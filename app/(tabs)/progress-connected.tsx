import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useStudyData } from "@/hooks/use-study-data";
import * as Haptics from "expo-haptics";

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function ProgressTrackerScreen() {
  const colors = useColors();
  const { progress, loading } = useStudyData();
  const [weakAreas, setWeakAreas] = useState<any[]>([]);
  const [strongAreas, setStrongAreas] = useState<any[]>([]);

  useEffect(() => {
    // Calculate weak and strong areas
    const weak = progress.topics
      .filter((t) => t.masteryLevel < 70)
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 5);
    const strong = progress.topics
      .filter((t) => t.masteryLevel >= 80)
      .sort((a, b) => b.masteryLevel - a.masteryLevel)
      .slice(0, 5);

    setWeakAreas(weak);
    setStrongAreas(strong);
  }, [progress]);

  const statCards: StatCard[] = [
    {
      label: "Topics Studied",
      value: progress.totalTopicsStudied,
      icon: "book.fill",
      color: colors.primary,
    },
    {
      label: "Average Mastery",
      value: `${Math.round(progress.averageMastery)}%`,
      icon: "chart.bar.fill",
      color: colors.success,
    },
    {
      label: "Study Streak",
      value: progress.studyStreak,
      icon: "flame.fill",
      color: colors.warning,
    },
    {
      label: "Total Time",
      value: `${Math.round(progress.totalTimeSpent / 60)}h`,
      icon: "clock.fill",
      color: colors.primary,
    },
  ];

  const getMasteryColor = (level: number) => {
    if (level >= 80) return colors.success;
    if (level >= 60) return colors.warning;
    return colors.error;
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 80) return "Mastered";
    if (level >= 60) return "Proficient";
    if (level >= 40) return "Learning";
    return "Needs Work";
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 px-4 py-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Your Progress</Text>
            <Text className="text-base text-muted">Track your learning journey</Text>
          </View>

          {/* Stats Grid */}
          <View className="gap-3">
            <FlatList
              scrollEnabled={false}
              data={statCards}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
                  <View className="flex-row items-center justify-between mb-2">
                    <View
                      className="rounded-lg p-2"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <IconSymbol name={item.icon as any} size={20} color={item.color} />
                    </View>
                  </View>
                  <Text className="text-2xl font-bold text-foreground">{item.value}</Text>
                  <Text className="text-xs text-muted mt-1">{item.label}</Text>
                </View>
              )}
            />
          </View>

          {/* Weak Areas Section */}
          {weakAreas.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Areas to Improve</Text>
                <View className="bg-error bg-opacity-10 rounded-full px-2 py-1">
                  <Text className="text-error text-xs font-semibold">{weakAreas.length}</Text>
                </View>
              </View>

              <FlatList
                scrollEnabled={false}
                data={weakAreas}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    className="bg-surface rounded-xl p-4 border border-border mb-2"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-foreground font-semibold flex-1">{item.name}</Text>
                      <View className="bg-error bg-opacity-10 rounded-full px-2 py-1">
                        <Text className="text-error text-xs font-bold">
                          {Math.round(item.masteryLevel)}%
                        </Text>
                      </View>
                    </View>
                    <View className="bg-border rounded-full h-2 overflow-hidden">
                      <View
                        className="bg-error h-full"
                        style={{ width: `${item.masteryLevel}%` }}
                      />
                    </View>
                    <Text className="text-muted text-xs mt-2">
                      Last studied: {item.lastStudied ? new Date(item.lastStudied).toLocaleDateString() : "Never"}
                    </Text>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity className="bg-error bg-opacity-10 rounded-lg p-4 border border-error border-opacity-30 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1">
                  <IconSymbol name="target" size={20} color={colors.error} />
                  <View className="flex-1">
                    <Text className="text-error font-semibold">Create Improvement Plan</Text>
                    <Text className="text-error text-opacity-70 text-xs">
                      Get personalized study strategies
                    </Text>
                  </View>
                </View>
                <IconSymbol name="arrow.right" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          {/* Strong Areas Section */}
          {strongAreas.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Mastered Topics</Text>
                <View className="bg-success bg-opacity-10 rounded-full px-2 py-1">
                  <Text className="text-success text-xs font-semibold">{strongAreas.length}</Text>
                </View>
              </View>

              <FlatList
                scrollEnabled={false}
                data={strongAreas}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-xl p-4 border border-border mb-2">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-foreground font-semibold flex-1">{item.name}</Text>
                      <View className="bg-success bg-opacity-10 rounded-full px-2 py-1">
                        <Text className="text-success text-xs font-bold">
                          {Math.round(item.masteryLevel)}%
                        </Text>
                      </View>
                    </View>
                    <View className="bg-border rounded-full h-2 overflow-hidden">
                      <View
                        className="bg-success h-full"
                        style={{ width: `${item.masteryLevel}%` }}
                      />
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          {/* Empty State */}
          {progress.topics.length === 0 && !loading && (
            <View className="bg-surface rounded-2xl p-8 border border-border items-center justify-center gap-3">
              <IconSymbol name="book.fill" size={40} color={colors.primary} />
              <Text className="text-foreground font-semibold text-center">No Topics Yet</Text>
              <Text className="text-muted text-sm text-center">
                Start studying to track your progress and see your improvement over time
              </Text>
            </View>
          )}

          {/* Recommendations */}
          {progress.topics.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">Recommendations</Text>

              <View className="bg-primary bg-opacity-10 rounded-xl p-4 border border-primary border-opacity-30 gap-2">
                <View className="flex-row items-start gap-2">
                  <IconSymbol name="lightbulb.fill" size={20} color={colors.primary} />
                  <View className="flex-1">
                    <Text className="text-primary font-semibold">Focus on Weak Areas</Text>
                    <Text className="text-primary text-opacity-70 text-xs mt-1">
                      Dedicate 20-30 minutes daily to topics where you're struggling
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-success bg-opacity-10 rounded-xl p-4 border border-success border-opacity-30 gap-2">
                <View className="flex-row items-start gap-2">
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  <View className="flex-1">
                    <Text className="text-success font-semibold">Maintain Your Streak</Text>
                    <Text className="text-success text-opacity-70 text-xs mt-1">
                      Study at least one topic every day to build momentum
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
