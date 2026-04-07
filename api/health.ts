import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    res.status(200).json({
      status: "ok",
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("[Health Check Error]", error);
    res.status(500).json({
      status: "error",
      message: String(error),
    });
  }
};
