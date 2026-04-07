/**
 * Error Boundary Component
 * Catches unhandled errors in the React component tree and displays fallback UI
 */

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry or error tracking service
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // You can also log error to Sentry here:
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            {/* Error Icon */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 64 }}>⚠️</Text>
            </View>

            {/* Error Title */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 12,
                textAlign: "center",
                color: "#000",
              }}
            >
              Something Went Wrong
            </Text>

            {/* Error Message */}
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                marginBottom: 20,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              We are sorry! StudyBuddy encountered an unexpected error. Please
              try restarting the app.
            </Text>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <View
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: "#ff6b6b",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#ff6b6b",
                    fontWeight: "600",
                    marginBottom: 8,
                  }}
                >
                  Error Details:
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#666",
                    fontFamily: "Courier New",
                  }}
                >
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#999",
                      fontFamily: "Courier New",
                      marginTop: 8,
                    }}
                    numberOfLines={5}
                  >
                    {this.state.error.stack}
                  </Text>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  // Reload the app
                  this.setState({ hasError: false, error: undefined });
                  // Force refresh
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
                style={{
                  backgroundColor: "#007AFF",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                >
                  Restart App
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  // Navigate to home
                  const router = useRouter();
                  router.replace("/");
                }}
                style={{
                  backgroundColor: "#e0e0e0",
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#000", fontSize: 16, fontWeight: "600" }}
                >
                  Go to Home
                </Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <Text
              style={{
                fontSize: 12,
                color: "#999",
                marginTop: 24,
                textAlign: "center",
              }}
            >
              If you continue to experience issues, please contact support at
              support@studybuddy.ai
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

// Simpler version for use without useRouter
export const SimpleErrorBoundary = ErrorBoundary;
