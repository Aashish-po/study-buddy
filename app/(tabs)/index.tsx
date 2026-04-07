import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const RECENT_TOPICS = [
  { id: "1", title: "Photosynthesis", lastStudied: "2 days ago", progress: 75 },
  { id: "2", title: "Quadratic Equations", lastStudied: "1 week ago", progress: 60 },
  { id: "3", title: "World War II", lastStudied: "3 days ago", progress: 85 },
];

const MOTIVATIONAL_MESSAGES = [
  "Every expert was once a beginner. Keep learning!",
  "Progress, not perfection. You're doing great!",
  "Your effort today is your success tomorrow.",
  "Learning is a journey, not a destination.",
  "You are capable of amazing things!",
];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const motivationalMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

  const handlePress = (screen: "chat" | "study-aids" | "progress" | "settings") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/${screen}` as any);
  };

  return (
    <ScreenContainer className="p-4 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Welcome back!</Text>
            <Text className="text-base text-muted">Let's continue your learning journey</Text>
          </View>

          {/* Motivational Message */}
          <View className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
            <Text className="text-sm text-foreground font-semibold leading-relaxed">
              💡 {motivationalMessage}
            </Text>
          </View>

          {/* Quick Start Buttons */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Quick Start</Text>
            
            {/* Ask a Question Button */}
            <TouchableOpacity
              onPress={() => handlePress("chat")}
              className="bg-primary rounded-2xl p-4 flex-row items-center justify-between active:opacity-80"
            >
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">Ask a Question</Text>
                <Text className="text-blue-100 text-sm mt-1">Get concept explanations</Text>
              </View>
              <IconSymbol name="arrow.right" size={24} color="white" />
            </TouchableOpacity>

            {/* Generate Study Aids Button */}
            <TouchableOpacity
              onPress={() => handlePress("study-aids")}
              className="bg-surface rounded-2xl p-4 flex-row items-center justify-between border border-border active:opacity-80"
            >
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base">Generate Study Aids</Text>
                <Text className="text-muted text-sm mt-1">Flashcards, quizzes & more</Text>
              </View>
              <IconSymbol name="arrow.right" size={24} color={colors.primary} />
            </TouchableOpacity>

            {/* View Progress Button */}
            <TouchableOpacity
              onPress={() => handlePress("progress")}
              className="bg-surface rounded-2xl p-4 flex-row items-center justify-between border border-border active:opacity-80"
            >
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base">View Progress</Text>
                <Text className="text-muted text-sm mt-1">Track your learning journey</Text>
              </View>
              <IconSymbol name="arrow.right" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Recent Topics */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Recent Topics</Text>
            <FlatList
              data={RECENT_TOPICS}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/(tabs)/chat" as any);
              }}
                  className="bg-surface rounded-xl p-4 mb-2 border border-border active:opacity-80"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-foreground font-semibold flex-1">{item.title}</Text>
                    <View className="bg-primary rounded-full px-3 py-1">
                      <Text className="text-white text-xs font-semibold">{item.progress}%</Text>
                    </View>
                  </View>
                  <Text className="text-muted text-xs">Last studied: {item.lastStudied}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Study Tip */}
          <View className="bg-warning bg-opacity-10 rounded-xl p-4 border border-warning border-opacity-30">
            <Text className="text-sm text-foreground font-semibold mb-1">📚 Study Tip</Text>
            <Text className="text-xs text-muted leading-relaxed">
              Consistency is key! Try to study for 20-30 minutes daily. Short, focused sessions are more effective than long cramming sessions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
