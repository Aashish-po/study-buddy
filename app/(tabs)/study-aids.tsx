import { ScrollView, Text, View, TouchableOpacity, FlatList, Animated } from "react-native";
import { useState, useRef } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

type TabType = "flashcards" | "quizzes" | "summaries" | "practice";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

interface Quiz {
  id: string;
  topic: string;
  questions: number;
  score: number;
  date: string;
}

interface Summary {
  id: string;
  topic: string;
  content: string;
  date: string;
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  { id: "1", front: "What is photosynthesis?", back: "The process by which plants convert light energy into chemical energy stored in glucose.", mastered: false },
  { id: "2", front: "What are the two main stages of photosynthesis?", back: "Light-dependent reactions (in thylakoids) and light-independent reactions/Calvin cycle (in stroma).", mastered: true },
  { id: "3", front: "What is the role of chlorophyll?", back: "Chlorophyll absorbs light energy, primarily in the blue and red wavelengths, to power photosynthesis.", mastered: false },
];

const SAMPLE_QUIZZES: Quiz[] = [
  { id: "1", topic: "Photosynthesis", questions: 10, score: 85, date: "Today" },
  { id: "2", topic: "Quadratic Equations", questions: 15, score: 72, date: "2 days ago" },
  { id: "3", topic: "World War II", questions: 20, score: 90, date: "1 week ago" },
];

const SAMPLE_SUMMARIES: Summary[] = [
  { id: "1", topic: "Photosynthesis", content: "Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy. It occurs in two stages: light-dependent reactions and the Calvin cycle.", date: "Today" },
  { id: "2", topic: "Quadratic Equations", content: "Quadratic equations are polynomial equations of degree 2. They can be solved using factoring, completing the square, or the quadratic formula: x = (-b ± √(b²-4ac)) / 2a", date: "2 days ago" },
];

export default function StudyAidsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>("flashcards");
  const [flashcards, setFlashcards] = useState(SAMPLE_FLASHCARDS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const toggleCardMastery = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, mastered: !card.mastered } : card
      )
    );
  };

  const renderFlashcardsTab = () => (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">
          {currentCardIndex + 1} / {flashcards.length}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
          }}
          className="bg-primary rounded-full px-4 py-2"
        >
          <Text className="text-white text-sm font-semibold">Next</Text>
        </TouchableOpacity>
      </View>

      {/* Flashcard */}
      <TouchableOpacity
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 min-h-64 justify-center items-center border-2 border-primary"
      >
        <Text className="text-center text-2xl font-bold text-foreground">
          {flashcards[currentCardIndex]?.front}
        </Text>
        <Text className="text-center text-sm text-muted mt-4">Tap to reveal answer</Text>
      </TouchableOpacity>

      {/* Card Actions */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => toggleCardMastery(flashcards[currentCardIndex].id)}
          className={`flex-1 rounded-lg py-3 ${
            flashcards[currentCardIndex]?.mastered
              ? "bg-success"
              : "bg-surface border border-border"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              flashcards[currentCardIndex]?.mastered
                ? "text-white"
                : "text-foreground"
            }`}
          >
            {flashcards[currentCardIndex]?.mastered ? "✓ Mastered" : "Know It"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-surface border border-border rounded-lg py-3">
          <Text className="text-center font-semibold text-foreground">Need Practice</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-sm font-semibold text-foreground">Progress</Text>
          <Text className="text-sm text-muted">
            {flashcards.filter((c) => c.mastered).length} mastered
          </Text>
        </View>
        <View className="h-2 bg-surface rounded-full overflow-hidden">
          <View
            className="h-full bg-success"
            style={{
              width: `${(flashcards.filter((c) => c.mastered).length / flashcards.length) * 100}%`,
            }}
          />
        </View>
      </View>
    </View>
  );

  const renderQuizzesTab = () => (
    <View className="gap-3">
      <TouchableOpacity className="bg-primary rounded-2xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-semibold text-base">Start New Quiz</Text>
          <Text className="text-blue-100 text-sm mt-1">Choose topic and difficulty</Text>
        </View>
        <IconSymbol name="arrow.right" size={24} color="white" />
      </TouchableOpacity>

      <Text className="text-lg font-semibold text-foreground mt-4">Recent Quizzes</Text>
      <FlatList
        data={SAMPLE_QUIZZES}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View className="bg-surface rounded-xl p-4 mb-2 border border-border">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-foreground font-semibold flex-1">{item.topic}</Text>
              <View className="bg-primary rounded-full px-3 py-1">
                <Text className="text-white text-xs font-semibold">{item.score}%</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted text-xs">{item.questions} questions</Text>
              <Text className="text-muted text-xs">{item.date}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderSummariesTab = () => (
    <View className="gap-3">
      <TouchableOpacity className="bg-primary rounded-2xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-semibold text-base">Generate Summary</Text>
          <Text className="text-blue-100 text-sm mt-1">AI-powered summaries</Text>
        </View>
        <IconSymbol name="arrow.right" size={24} color="white" />
      </TouchableOpacity>

      <Text className="text-lg font-semibold text-foreground mt-4">Generated Summaries</Text>
      <FlatList
        data={SAMPLE_SUMMARIES}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-surface rounded-xl p-4 mb-2 border border-border">
            <Text className="text-foreground font-semibold mb-2">{item.topic}</Text>
            <Text className="text-muted text-sm leading-relaxed mb-2">{item.content}</Text>
            <Text className="text-muted text-xs">{item.date}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderPracticeTab = () => (
    <View className="gap-3">
      <TouchableOpacity className="bg-primary rounded-2xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="text-white font-semibold text-base">Start Practice</Text>
          <Text className="text-blue-100 text-sm mt-1">Answer questions & get feedback</Text>
        </View>
        <IconSymbol name="arrow.right" size={24} color="white" />
      </TouchableOpacity>

      <View className="bg-warning bg-opacity-10 rounded-xl p-4 border border-warning border-opacity-30">
        <Text className="text-sm text-foreground font-semibold mb-1">💡 Practice Tip</Text>
        <Text className="text-xs text-muted leading-relaxed">
          Practice questions help reinforce learning. The AI will provide detailed feedback on your answers.
        </Text>
      </View>
    </View>
  );

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "flashcards", label: "Flashcards", icon: "star.fill" },
    { id: "quizzes", label: "Quizzes", icon: "checkmark" },
    { id: "summaries", label: "Summaries", icon: "book.fill" },
    { id: "practice", label: "Practice", icon: "pencil.and.list" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1">
        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-b border-border"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <View className="flex-row gap-1">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleTabChange(tab.id)}
                className={`px-4 py-3 border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary"
                    : "border-transparent"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Tab Content */}
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {activeTab === "flashcards" && renderFlashcardsTab()}
          {activeTab === "quizzes" && renderQuizzesTab()}
          {activeTab === "summaries" && renderSummariesTab()}
          {activeTab === "practice" && renderPracticeTab()}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
