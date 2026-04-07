import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface WeakArea {
  id: string;
  topic: string;
  mastery: number;
  lastStudied: string;
  recommendedFocus: string;
}

interface Statistic {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const WEAK_AREAS: WeakArea[] = [
  {
    id: "1",
    topic: "Algebra - Polynomials",
    mastery: 55,
    lastStudied: "1 week ago",
    recommendedFocus: "Focus on factoring techniques",
  },
  {
    id: "2",
    topic: "Biology - Cellular Respiration",
    mastery: 65,
    lastStudied: "3 days ago",
    recommendedFocus: "Review the electron transport chain",
  },
  {
    id: "3",
    topic: "History - Renaissance Period",
    mastery: 68,
    lastStudied: "5 days ago",
    recommendedFocus: "Study key figures and movements",
  },
];

const STATISTICS: Statistic[] = [
  { label: "Topics Studied", value: "12", icon: "book.fill", color: "#0A7EA4" },
  {
    label: "Study Streak",
    value: "7 days",
    icon: "star.fill",
    color: "#F59E0B",
  },
  {
    label: "Avg. Mastery",
    value: "76%",
    icon: "chart.bar.fill",
    color: "#22C55E",
  },
  {
    label: "Time Spent",
    value: "14.5 hrs",
    icon: "clock.fill",
    color: "#EF4444",
  },
];

export default function ProgressTrackerScreen() {
  const colors = useColors();

  const handleFocusArea = (topic: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to chat with pre-filled topic
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 px-4 py-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Your Progress
            </Text>
            <Text className="text-base text-muted">
              Keep up the great work! 🎉
            </Text>
          </View>

          {/* Statistics Grid */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Learning Statistics
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {STATISTICS.map((stat, index) => (
                <View
                  key={index}
                  className="flex-1 min-w-[48%] bg-surface rounded-2xl p-4 border border-border"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-muted text-xs font-semibold">
                      {stat.label}
                    </Text>
                    <View
                      className="rounded-full p-2"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <IconSymbol
                        name={stat.icon as any}
                        size={16}
                        color={stat.color}
                      />
                    </View>
                  </View>
                  <Text className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Overall Progress */}
          <View className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-foreground">
                Overall Mastery
              </Text>
              <Text className="text-2xl font-bold text-primary">76%</Text>
            </View>
            <View className="h-3 bg-blue-200 rounded-full overflow-hidden">
              <View className="h-full bg-primary" style={{ width: "76%" }} />
            </View>
            <Text className="text-xs text-muted mt-2">
              You&apos;re doing great! Keep studying to reach 80% mastery.
            </Text>
          </View>

          {/* Weak Areas */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">
                Areas to Focus On
              </Text>
              <TouchableOpacity>
                <Text className="text-primary font-semibold text-sm">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={WEAK_AREAS}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleFocusArea(item.topic)}
                  className="bg-surface rounded-xl p-4 mb-2 border border-border active:opacity-80"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-foreground font-semibold flex-1">
                      {item.topic}
                    </Text>
                    <View className="bg-warning bg-opacity-20 rounded-full px-3 py-1">
                      <Text className="text-warning text-xs font-semibold">
                        {item.mastery}%
                      </Text>
                    </View>
                  </View>

                  <View className="h-2 bg-background rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full bg-warning"
                      style={{ width: `${item.mastery}%` }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-muted text-xs">
                      Last studied: {item.lastStudied}
                    </Text>
                    <Text className="text-primary text-xs font-semibold">
                      {item.recommendedFocus}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Improvement Plan */}
          <View className="bg-success bg-opacity-10 rounded-2xl p-4 border border-success border-opacity-30">
            <View className="flex-row items-start gap-3">
              <Text className="text-2xl">📋</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground mb-1">
                  Personalized Study Plan
                </Text>
                <Text className="text-sm text-muted leading-relaxed mb-3">
                  Based on your progress, we recommend focusing on Algebra this
                  week. Spend 30 minutes daily on polynomial factoring.
                </Text>
                <TouchableOpacity className="bg-success rounded-lg px-4 py-2 self-start">
                  <Text className="text-white font-semibold text-sm">
                    Start Focused Session
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Learning Timeline */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              This Week&apos;s Activity
            </Text>
            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="gap-3">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, index) => (
                    <View key={day} className="flex-row items-center gap-2">
                      <Text className="w-10 text-sm font-semibold text-muted">
                        {day}
                      </Text>
                      <View className="flex-1 flex-row gap-1">
                        {[...Array(Math.floor(Math.random() * 5))].map(
                          (_, i) => (
                            <View
                              key={i}
                              className="h-6 w-2 bg-primary rounded-sm"
                            />
                          ),
                        )}
                      </View>
                      <Text className="text-xs text-muted">
                        {Math.floor(Math.random() * 120)} min
                      </Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          </View>

          {/* Achievements */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Achievements
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1 bg-surface rounded-xl p-3 border border-border items-center">
                <Text className="text-3xl mb-1">🔥</Text>
                <Text className="text-xs font-semibold text-foreground text-center">
                  7-Day Streak
                </Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-3 border border-border items-center">
                <Text className="text-3xl mb-1">⭐</Text>
                <Text className="text-xs font-semibold text-foreground text-center">
                  10 Topics
                </Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-3 border border-border items-center">
                <Text className="text-3xl mb-1">🏆</Text>
                <Text className="text-xs font-semibold text-foreground text-center">
                  80% Mastery
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
