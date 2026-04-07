# 🚀 StudyBuddy AI - Production Deployment Guide

**Version:** 1.0.0  
**Last Updated:** April 7, 2026

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Pre-Deployment](#pre-deployment)
4. [Building for Stores](#building-for-stores)
5. [App Store Submission](#app-store-submission)
6. [Troubleshooting](#troubleshooting)
7. [Post-Deployment](#post-deployment)

---

## Quick Start

### Prerequisites

Ensure you have installed:

```bash
# Node.js 18+ LTS
node --version

# pnpm (already using)
pnpm --version

# EAS CLI for builds
npm install -g eas-cli
eas login
```

### One-Command Deployment (Before First Build)

```bash
# 1. Copy and fill environment variables
cp .env.example .env.local

# 2. Generate EAS credentials (one-time setup)
eas credentials

# 3. Create production build
eas build --platform ios --profile production
eas build --platform android --profile production

# 4. Submit to stores (requires builds above)
eas submit --platform ios
eas submit --platform android
```

---

## Environment Setup

### 1. Generate `.env.local`

```bash
cp .env.example .env.local
```

### 2. Fill Required Variables

| Variable | Source | How to Get |
|----------|--------|-----------|
| `DATABASE_URL` | MySQL Server | Your database credentials |
| `OAUTH_SERVER_URL` | OAuth Provider | From your OAuth provider settings |
| `VITE_APP_ID` | OAuth Provider | Application ID from OAuth provider |
| `OWNER_OPEN_ID` | OAuth Provider | Your owner ID from OAuth provider |
| `BUILT_IN_FORGE_API_URL` | Manus Forge | https://api.manus.tech/llm |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge | Get from https://manus.tech dashboard |
| `ML_SERVICE_URL` | ML Service | http://localhost:8000 (dev) or deployed URL (prod) |
| `JWT_SECRET` | Generate | `openssl rand -hex 32` |
| `SENTRY_DSN` | Sentry | Create project at https://sentry.io |
| `NODE_ENV` | Manual | Set to `production` |

### 3. Generate Secure Credentials

```bash
# Generate JWT Secret (32 characters minimum)
openssl rand -hex 32

# Generate application-specific API keys
# (Use your existing infrastructure)
```

### 4. Test Configuration

```bash
# Verify all env vars are set correctly
pnpm check
```

### 5. ML Service Setup (Optional but Recommended)

The ML microservice provides advanced features:
- **Topic Recommendations** - Personalized study suggestions
- **Knowledge Gap Detection** - Identifies weak areas
- **Retention Prediction** - Spaced repetition scheduling
- **Study Plan Generation** - Exam preparation scheduling

#### Development Setup

```bash
# Install Python dependencies
cd ml-service
pip install -r requirements.txt

# Start ML service (separate terminal)
python -m uvicorn app.main:app --reload --port 8000

# Or use pnpm (runs all three concurrently)
cd ..
pnpm dev
```

#### Production Deployment (Docker)

```bash
# Build Docker image
docker build -t studybuddy-ml ml-service/

# Run container
docker run -d \
  -p 8000:8000 \
  -e ML_SERVICE_URL=http://localhost:8000 \
  studybuddy-ml

# Or deploy via Docker Compose (see ml-service/docker-compose.yml)
docker-compose -f ml-service/docker-compose.yml up -d
```

#### Verify ML Service is Running

```bash
# Check health
curl http://localhost:8000/api/ml/health

# Expected response:
# {"status":"healthy","version":"1.0.0"}
```

#### If ML Service is Unavailable

The app continues working with fallback strategies:
- Recommendations return empty list
- Knowledge gaps show no weaknesses detected
- Retention prediction uses basic algorithm
- Study plans not generated

**No action required** - app gracefully degrades.

---

## Pre-Deployment

### Step 1: Code Quality & Security

```bash
# Type checking
pnpm check

# Linting
pnpm lint

# Testing
pnpm test

# Remove console.logs
grep -r "console\." src/ server/ app/ components/
# or use: git grep "console\." | grep -v node_modules
```

### Step 2: Build Verification

```bash
# Create development build to verify compilation
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Test on devices before production submission
```

### Step 3: Performance Audit

```bash
# Check bundle size
npm ls | head -20

# Profile startup time
# (Measure manually on device: from app launch to first interaction)
# Goal: < 3 seconds
```

### Step 4: Update Version Numbers

Edit `app.config.ts`:

```typescript
const config: ExpoConfig = {
  // ...
  version: "1.0.0", // Update this for each release
  // ...
};
```

Also update `package.json`:

```json
{
  "version": "1.0.0"
}
```

### Step 5: Verify All Assets

```bash
# App icon (1024x1024px)
ls -la assets/images/icon.png

# Splash screen
ls -la assets/images/adaptive-icon-* 

# Verify images are optimized (< 500KB)
du -h assets/images/
```

---

## Building for Stores

### Initial Setup (One-Time)

```bash
# 1. Set up EAS project (if not already done)
eas init

# 2. Generate signing credentials
eas credentials

# Follow prompts:
# - iOS: Create new certificate and provisioning profile
# - Android: Create new keystore

# 3. Verify credentials saved
eas credentials --list
```

### iOS Build

```bash
# Create development/preview build
eas build --platform ios --profile preview

# Create production build (for App Store)
eas build --platform ios --profile production

# Check build status
eas build:list
```

### Android Build

```bash
# Create development/preview build
eas build --platform android --profile preview

# Create production build (for Play Store)
eas build --platform android --profile production

# Check build status
eas build:list
```

### Build Configuration

See `eas.json` in the project root for configuration details.

---

## App Store Submission

### iOS App Store

#### Prepare Assets

1. **Screenshots** (6 minimum, 1242x2208px each)
   - Home screen with quick start buttons
   - Chat tutor showing AI response
   - Study aids (flashcards/quizzes)
   - Progress tracker
   - Settings screen
   - A complete flow/user journey

2. **App Name**: StudyBuddy AI
3. **Subtitle**: Learn with an AI Tutor
4. **Description**: Write compelling copy (~4000 chars)
5. **Keywords**: education, tutoring, AI, learning, study
6. **Support URL**: support@studybuddy.ai
7. **Privacy Policy**: https://your-domain.com/privacy
8. **Terms of Service**: https://your-domain.com/terms

#### Submit to App Store

```bash
# Option 1: Use EAS Submit (Recommended)
eas submit --platform ios --latest

# Option 2: Manual via App Store Connect
# 1. Go to https://appstoreconnect.apple.com
# 2. Select your app
# 3. Upload build in "TestFlight" section
# 4. Click "Prepare for Submission"
# 5. Fill in metadata and submit
```

#### Common Reasons for Rejection

- ❌ Missing privacy policy or terms of service
- ❌ Requires login at startup (make it optional)
- ❌ Crashes on app launch
- ❌ Undefined backend behavior when API unavailable
- ❌ Poor app icon quality or resolution
- ❌ Misleading descriptions or screenshots

### Google Play Store

#### Prepare Assets

1. **Screenshots** (5 minimum, 1440x3120px each)
   - Similar content to iOS

2. **Feature Graphic**: 1024×500 px banner image
3. **App Icon**: 512×512 px
4. **Short Description**: 80 chars max
5. **Full Description**: 4000 chars max
6. **Category**: Education
7. **Content Rating**: Complete questionnaire
8. **Privacy Policy**: HTTPS public URL
9. **Support URL**: Email address

#### Submit to Play Store

```bash
# Option 1: Use EAS Submit (Recommended)
eas submit --platform android --latest

# Option 2: Manual via Google Play Console
# 1. Go to https://play.google.com/console
# 2. Select your app
# 3. Go to "Releases" → "Production"
# 4. Create new release with APK/AAB
# 5. Fill in release notes
# 6. Roll out to production
```

---

## Troubleshooting

### Build Issues

#### "Port 3000 already in use"

```bash
# Find process using port
lsof -i :3000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

#### "DATABASE_URL not found"

```bash
# Verify .env file exists and has DATABASE_URL
cat .env.local | grep DATABASE_URL

# Test database connection
mysql -h localhost -u user -p -e "SELECT 1"
```

#### "Sentry DSN not configured"

```bash
# If you want error tracking:
# 1. Create Sentry project at https://sentry.io
# 2. Copy DSN
# 3. Add SENTRY_DSN=<your-dsn> to .env

# If you don't want Sentry, leave SENTRY_DSN empty
# App will work fine without it
```

### Deployment Issues

#### "Too many API requests" errors

```bash
# Check rate limiting in server/_core/rate-limiting.ts
# Default: 100 requests per 15 minutes

# Adjust in .env:
RATE_LIMIT_REQUESTS=200
RATE_LIMIT_WINDOW_MS=900000
```

#### "OAuth callback not working"

```bash
# Verify deep link scheme in app.config.ts
# Should match: manus{TIMESTAMP}

# Test deep link:
# Android: adb shell am start -W -a android.intent.action.VIEW -d "manus20260407103045://..."
# iOS: xcrun simctl openurl booted "manus20260407103045://..."
```

#### "Chat API timeout"

```bash
# Check LLM configuration
echo "BUILT_IN_FORGE_API_URL=$BUILT_IN_FORGE_API_URL"
echo "BUILT_IN_FORGE_API_KEY=$BUILT_IN_FORGE_API_KEY"

# Test LLM endpoint
curl -X POST "$BUILT_IN_FORGE_API_URL" \
  -H "Authorization: Bearer $BUILT_IN_FORGE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello"}'
```

### Performance Issues

#### "App takes too long to start"

```bash
# Profile startup (measure with stopwatch)
# Goal: < 3 seconds from tap to first screen

# Optimize:
# 1. Lazy-load heavy components
# 2. Reduce initial bundle size
# 3. Optimize database queries
```

#### "Chat responses are slow"

```bash
# Check LLM API latency
# Expected: 1-3 seconds per response

# If slow:
# 1. Check network connectivity (run on 3G)
# 2. Check LLM service status
# 3. Verify API key is valid
```

---

## Post-Deployment

### Week 1: Monitor

```bash
# Check crash reports
# Dashboard: https://sentry.io

# Check user analytics
# Dashboard: https://console.firebase.google.com

# Monitor app performance
# Dashboard: App Store Connect / Google Play Console
```

### Monitor Metrics

- **Crash rate**: Should be < 0.1%
- **AOD (Average Operating Duration)**: Track user engagement
- **Retention**: Day-1, Day-7, Day-30 retention rates
- **Conversion**: Signup to first study session

### Hotfix Procedure (If Critical Bug)

```bash
# 1. Fix the bug
git checkout -b hotfix/critical-issue

# 2. Increment build version
# Edit app.config.ts: version: "1.0.1"

# 3. Create emergency build
eas build --platform ios --profile production
eas build --platform android --profile production

# 4. Submit to stores
eas submit --platform ios
eas submit --platform android

# 5. Mark review as urgent on both stores
```

---

## Maintenance Checklist

### Weekly
- [ ] Review Sentry error reports
- [ ] Check Firebase Analytics
- [ ] Monitor API on/offline issues
- [ ] Read app store reviews

### Monthly
- [ ] Update dependencies (critical security patches)
- [ ] Review slow queries on database
- [ ] Audit API usage and costs
- [ ] Plan next features/updates

### Quarterly
- [ ] Review feature adoption metrics
- [ ] Plan next version release
- [ ] Security audit
- [ ] User feedback analysis

---

## Support & Resources

### Documentation
- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction
- **App Store Connect**: https://help.apple.com/app-store-connect
- **Google Play Console**: https://support.google.com/googleplay/android-developer

### Monitoring
- **Sentry**: https://sentry.io/docs
- **Firebase Analytics**: https://firebase.google.com/docs/analytics
- **App Store Analytics**: https://help.apple.com/app-store-connect/#/dev4e413fcb8

### Chat Support
- **Expo Community**: https://chat.expo.dev
- **GitHub Issues**: Create issue in your repo
- **Email**: support@studybuddy.ai

---

**Need help?** Check [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for a complete pre-launch checklist.

Good luck with your launch! 🚀
