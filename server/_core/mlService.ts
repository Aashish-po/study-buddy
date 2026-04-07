/**
 * ML Service Client
 * HTTP client for communicating with Python ML microservice
 * Includes error handling, timeouts, and fallback strategies
 */

import { ENV } from "./env";

// ==================== Type Definitions ====================

export interface PerformanceRecord {
  topic: string;
  score: number;
  timestamp: string;
}

export interface RecommendationRequest {
  userId: string;
  studiedTopics: string[];
  performanceHistory: PerformanceRecord[];
}

export interface RecommendedTopic {
  topic: string;
  confidence: number; // 0-1
  reason: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
}

export interface NextStudySession {
  suggestedDuration: number;
  suggestedTime: string;
  preferredLength: "short" | "medium" | "long";
}

export interface RecommendationResponse {
  recommendedTopics: RecommendedTopic[];
  nextStudySession: NextStudySession;
  explanations?: string;
}

// ==================== Knowledge Gap Types ====================

export interface QuizResult {
  topic: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
}

export interface ChatInteraction {
  topic: string;
  sentiment: "positive" | "neutral" | "negative";
  timestamp: string;
}

export interface KnowledgeGapRequest {
  userId: string;
  quizResults: QuizResult[];
  chatInteractions: ChatInteraction[];
}

export interface WeakArea {
  topic: string;
  masteryLevel: number; // 0-100
  priority: "high" | "medium" | "low";
  suggestedActions: string[];
  conceptsToFocus: string[];
}

export interface KnowledgeGapResponse {
  weakAreas: WeakArea[];
  overallMastery: number; // 0-100
  readinessForExam?: number; // 0-100
  improvementPotential?: number; // 0-100
}

// ==================== Retention Types ====================

export interface RetentionPredictionRequest {
  topic: string;
  lastStudied: string;
  reviewCount: number;
  averageScore: number;
}

export interface RetentionPredictionResponse {
  retentionProbability: number; // 0-100
  optimalReviewDate: string;
  forgettingCurveStage: "fresh" | "reviewing" | "at_risk" | "forgotten";
  daysSinceLastStudy: number;
  suggestedReviewMaterial?: string[];
}

// ==================== Study Plan Types ====================

export interface StudyPlanRequest {
  userId: string;
  examDate: string;
  topics: string[];
  hoursPerDay: number;
  currentMastery: Record<string, number>;
}

export interface DailyStudyPlan {
  date: string;
  topics: string[];
  estimatedDuration: number;
  activities: string[];
  focusAreas: string[];
}

export interface StudyMilestone {
  date: string;
  expectedMastery: number;
  topics: string[];
  checkpoint: string;
}

export interface StudyPlanResponse {
  dailyPlan: DailyStudyPlan[];
  milestones: StudyMilestone[];
  totalHoursRequired: number;
  recommendedStartDate: string;
  successProbability: number;
}

// ==================== Generic Response ====================

interface MLServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: boolean;
}

// ==================== ML Service Client ====================

class MLServiceClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor() {
    this.baseUrl = ENV.mlServiceUrl;
    this.timeout = 15000; // 15 seconds
    this.retries = 2;
  }

  /**
   * Make HTTP request to ML service with retry logic
   */
  private async request<T>(
    endpoint: string,
    body: Record<string, unknown> | any,
    retryCount = 0,
  ): Promise<MLServiceResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      console.log(`[ML Service] ${endpoint.toUpperCase()} request`, { retryCount });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ML Service] Error ${response.status}:`, errorText);

        // Retry on server error
        if (response.status >= 500 && retryCount < this.retries) {
          console.log(`[ML Service] Retrying... (attempt ${retryCount + 1})`);
          await this._delay(1000 * (retryCount + 1)); // Exponential backoff
          return this.request<T>(endpoint, body, retryCount + 1);
        }

        return {
          success: false,
          error: `ML service error: ${response.status}`,
        };
      }

      const data = await response.json();
      console.log(`[ML Service] ${endpoint} success`);
      return { success: true, data };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("[ML Service] Request timeout");

        // Retry on timeout
        if (retryCount < this.retries) {
          console.log(`[ML Service] Retrying after timeout... (attempt ${retryCount + 1})`);
          await this._delay(1000 * (retryCount + 1));
          return this.request<T>(endpoint, body, retryCount + 1);
        }

        return { success: false, error: "ML service request timed out" };
      }

      console.error("[ML Service] Connection error:", error);
      return {
        success: false,
        error: "ML service unavailable",
      };
    }
  }

  /**
   * Get personalized topic recommendations
   */
  async getRecommendations(
    request: RecommendationRequest,
  ): Promise<MLServiceResponse<RecommendationResponse>> {
    return this.request<RecommendationResponse>("/api/ml/recommend", request);
  }

  /**
   * Analyze knowledge gaps and weak areas
   */
  async analyzeKnowledgeGaps(
    request: KnowledgeGapRequest,
  ): Promise<MLServiceResponse<KnowledgeGapResponse>> {
    return this.request<KnowledgeGapResponse>("/api/ml/knowledge-gaps", request);
  }

  /**
   * Predict retention probability for a topic
   */
  async predictRetention(
    request: RetentionPredictionRequest,
  ): Promise<MLServiceResponse<RetentionPredictionResponse>> {
    return this.request<RetentionPredictionResponse>(
      "/api/ml/predict-retention",
      request,
    );
  }

  /**
   * Generate a personalized study plan
   */
  async generateStudyPlan(
    request: StudyPlanRequest,
  ): Promise<MLServiceResponse<StudyPlanResponse>> {
    return this.request<StudyPlanResponse>("/api/ml/study-plan", request);
  }

  /**
   * Health check - is ML service available?
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ml/health`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      const isOk = response.ok;
      console.log(`[ML Service] Health check: ${isOk ? "OK" : "FAILED"}`);
      return isOk;
    } catch (error) {
      console.error("[ML Service] Health check failed:", error);
      return false;
    }
  }

  /**
   * Utility: delay for retry logic
   */
  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mlService = new MLServiceClient();
