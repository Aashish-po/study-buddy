import { ScrollView, Text, View, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface DailyMetric {
  date: string;
  topicsStudied: number;
  timeSpent: number;
  averageScore: number;
}

interface TopicAnalytic {
  name: string;
  mastery: number;
  timeSpent: number;
  sessionsCount: number;
  trend: "up" | "down" | "stable";
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  const dailyMetrics: DailyMetric[] = [
    { date: "Mon", topicsStudied: 3, timeSpent: 120, averageScore: 85 },
    { date: "Tue", topicsStudied: 2, timeSpent: 90, averageScore: 78 },
    { date: "Wed", topicsStudied: 4, timeSpent: 150, averageScore: 92 },
    { date: "Thu", topicsStudied: 2, timeSpent: 75, averageScore: 80 },
    { date: "Fri", topicsStudied: 5, timeSpent: 180, averageScore: 88 },
    { date: "Sat", topicsStudied: 3, timeSpent: 110, averageScore: 86 },
    { date: "Sun", topicsStudied: 2, timeSpent: 60, averageScore: 82 },
  ];

  const topicAnalytics: TopicAnalytic[] = [
    { name: "Algebra", mastery: 85, timeSpent: 420, sessionsCount: 12, trend: "up" },
    { name: "Geometry", mastery: 72, timeSpent: 280, sessionsCount: 8, trend: "up" },
    { name: "Biology", mastery: 68, timeSpent: 240, sessionsCount: 7, trend: "stable" },
    { name: "Chemistry", mastery: 55, timeSpent: 180, sessionsCount: 5, trend: "down" },
    { name: "Physics", mastery: 78, timeSpent: 360, sessionsCount: 10, trend: "up" },
  ];

  const insights = {
    learningVelocity: 2.3, // topics per week
    averageMastery: 71.6,
    totalTimeSpent: 1085, // minutes
    predictedExamReadiness: 76,
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "arrow.up.right";
      case "down":
        return "arrow.down.right";
      default:
        return "minus";
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return colors.success;
      case "down":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const maxTimeSpent = Math.max(...dailyMetrics.map((m) => m.timeSpent));

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 px-4 py-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Analytics</Text>
            <Text className="text-base text-muted">Your learning insights</Text>
          </View>

          {/* Key Metrics */}
          <View className="gap-3">
            <View className="flex-row gap-2">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <IconSymbol name="chart.line.uptrend.xyaxis" size={20} color={colors.primary} />
                </View>
                <Text className="text-2xl font-bold text-foreground">{insights.learningVelocity}</Text>
                <Text className="text-xs text-muted">Topics/Week</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <IconSymbol name="target" size={20} color={colors.success} />
                </View>
                <Text className="text-2xl font-bold text-foreground">{Math.round(insights.averageMastery)}%</Text>
                <Text className="text-xs text-muted">Avg Mastery</Text>
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <IconSymbol name="clock.fill" size={20} color={colors.warning} />
                </View>
                <Text className="text-2xl font-bold text-foreground">
                  {Math.round(insights.totalTimeSpent / 60)}h
                </Text>
                <Text className="text-xs text-muted">Total Time</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                </View>
                <Text className="text-2xl font-bold text-foreground">{insights.predictedExamReadiness}%</Text>
                <Text className="text-xs text-muted">Exam Ready</Text>
              </View>
            </View>
          </View>

          {/* Weekly Activity */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Weekly Activity</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
              <View className="flex-row items-end justify-between h-32 gap-2">
                {dailyMetrics.map((metric, index) => (
                  <View key={index} className="flex-1 items-center gap-2">
                    <View
                      className="w-full rounded-t-lg bg-primary"
                      style={{
                        height: (metric.timeSpent / maxTimeSpent) * 100,
                      }}
                    />
                    <Text className="text-xs text-muted">{metric.date}</Text>
                  </View>
                ))}
              </View>
              <View className="pt-4 border-t border-border">
                <Text className="text-xs text-muted text-center">
                  Average: {Math.round(dailyMetrics.reduce((sum, m) => sum + m.timeSpent, 0) / dailyMetrics.length)} min/day
                </Text>
              </View>
            </View>
          </View>

          {/* Topic Performance */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Topic Performance</Text>

            <FlatList
              scrollEnabled={false}
              data={topicAnalytics}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-xl p-4 border border-border mb-2">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold">{item.name}</Text>
                      <Text className="text-muted text-xs">
                        {item.sessionsCount} sessions • {Math.round(item.timeSpent / 60)}h
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold text-foreground">{item.mastery}%</Text>
                      <View className="flex-row items-center gap-1 mt-1">
                        <IconSymbol
                          name={getTrendIcon(item.trend) as any}
                          size={14}
                          color={getTrendColor(item.trend)}
                        />
                        <Text className="text-xs" style={{ color: getTrendColor(item.trend) }}>
                          {item.trend}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Mastery Bar */}
                  <View className="bg-border rounded-full h-2 overflow-hidden">
                    <View
                      className={`h-full rounded-full ${
                        item.mastery >= 80 ? "bg-success" : item.mastery >= 60 ? "bg-warning" : "bg-error"
                      }`}
                      style={{ width: `${item.mastery}%` }}
                    />
                  </View>
                </View>
              )}
            />
          </View>

          {/* Recommendations */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Recommendations</Text>

            <View className="bg-primary bg-opacity-10 rounded-xl p-4 border border-primary border-opacity-30 gap-2">
              <View className="flex-row items-start gap-2">
                <IconSymbol name="lightbulb.fill" size={20} color={colors.primary} />
                <View className="flex-1">
                  <Text className="text-primary font-semibold">Focus on Chemistry</Text>
                  <Text className="text-primary text-opacity-70 text-xs">
                    Your mastery is declining. Increase study frequency.
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-success bg-opacity-10 rounded-xl p-4 border border-success border-opacity-30 gap-2">
              <View className="flex-row items-start gap-2">
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                <View className="flex-1">
                  <Text className="text-success font-semibold">Maintain Momentum</Text>
                  <Text className="text-success text-opacity-70 text-xs">
                    You're on track for exam readiness. Keep up the good work!
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Time Range Selector */}
          <View className="flex-row gap-2 pb-4">
            {(["week", "month", "all"] as const).map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setTimeRange(range)}
                className={`flex-1 py-2 px-3 rounded-lg border ${
                  timeRange === range
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`text-xs font-semibold text-center capitalize ${
                    timeRange === range ? "text-white" : "text-foreground"
                  }`}
                >
                  {range === "all" ? "All Time" : range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
