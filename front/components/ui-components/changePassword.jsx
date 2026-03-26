import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_SERVER_URL;

function ChangePassword({ closeForgotModal, resetEmail, setResetEmail }) {
  // step: 'email' | 'otp' | 'password' | 'success'
  const [step, setStep] = useState("email");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // OTP countdown — 2 minutes = 120 seconds
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  function startCountdown() {
    setCountdown(120);
    setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height || 0);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // ── Step 1: Request OTP ──
  async function handleRequestOtp() {
    setError("");
    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/request-otp`, {
        to: resetEmail,
      });
      if (res.data.success) {
        startCountdown();
        setStep("otp");
      } else {
        setError(res.data.message || "Failed to send OTP. Try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ──
  async function handleVerifyOtp() {
    setError("");
    if (!otp || otp.length < 4) {
      setError("Please enter the OTP sent to your email.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/verify-otp`, {
        otp,
        email: resetEmail,
      });
      if (res.data.success) {
        clearInterval(timerRef.current);
        setResetToken(res.data.resetToken);
        setStep("password");
      } else {
        setError(res.data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Invalid or expired OTP. Please request a new one.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: Change Password ──
  async function handleChangePassword() {
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/change-password`, {
        resetToken,
        newPassword,
        email: resetEmail,
      });
      if (res.data.success) {
        setStep("success");
      } else {
        setError(res.data.message || "Failed to change password.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setOtp("");
    setError("");
    await handleRequestOtp();
  }

  const sheetOffset = keyboardHeight > 0 ? keyboardHeight + 12 : 0;

  return (
    <View style={styles.backdrop}>
      {/* Tap outside to close */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={closeForgotModal}
      />

      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.sheetWrap, { paddingBottom: sheetOffset }]}>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetScrollContent}
          >
            <View style={styles.sheet}>
              {step !== <Text>success</Text> && (
                <View style={styles.stepDots}>
                  {["email", "otp", "password"].map((s, i) => {
                    const steps = ["email", "otp", "password"];
                    const currentIndex = steps.indexOf(step);
                    const isActive = i === currentIndex;
                    const isPast = i < currentIndex;

                    return (
                      <View
                        key={s}
                        style={[
                          styles.dot,
                          isPast && styles.dotPast,
                          isActive && styles.dotActive,
                        ]}
                      />
                    );
                  })}
                </View>
              )}

              {step === <Text>email</Text> && (
                <>
                  <View style={styles.iconWrap}>
                    <Text style={styles.iconText}>🔑</Text>
                  </View>
                  <Text style={styles.title}>Forgot password?</Text>
                  <Text style={styles.subtitle}>
                    Enter your email and we&apos;ll send you a one-time code.
                  </Text>

                  {error ? <ErrorBox message={error} /> : null}

                  <TextInput
                    label="Email address"
                    value={resetEmail}
                    onChangeText={(val) => {
                      setResetEmail(val);
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

                  <Button
                    mode="contained"
                    onPress={handleRequestOtp}
                    loading={loading}
                    disabled={loading}
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    <Text>{loading ? "Sending..." : "Send Code"}</Text>
                  </Button>

                  <TouchableOpacity
                    onPress={closeForgotModal}
                    style={styles.cancelWrap}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}

              {step === <Text>otp</Text> && (
                <>
                  <View style={styles.iconWrap}>
                    <Text style={styles.iconText}>📨</Text>
                  </View>
                  <Text style={styles.title}>Check your email</Text>
                  <Text style={styles.subtitle}>
                    We sent a code to{" "}
                    <Text style={styles.emailHighlight}>{resetEmail}</Text>.
                    Enter it below.
                  </Text>

                  <View
                    style={[
                      styles.countdownWrap,
                      countdown === 0 && styles.countdownExpired,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countdownText,
                        countdown === 0 && styles.countdownTextExpired,
                      ]}
                    >
                      {countdown > 0
                        ? `Code expires in ${formatCountdown(countdown)}`
                        : "Code expired"}
                    </Text>
                  </View>

                  {error ? <ErrorBox message={error} /> : null}

                  <TextInput
                    label="One-time code"
                    value={otp}
                    onChangeText={(val) => {
                      setOtp(val);
                      setError("");
                    }}
                    mode="outlined"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    theme={{ colors: { primary: "#6C47FF" } }}
                  />

                  <Button
                    mode="contained"
                    onPress={handleVerifyOtp}
                    loading={loading}
                    disabled={loading || countdown === 0}
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>

                  {canResend ? (
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      style={styles.cancelWrap}
                    >
                      <Text style={styles.resendText}>Resend code</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setStep("email")}
                      style={styles.cancelWrap}
                    >
                      <Text style={styles.cancelText}>
                        Use a different email
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {step === <Text>password</Text> && (
                <>
                  <View style={styles.iconWrap}>
                    <Text style={styles.iconText}>🔒</Text>
                  </View>
                  <Text style={styles.title}>New password</Text>
                  <Text style={styles.subtitle}>
                    Choose a strong password of at least 8 characters.
                  </Text>

                  {error ? <ErrorBox message={error} /> : null}

                  <TextInput
                    label="New password"
                    value={newPassword}
                    onChangeText={(val) => {
                      setNewPassword(val);
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

                  <TextInput
                    label="Confirm new password"
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      setError("");
                    }}
                    secureTextEntry={!showConfirm}
                    mode="outlined"
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    theme={{ colors: { primary: "#6C47FF" } }}
                    right={
                      <TextInput.Icon
                        icon={showConfirm ? "eye-off" : "eye"}
                        onPress={() => setShowConfirm(!showConfirm)}
                      />
                    }
                  />

                  <Button
                    mode="contained"
                    onPress={handleChangePassword}
                    loading={loading}
                    disabled={loading}
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    {loading ? "Saving..." : "Change Password"}
                  </Button>
                </>
              )}

              {step === <Text>success</Text> && (
                <>
                  <View style={styles.successIcon}>
                    <Text style={styles.successIconText}>✓</Text>
                  </View>
                  <Text style={styles.title}>Password changed!</Text>
                  <Text style={styles.subtitle}>
                    Your password has been updated successfully. You can now
                    sign in with your new password.
                  </Text>

                  <Button
                    mode="contained"
                    onPress={closeForgotModal}
                    style={styles.primaryButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    Back to Sign In
                  </Button>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Small reusable error box
function ErrorBox({ message }) {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>⚠ {message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheetWrap: {
    justifyContent: "flex-end",
  },
  sheetScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 64,
    padding: 28,
    paddingBottom: 48,
    gap: 14,
  },

  // Step dots
  stepDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  dotPast: {
    backgroundColor: "#c4b5fd",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#6C47FF",
  },

  // Icon
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  iconText: {
    fontSize: 24,
  },

  // Text
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },
  emailHighlight: {
    color: "#1a1a2e",
    fontWeight: "600",
  },

  // Countdown
  countdownWrap: {
    backgroundColor: "#f5f3ff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ede9fe",
    alignItems: "center",
  },
  countdownExpired: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  countdownText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C47FF",
  },
  countdownTextExpired: {
    color: "#dc2626",
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

  // Inputs
  input: {
    backgroundColor: "#ffffff",
  },
  inputOutline: {
    borderRadius: 12,
    borderColor: "#e5e7eb",
  },

  // Buttons
  primaryButton: {
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
  cancelWrap: {
    alignItems: "center",
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  resendText: {
    fontSize: 14,
    color: "#6C47FF",
    fontWeight: "600",
  },

  // Success
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  successIconText: {
    fontSize: 28,
    color: "#16a34a",
  },
});

export default ChangePassword;
