import { ScrollView, Text, View, TouchableOpacity, Switch, FlatList } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
type LearningStyle = "Visual" | "Auditory" | "Reading/Writing" | "Kinesthetic";

interface SettingOption {
  id: string;
  label: string;
  icon: string;
}

const DIFFICULTY_OPTIONS: SettingOption[] = [
  { id: "beginner", label: "Beginner", icon: "star.fill" },
  { id: "intermediate", label: "Intermediate", icon: "star.fill" },
  { id: "advanced", label: "Advanced", icon: "star.fill" },
];

const LEARNING_STYLES: SettingOption[] = [
  { id: "visual", label: "Visual", icon: "eye.fill" },
  { id: "auditory", label: "Auditory", icon: "speaker.wave.2.fill" },
  { id: "reading", label: "Reading/Writing", icon: "book.fill" },
  { id: "kinesthetic", label: "Kinesthetic", icon: "hand.raised.fill" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Intermediate");
  const [learningStyle, setLearningStyle] = useState<LearningStyle>("Visual");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleDifficultyChange = (level: DifficultyLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDifficulty(level);
  };

  const handleLearningStyleChange = (style: LearningStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLearningStyle(style);
  };

  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setter(!currentValue);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6 px-4 py-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-base text-muted">Customize your learning experience</Text>
          </View>

          {/* Learning Preferences Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Learning Preferences</Text>

            {/* Difficulty Level */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="bg-primary bg-opacity-20 rounded-lg p-2">
                    <IconSymbol name="chart.bar.fill" size={20} color={colors.primary} />
                  </View>
                  <Text className="text-foreground font-semibold">Difficulty Level</Text>
                </View>
                <View className="bg-primary rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-semibold">{difficulty}</Text>
                </View>
              </View>

              <View className="gap-2">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleDifficultyChange(option.label as DifficultyLevel)}
                    className={`flex-row items-center justify-between p-3 rounded-lg border ${
                      difficulty === option.label
                        ? "bg-primary bg-opacity-10 border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        difficulty === option.label ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {difficulty === option.label && (
                      <IconSymbol name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Learning Style */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="bg-primary bg-opacity-20 rounded-lg p-2">
                    <IconSymbol name="book.fill" size={20} color={colors.primary} />
                  </View>
                  <Text className="text-foreground font-semibold">Learning Style</Text>
                </View>
                <View className="bg-primary rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-semibold">{learningStyle}</Text>
                </View>
              </View>

              <View className="gap-2">
                {LEARNING_STYLES.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleLearningStyleChange(option.label as LearningStyle)}
                    className={`flex-row items-center justify-between p-3 rounded-lg border ${
                      learningStyle === option.label
                        ? "bg-primary bg-opacity-10 border-primary"
                        : "bg-background border-border"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        learningStyle === option.label ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {learningStyle === option.label && (
                      <IconSymbol name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Notifications Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Notifications</Text>

            <View className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="bg-primary bg-opacity-20 rounded-lg p-2">
                  <IconSymbol name="bell.fill" size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Study Reminders</Text>
                  <Text className="text-muted text-xs">Get daily study reminders</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={() => handleToggle(setNotificationsEnabled, notificationsEnabled)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>

          {/* Display Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Display</Text>

            <View className="bg-surface rounded-2xl p-4 border border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="bg-primary bg-opacity-20 rounded-lg p-2">
                  <IconSymbol name="moon.stars.fill" size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">Dark Mode</Text>
                  <Text className="text-muted text-xs">Easier on the eyes at night</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={() => handleToggle(setDarkMode, darkMode)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>

          {/* About Section */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">About</Text>

            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <View className="flex-row items-center justify-between pb-3 border-b border-border">
                <Text className="text-foreground font-semibold">App Version</Text>
                <Text className="text-muted text-sm">1.0.0</Text>
              </View>

              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />
                  <Text className="text-foreground font-semibold">Help & Support</Text>
                </View>
                <IconSymbol name="arrow.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="doc.text.fill" size={20} color={colors.primary} />
                  <Text className="text-foreground font-semibold">Privacy Policy</Text>
                </View>
                <IconSymbol name="arrow.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="star.fill" size={20} color={colors.primary} />
                  <Text className="text-foreground font-semibold">Rate This App</Text>
                </View>
                <IconSymbol name="arrow.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2">
                  <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                  <Text className="text-foreground font-semibold">Send Feedback</Text>
                </View>
                <IconSymbol name="arrow.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Section */}
          <View className="gap-3 pb-6">
            <TouchableOpacity className="bg-error bg-opacity-10 rounded-2xl p-4 border border-error border-opacity-30 flex-row items-center justify-between">
              <Text className="text-error font-semibold">Sign Out</Text>
              <IconSymbol name="arrow.right" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
