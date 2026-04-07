/**
 * Feature Flags - Control feature availability without app updates
 * Use in production to gradually roll out or disable features
 */

export const FEATURE_FLAGS = {
  // Chat & Core Tutoring
  ENABLE_CHAT_HISTORY: process.env.ENABLE_CHAT_HISTORY !== "false", // Persist chat messages
  ENABLE_CHAT_EDITING: process.env.ENABLE_CHAT_EDITING !== "false", // Allow editing past messages

  // Study Aids
  ENABLE_FLASHCARD_ANIMATIONS: process.env.ENABLE_FLASHCARD_ANIMATIONS !== "false",
  ENABLE_QUIZ_SCORING: process.env.ENABLE_QUIZ_SCORING !== "false",
  ENABLE_VOICE_INPUT: process.env.ENABLE_VOICE_INPUT !== "false", // Speech-to-text for queries

  // Advanced Features
  ENABLE_OFFLINE_MODE: process.env.ENABLE_OFFLINE_MODE === "true", // Allow offline access
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS !== "false", // Send usage analytics
  ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS !== "false", // Push notifications

  // Experimental
  ENABLE_EXAM_TIMELINE: process.env.ENABLE_EXAM_TIMELINE === "true", // Exam planning
  ENABLE_STUDY_PLAN_GENERATION: process.env.ENABLE_STUDY_PLAN_GENERATION === "true",
  ENABLE_DATA_EXPORT: process.env.ENABLE_DATA_EXPORT === "true", // GDPR data download

  // DEBUG
  DEBUG_MODE: process.env.NODE_ENV === "development",
};

/**
 * Check if a feature is enabled
 * @param feature - Feature flag key
 * @returns true if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] ?? false;
}

/**
 * Get all enabled features (useful for debugging)
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);
}

/**
 * Example usage in components:
 *
 * ```tsx
 * import { isFeatureEnabled } from '@/constants/feature-flags';
 *
 * export function ChatScreen() {
 *   return (
 *     <View>
 *       {isFeatureEnabled('ENABLE_CHAT_HISTORY') && <ChatHistory />}
 *       {isFeatureEnabled('ENABLE_VOICE_INPUT') && <VoiceInput />}
 *     </View>
 *   );
 * }
 * ```
 */
