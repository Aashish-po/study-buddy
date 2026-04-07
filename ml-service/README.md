# Python ML Service - Development & Production Setup

## Quick Start (Development)

### Prerequisites

- Python 3.10+ (3.11 recommended)
- pip or conda

### Setup Instructions

```bash
# 1. Navigate to ml-service directory
cd ml-service

# 2. Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment template
cp .env.example .env

# 5. Run the service
uvicorn app.main:app --reload --port 8000
```

Service will be available at: `http://localhost:8000`

## Project Structure

```text
ml-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Configuration management
│   ├── schemas.py           # Pydantic request/response models
│   ├── models/
│   │   ├── __init__.py
│   │   ├── recommendation.py    # Topic recommendation engine
│   │   ├── knowledge_gap.py     # Knowledge gap detector
│   │   ├── retention.py         # Retention predictor
│   │   └── study_plan.py        # Study plan generator
│   └── services/
│       ├── __init__.py
│       └── ml_pipeline.py   # Orchestration (future)
├── requirements.txt
├── .env.example
├── Dockerfile              # Docker configuration
└── README.md              # This file
```

## API Endpoints

All endpoints are prefixed with `/api/ml/`

### 1. Health Check

```bash
GET /api/ml/health
Response: { "status": "healthy", "service": "StudyBuddy ML" }
```

### 2. Get Recommendations

```json
POST /api/ml/recommend
Body: {
  "userId": "user123",
  "studiedTopics": ["Algebra", "Geometry"],
  "performanceHistory": [
    { "topic": "Algebra", "score": 85, "timestamp": "2024-01-15" }
  ]
}
Response: {
  "recommendedTopics": [...],
  "nextStudySession": { "suggestedDuration": 30, "suggestedTime": "..." }
}
```

### 3. Analyze Knowledge Gaps

```json
POST /api/ml/knowledge-gaps
Body: {
  "userId": "user123",
  "quizResults": [...],
  "chatInteractions": [...]
}
Response: {
  "weakAreas": [...],
  "overallMastery": 75.5,
  "readinessForExam": 65.0
}
```

### 4. Predict Retention

```json
POST /api/ml/predict-retention
Body: {
  "topic": "Algebra",
  "lastStudied": "2024-01-10",
  "reviewCount": 2,
  "averageScore": 85.0
}
Response: {
  "retentionProbability": 78.5,
  "optimalReviewDate": "2024-01-18",
  "forgettingCurveStage": "reviewing"
}
```

### 5. Generate Study Plan

```json
POST /api/ml/study-plan
Body: {
  "userId": "user123",
  "examDate": "2024-02-15",
  "topics": ["Algebra", "Calculus"],
  "hoursPerDay": 3.0,
  "currentMastery": { "Algebra": 65, "Calculus": 40 }
}
Response: {
  "dailyPlan": [...],
  "milestones": [...],
  "totalHoursRequired": 35.5,
  "successProbability": 75.0
}
```

## Integration with Express Backend

The Python ML service integrates via HTTP calls from the Express backend (`server/_core/mlService.ts`).

The Express backend makes HTTP requests to this service and caches results.

### Request Flow
1. Frontend calls tRPC procedure (e.g., `ml.getRecommendations`)
2. tRPC handler calls `mlService.getRecommendations()`
3. `mlService` makes HTTP POST to `http://localhost:8000/api/ml/recommend`
4. Python service processes and returns result
5. Express returns result to frontend

### Error Handling
- Service returns fallback recommendations if Python service is down
- Timeout: 15 seconds (configurable)
- Health check: `/api/ml/health` endpoint for monitoring

## Machine Learning Models

### 1. Topic Recommender
**Algorithm**: Collaborative filtering + Content-based filtering

**Inputs**:
- User's study history (topics studied)
- Performance on each topic
- Quiz scores and patterns

**Output**: Ranked list of recommended topics

**Logic**:
1. Filter out already-studied topics
2. Check topic prerequisites
3. Score available topics based on:
   - User's performance on similar-difficulty topics
   - Whether prerequisites are satisfied
   - Learning velocity
4. Return top 5 recommendations with confidence scores

### 2. Knowledge Gap Detector
**Algorithm**: Multimodal analysis

**Inputs**:
- Quiz results (score per question)
- Chat interaction sentiment (positive/negative/neutral)
- Learning interaction history

**Output**: Ranked list of weak areas with priority and suggested actions

**Logic**:
1. Aggregate quiz scores by topic
2. Analyze chat sentiment by topic
3. Combine signals: 60% weight on quizzes, 40% weight on sentiment
4. Identify topics with mastery < 70%
5. Rank by severity and suggest actions

### 3. Retention Predictor
**Algorithm**: Ebbinghaus Forgetting Curve

**Inputs**:
- Topic name
- Last study date
- Number of reviews
- Average quiz score

**Output**: Retention probability & optimal review date

**Formula**: `R = e^(-t/S)` where:
- R = Retention (0-1)
- t = Days since last study
- S = Memory strength (increases with reviews and score)

**Logic**:
1. Calculate stability based on review count and performance
2. Apply forgetting curve exponential decay
3. Find when retention drops to 50% (optimal review time)
4. Return stage: fresh, reviewing, at_risk, or forgotten

### 4. Study Plan Generator
**Algorithm**: Knapsack-style optimization

**Inputs**:
- Topics to study
- Current mastery per topic
- Hours available per day
- Exam date

**Output**: Day-by-day study schedule with milestones

**Logic**:
1. Calculate hours needed to reach 90% mastery per topic
2. Order topics by prerequisites
3. Allocate daily study blocks:
   - Continue in-progress topics
   - Start new topics when space available
4. Create milestones at 25%, 50%, 75%, 100%
5. Calculate success probability from time coverage

## Docker Deployment (Production)

### Build Docker Image
```bash
docker build -t studybuddy-ml:latest .
```

### Run Container
```bash
docker run -p 8000:8000 \
  -e NODE_ENV=production \
  -e LOG_LEVEL=INFO \
  -e ML_SERVICE_PORT=8000 \
  studybuddy-ml:latest
```

## Performance Considerations

- **Caching**: Consider Redis for caching recommendations  (optional, see `config.py`)
- **Batch Processing**: For large user bases, batch recommendations offline
- **Model Updates**: Retrain models weekly/monthly with new data

## Future Enhancements

- [ ] Deep learning models (LSTM for sequence prediction)
- [ ] Vector embeddings for topic similarity
- [ ] Collaborative filtering with matrix factorization
- [ ] Real-time model updates (online learning)
- [ ] Multi-language support
- [ ] Topic taxonomy learning from user data

## Troubleshooting

### "Module not found" errors
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### "Connection refused" from Express backend
```bash
# Verify ML service is running on port 8000
lsof -i :8000

# Or check with curl
curl http://localhost:8000/api/ml/health
```

### Slow predictions
```bash
# Check logs for bottlenecks
# Consider caching with Redis for frequently-requested topics
# Profile with: python -m cProfile -s cumulative app/main.py
```

## Support & Documentation

- FastAPI Docs: http://localhost:8000/docs (interactive Swagger UI)
- ReDoc: http://localhost:8000/redoc

## License

Part of StudyBuddy AI project
