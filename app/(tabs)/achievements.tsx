import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Animated,
} from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  unlockedDate?: string;
}

interface Achievement {
  category: string;
  badges: Badge[];
}

export default function AchievementsScreen() {
  const colors = useColors();
  const [level, setLevel] = useState(5);
  const [totalXP, setTotalXP] = useState(4250);
  const [streak, setStreak] = useState(12);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      category: "Milestones",
      badges: [
        {
          id: "first_steps",
          name: "First Steps",
          description: "Complete your first study session",
          icon: "👣",
          unlocked: true,
          progress: 100,
          unlockedDate: "2 weeks ago",
        },
        {
          id: "quiz_master",
          name: "Quiz Master",
          description: "Score 100% on 5 quizzes",
          icon: "🎯",
          unlocked: true,
          progress: 100,
          unlockedDate: "1 week ago",
        },
        {
          id: "speed_learner",
          name: "Speed Learner",
          description: "Complete 5 quizzes in one day",
          icon: "⚡",
          unlocked: false,
          progress: 60,
        },
        {
          id: "perfect_score",
          name: "Perfect Score",
          description: "Get 100% on a quiz",
          icon: "💯",
          unlocked: true,
          progress: 100,
          unlockedDate: "3 days ago",
        },
      ],
    },
    {
      category: "Streaks",
      badges: [
        {
          id: "streak_7",
          name: "7-Day Streak",
          description: "Study for 7 consecutive days",
          icon: "🔥",
          unlocked: true,
          progress: 100,
          unlockedDate: "1 week ago",
        },
        {
          id: "streak_30",
          name: "30-Day Champion",
          description: "Study for 30 consecutive days",
          icon: "👑",
          unlocked: false,
          progress: 40,
        },
        {
          id: "consistency",
          name: "Consistency Champion",
          description: "Maintain a 14-day study streak",
          icon: "⭐",
          unlocked: true,
          progress: 100,
          unlockedDate: "5 days ago",
        },
      ],
    },
    {
      category: "Expertise",
      badges: [
        {
          id: "concept_expert",
          name: "Concept Expert",
          description: "Achieve 90%+ mastery on 10 topics",
          icon: "🧠",
          unlocked: false,
          progress: 70,
        },
        {
          id: "knowledge_seeker",
          name: "Knowledge Seeker",
          description: "Study 20 different topics",
          icon: "📚",
          unlocked: true,
          progress: 100,
          unlockedDate: "2 days ago",
        },
        {
          id: "comeback",
          name: "Comeback Kid",
          description: "Improve a weak topic to 80%+ mastery",
          icon: "🚀",
          unlocked: true,
          progress: 100,
          unlockedDate: "1 day ago",
        },
      ],
    },
  ]);

  const nextLevelXP = (level + 1) * 1000;
  const xpProgress = (totalXP % 1000) / 1000;

  const renderBadge = ({ item }: { item: Badge }) => (
    <TouchableOpacity
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      className={`flex-1 mx-1.5 rounded-2xl p-4 items-center justify-center ${
        item.unlocked
          ? "bg-surface border border-border"
          : "bg-surface bg-opacity-50 border border-border border-opacity-30"
      }`}
    >
      <Text className="text-4xl mb-2">{item.icon}</Text>
      <Text
        className={`text-xs font-bold text-center ${item.unlocked ? "text-foreground" : "text-muted"}`}
      >
        {item.name}
      </Text>
      {!item.unlocked && (
        <View className="mt-2 w-full bg-border rounded-full h-1 overflow-hidden">
          <View
            className="bg-primary h-full"
            style={{ width: `${item.progress}%` }}
          />
        </View>
      )}
      {item.unlockedDate && (
        <Text className="text-muted text-xs mt-1">{item.unlockedDate}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 px-4 py-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Achievements
            </Text>
            <Text className="text-base text-muted">
              Unlock badges and level up
            </Text>
          </View>

          {/* Level & XP Card */}
          <View className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-opacity-80 text-sm">
                  Current Level
                </Text>
                <Text className="text-5xl font-bold text-white">{level}</Text>
              </View>
              <View className="items-center">
                <Text className="text-6xl">🏆</Text>
              </View>
            </View>

            {/* XP Progress Bar */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-white text-opacity-80 text-xs">
                  Experience Points
                </Text>
                <Text className="text-white text-opacity-80 text-xs">
                  {totalXP % 1000} / 1000
                </Text>
              </View>
              <View className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
                <View
                  className="bg-white h-full rounded-full"
                  style={{ width: `${xpProgress * 100}%` }}
                />
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl mb-1">🔥</Text>
              <Text className="text-2xl font-bold text-foreground">
                {streak}
              </Text>
              <Text className="text-xs text-muted text-center">Day Streak</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl mb-1">⭐</Text>
              <Text className="text-2xl font-bold text-foreground">
                {achievements.reduce(
                  (sum, cat) =>
                    sum + cat.badges.filter((b) => b.unlocked).length,
                  0,
                )}
              </Text>
              <Text className="text-xs text-muted text-center">Badges</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl mb-1">✨</Text>
              <Text className="text-2xl font-bold text-foreground">
                {totalXP}
              </Text>
              <Text className="text-xs text-muted text-center">Total XP</Text>
            </View>
          </View>

          {/* Achievements by Category */}
          {achievements.map((category, index) => (
            <View key={index} className="gap-3">
              <Text className="text-lg font-semibold text-foreground">
                {category.category}
              </Text>
              <FlatList
                scrollEnabled={false}
                data={category.badges}
                numColumns={2}
                columnWrapperStyle={{ gap: 8 }}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={renderBadge}
              />
            </View>
          ))}

          {/* Upcoming Achievements */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Next Achievements
            </Text>

            <View className="bg-primary bg-opacity-10 rounded-xl p-4 border border-primary border-opacity-30 gap-3">
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">⚡</Text>
                <View className="flex-1">
                  <Text className="text-primary font-semibold">
                    Speed Learner
                  </Text>
                  <Text className="text-primary text-opacity-70 text-xs">
                    Complete 5 quizzes in one day
                  </Text>
                </View>
              </View>
              <View className="bg-primary bg-opacity-20 rounded-full h-2 overflow-hidden">
                <View className="bg-primary h-full" style={{ width: "60%" }} />
              </View>
              <Text className="text-primary text-opacity-70 text-xs">
                3 of 5 quizzes completed
              </Text>
            </View>

            <View className="bg-success bg-opacity-10 rounded-xl p-4 border border-success border-opacity-30 gap-3">
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">👑</Text>
                <View className="flex-1">
                  <Text className="text-success font-semibold">
                    30-Day Champion
                  </Text>
                  <Text className="text-success text-opacity-70 text-xs">
                    Study for 30 consecutive days
                  </Text>
                </View>
              </View>
              <View className="bg-success bg-opacity-20 rounded-full h-2 overflow-hidden">
                <View className="bg-success h-full" style={{ width: "40%" }} />
              </View>
              <Text className="text-success text-opacity-70 text-xs">
                12 of 30 days completed
              </Text>
            </View>
          </View>

          {/* Motivational Message */}
          <View className="bg-warning bg-opacity-10 rounded-xl p-4 border border-warning border-opacity-30 items-center gap-2">
            <Text className="text-2xl">💡</Text>
            <Text className="text-warning font-semibold text-center">
              Keep Going!
            </Text>
            <Text className="text-warning text-opacity-70 text-xs text-center">
              You are on track to unlock 3 more badges this week
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
