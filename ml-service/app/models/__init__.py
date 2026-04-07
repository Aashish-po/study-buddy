# Models __init__.py
from app.models.recommendation import TopicRecommender
from app.models.knowledge_gap import KnowledgeGapDetector
from app.models.retention import RetentionPredictor
from app.models.study_plan import StudyPlanGenerator

__all__ = [
    "TopicRecommender",
    "KnowledgeGapDetector",
    "RetentionPredictor",
    "StudyPlanGenerator",
]
