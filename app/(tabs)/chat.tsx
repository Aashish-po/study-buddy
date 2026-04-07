import { ScrollView, Text, View, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState, useRef } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export default function ChatTutorScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi there! 👋 I'm your AI study buddy. I'm here to help you understand any concept, answer your questions, and make learning fun. What would you like to learn about today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Intermediate");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    const userInput = inputText;
    try {
      const mutation = trpc.chat.sendMessage.useMutation();
      const response = await mutation.mutateAsync({
        message: userInput,
        difficultyLevel: difficulty,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: typeof response.response === 'string' ? response.response : JSON.stringify(response.response),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Explain Simply", icon: "paperplane.fill" },
    { label: "Ask Me a Question", icon: "chat.bubble.fill" },
    { label: "Show Examples", icon: "star.fill" },
    { label: "Create Flashcard", icon: "plus.circle.fill" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 flex-col">
          {/* Header with Difficulty Selector */}
          <View className="border-b border-border px-4 py-3 bg-surface">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-foreground">Study Tutor</Text>
              <View className="flex-row gap-2">
                {DIFFICULTY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDifficulty(level);
                    }}
                    className={`px-3 py-1 rounded-full ${
                      difficulty === level
                        ? "bg-primary"
                        : "bg-background border border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        difficulty === level ? "text-white" : "text-muted"
                      }`}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                className={`px-4 py-3 ${
                  item.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <View
                  className={`max-w-xs rounded-2xl px-4 py-3 ${
                    item.role === "user"
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`text-base leading-relaxed ${
                      item.role === "user"
                        ? "text-white"
                        : "text-foreground"
                    }`}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 12 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <View className="px-4 py-2">
              <View className="bg-surface border border-border rounded-2xl px-4 py-3 flex-row gap-2 items-center">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="text-muted text-sm">Tutor is thinking...</Text>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View className="px-4 py-3 border-t border-border">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInputText(action.label);
                  }}
                  className="bg-surface border border-border rounded-full px-4 py-2 flex-row items-center gap-1 mr-2"
                >
                  <IconSymbol name={action.icon as any} size={16} color={colors.primary} />
                  <Text className="text-sm font-semibold text-foreground">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input Area */}
          <View className="border-t border-border px-4 py-3 bg-surface flex-row items-center gap-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything..."
              placeholderTextColor={colors.muted}
              className="flex-1 bg-background rounded-full px-4 py-3 text-foreground"
              multiline
              editable={!isLoading}
              style={{ maxHeight: 100 }}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`rounded-full p-3 ${
                inputText.trim() && !isLoading
                  ? "bg-primary"
                  : "bg-muted opacity-50"
              }`}
            >
              <IconSymbol name="paperplane.fill" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
