import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

type TabType = "flashcards" | "quizzes" | "summaries" | "practice";
type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function StudyAidsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<TabType>("flashcards");
  const [topicInput, setTopicInput] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Intermediate");
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [summary, setSummary] = useState("");

  const handleGenerateFlashcards = async () => {
    if (!topicInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    try {
      const mutation = trpc.studyAids.generateFlashcards.useMutation();
      const response = await mutation.mutateAsync({
        topic: topicInput,
        count: 10,
        difficultyLevel: difficulty,
      });
      setFlashcards(response.flashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!topicInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    try {
      const mutation = trpc.studyAids.generateQuiz.useMutation();
      const response = await mutation.mutateAsync({
        topic: topicInput,
        count: 10,
        difficultyLevel: difficulty,
      });
      setQuizzes(response.questions);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!topicInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    try {
      const mutation = trpc.studyAids.generateSummary.useMutation();
      const response = await mutation.mutateAsync({
        topic: topicInput,
        difficultyLevel: difficulty,
      });
      const summaryText = typeof response.summary === 'string' ? response.summary : JSON.stringify(response.summary);
      setSummary(summaryText);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "flashcards", label: "Flashcards", icon: "square.grid.2x2.fill" },
    { id: "quizzes", label: "Quizzes", icon: "checkmark.square.fill" },
    { id: "summaries", label: "Summaries", icon: "doc.text.fill" },
    { id: "practice", label: "Practice", icon: "pencil.and.notepad" },
  ] as const;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 px-4 py-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Study Aids</Text>
            <Text className="text-base text-muted">Generate flashcards, quizzes & more</Text>
          </View>

          {/* Topic Input */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">What do you want to study?</Text>
            <TextInput
              placeholder="Enter a topic (e.g., Photosynthesis)"
              value={topicInput}
              onChangeText={setTopicInput}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Difficulty Selector */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">Difficulty Level</Text>
            <View className="flex-row gap-2">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setDifficulty(level)}
                  className={`flex-1 py-2 px-3 rounded-lg border ${
                    difficulty === level
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold text-center ${
                      difficulty === level ? "text-white" : "text-foreground"
                    }`}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row gap-2 border-b border-border pb-3">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`flex-row items-center gap-1 px-3 py-2 rounded-lg ${
                  activeTab === tab.id ? "bg-primary bg-opacity-10" : ""
                }`}
              >
                <IconSymbol
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.id ? colors.primary : colors.muted}
                />
                <Text
                  className={`text-xs font-semibold ${
                    activeTab === tab.id ? "text-primary" : "text-muted"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content Area */}
          {loading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted text-sm mt-3">Generating content...</Text>
            </View>
          ) : (
            <>
              {/* Flashcards Tab */}
              {activeTab === "flashcards" && (
                <View className="gap-4">
                  <TouchableOpacity
                    onPress={handleGenerateFlashcards}
                    className="bg-primary rounded-lg py-3 px-4 flex-row items-center justify-center gap-2"
                  >
                    <IconSymbol name="plus.circle.fill" size={20} color="white" />
                    <Text className="text-white font-semibold">Generate Flashcards</Text>
                  </TouchableOpacity>

                  {flashcards.length > 0 && (
                    <FlatList
                      scrollEnabled={false}
                      data={flashcards}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
                          <Text className="text-xs text-muted mb-2">Card {index + 1}</Text>
                          <Text className="text-foreground font-semibold mb-3">{item.front}</Text>
                          <View className="bg-primary bg-opacity-10 rounded-lg p-3 border border-primary border-opacity-30">
                            <Text className="text-primary text-sm">{item.back}</Text>
                          </View>
                        </View>
                      )}
                    />
                  )}
                </View>
              )}

              {/* Quizzes Tab */}
              {activeTab === "quizzes" && (
                <View className="gap-4">
                  <TouchableOpacity
                    onPress={handleGenerateQuiz}
                    className="bg-primary rounded-lg py-3 px-4 flex-row items-center justify-center gap-2"
                  >
                    <IconSymbol name="plus.circle.fill" size={20} color="white" />
                    <Text className="text-white font-semibold">Generate Quiz</Text>
                  </TouchableOpacity>

                  {quizzes.length > 0 && (
                    <FlatList
                      scrollEnabled={false}
                      data={quizzes}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
                          <Text className="text-xs text-muted mb-2">Question {index + 1}</Text>
                          <Text className="text-foreground font-semibold mb-3">{item.question}</Text>
                          <View className="gap-2">
                            {item.options.map((option, optIndex) => (
                              <TouchableOpacity
                                key={optIndex}
                                className={`p-3 rounded-lg border ${
                                  optIndex === item.correctAnswer
                                    ? "bg-success bg-opacity-10 border-success"
                                    : "bg-background border-border"
                                }`}
                              >
                                <Text className="text-foreground text-sm">{option}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    />
                  )}
                </View>
              )}

              {/* Summaries Tab */}
              {activeTab === "summaries" && (
                <View className="gap-4">
                  <TouchableOpacity
                    onPress={handleGenerateSummary}
                    className="bg-primary rounded-lg py-3 px-4 flex-row items-center justify-center gap-2"
                  >
                    <IconSymbol name="plus.circle.fill" size={20} color="white" />
                    <Text className="text-white font-semibold">Generate Summary</Text>
                  </TouchableOpacity>

                  {summary && (
                    <View className="bg-surface rounded-lg p-4 border border-border">
                      <Text className="text-foreground text-sm leading-relaxed">{summary}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Practice Tab */}
              {activeTab === "practice" && (
                <View className="gap-4">
                  <View className="bg-surface rounded-lg p-4 border border-border items-center justify-center py-8">
                    <IconSymbol name="pencil.and.notepad" size={32} color={colors.primary} />
                    <Text className="text-foreground font-semibold mt-3">Practice Mode</Text>
                    <Text className="text-muted text-sm text-center mt-2">
                      Answer practice questions and get personalized feedback
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
