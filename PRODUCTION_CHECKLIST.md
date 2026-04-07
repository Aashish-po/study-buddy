# 📱 StudyBuddy AI - Production Deployment Checklist

**Last Updated:** April 7, 2026

This checklist ensures your app is production-ready before submitting to app stores.

---

## ✅ Pre-Deployment Phase (Week 1-2)

### Code Quality
- [ ] **TypeScript**: Run `pnpm check` with zero errors
  ```bash
  pnpm check
  ```
- [ ] **Linting**: Run `pnpm lint` with zero warnings
  ```bash
  pnpm lint
  ```
- [ ] **Testing**: Run all tests
  ```bash
  pnpm test
  ```
- [ ] **Remove dev code**: Delete or gate all console.log, test data, and dev-only routes
- [ ] **Code review**: Have another developer review critical paths (auth, payments, data handling)

### Security Audit
- [ ] **Secrets check**: No API keys, tokens, or secrets hardcoded in codebase
  ```bash
  git grep -i "secret\|password\|token" | grep -v ".example"
  ```
- [ ] **Dependencies audit**: Check for known vulnerabilities
  ```bash
  npm audit
  ```
- [ ] **HTTPS enforcement**: Verify production uses HTTPS only
- [ ] **OAuth PKCE**: Verify PKCE flow is implemented for OAuth
- [ ] **Secure storage**: Verify tokens stored in secure storage (expo-secure-store)

### Environment Setup
- [ ] **Production credentials**: Generate new API keys and credentials for production
- [ ] **JWT Secret**: Generate a secure 32+ character JWT secret
  ```bash
  openssl rand -hex 32
  ```
- [ ] **Database backup**: Set up daily automatic backups
- [ ] **Monitoring**: Configure Sentry for error tracking
  - [ ] Create Sentry project
  - [ ] Add SENTRY_DSN to `.env`
  - [ ] Test error capture with test event

### Configuration Files
- [ ] **`.env.example`**: Documented with all required variables ✅
- [ ] **`eas.json`**: EAS build configuration in place ✅
- [ ] **`app.config.ts`**: Version bumped, correct bundle IDs
- [ ] **`package.json`**: Version matches your release (currently 1.0.0)

### Documentation
- [ ] **Privacy Policy**: Created and accessible ✅ [PRIVACY.md](../PRIVACY.md)
- [ ] **Terms of Service**: Created and accessible ✅ [TERMS_OF_SERVICE.md](../TERMS_OF_SERVICE.md)
- [ ] **Deployment guide**: Created for team reference
- [ ] **API documentation**: tRPC endpoints documented

---

## 🔧 Build & Signing Phase (Week 2)

### iOS Setup
- [ ] **Apple Developer Account**: Active membership with Team ID
- [ ] **App Store Connect**: App created and ASCID obtained
- [ ] **Signing Certificates**: Generated via EAS Credentials
  ```bash
  eas credentials --platform ios
  ```
- [ ] **Provisioning Profile**: Automatic (EAS manages)
- [ ] **App icons**: 1024x1024px icon.png verified
- [ ] **Launch Screen**: Customized with app branding
- [ ] **Privacy manifest**: Required for iOS 17+ (auto-generated)

### Android Setup
- [ ] **Google Play Developer Account**: Active membership
- [ ] **Signing Key**: Generated via EAS Credentials
  ```bash
  eas credentials --platform android
  ```
- [ ] **Google Play App**: Created in Firebase/Play Console
- [ ] **App icons**: Adaptive icon (foreground, background, monochrome)
- [ ] **Permissions**: POST_NOTIFICATIONS declared in app.config.ts ✅
- [ ] **Orientation**: Set to portrait in app.config.ts ✅

### EAS Build Certificates
- [ ] **iOS Development Certificate**: Generated
- [ ] **iOS Distribution Certificate**: Generated
- [ ] **Android Keystore**: Generated
- [ ] **Credentials saved**: Store securely (EAS stores them)

---

## 📱 Platform Testing Phase (Week 2-3)

### iOS Testing
- [ ] **Device test**: Install on real iPhone (minimum iOS 15)
- [ ] **Simulator test**: Test on iPhone 12 mini (smallest device)
- [ ] **Startup time**: Measure app launch (goal: < 3 seconds)
- [ ] **Memory usage**: Check for leaks during extended use
- [ ] **Networking**: Test on slow 3G connection
- [ ] **Offline**: Test with airplane mode if offline mode enabled
- [ ] **Gestures**: Verify back gesture works (predictiveBackGestureEnabled: false)
- [ ] **Deep links**: Test OAuth callback deep link
- [ ] **Permissions**: Test notification permissions, location (if applicable)
- [ ] **Interface**: Verify no clipping on notched devices
- [ ] **Dark mode**: Test light and dark theme
- [ ] **Accessibility**: Screen reader test, contrast check

### Android Testing
- [ ] **Device test**: Install on real Android device (minimum Android 9)
- [ ] **Emulator test**: Test on Pixel 5 emulator
- [ ] **Startup time**: Measure app launch
- [ ] **Memory usage**: Monitor for leaks
- [ ] **Networking**: Test on slow connection
- [ ] **Back button**: Verify back navigation and exit behavior
- [ ] **Deep links**: Test OAuth callback
- [ ] **Permissions**: Test notification/runtime permissions
- [ ] **Interface**: Verify design on 6"+ screens
- [ ] **Dark mode**: Test both themes
- [ ] **Accessibility**: Screen reader test

### Feature Testing
- [ ] **Chat flow**: Send message, receive AI response, verify formatting
- [ ] **Study aids**: Generate flashcards, quizzes, summaries
- [ ] **Progress tracking**: Verify calculations and data persistence
- [ ] **Settings**: Save and verify user preferences
- [ ] **Auth flow**: Login, logout, session refresh
- [ ] **Error handling**: Network errors, API timeouts, graceful degradation
- [ ] **Performance**: Monitor API response times, no jank on scrolling

---

## 🎨 App Store Assets Phase (Week 2-3)

### Screenshots (6 per language minimum)
- [ ] **Design**: Professional, high-quality
- [ ] **Text-free**: No English text for multi-language support
- [ ] **Branding**: App branding visible
- [ ] **Sizes**: 
  - iOS: 1242x2208 px
  - Android: 1440x3120 px
- [ ] **Content**: Showcase key features
  1. Home screen
  2. Chat tutor in action
  3. Study aids
  4. Progress tracking
  5. Settings
  6. Error state (optional)

### Metadata
- [ ] **App Name**: "StudyBuddy AI" (finalized)
- [ ] **Subtitle**: Short description (<30 chars)
- [ ] **Description**: 4000 chars max, compelling copy
- [ ] **Keywords**: "education, tutoring, AI, learning, study"
- [ ] **Category**: Education
- [ ] **Rating**: Content rating completed
- [ ] **Support URL**: Valid support email/URL
- [ ] **Privacy Policy URL**: HTTPS public URL
- [ ] **Terms URL**: HTTPS public URL
- [ ] **Icon**: 512x512 px PNG, verified correct

---

## 🚀 Build & Internal Testing Phase (Week 3)

### Build Creation
- [ ] **EAS Build Preview**: Create internal build
  ```bash
  eas build --platform ios --profile preview
  eas build --platform android --profile preview
  ```
- [ ] **Install on devices**: Via Expo app or direct install
- [ ] **Internal testing**: QA team tests all flows

### Beta Distribution (Optional)
- [ ] **TestFlight (iOS)**: Submit to TestFlight for beta testing
- [ ] **Google Play Beta**: Submit to Play Store beta channel
- [ ] **Beta tester feedback**: Iterate based on feedback
- [ ] **Bug fixes**: Critical bugs fixed and re-tested

---

## 📦 Production Build Phase (Week 3)

### Production Build
- [ ] **Version number**: Bumped correctly (e.g., 1.0.0)
- [ ] **Build number**: Incremented
- [ ] **Changelog**: Written and ready
- [ ] **EAS Build Production**:
  ```bash
  eas build --platform ios --profile production
  eas build --platform android --profile production
  ```
- [ ] **Build verification**: APK/IPA downloaded and verified structure

### Pre-Submission Legal
- [ ] **Privacy Policy**: Reviewed by legal (if required)
- [ ] **Terms of Service**: Reviewed by legal (if required)
- [ ] **Encryption declaration**: iOS ITSAppUsesNonExemptEncryption set to false (no end-to-end encryption)

---

## 🏪 App Store Submission Phase (Week 3-4)

### iOS App Store
- [ ] **Build uploaded**: Submit build via App Store Connect
- [ ] **Metadata finalized**: All fields filled and reviewed
- [ ] **Screenshots uploaded**: All 6+ screenshots
- [ ] **Version release notes**: Written
- [ ] **Export compliance**: Confirmed
- [ ] **Advertising ID**: Declared if used
- [ ] **Submission**: Click "Submit for Review"
- [ ] **Review status**: Monitor approval (typically 24-48 hours)

### Google Play Store
- [ ] **APK/Bundle uploaded**: Upload production build
- [ ] **Metadata finalized**: All fields filled
- [ ] **Screenshots uploaded**: All 5+ screenshots
- [ ] **Release notes**: Written
- [ ] **Content rating**: Questionnaire completed
- [ ] **App permissions**: Verified against actual usage
- [ ] **Submission**: Click "Review and roll out"
- [ ] **Status monitoring**: Usually approved within 3-4 hours

---

## 📊 Post-Launch Monitoring (Ongoing)

### Week 1 Post-Launch
- [ ] **Monitor crashes**: Check Sentry for crashes
  - [ ] Triage and fix critical crashes
  - [ ] Prioritize by frequency and impact
- [ ] **Monitor performance**: Check API response times
- [ ] **Monitor user feedback**: App store reviews
- [ ] **Hotfix ready**: Be prepared to submit emergency fixes

### First Month
- [ ] **Analytics review**: Check Firebase analytics
  - [ ] Feature adoption rate
  - [ ] User retention
  - [ ] Conversion metrics
- [ ] **Error tracking**: Review Sentry weekly
- [ ] **User support**: Respond to reviews and support emails
- [ ] **Feedback collection**: Implement user feedback for v1.1

### Ongoing
- [ ] **Weekly error review**: Sentry dashboard
- [ ] **Monthly analytics review**: Trends and metrics
- [ ] **Quarterly updates**: New features and improvements
- [ ] **Security patches**: Apply promptly
- [ ] **Dependency updates**: Regular updates for security

---

## 🔐 Security Verification Checklist

- [ ] **No hardcoded secrets**: API keys, tokens, passwords encrypted
- [ ] **HTTPS only**: Production uses TLS 1.2+
- [ ] **Secure headers**: helmet middleware configured
- [ ] **Rate limiting**: API endpoints rate-limited
- [ ] **Input validation**: All inputs validated with Zod
- [ ] **Auth tokens**: Stored securely (expo-secure-store)
- [ ] **Cookies**: httpOnly, secure, sameSite flags set
- [ ] **CORS**: Properly configured for production domain
- [ ] **Database**: User permissions restricted, backups encrypted
- [ ] **Logs**: No sensitive data in logs

---

## 📋 Sign-Off

- [ ] **Code owner**: Reviewed and approved
- [ ] **QA lead**: All tests passed
- [ ] **Product manager**: Feature complete and as designed
- [ ] **Security review**: Passed security audit
- [ ] **Legal review**: Privacy/Terms reviewed (if required)

---

**Ready to Submit?** 🚀

Once all items are checked, you're ready for App Store submission!

For questions or issues during deployment, refer to:
- [Production Readiness Assessment](../README_PRODUCTION.md)
- [Expo Deployment Docs](https://docs.expo.dev/deploy/submit-to-app-stores/)
- [EAS Build Documentation](https://docs.expo.dev/eas-update/getting-started/)
