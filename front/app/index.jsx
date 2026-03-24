import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/aby.jpg")}
      style={styles.bgImage}
      resizeMode="cover"
    >
      {/* Gradient overlay — dark at bottom, semi-transparent at top */}
      <LinearGradient
        colors={["rgba(141, 139, 139, 0.38)", "rgba(0, 0, 0, 0.55)"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>
          <Text style={styles.title}>Welcome to Whisper</Text>
          <Text style={styles.subtitle}>
            {/* A short punchy line that tells users what they`&apos;`ll get. */}
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.cta}>
          <Button
            mode="contained"
            onPress={() => router.push("/register")}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.primaryLabel}
          >
            Get Started
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push("/login")}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.secondaryLabel}
          >
            I already have an account
          </Button>

          <Text style={styles.terms}>
            By continuing, you agree to our{" "}
            <Text style={styles.link}>Terms of Service</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },

  // Hero
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: height * 0.05,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#6C47FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 36,
    color: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff", // white text over image
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)", // slightly muted white
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },

  // Features
  features: {
    paddingVertical: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.15)", // frosted glass feel
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "500",
  },

  // CTA
  cta: {
    paddingBottom: 16,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 14,
    backgroundColor: "#6C47FF",
  },
  secondaryButton: {
    borderRadius: 14,
    borderColor: "rgba(255,255,255,0.5)",
  },
  buttonContent: {
    height: 52,
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  secondaryLabel: {
    fontSize: 15,
    color: "#ffffff",
  },
  terms: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
  link: {
    color: "#a78bfa",
    fontWeight: "500",
  },
});
