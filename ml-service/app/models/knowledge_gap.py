# Knowledge Gap Detector
import numpy as np
from typing import List
from app.schemas import (
    KnowledgeGapRequest,
    KnowledgeGapResponse,
    WeakArea,
    QuizResult,
    ChatInteraction,
)
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class KnowledgeGapDetector:
    """
    Identifies weak areas and knowledge gaps by analyzing:
    - Quiz performance (questions answered incorrectly)
    - Chat interaction sentiment during tutoring
    - Multimodal learning signals
    """

    def __init__(self):
        self.analysis_count = 0

    def analyze(self, request: KnowledgeGapRequest) -> KnowledgeGapResponse:
        """
        Analyze knowledge gaps and weak areas.

        Algorithm:
        1. Aggregate quiz scores by topic
        2. Analyze chat sentiment by topic
        3. Combine for overall weakness score
        4. Rank by priority (most problematic areas first)
        5. Suggest focused review actions
        """
        logger.info(f"Analyzing knowledge gaps for user {request.userId}")

        # Aggregate data by topic
        topic_scores = self._aggregate_quiz_scores(request.quizResults)
        topic_sentiment = self._aggregate_chat_sentiment(request.chatInteractions)

        # Calculate mastery levels
        weak_areas = []
        for topic in set(list(topic_scores.keys()) + list(topic_sentiment.keys())):
            mastery = self._calculate_mastery(
                topic_scores.get(topic),
                topic_sentiment.get(topic),
            )

            if mastery < 70:  # Weak area threshold
                priority = self._determine_priority(mastery)
                actions = self._suggest_actions(topic, mastery)

                weak_areas.append(
                    WeakArea(
                        topic=topic,
                        masteryLevel=mastery,
                        priority=priority,
                        suggestedActions=actions,
                        conceptsToFocus=self._identify_focus_concepts(topic),
                    )
                )

        # Sort by priority
        priority_order = {"high": 3, "medium": 2, "low": 1}
        weak_areas.sort(
            key=lambda x: (
                priority_order[x.priority],
                -x.masteryLevel,
            ),
            reverse=True,
        )

        # Calculate overall mastery
        all_masteries = list(topic_scores.values()) + [
            m for m in topic_sentiment.values() if m is not None
        ]
        overall_mastery = np.mean(all_masteries) if all_masteries else 0

        # Estimate readiness for exam (0-100)
        exam_readiness = max(0, 100 - (70 - overall_mastery) * 2)

        # Improvement potential
        improvement_potential = (
            sum(70 - wa.masteryLevel for wa in weak_areas) / len(weak_areas) * 0.8
            if weak_areas
            else 0
        )

        self.analysis_count += 1
        logger.info(
            f"Found {len(weak_areas)} weak areas, "
            f"overall mastery: {overall_mastery:.1f}% "
            f"(analysis #{self.analysis_count})"
        )

        return KnowledgeGapResponse(
            weakAreas=weak_areas,
            overallMastery=overall_mastery,
            readinessForExam=exam_readiness,
            improvementPotential=improvement_potential,
        )

    @staticmethod
    def _aggregate_quiz_scores(
        quiz_results: List[QuizResult],
    ) -> dict:
        """Aggregate quiz scores by topic."""
        scores = {}
        for result in quiz_results:
            percentage = (result.score / result.totalQuestions) * 100
            if result.topic not in scores:
                scores[result.topic] = []
            scores[result.topic].append(percentage)

        # Average scores per topic
        return {topic: np.mean(scores_list) for topic, scores_list in scores.items()}

    @staticmethod
    def _aggregate_chat_sentiment(
        interactions: List[ChatInteraction],
    ) -> dict:
        """Convert chat sentiment to mastery estimate."""
        sentiment_map = {
            "positive": 85,  # User understood topic well
            "neutral": 60,  # Mixed understanding
            "negative": 35,  # User struggled with topic
        }

        sentiment_scores = {}
        for interaction in interactions:
            score = sentiment_map.get(interaction.sentiment, 60)
            if interaction.topic not in sentiment_scores:
                sentiment_scores[interaction.topic] = []
            sentiment_scores[interaction.topic].append(score)

        # Average sentiment per topic
        return {topic: np.mean(scores) for topic, scores in sentiment_scores.items()}

    @staticmethod
    def _calculate_mastery(quiz_score: float, chat_score: float) -> float:
        """Combine quiz and chat signals into overall mastery."""
        if quiz_score is not None and chat_score is not None:
            return quiz_score * 0.6 + chat_score * 0.4  # Weight quiz heavier
        elif quiz_score is not None:
            return quiz_score
        elif chat_score is not None:
            return chat_score
        else:
            return 50  # Default if no data

    @staticmethod
    def _determine_priority(mastery: float) -> str:
        """Determine review priority based on mastery level."""
        if mastery < 40:
            return "high"
        elif mastery < 60:
            return "medium"
        else:
            return "low"

    @staticmethod
    def _suggest_actions(topic: str, mastery: float) -> List[str]:
        """Suggest learning actions for weak area."""
        actions = []

        if mastery < 30:
            actions.extend(
                [
                    f"Review fundamentals of {topic}",
                    f"Watch educational video on {topic}",
                    f"Work through practice problems with solutions",
                ]
            )
        elif mastery < 50:
            actions.extend(
                [
                    f"Complete practice quiz on {topic}",
                    f"Review commonly missed concepts",
                    f"Create flashcards for key terms",
                ]
            )
        elif mastery < 70:
            actions.extend(
                [
                    f"Solve harder practice problems",
                    f"Take another quiz to assess improvement",
                    f"Compare your answers with model solutions",
                ]
            )

        return actions

    @staticmethod
    def _identify_focus_concepts(topic: str) -> List[str]:
        """Identify specific concepts to focus on."""
        # In production, this would look up common misconceptions
        focus_map = {
            "Algebra": [
                "Variables and expressions",
                "Solving equations",
                "Systems of equations",
            ],
            "Calculus": ["Derivatives", "Integrals", "Limits"],
            "Chemistry": ["Bonding", "Reactions", "Stoichiometry"],
            "Biology": ["Cells", "Photosynthesis", "DNA"],
        }

        return focus_map.get(topic, [f"Core concepts of {topic}"])
