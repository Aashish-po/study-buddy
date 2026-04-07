/**
 * tRPC ML Router
 * Exposes ML service functionality to the frontend
 * Includes fallback strategies for service unavailability
 */

import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { mlService } from "./mlService";
import { ENV } from "./env";

export const mlRouter = router({
  /**
   * Get personalized topic recommendations
   * Suggests next topics to study based on performance history
   */
  getRecommendations: protectedProcedure
    .input(
      z.object({
        studiedTopics: z.array(z.string()).default([]),
        performanceHistory: z
          .array(
            z.object({
              topic: z.string(),
              score: z.number().min(0).max(100),
              timestamp: z.string(),
            }),
          )
          .default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await mlService.getRecommendations({
        userId: ctx.user?.openId ?? "anonymous",
        studiedTopics: input.studiedTopics,
        performanceHistory: input.performanceHistory,
      });

      if (!result.success) {
        console.warn("[tRPC ML] Recommendations fell back to default");
        // Fallback: return basic recommendations
        return {
          recommendedTopics: [],
          nextStudySession: {
            suggestedDuration: 30,
            suggestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            preferredLength: "medium" as const,
          },
          error: result.error,
          fallback: true,
        };
      }

      return {
        ...result.data,
        fallback: false,
      };
    }),

  /**
   * Analyze knowledge gaps
   * Identifies topics where user is struggling
   */
  analyzeKnowledgeGaps: protectedProcedure
    .input(
      z.object({
        quizResults: z
          .array(
            z.object({
              topic: z.string(),
              score: z.number(),
              totalQuestions: z.number(),
              timestamp: z.string(),
            }),
          )
          .default([]),
        chatInteractions: z
          .array(
            z.object({
              topic: z.string(),
              sentiment: z.enum(["positive", "neutral", "negative"]),
              timestamp: z.string(),
            }),
          )
          .default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await mlService.analyzeKnowledgeGaps({
        userId: ctx.user?.openId ?? "anonymous",
        quizResults: input.quizResults,
        chatInteractions: input.chatInteractions,
      });

      if (!result.success) {
        console.warn("[tRPC ML] Knowledge gap analysis fell back to default");
        return {
          weakAreas: [],
          overallMastery: 0,
          readinessForExam: 0,
          error: result.error,
          fallback: true,
        };
      }

      return {
        ...result.data,
        fallback: false,
      };
    }),

  /**
   * Predict retention probability
   * Uses spaced repetition algorithm to determine when to review
   */
  predictRetention: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        lastStudied: z.string(),
        reviewCount: z.number().int().nonnegative().default(0),
        averageScore: z.number().min(0).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await mlService.predictRetention({
        topic: input.topic,
        lastStudied: input.lastStudied,
        reviewCount: input.reviewCount,
        averageScore: input.averageScore,
      });

      if (!result.success) {
        console.warn("[tRPC ML] Retention prediction fell back to default");
        // Fallback: simple retention calculation
        const lastStudiedDate = new Date(input.lastStudied);
        const daysSinceStudied = Math.floor(
          (Date.now() - lastStudiedDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const baseRetention = Math.max(0, 100 - daysSinceStudied * 5);

        const reviewDays =
          daysSinceStudied < 3 ? 1 : daysSinceStudied < 7 ? 3 : 7;
        const nextReview = new Date(
          Date.now() + reviewDays * 24 * 60 * 60 * 1000,
        );

        return {
          retentionProbability: baseRetention,
          optimalReviewDate: nextReview.toISOString(),
          forgettingCurveStage:
            baseRetention > 80
              ? ("fresh" as const)
              : baseRetention > 50
                ? ("reviewing" as const)
                : baseRetention > 20
                  ? ("at_risk" as const)
                  : ("forgotten" as const),
          daysSinceLastStudy: daysSinceStudied,
          error: result.error,
          fallback: true,
        };
      }

      return {
        ...result.data,
        fallback: false,
      };
    }),

  /**
   * Generate a study plan
   * Creates day-by-day schedule leading up to exam
   */
  generateStudyPlan: protectedProcedure
    .input(
      z.object({
        examDate: z.string(),
        topics: z.array(z.string()),
        hoursPerDay: z.number().min(0.5).max(12),
        currentMastery: z.record(z.string(), z.number().min(0).max(100)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await mlService.generateStudyPlan({
        userId: ctx.user?.openId ?? "anonymous",
        examDate: input.examDate,
        topics: input.topics,
        hoursPerDay: input.hoursPerDay,
        currentMastery: input.currentMastery,
      });

      if (!result.success) {
        console.warn("[tRPC ML] Study plan generation fell back to default");
        return {
          dailyPlan: [],
          milestones: [],
          totalHoursRequired: 0,
          recommendedStartDate: new Date().toISOString(),
          successProbability: 0,
          error: result.error,
          fallback: true,
        };
      }

      return {
        ...result.data,
        fallback: false,
      };
    }),

  /**
   * Health check
   * Verify ML service is available
   */
  healthCheck: protectedProcedure.query(async () => {
    const isHealthy = await mlService.healthCheck();
    return {
      available: isHealthy,
      serviceUrl: ENV.mlServiceUrl,
      message: isHealthy
        ? "ML service is running"
        : "ML service is unavailable - using fallback strategies",
    };
  }),
});
