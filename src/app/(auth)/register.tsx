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
import { register } from "../../services/auth";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      await register(name.trim(), email.trim(), password);

      router.replace("../(tabs)");
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error?.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>BooyahX</Text>
      <Text style={styles.subtitle}>Create your player account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

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
        placeholder="Password (minimum 8 characters)"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login" style={styles.link}>
          Login
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
