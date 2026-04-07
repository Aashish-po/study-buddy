# ML Service Configuration
import os
from typing import Literal


class Settings:
    """ML Service configuration from environment"""

    # Service
    ML_SERVICE_PORT: int = int(os.getenv("ML_SERVICE_PORT", 8000))
    NODE_ENV: Literal["development", "staging", "production"] = os.getenv(
        "NODE_ENV", "development"
    )
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # Database (optional - for caching results)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "mysql://user:password@localhost:3306/studybuddy"
    )

    # Redis (optional - for caching)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    USE_CACHE: bool = os.getenv("USE_CACHE", "false").lower() == "true"

    # ML Model settings
    MIN_DATA_POINTS: int = 3  # Minimum quiz/chat interactions for recommendations
    CONFIDENCE_THRESHOLD: float = 0.6  # Minimum confidence for recommendations
    TOP_RECOMMENDATIONS: int = 5  # Number of topics to recommend
    PREDICTION_HORIZON_DAYS: int = 7  # Days ahead to predict retention

    # Forgetting curve constants (Ebbinghaus)
    FORGETTING_CURVE_ALPHA: float = 0.3
    FORGETTING_CURVE_BETA: float = 0.7


settings = Settings()
