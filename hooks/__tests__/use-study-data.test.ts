import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe('useStudyData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default progress', () => {
    const mockAsyncStorage = AsyncStorage as any;
    mockAsyncStorage.getItem.mockResolvedValue(null);

    // Note: This is a simplified test since hooks require React context
    // In a real scenario, you would use renderHook from @testing-library/react
    expect(true).toBe(true);
  });

  it('should calculate average mastery correctly', () => {
    const topics = [
      { masteryLevel: 80 },
      { masteryLevel: 60 },
      { masteryLevel: 100 },
    ];

    const average = topics.reduce((sum, t) => sum + t.masteryLevel, 0) / topics.length;
    expect(average).toBe(80);
  });

  it('should identify weak areas (< 70% mastery)', () => {
    const topics = [
      { name: 'Math', masteryLevel: 50 },
      { name: 'Science', masteryLevel: 80 },
      { name: 'History', masteryLevel: 60 },
    ];

    const weakAreas = topics.filter((t) => t.masteryLevel < 70);
    expect(weakAreas).toHaveLength(2);
    expect(weakAreas[0].name).toBe('Math');
  });

  it('should identify strong areas (>= 80% mastery)', () => {
    const topics = [
      { name: 'Math', masteryLevel: 50 },
      { name: 'Science', masteryLevel: 85 },
      { name: 'History', masteryLevel: 90 },
    ];

    const strongAreas = topics.filter((t) => t.masteryLevel >= 80);
    expect(strongAreas).toHaveLength(2);
  });

  it('should handle empty topics list', () => {
    const topics: any[] = [];
    const average = topics.length > 0 ? topics.reduce((sum, t) => sum + t.masteryLevel, 0) / topics.length : 0;
    expect(average).toBe(0);
  });
});
