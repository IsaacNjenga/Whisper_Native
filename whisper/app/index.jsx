import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import Spinner from "react-native-loading-spinner-overlay";

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
      console.log("🚀 ~ onSignUp ~ result:", result);
    } catch (error) {
      Alert.alert("Error", `Could not sign up. Try again.`);
    } finally {
      setLoading(false);
    }
  };
  const onSignIn = async () => {
    setLoading(true);
    try {
      const result = await onLogin( email, password);
      console.log("🚀 ~ onSignIn ~ result:", result);
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
      <View>
        <Spinner visible={loading} />
        <Text style={styles.header}>Whisper</Text>
        <Text style={styles.subHeader}>Connect. Fast</Text>
        <TextInput
          autoCapitalize="none"
          placeholder="johndoe@email.com"
          placeholderTextColor="#333"
          value={email}
          onChangeText={setEmail}
          style={styles.inputField}
        />
        <TextInput
          autoCapitalize="none"
          placeholder="E.g. John Doe"
          placeholderTextColor="#333"
          value={username}
          onChangeText={setUsername}
          style={styles.inputField}
        />
        <TextInput
          autoCapitalize="none"
          placeholder="**********"
          placeholderTextColor="#333"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.inputField}
        />

        <TouchableOpacity onPress={onSignIn} style={styles.submitButton}>
          <Text style={{ color: "#fff" }}>Sign In</Text>
        </TouchableOpacity>
        <Button
          title="Don't have an account? Sign Up"
          onPress={onSignUp}
          color={Colors.primary}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "whitesmoke",
    paddingHorizontal: WIDTH > HEIGHT ? "40%" : 20,
  },
  header: {
    fontSize: 45,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 5,
    fontWeight: 800,
  },
  subHeader: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
    fontWeight: 500,
  },
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
});
