# Retention Prediction (Spaced Repetition)
import numpy as np
from datetime import datetime, timedelta
from app.schemas import (
    RetentionPredictionRequest,
    RetentionPredictionResponse,
)
from app.config import settings
import logging
import math

logger = logging.getLogger(__name__)


class RetentionPredictor:
    """
    Predict retention using Ebbinghaus Forgetting Curve.

    The forgetting curve models how humans lose information over time:
    R = e^(-t/S)
    Where:
    - R = Retention (0-1)
    - t = Time since learning
    - S = Strength of memory (increases with review)
    """

    def __init__(self):
        self.prediction_count = 0

    def predict(
        self, request: RetentionPredictionRequest
    ) -> RetentionPredictionResponse:
        """
        Predict retention probability and optimal review time.

        Returns:
        - retentionProbability: % user still remembers (0-100)
        - optimalReviewDate: When to review for spaced repetition
        - forgettingCurveStage: Where in curve user is
        """
        logger.info(f"Predicting retention for {request.topic}")

        # Parse dates
        last_studied = datetime.fromisoformat(
            request.lastStudied.replace("Z", "+00:00")
        )
        days_since = (datetime.now(last_studied.tzinfo) - last_studied).days
        if days_since < 0:
            days_since = 0

        # Ebbinghaus forgetting curve
        retention_prob = self._calculate_retention_probability(
            days_since,
            request.reviewCount,
            request.averageScore,
        )

        # Determine forgetting curve stage
        stage = self._get_forgetting_stage(retention_prob)

        # Calculate optimal review date (when retention drops to 50%)
        days_to_review = self._days_until_target_retention(
            target_retention=0.5,
            current_days_since=days_since,
            review_count=request.reviewCount,
            average_score=request.averageScore,
        )

        optimal_review = datetime.now() + timedelta(days=days_to_review)

        self.prediction_count += 1
        logger.info(
            f"Retention: {retention_prob:.1f}%, Stage: {stage}, "
            f"Review in {days_to_review:.1f} days (prediction #{self.prediction_count})"
        )

        return RetentionPredictionResponse(
            retentionProbability=retention_prob * 100,  # Convert to percentage
            optimalReviewDate=optimal_review.isoformat(),
            forgettingCurveStage=stage,
            daysSinceLastStudy=days_since,
            suggestedReviewMaterial=[
                f"Review key concepts of {request.topic}",
                "Test yourself with practice questions",
                "Compare your understanding with notes",
            ],
        )

    def _calculate_retention_probability(
        self,
        days_since_study: int,
        review_count: int,
        average_score: float,
    ) -> float:
        """
        Calculate retention using Ebbinghaus forgetting curve.

        Adjustments:
        - More reviews = slower forgetting (better memory strength)
        - Higher scores = better encoding (stronger memory)
        """
        # Base forgetting curve: R = e^(-t/S)
        # S (stability) increases with reviews and score

        # Score component (0-1, where 1 is perfect)
        score_factor = average_score / 100.0

        # Stability factor: affected by review count and performance
        # First review has less effect on stability
        stability = 1.0 + (review_count * 0.5) + (score_factor * 0.3)

        # Apply forgetting curve
        # Exponent adjustment based on review count
        exponent = -days_since_study / stability

        # Sigmoid adjustment to prevent retention going to 0 too quickly
        retention = math.exp(exponent)

        # Boost retention based on performance (high scores = better retention)
        retention = retention * (0.5 + score_factor * 0.5)

        # Clamp between 0 and 1
        return max(0.0, min(1.0, retention))

    @staticmethod
    def _get_forgetting_stage(retention_prob: float) -> str:
        """Determine position on forgetting curve."""
        if retention_prob > 0.8:
            return "fresh"  # Recent learning, still fresh
        elif retention_prob > 0.5:
            return "reviewing"  # Starting to forget, needs review
        elif retention_prob > 0.2:
            return "at_risk"  # Significantly forgotten, at risk of loss
        else:
            return "forgotten"  # Mostly forgotten, needs relearning

    def _days_until_target_retention(
        self,
        target_retention: float,
        current_days_since: int,
        review_count: int,
        average_score: float,
    ) -> float:
        """Calculate days until retention drops to target level."""
        # Solve for t: target = e^(-t/S)
        # t = -S * ln(target)

        score_factor = average_score / 100.0
        stability = 1.0 + (review_count * 0.5) + (score_factor * 0.3)

        # Avoid log(0)
        if target_retention <= 0:
            return 30  # Safety: recommend review in 30 days

        days_needed = -stability * math.log(target_retention)
        days_remaining = days_needed - current_days_since

        # Ensure we returns positive days (minimum 1 day)
        return max(1, round(days_remaining))
