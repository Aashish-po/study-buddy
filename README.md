# StudyBuddy AI

> Intelligent learning companion powered by open-source LLMs and machine learning. Personalized study recommendations, adaptive learning paths, and AI-powered content generation.

![GitHub](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![Node.js](https://img.shields.io/badge/node-18%2B-green)

## 🎯 Overview

StudyBuddy AI is a full-stack learning platform that combines React Native frontend, Express.js backend, and a FastAPI ML microservice to deliver personalized educational experiences. Leverages NVIDIA NIM for efficient open-source LLM inference.

### Key Features

🤖 **AI-Powered Learning**
- Adaptive learning recommendations based on performance analytics
- Multi-format study material support (PDFs, images, videos, text)
- Intelligent Q&A generation from any subject matter
- Real-time tutoring and concept explanation

📊 **Analytics & Progress Tracking**
- Personal learning dashboard with progress visualization
- Spaced repetition scheduling for optimal retention
- Performance trends and learning analytics
- Study time tracking and goal management

🎯 **Personalized Learning Paths**
- Dynamic curriculum adaptation based on proficiency
- Skill gap identification and targeted practice
- Custom quiz generation based on study history
- Prerequisite tracking and learning sequence optimization

⚡ **High-Performance Infrastructure**
- Open-source LLM integration (Llama 3.3 70B via NVIDIA NIM)
- Efficient inference with GPU acceleration
- Real-time API response optimization
- Scalable microservice architecture

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native + Expo
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: NativeWind (Tailwind for React Native)
- **Navigation**: React Navigation v6

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **ORM**: Drizzle ORM with MySQL
- **RPC**: tRPC for type-safe APIs
- **Database**: MySQL 8.0+
- **Authentication**: JWT + OAuth 2.0

### ML Microservice
- **Framework**: FastAPI (Python 3.9+)
- **LLM Integration**: NVIDIA NIM (meta/llama-3.3-70b-instruct)
- **ML Libraries**: scikit-learn, pandas, numpy
- **Task Queue**: Celery + Redis
- **Deployment**: Docker + Kubernetes-ready

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Message Queue**: Redis
- **Async Jobs**: Celery
- **APIs**: NVIDIA NIM (free tier), Anthropic Claude (optional)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.9
- Docker & Docker Compose
- Redis
- MySQL 8.0+
- NVIDIA NIM API key (free tier: [https://build.nvidia.com](https://build.nvidia.com))

### Quick Start

```bash
# Clone repository
git clone https://github.com/Aashish-po/study-buddy.git
cd study-buddy

# Setup with Docker Compose (recommended)
docker-compose up -d

# Verify services
docker-compose ps

# Frontend: http://localhost:3000 (Expo)
# Backend API: http://localhost:4000
# ML Service: http://localhost:8000
```

### Manual Setup

```bash
# 1. Backend Setup
cd apps/backend
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev

# 2. Frontend Setup (new terminal)
cd apps/frontend
npm install
npx expo start

# 3. ML Service Setup (new terminal)
cd apps/ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn main:app --reload --port 8000
```

### Environment Variables

#### Backend (`.env.local`)
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/studybuddy

# JWT & Security
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret

# NVIDIA NIM (free tier)
NVIDIA_NIM_API_KEY=your_key_from_build.nvidia.com
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1

# Anthropic (optional)
ANTHROPIC_API_KEY=sk-ant-...

# Frontend
FRONTEND_URL=http://localhost:3000
```

#### ML Service (`.env`)
```env
# NVIDIA NIM
NVIDIA_NIM_API_KEY=your_key
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# Database (same as backend)
DATABASE_URL=mysql://user:password@localhost:3306/studybuddy

# Model Configuration
MODEL_NAME=meta/llama-3.3-70b-instruct
MODEL_MAX_TOKENS=2048
```

## 📁 Project Structure

```
study-buddy/
├── apps/
│   ├── frontend/                    # React Native/Expo
│   │   ├── app/                     # App routing
│   │   ├── components/              # Reusable components
│   │   ├── screens/                 # Screen components
│   │   ├── hooks/                   # Custom hooks
│   │   └── lib/                     # API clients, utils
│   │
│   ├── backend/                     # Express.js API
│   │   ├── src/
│   │   │   ├── routes/              # API endpoints
│   │   │   ├── controllers/         # Request handlers
│   │   │   ├── services/            # Business logic
│   │   │   ├── middleware/          # Auth, validation
│   │   │   ├── schemas/             # Zod validators
│   │   │   └── db/                  # Database setup
│   │   └── prisma/                  # Database schema
│   │
│   └── ml-service/                  # FastAPI ML Service
│       ├── app/
│       │   ├── api/                 # API endpoints
│       │   ├── ml/                  # ML models & logic
│       │   ├── services/            # LLM integration
│       │   └── db/                  # Database models
│       └── requirements.txt
│
├── packages/
│   ├── shared-types/                # TypeScript types
│   └── utils/                       # Shared utilities
│
├── docker-compose.yml               # Development setup
└── README.md
```

## 🔧 Development

### Running Tests

```bash
# Backend tests
npm -C apps/backend run test

# ML Service tests
pytest apps/ml-service/

# Frontend tests
npm -C apps/frontend run test
```

### Code Quality

```bash
# Lint all packages
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Database Operations

```bash
# Run migrations (backend)
npm -C apps/backend run db:migrate

# Reset database
npm -C apps/backend run db:reset

# View database (Prisma Studio)
npm -C apps/backend run db:studio
```

## 🎓 API Examples

### Generate Study Questions

```bash
curl -X POST http://localhost:4000/api/study/generate-questions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Photosynthesis",
    "difficulty": "intermediate",
    "count": 5
  }'
```

### Get Adaptive Recommendations

```bash
curl -X GET "http://localhost:4000/api/recommendations?userId=user_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Submit Answer for Analysis

```bash
curl -X POST http://localhost:4000/api/study/submit-answer \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "q_456",
    "answer": "Photosynthesis converts light energy to chemical energy",
    "explanation": true
  }'
```

### ML Service - Get Content Summary

```bash
curl -X POST http://localhost:8000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Long text content here...",
    "max_length": 150
  }'
```

## 📊 Architecture

```
┌──────────────────────────────────┐
│   React Native / Expo Frontend   │
│   (iOS, Android, Web)            │
└────────────────┬─────────────────┘
                 │
         ┌───────▼────────┐
         │  Expo / Metro  │
         │   Development  │
         └────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
REST API     Socket.io    GraphQL
    │            │            │
┌───▼────────────▼────────────▼──┐
│   Express.js API Server        │
│   (tRPC + TypeScript)          │
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ Auth & Session           │  │
│  │ Course Management        │  │
│  │ Quiz & Progress          │  │
│  │ Recommendation Engine    │  │
│  └──────────────────────────┘  │
└────────┬───────────────┬────────┘
         │               │
    ┌────▼──────┐   ┌────▼──────────────┐
    │  MySQL    │   │ FastAPI ML Service │
    │  Database │   │ ┌────────────────┐ │
    │           │   │ │NVIDIA NIM LLM  │ │
    └───────────┘   │ │(Llama 3.3 70B) │ │
                    │ ├────────────────┤ │
                    │ │ ML Models      │ │
                    │ │ Analytics      │ │
                    │ └────────────────┘ │
                    └────────────────────┘
```

## 🐛 Troubleshooting

### NVIDIA NIM Connection Error
```bash
# Verify API key and base URL
curl -X GET https://integrate.api.nvidia.com/v1/models \
  -H "Authorization: Bearer YOUR_NVIDIA_NIM_KEY"
```

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u user -p -h localhost

# Verify DATABASE_URL format
# mysql://user:password@host:3306/dbname
```

### ML Service Not Responding
```bash
# Check FastAPI service is running
curl http://localhost:8000/health

# View service logs
docker logs study-buddy-ml-service
```

### Redis Connection Problem
```bash
# Test Redis connection
redis-cli ping

# Should return: PONG
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

```bash
# Build images
docker build -f Dockerfile.backend -t study-buddy-backend:latest .
docker build -f Dockerfile.ml -t study-buddy-ml:latest .

# Push to registry
docker push your-registry/study-buddy-backend:latest
docker push your-registry/study-buddy-ml:latest

# Deploy with Helm
helm install study-buddy ./helm
```

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [ML Model Training](./docs/ML_TRAINING.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/Aashish-po/study-buddy/issues)
- **Email**: poudelashish572@gmail.com
- **Discussions**: [GitHub Discussions](https://github.com/Aashish-po/study-buddy/discussions)

## 🔮 Roadmap

- [ ] Multi-language support (Nepali, Hindi, etc.)
- [ ] Advanced ML-powered learning path optimization
- [ ] Collaborative study groups
- [ ] Gamification (badges, leaderboards)
- [ ] Mobile offline mode with sync
- [ ] Real-time peer tutoring
- [ ] Voice-based learning interface

## 🙏 Acknowledgments

- **NVIDIA NIM** for free open-source LLM inference
- **Anthropic** for Claude API (optional)
- **React Native/Expo** community
- Contributors and users

---

**Built with ❤️ by [Aashish Paudel](https://github.com/Aashish-po)**

*AI-Powered Education | Open Source | MIT License*
