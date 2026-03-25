import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/auth/sign-in`, { email, password });

      if (res.data.success) {
        await login(res.data.user, res.data.token, res.data.refreshToken);
        router.replace("/home"); // replace so user can't go back to login
      } else {
        setError(res.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Incorrect email or password.");
      } else if (err.response?.status === 404) {
        setError("Account not found.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>✦</Text>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            <TextInput
              label="Email address"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                setError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setError("");
              }}
              secureTextEntry={!showPassword}
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              <Text>{loading ? "Signing in..." : "Sign In"}</Text>
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.footerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    paddingVertical: 40,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#6C47FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 28,
    color: "#ffffff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
  },

  // Form
  form: {
    gap: 12,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: "#ffffff",
  },
  inputOutline: {
    borderRadius: 12,
    borderColor: "#e5e7eb",
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: "#6C47FF",
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 14,
    backgroundColor: "#6C47FF",
    marginTop: 8,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    fontSize: 14,
    color: "#6C47FF",
    fontWeight: "600",
  },
});
