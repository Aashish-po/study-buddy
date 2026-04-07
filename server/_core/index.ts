import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { globalLimiter, authLimiter, apiCallLimiter } from "./rate-limiting";
import { initServerSentry } from "./sentry";

// Initialize Sentry error tracking if configured
const Sentry = initServerSentry();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security middleware - Set various HTTP headers for security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // Sentry request handler (if initialized)
  // if (Sentry) {
  //   app.use(Sentry.Handlers.requestHandler());
  // }

  // Global rate limiting to prevent abuse
  app.use("/api", globalLimiter);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Apply stricter rate limiting to tRPC endpoints (especially chat/AI endpoints)
  app.use("/api/trpc/chat", apiCallLimiter);
  app.use("/api/trpc/studyAids", apiCallLimiter);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Sentry error handler (if initialized) - must be after all other middleware
  // if (Sentry) {
  //   app.use(Sentry.Handlers.errorHandler());
  // }

  // Global error handler for unhandled exceptions
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Error Handler]", err);

    // Send error response
    if (res.headersSent) {
      return next(err);
    }

    res.status(err.status || 500).json({
      error: {
        message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
        status: err.status || 500,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
      },
    });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
