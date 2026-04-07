# ML Service - Entry Point
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config import settings
from app.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    KnowledgeGapRequest,
    KnowledgeGapResponse,
    RetentionPredictionRequest,
    RetentionPredictionResponse,
    StudyPlanRequest,
    StudyPlanResponse,
)
from app.models.recommendation import TopicRecommender
from app.models.knowledge_gap import KnowledgeGapDetector
from app.models.retention import RetentionPredictor
from app.models.study_plan import StudyPlanGenerator

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="StudyBuddy AI - ML Service",
    description="Machine learning microservice for personalized learning analytics",
    version="1.0.0",
)

# Configure CORS for Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML models
logger.info("[ML Service] Initializing models...")
recommender = TopicRecommender()
gap_detector = KnowledgeGapDetector()
retention_predictor = RetentionPredictor()
plan_generator = StudyPlanGenerator()
logger.info("[ML Service] Models initialized successfully")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "StudyBuddy ML",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/ml/health",
            "recommendations": "/api/ml/recommend",
            "knowledge_gaps": "/api/ml/knowledge-gaps",
            "retention": "/api/ml/predict-retention",
            "study_plan": "/api/ml/study-plan",
        },
    }


@app.get("/api/ml/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Simple health check
        return {
            "status": "healthy",
            "service": "StudyBuddy ML",
            "models_loaded": True,
        }
    except Exception as e:
        logger.error(f"[Health Check] Error: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.post("/api/ml/recommend", response_model=RecommendationResponse)
async def recommend_topics(request: RecommendationRequest):
    """
    Get personalized topic recommendations based on study history.

    Uses collaborative filtering + content-based approach to suggest
    topics user should study next based on:
    - Topics already studied
    - Performance history
    - Learning patterns
    """
    try:
        logger.info(f"[Recommendations] Analyzing user {request.userId}")
        result = recommender.recommend(request)
        logger.info(
            f"[Recommendations] Generated {len(result.recommendedTopics)} recommendations"
        )
        return result
    except Exception as e:
        logger.error(f"[Recommendations] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@app.post("/api/ml/knowledge-gaps", response_model=KnowledgeGapResponse)
async def analyze_knowledge_gaps(request: KnowledgeGapRequest):
    """
    Analyze knowledge gaps and identify weak areas.

    Uses quiz results and chat interaction sentiment to identify
    topics where user is struggling, ranked by priority.
    """
    try:
        logger.info(f"[Knowledge Gaps] Analyzing user {request.userId}")
        result = gap_detector.analyze(request)
        logger.info(f"[Knowledge Gaps] Found {len(result.weakAreas)} weak areas")
        return result
    except Exception as e:
        logger.error(f"[Knowledge Gaps] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post("/api/ml/predict-retention", response_model=RetentionPredictionResponse)
async def predict_retention(request: RetentionPredictionRequest):
    """
    Predict retention probability using spacing repetition algorithm.

    Determines:
    - Probability user still remembers the topic (0-100%)
    - When they should review it next (optimal review date)
    - Current stage in forgetting curve
    """
    try:
        logger.info(f"[Retention] Predicting for topic: {request.topic}")
        result = retention_predictor.predict(request)
        return result
    except Exception as e:
        logger.error(f"[Retention] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/ml/study-plan", response_model=StudyPlanResponse)
async def generate_study_plan(request: StudyPlanRequest):
    """
    Generate a personalized study plan for exam preparation.

    Creates:
    - Daily study schedule with topics and durations
    - Milestones with expected mastery levels
    - Optimal study sequence based on dependencies
    """
    try:
        logger.info(f"[Study Plan] Generating plan for user {request.userId}")
        result = plan_generator.generate(request)
        logger.info(
            f"[Study Plan] Generated {len(result.dailyPlan)} days of study plan"
        )
        return result
    except Exception as e:
        logger.error(f"[Study Plan] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Plan generation error: {str(e)}")


@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("[ML Service] Starting up...")
    logger.info("[ML Service] Ready to accept requests")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("[ML Service] Shutting down...")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=settings.ML_SERVICE_PORT,
        log_level=settings.LOG_LEVEL.lower(),
    )
