import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleAuth } from "@/providers/AuthProvider";
import axios from "axios";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/providers/FirebaseProvider";
import Modal from "@/components/ui-components/Modal";
import ChangePassword from "@/components/ui-components/changePassword";

const API_URL = process.env.EXPO_PUBLIC_SERVER_URL;

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { request, promptAsync } = useGoogleAuth();

  const [forgotVisible, setForgotVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  // const [resetSent, setResetSent] = useState(false);
  // const [resetError, setResetError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError("");

    if (!request) {
      setError(
        "Google sign-in is still loading. Please try again in a moment.",
      );
      return;
    }

    try {
      setGoogleLoading(true);

      const result = await promptAsync();

      if (result?.type !== "success") {
        if (result?.type === "error") {
          setError("Google sign-in failed. Please try again.");
        }
        return;
      }

      const idToken = result.params?.id_token || result.authentication?.idToken;

      console.log(result);

      if (!idToken) {
        throw new Error("No ID token returned from Google");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      const res = await axios.post(`${API_URL}/auth/firebase-sign-in`, {
        idToken: firebaseIdToken,
      });

      if (res.data.success) {
        await login(res.data.user, res.data.token, res.data.refreshToken);
        router.replace("/(tabs)/home");
      } else {
        setError(res.data.message || "Google sign-in failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Google sign-in failed. Please try again.",
      );
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  }
  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/auth/sign-in`, {
        email,
        password,
      });

      if (res.data.success) {
        await login(res.data.user, res.data.token, res.data.refreshToken);
        router.replace("/(tabs)/home");
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

  function closeForgotModal() {
    setForgotVisible(false);
    // reset internal state after modal animates out
    setTimeout(() => {
      setResetEmail("");
    }, 300);
  }

  return (
    <ImageBackground
      source={require("../assets/images/signin.jpg")}
      style={styles.bgImage}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.75)"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>✦</Text>
              </View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              {/* Error box */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠ {error}</Text>
                </View>
              ) : null}

              {/* Google button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={googleLoading || !request}
                activeOpacity={0.8}
              >
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleText}>
                  {googleLoading ? "Signing in..." : "Continue with Google"}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign in with email</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Inputs */}
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
                theme={{ colors: { primary: "#6C47FF" } }}
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
                theme={{ colors: { primary: "#6C47FF" } }}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <TouchableOpacity
                style={styles.forgotWrap}
                onPress={() => setForgotVisible(true)}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Submit */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || googleLoading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                <Text>{loading ? "Signing in..." : "Sign In"}</Text>
              </Button>

              {/* Terms */}
              <Text style={styles.terms}>
                By continuing you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.footerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      
      <Modal
        visible={forgotVisible}
        closeModal={closeForgotModal}
        component={
          <ChangePassword
            closeForgotModal={closeForgotModal}
            resetEmail={resetEmail}
            setResetEmail={setResetEmail}
          />
        }
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "center",
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#6C47FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 28,
    color: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
  },

  // Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },

  // Error
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

  // Google
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: "#fafafa",
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    fontSize: 12,
    color: "#9ca3af",
  },

  // Inputs
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

  // Submit
  loginButton: {
    borderRadius: 14,
    backgroundColor: "#6C47FF",
    marginTop: 4,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Terms
  terms: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#6C47FF",
    fontWeight: "500",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  footerLink: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "700",
  },
});
