import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Spinner from "react-native-loading-spinner-overlay";
import bgImage from "@/assets/images/bg.jpeg";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { onLogin, onRegister } = useAuth();

  const onSignUp = async () => {
    setLoading(true);
    try {
      const result = await onRegister(username, email, password);
      //console.log("🚀 ~ onSignUp ~ result:", result);
    } catch (error) {
      Alert.alert("Error", `Could not sign up. Try again.`);
    } finally {
      setLoading(false);
    }
  };
  const onSignIn = async () => {
    setLoading(true);
    try {
      const result = await onLogin(email, password);
      //console.log("🚀 ~ onSignIn ~ result:", result);
    } catch (error) {
      Alert.alert("Error", `Could not sign in. Try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground source={bgImage} style={styles.image} resizeMode="cover">
        <View style={styles.innerContainer}>
          <Spinner visible={loading} />
          <Text style={styles.header}>Whisper</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine}></View>
            <Text style={styles.subHeader}>Connect. Anywhere. Anytime</Text>
            <View style={styles.dividerLine}></View>
          </View>

          <View style={styles.formView}>
            <Text style={styles.formLabel}>Username</Text>
            <TextInput
              autoCapitalize="none"
              placeholder="E.g. John Doe"
              placeholderTextColor="gray"
              value={username}
              onChangeText={setUsername}
              style={styles.inputField}
            />{" "}
          </View>
          <View style={styles.formView}>
            <Text style={styles.formLabel}>Email Address</Text>
            <TextInput
              autoCapitalize="none"
              placeholder="johndoe@email.com"
              placeholderTextColor="gray"
              value={email}
              onChangeText={setEmail}
              style={styles.inputField}
            />
          </View>
          <View style={styles.formView}>
            <Text style={styles.formLabel}>Password</Text>
            <TextInput
              autoCapitalize="none"
              placeholder="●●●●●●●●●"
              placeholderTextColor="gray"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.inputField}
            />
          </View>
          <TouchableOpacity onPress={onSignIn} style={styles.submitButton}>
            <Text style={{ color: "#fff" }}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSignUp} style={styles.submitButtonAlt}>
            <Text style={{ color: Colors.primary, textAlign: "center" }}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    justifyContent: "center",
    backgroundColor: "whitesmoke",
    paddingHorizontal: WIDTH > HEIGHT ? "40%" : 0,
  },
  innerContainer: {
    padding: 18,
    margin: 10,
    backgroundColor: "rgba(238, 230, 230, 0.88)",
    borderRadius: 30,
  },
  header: {
    marginTop: 10,
    fontSize: 51,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 5,
    fontWeight: 800,
    lineHeight: 50,
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 15,
    color: "white",
    marginHorizontal: 60,
  },
  subHeader: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 0,
    fontWeight: 500,
    color: Colors.primary,
  },
  formLabel: { fontSize: 15, color: Colors.primary },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    borderColor: Colors.primary,
    color: "#333",
  },
  submitButton: {
    marginVertical: 15,
    alignItems: "center",
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 4,
    color: "#fff",
  },
  submitButtonAlt: {
    padding: 12,
    borderRadius: 4,
    marginTop: 10,
  },
  formView: { marginBottom: 10 },
  image: {
    width: "100%",
    height: "100%",
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 2, backgroundColor: Colors.primary },
});
