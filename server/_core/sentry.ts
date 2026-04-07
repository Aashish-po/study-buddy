/**
 * Sentry Error Tracking for Backend
 * Captures exceptions and performance metrics on the server
 */

import * as Sentry from "@sentry/node";

export function initServerSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT || "production";
  const release = process.env.SENTRY_RELEASE || "1.0.0";

  if (!dsn) {
    console.warn("[Sentry] No SENTRY_DSN provided - error tracking disabled on backend");
    return null;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    beforeSend(event: any) {
      // Filter out health check errors
      if (event.request?.url?.includes("/api/health")) {
        return null;
      }
      return event;
    },
  });

  console.log(`[Sentry] Backend error tracking initialized for ${environment}`);

  return Sentry;
}

export { Sentry };
