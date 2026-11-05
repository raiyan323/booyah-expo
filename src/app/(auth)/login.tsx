import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { login } from "../../services/auth";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(email.trim(), password);

      router.replace("../(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.message || "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>BooyahX</Text>
      <Text style={styles.subtitle}>Welcome back, Player!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New Player? </Text>
        <Link href="/(auth)/register" style={styles.link}>
          Create Account
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#100D20",
    justifyContent: "center",
    padding: 25,
  },
  logo: {
    color: "#A78BFA",
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#AAA3C2",
    textAlign: "center",
    marginBottom: 35,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#1D1833",
    color: "#fff",
    padding: 17,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#332A4B",
  },
  button: {
    backgroundColor: "#7C3AED",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    color: "#AAA3C2",
  },
  link: {
    color: "#A78BFA",
    fontWeight: "bold",
  },
});
