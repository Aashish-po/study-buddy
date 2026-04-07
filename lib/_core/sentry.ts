/**
 * Sentry Error Tracking Initialization
 * Captures and reports errors to Sentry for production monitoring
 */

import * as Sentry from "@sentry/react-native";
import { sentryTracesPropagationIntegration } from "@sentry/react-native";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT || "production";
  const release = process.env.SENTRY_RELEASE || "1.0.0";

  if (!dsn) {
    console.warn("[Sentry] No SENTRY_DSN provided - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% sampling in production
    enableNative: true,
    integrations: [
      sentryTracesPropagationIntegration(),
      new Sentry.reactNavigationIntegration(),
    ],
    beforeSend(event) {
      // Filter out certain errors in development
      if (process.env.NODE_ENV === "development") {
        return event;
      }

      return event;
    },
  });

  console.log(`[Sentry] Error tracking initialized for ${environment}`);
}

export { Sentry };
