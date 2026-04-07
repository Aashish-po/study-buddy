/**
 * Rate Limiting Middleware for Express
 * Prevents API abuse and protects against brute force attacks
 */

import rateLimit from "express-rate-limit";

// Global rate limiter - applies to all API routes
export const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_REQUESTS || "100"), // 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health";
  },
  keyGenerator: (req) => {
    // Use IP address as the key for rate limiting
    // If behind a proxy, extract the real IP
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "unknown";
  },
});

// Stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many login attempts, please try again after 15 minutes",
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for LLM/API-heavy endpoints (chat, generation)
export const apiCallLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: "Too many API calls, please wait before trying again",
  standardHeaders: true,
  legacyHeaders: false,
});
