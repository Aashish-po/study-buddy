// Validate required environment variables
function validateEnv() {
  const requiredVars = ['DATABASE_URL', 'VITE_APP_ID', 'OAUTH_SERVER_URL', 'JWT_SECRET', 'NVIDIA_API_KEY'];
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    console.error('[Environment] ERROR:', message);
    console.error('[Environment] Please set these variables in your .env file or Vercel dashboard');
  }
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // LLM - NVIDIA (Llama 3.3 70B)
  nvidiaApiKey: process.env.NVIDIA_API_KEY ?? "",
  // Optional: Legacy Manus Forge API (for image generation, voice transcription)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // ML Service
  mlServiceUrl: process.env.ML_SERVICE_URL ?? "http://localhost:8000",
};

// Validate on module load
validateEnv();
