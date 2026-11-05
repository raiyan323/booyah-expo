import "@/global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getCurrentUser } from "../services/auth";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        const inAuth = segments[0] === "(auth)";

        if (!user && !inAuth) {
          router.replace("/(auth)/login");
        } else if (user && inAuth) {
          router.replace("/(tabs)");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, [segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#100D20",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tournament/[id]" />
      <Stack.Screen name="room/[id]" />
    </Stack>
  );
}
