# Pydantic schemas for request/response validation
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Literal
from datetime import datetime


# ==================== Recommendation Engine ====================


class PerformanceRecord(BaseModel):
    topic: str
    score: float = Field(ge=0, le=100)
    timestamp: str  # ISO 8601 date


class RecommendationRequest(BaseModel):
    userId: str
    studiedTopics: List[str] = Field(default_factory=list)
    performanceHistory: List[PerformanceRecord] = Field(default_factory=list)


class RecommendedTopic(BaseModel):
    topic: str
    confidence: float = Field(ge=0, le=1, description="Confidence score 0-1")
    reason: str = Field(description="Why this topic is recommended")
    difficulty: Literal["Beginner", "Intermediate", "Advanced"] = "Intermediate"
    estimatedHours: float = Field(ge=0.5, le=20)


class NextStudySession(BaseModel):
    suggestedDuration: int = Field(description="Minutes recommended for study")
    suggestedTime: str = Field(description="ISO 8601 datetime for optimal study")
    preferredLength: Literal["short", "medium", "long"] = "medium"


class RecommendationResponse(BaseModel):
    recommendedTopics: List[RecommendedTopic]
    nextStudySession: NextStudySession
    explanations: Optional[str] = None


# ==================== Knowledge Gap Detection ====================


class QuizResult(BaseModel):
    topic: str
    score: float
    totalQuestions: int
    timestamp: str


class ChatInteraction(BaseModel):
    topic: str
    sentiment: Literal["positive", "neutral", "negative"]
    timestamp: str


class KnowledgeGapRequest(BaseModel):
    userId: str
    quizResults: List[QuizResult] = Field(default_factory=list)
    chatInteractions: List[ChatInteraction] = Field(default_factory=list)


class WeakArea(BaseModel):
    topic: str
    masteryLevel: float = Field(ge=0, le=100, description="Mastery percentage")
    priority: Literal["high", "medium", "low"]
    suggestedActions: List[str]
    conceptsToFocus: List[str] = Field(default_factory=list)


class KnowledgeGapResponse(BaseModel):
    weakAreas: List[WeakArea]
    overallMastery: float = Field(ge=0, le=100)
    readinessForExam: Optional[float] = Field(
        None, ge=0, le=100, description="Exam readiness percentage"
    )
    improvementPotential: Optional[float] = Field(
        None, ge=0, le=100, description="Potential improvement with focused study"
    )


# ==================== Retention Prediction ====================


class RetentionPredictionRequest(BaseModel):
    topic: str
    lastStudied: str  # ISO 8601 date
    reviewCount: int = Field(ge=0)
    averageScore: float = Field(ge=0, le=100)


class RetentionPredictionResponse(BaseModel):
    retentionProbability: float = Field(
        ge=0, le=100, description="Probability user remembers the topic"
    )
    optimalReviewDate: str = Field(description="ISO 8601 datetime for next review")
    forgettingCurveStage: Literal["fresh", "reviewing", "at_risk", "forgotten"]
    daysSinceLastStudy: int
    suggestedReviewMaterial: Optional[List[str]] = None


# ==================== Study Planning ====================


class DailyStudyPlan(BaseModel):
    date: str  # ISO 8601 date
    topics: List[str]
    estimatedDuration: int = Field(description="Minutes")
    activities: List[str] = Field(
        default_factory=list,
        description=["Review flashcards", "Quiz", "Practice problems"],
    )
    focusAreas: List[str] = Field(default_factory=list)


class StudyMilestone(BaseModel):
    date: str  # ISO 8601 date
    expectedMastery: float = Field(ge=0, le=100)
    topics: List[str]
    checkpoint: str  # e.g., "Mid-study checkpoint", "Final review"


class StudyPlanRequest(BaseModel):
    userId: str
    examDate: str  # ISO 8601 date
    topics: List[str]
    hoursPerDay: float = Field(ge=0.5, le=12)
    currentMastery: Dict[str, float] = Field(
        description="Current mastery level for each topic (0-100)"
    )


class StudyPlanResponse(BaseModel):
    dailyPlan: List[DailyStudyPlan]
    milestones: List[StudyMilestone]
    totalHoursRequired: float
    recommendedStartDate: str
    successProbability: float = Field(ge=0, le=100)
