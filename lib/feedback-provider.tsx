/* eslint-disable @typescript-eslint/no-redeclare */
import React, { createContext, useContext, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type LearningStyle =
  | "Visual"
  | "Auditory"
  | "Reading/Writing"
  | "Kinesthetic";

export interface UserPreferences {
  difficultyLevel: DifficultyLevel;
  learningStyle: LearningStyle;
  notificationsEnabled: boolean;
  darkModeEnabled: boolean;
  feedbackTone: "encouraging" | "neutral" | "challenging";
  pacePreference: "slow" | "moderate" | "fast";
}

export interface FeedbackContext {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  getAdaptedPrompt: (basePrompt: string) => string;
  recordUserFeedback: (
    topic: string,
    rating: number,
    comment: string,
  ) => Promise<void>;
  getUserFeedback: (topic: string) => Promise<any>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  difficultyLevel: "Intermediate",
  learningStyle: "Visual",
  notificationsEnabled: true,
  darkModeEnabled: false,
  feedbackTone: "encouraging",
  pacePreference: "moderate",
};

const PREFERENCES_STORAGE_KEY = "user_preferences";
const FEEDBACK_STORAGE_KEY = "user_feedback";

const FeedbackContext = createContext<FeedbackContext | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Load preferences on mount
  React.useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      try {
        const newPreferences = { ...preferences, ...updates };
        setPreferences(newPreferences);
        await AsyncStorage.setItem(
          PREFERENCES_STORAGE_KEY,
          JSON.stringify(newPreferences),
        );
      } catch (error) {
        console.error("Error updating preferences:", error);
      }
    },
    [preferences],
  );

  const getAdaptedPrompt = useCallback(
    (basePrompt: string): string => {
      let adaptedPrompt = basePrompt;

      // Add tone guidance
      if (preferences.feedbackTone === "encouraging") {
        adaptedPrompt +=
          "\n\nBe very encouraging and celebrate the student's effort. Use positive reinforcement.";
      } else if (preferences.feedbackTone === "challenging") {
        adaptedPrompt +=
          "\n\nChallenge the student to think deeper. Push them to explore more complex aspects.";
      }

      // Add learning style guidance
      switch (preferences.learningStyle) {
        case "Visual":
          adaptedPrompt +=
            "\n\nUse diagrams, charts, and visual descriptions. Help them visualize concepts.";
          break;
        case "Auditory":
          adaptedPrompt +=
            "\n\nExplain concepts as if speaking. Use analogies and rhythm in your explanations.";
          break;
        case "Reading/Writing":
          adaptedPrompt +=
            "\n\nProvide detailed written explanations. Use structured lists and bullet points.";
          break;
        case "Kinesthetic":
          adaptedPrompt +=
            "\n\nFocus on practical applications and hands-on examples. Relate to real-world scenarios.";
          break;
      }

      // Add pace guidance
      if (preferences.pacePreference === "slow") {
        adaptedPrompt +=
          "\n\nTake your time explaining. Break concepts into very small steps.";
      } else if (preferences.pacePreference === "fast") {
        adaptedPrompt +=
          "\n\nMove quickly through concepts. Assume the student can grasp ideas rapidly.";
      }

      return adaptedPrompt;
    },
    [preferences],
  );

  const recordUserFeedback = useCallback(
    async (topic: string, rating: number, comment: string) => {
      try {
        const feedback = {
          topic,
          rating,
          comment,
          timestamp: new Date().toISOString(),
        };

        const stored = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
        const feedbackList = stored ? JSON.parse(stored) : [];
        feedbackList.push(feedback);
        await AsyncStorage.setItem(
          FEEDBACK_STORAGE_KEY,
          JSON.stringify(feedbackList),
        );
      } catch (error) {
        console.error("Error recording feedback:", error);
      }
    },
    [],
  );

  const getUserFeedback = useCallback(async (topic: string) => {
    try {
      const stored = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (!stored) return null;

      const feedbackList = JSON.parse(stored);
      return feedbackList.find(
        (f: any) => f.topic.toLowerCase() === topic.toLowerCase(),
      );
    } catch (error) {
      console.error("Error getting feedback:", error);
      return null;
    }
  }, []);

  const value: FeedbackContext = {
    preferences,
    updatePreferences,
    getAdaptedPrompt,
    recordUserFeedback,
    getUserFeedback,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return context;
}
