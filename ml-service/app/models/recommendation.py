# Topic Recommendation Engine
import numpy as np
from typing import List, Optional
from datetime import datetime, timedelta
from app.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendedTopic,
    NextStudySession,
)
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class TopicRecommender:
    """
    Recommends topics based on:
    - Topics already studied
    - Performance history
    - Learning patterns
    - Topic dependencies
    """

    # Topic difficulty progression
    TOPIC_DIFFICULTY = {
        # Mathematics
        "Algebra": "Beginner",
        "Geometry": "Beginner",
        "Trigonometry": "Intermediate",
        "Calculus": "Advanced",
        "Linear Algebra": "Advanced",
        # Science
        "Biology": "Beginner",
        "Chemistry": "Intermediate",
        "Physics": "Intermediate",
        "Organic Chemistry": "Advanced",
        # History/Social
        "World History": "Beginner",
        "Modern History": "Intermediate",
        "Philosophy": "Intermediate",
        "Political Science": "Advanced",
    }

    # Topic prerequisites/dependencies
    TOPIC_DEPENDENCIES = {
        "Trigonometry": ["Algebra"],
        "Calculus": ["Algebra", "Trigonometry"],
        "Chemistry": ["Algebra"],
        "Physics": ["Calculus", "Algebra"],
        "Organic Chemistry": ["Chemistry"],
        "Modern History": ["World History"],
    }

    # Estimated hours to master each topic
    TOPIC_HOURS = {
        "Algebra": 15,
        "Geometry": 12,
        "Trigonometry": 10,
        "Calculus": 20,
        "Biology": 18,
        "Chemistry": 20,
        "Physics": 25,
        "World History": 14,
        "Modern History": 12,
    }

    def __init__(self):
        """Initialize recommender"""
        self.recommendation_count = 0

    def recommend(self, request: RecommendationRequest) -> RecommendationResponse:
        """
        Generate topic recommendations for a user.

        Algorithm:
        1. Filter out already-studied topics
        2. Check prerequisites are met
        3. Score remaining topics by:
           - User's performance trend
           - Topic difficulty level
           - Learning velocity
        4. Return top-N recommendations
        """
        logger.info(f"Processing recommendation request for user {request.userId}")

        # Get available topics (all known topics minus studied ones)
        available_topics = [
            t for t in self.TOPIC_DIFFICULTY.keys() if t not in request.studiedTopics
        ]

        if not available_topics:
            logger.info("User has studied all available topics")
            return RecommendationResponse(
                recommendedTopics=[],
                nextStudySession=NextStudySession(
                    suggestedDuration=30,
                    suggestedTime=self._get_next_study_time(),
                ),
            )

        # Check prerequisites and score topics
        scored_topics = []
        for topic in available_topics:
            prerequisites = self.TOPIC_DEPENDENCIES.get(topic, [])

            # Check if prerequisites are met
            if all(prereq in request.studiedTopics for prereq in prerequisites):
                score = self._score_topic(topic, request.performanceHistory)
                if score is not None:
                    scored_topics.append((topic, score))

        # Sort by score (descending) and take top recommendations
        scored_topics.sort(key=lambda x: x[1], reverse=True)
        top_topics = scored_topics[: settings.TOP_RECOMMENDATIONS]

        # Convert to response format
        recommended_topics = [
            RecommendedTopic(
                topic=topic,
                confidence=min(score, 0.99),  # Cap at 0.99
                reason=self._get_recommendation_reason(
                    topic, request.studiedTopics, request.performanceHistory
                ),
                difficulty=self.TOPIC_DIFFICULTY.get(topic, "Intermediate"),
                estimatedHours=self.TOPIC_HOURS.get(topic, 10),
            )
            for topic, score in top_topics
        ]

        # Calculate next study session
        next_session = self._calculate_next_session(request)

        self.recommendation_count += 1
        logger.info(
            f"Generated {len(recommended_topics)} recommendations "
            f"(recommendation #{self.recommendation_count})"
        )

        return RecommendationResponse(
            recommendedTopics=recommended_topics,
            nextStudySession=next_session,
        )

    def _score_topic(self, topic: str, performance_history: List) -> Optional[float]:
        """Score a topic based on performance history and availability."""
        if not performance_history:
            # If no history, prioritize easier topics
            if self.TOPIC_DIFFICULTY.get(topic) == "Beginner":
                return 0.85
            elif self.TOPIC_DIFFICULTY.get(topic) == "Intermediate":
                return 0.70
            else:
                return 0.50

        # Calculate average performance on similar-level topics
        avg_score = np.mean([p["score"] for p in performance_history]) / 100.0

        # Difficulty adjustment
        difficulty = self.TOPIC_DIFFICULTY.get(topic, "Intermediate")
        if difficulty == "Beginner":
            multiplier = 1.0
        elif difficulty == "Intermediate":
            multiplier = 0.85
        else:  # Advanced
            multiplier = 0.70

        # Combine: recent performance + difficulty adjustment
        score = (avg_score + 0.8) * multiplier  # Boost by 0.8 and apply multiplier
        return min(max(score, 0.1), 1.0)  # Clamp between 0.1 and 1.0

    def _get_recommendation_reason(
        self, topic: str, studied: List[str], performance: List
    ) -> str:
        """Generate a human-readable reason for recommendation."""
        difficulty = self.TOPIC_DIFFICULTY.get(topic, "Intermediate")

        if performance:
            avg_score = np.mean([p["score"] for p in performance]) / 100.0
            if avg_score > 0.8:
                return (
                    f"You're doing well! Ready for {difficulty.lower()} topic: {topic}"
                )
            elif avg_score > 0.6:
                return f"{topic} complements your current studies in {studied[-1] if studied else 'math'}"
            else:
                return f"Strengthen foundations with {topic} before advanced topics"
        else:
            return f"Start with {difficulty.lower()} topic: {topic}"

    def _calculate_next_session(
        self, request: RecommendationRequest
    ) -> NextStudySession:
        """Calculate when user should study next and for how long."""
        if not request.performanceHistory:
            # First study session
            duration = 30  # 30 minutes
            suggested_time = self._get_next_study_time()
            return NextStudySession(
                suggestedDuration=duration,
                suggestedTime=suggested_time,
                preferredLength="short",
            )

        # Analyze study pattern
        avg_score = np.mean([p["score"] for p in request.performanceHistory])

        if avg_score > 80:
            duration = 45
            length = "long"
        elif avg_score > 60:
            duration = 30
            length = "medium"
        else:
            duration = 20
            length = "short"

        return NextStudySession(
            suggestedDuration=duration,
            suggestedTime=self._get_next_study_time(),
            preferredLength=length,
        )

    @staticmethod
    def _get_next_study_time() -> str:
        """Get optimal time for next study session (tomorrow at 10am)."""
        tomorrow = datetime.now() + timedelta(days=1)
        tomorrow = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        return tomorrow.isoformat()
