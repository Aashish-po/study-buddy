import { useState, useCallback } from 'react';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export interface VoiceState {
  isListening: boolean;
  isPlaying: boolean;
  transcript: string;
  error: string | null;
}

/**
 * Hook for voice interaction (speech-to-text and text-to-speech)
 */
export function useVoice() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isPlaying: false,
    transcript: '',
    error: null,
  });

  /**
   * Start listening for speech input
   * Note: Requires expo-speech and native permissions
   */
  const startListening = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isListening: true, error: null }));

      // In a real implementation, you would use expo-speech or react-native-voice
      // For now, this is a placeholder that demonstrates the pattern
      if (Platform.OS !== 'web') {
        // Native implementation would go here
        console.log('Speech recognition would start here');
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: error instanceof Error ? error.message : 'Failed to start listening',
      }));
    }
  }, []);

  /**
   * Stop listening and get transcript
   */
  const stopListening = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isListening: false }));
      // Transcript would be set here from native module
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop listening',
      }));
    }
  }, []);

  /**
   * Play text using text-to-speech
   */
  const speak = useCallback(
    async (text: string, options?: { rate?: number; pitch?: number; language?: string }) => {
      try {
        setState((prev) => ({ ...prev, isPlaying: true, error: null }));

        await Speech.speak(text, {
          rate: options?.rate || 1,
          pitch: options?.pitch || 1,
          language: options?.language || 'en-US',
        });

        setState((prev) => ({ ...prev, isPlaying: false }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          error: error instanceof Error ? error.message : 'Failed to play speech',
        }));
      }
    },
    []
  );

  /**
   * Stop current speech playback
   */
  const stopSpeaking = useCallback(async () => {
    try {
      await Speech.stop();
      setState((prev) => ({ ...prev, isPlaying: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop speech',
      }));
    }
  }, []);

  /**
   * Clear transcript
   */
  const clearTranscript = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: '' }));
  }, []);

  /**
   * Set transcript manually
   */
  const setTranscript = useCallback((text: string) => {
    setState((prev) => ({ ...prev, transcript: text }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    setTranscript,
  };
}

/**
 * Get available voices for text-to-speech
 */
export async function getAvailableVoices() {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices;
  } catch (error) {
    console.error('Error getting voices:', error);
    return [];
  }
}

/**
 * Check if speech recognition is available
 */
export function isSpeechRecognitionAvailable(): boolean {
  return Platform.OS !== 'web';
}

/**
 * Check if text-to-speech is available
 */
export function isTextToSpeechAvailable(): boolean {
  return true; // expo-speech is available on all platforms
}
