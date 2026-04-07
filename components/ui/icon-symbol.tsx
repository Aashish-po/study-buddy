// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING | "house.fill" | "paperplane.fill" | "chevron.left.forwardslash.chevron.right" | "chevron.right" | "chat.bubble.fill" | "book.fill" | "chart.bar.fill" | "gear" | "xmark" | "checkmark" | "arrow.right" | "arrow.left" | "plus.circle.fill" | "star.fill" | "heart.fill";

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chat.bubble.fill": "chat",
  "book.fill": "library-books",
  "chart.bar.fill": "bar-chart",
  "gear": "settings",
  "xmark": "close",
  "checkmark": "check",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "plus.circle.fill": "add-circle",
  "star.fill": "star",
  "heart.fill": "favorite",
} as Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
