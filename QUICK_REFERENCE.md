# 🚀 StudyBuddy AI - Production Deployment Quick Reference

**TL;DR: Complete the items below before shipping to app stores.**

---

## ⚡ 5-Minute Quickstart

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Fill these critical values in .env:
# - DATABASE_URL (your MySQL connection)
# - OAUTH_SERVER_URL, VITE_APP_ID, OWNER_OPEN_ID (from OAuth provider)
# - BUILT_IN_FORGE_API_KEY (from Manus Forge)
# - ML_SERVICE_URL (http://localhost:8000 for dev, your ML service URL for prod)
# - JWT_SECRET (run: openssl rand -hex 32)
# - SENTRY_DSN (from sentry.io, optional but recommended)

# 3. Start development servers (all three concurrently)
pnpm dev
# Or separately:
# Terminal 1: pnpm dev:server      (Express backend)
# Terminal 2: pnpm dev:metro       (React Native frontend)
# Terminal 3: pnpm dev:ml          (Python ML service on port 8000)

# 4. Build for app stores
eas init                                           # One-time setup
eas credentials                                    # Generate signing keys
eas build --platform ios --profile production
eas build --platform android --profile production

# 5. Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## 📋 Pre-Submission Checklist

### Code Quality (1 hour)
- [ ] `pnpm check` passes (no TypeScript errors)
- [ ] `pnpm lint` passes (no warnings)
- [ ] `pnpm test` passes (all tests green)
- [ ] No `console.log()` left in production code
- [ ] No hardcoded API keys or secrets

### Security (30 minutes)
- [ ] `SENTRY_DSN` configured (error tracking enabled)
- [ ] Rate limiting configured (no API abuse)
- [ ] HTTPS enforced in production
- [ ] OAuth PKCE flow verified
- [ ] Secure token storage verified
- [ ] ML service health check passing (`curl http://localhost:8000/api/ml/health`)

### App Store Assets (2-3 hours)
- [ ] 6 screenshots prepared (1242x2208 iOS or 1440x3120 Android)
- [ ] App icon ready (512x512 PNG)
- [ ] App name and description written
- [ ] Privacy policy URL ready
- [ ] Terms of service URL ready

### Version & Builds (1 hour)
- [ ] App version updated (app.config.ts, package.json)
- [ ] EAS credentials generated (`eas credentials`)
- [ ] iOS build created (`eas build --platform ios --profile production`)
- [ ] Android build created (`eas build --platform android --profile production`)

---

## 🔗 Key Files

| File | Purpose | Action |
|------|---------|--------|
| `eas.json` | Build config | Already configured ✅ |
| `.env.example` | Env template | Copy to `.env` and fill values |
| `PRIVACY.md` | Legal doc | Host on web or link from App |
| `TERMS_OF_SERVICE.md` | Legal doc | Host on web or link from App |
| `PRODUCTION_CHECKLIST.md` | Detailed checklist | Use before launch |
| `DEPLOYMENT_GUIDE.md` | Step-by-step guide | Read full guide before starting |
| `README_PRODUCTION.md` | Full summary | Reference doc |

---

## 🎯 Critical Items

### Must Do
1. **Fill `.env` file** with production credentials
2. **Create Sentry project** at https://sentry.io (free tier okay)
3. **Generate signing certificates** via `eas credentials`
4. **Test on real devices** (iOS + Android)
5. **Deploy databases** and verify connectivity
6. **Host Privacy Policy** and **Terms of Service** somewhere accessible

### Should Do
1. **Complete Phase 7 incomplete features** or gate as "Coming Soon"
2. **Set up error tracking** (Sentry integration)
3. **Configure rate limiting** (prevents API abuse)
4. **Add error boundary** (graceful crash recovery)

### Nice to Have
1. **Set up Firebase Analytics** (usage tracking)
2. **Configure push notifications** (user engagement)
3. **Set up staging environment** (pre-production testing)

---

## 🚀 Deployment Timeline

| Timeline | Task | Duration |
|----------|------|----------|
| **Week 1** | Prepare environment, fix code quality | 10-15 hours |
| **Week 2** | Build, test on devices, prepare screenshots | 8-10 hours |
| **Week 3** | Submit to stores, monitor approval | 2-3 hours |

Total: ~20-28 hours of work

---

## 🔧 Common Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -i :3000` then `kill -9 <PID>` |
| Database connection fails | Verify `DATABASE_URL` in `.env`, test connection |
| OAuth callback not working | Check deep link scheme in `app.config.ts` |
| API timeouts | Check `BUILT_IN_FORGE_API_KEY` and network connectivity |
| Build fails | Run `eas credentials` to regenerate signing keys |

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting) for more.

---

## 📱 What You Get

✅ **Security**: Helmet headers, rate limiting, HSTS, CSP  
✅ **Error Tracking**: Sentry integration for crash reporting  
✅ **Error Recovery**: React error boundary for graceful failures  
✅ **Feature Flags**: Control features without app updates  
✅ **Legal Docs**: Privacy Policy and Terms of Service  
✅ **Build Config**: EAS configuration for iOS/Android builds  
✅ **Deployment Guides**: 4 comprehensive guides for your team  

---

## 📚 Next Steps

1. **Read now**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) (10 min)
2. **Do this week**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) (20+ hours)
3. **Reference later**: [README_PRODUCTION.md](./README_PRODUCTION.md)

---

## ❓ FAQ

**Q: Do I need all these files?**  
A: No. Minimum: `.env.example`, `eas.json`, `PRIVACY.md`, `TERMS_OF_SERVICE.md`. The rest are helpful but optional.

**Q: Can I deploy without Sentry?**  
A: Yes. Leave `SENTRY_DSN` empty. But error tracking is highly recommended.

**Q: What if I need to hot-fix after launch?**  
A: See [Hot-fix procedure](./DEPLOYMENT_GUIDE.md#hotfix-procedure-if-critical-bug) in the deployment guide.

**Q: How long does app store review take?**  
A: iOS: 24-48 hours. Android: 2-4 hours. Sometimes longer if issues found.

**Q: Can I test builds locally before submitting to stores?**  
A: Yes! Create preview builds with `--profile preview` and test via Expo app.

---

**Ready to ship?** → Start with [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 🚀
