import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { account } from "../../lib/appwrite";
import { logout } from "../../services/auth";
import {
    createMyProfile,
    getMyProfile,
    updateMyProfile,
} from "../../services/profile";

type ProfileData = {
  inGameName?: string;
  freeFireUid?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function isNotFoundError(error: any) {
  return error?.code === 404;
}

export default function ProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [savedName, setSavedName] = useState("");
  const [savedUid, setSavedUid] = useState("");

  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loadError, setLoadError] = useState("");

  const hasChanges =
    !exists || name.trim() !== savedName || uid.trim() !== savedUid;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const user = await account.get();

      setEmail(user.email || "");
      setUserId(user.$id);

      let profile: ProfileData | null = null;

      try {
        profile = await getMyProfile();
      } catch (error: any) {
        // Only treat a genuine 404 as a missing profile.
        // Network and permission errors must not create a new profile.
        if (!isNotFoundError(error)) {
          throw error;
        }
      }

      if (profile) {
        const profileName = profile.inGameName || "";
        const profileUid = profile.freeFireUid || "";

        setName(profileName);
        setUid(profileUid);
        setSavedName(profileName);
        setSavedUid(profileUid);
        setExists(true);
      } else {
        setName("");
        setUid("");
        setSavedName("");
        setSavedUid("");
        setExists(false);
      }
    } catch (error) {
      console.log("Profile loading error:", error);
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  async function handleSave() {
    const cleanName = name.trim();
    const cleanUid = uid.trim();

    if (!cleanName || !cleanUid) {
      Alert.alert(
        "Missing Information",
        "Please enter your in-game name and Free Fire UID.",
      );
      return;
    }

    if (cleanName.length < 2) {
      Alert.alert(
        "Invalid Name",
        "In-game name must contain at least 2 characters.",
      );
      return;
    }

    if (!/^\d{1,20}$/.test(cleanUid)) {
      Alert.alert("Invalid UID", "Free Fire UID must contain numbers only.");
      return;
    }

    if (!hasChanges) return;

    try {
      setSaving(true);

      if (exists) {
        await updateMyProfile(cleanName, cleanUid);
      } else {
        await createMyProfile(cleanName, cleanUid);
      }

      setName(cleanName);
      setUid(cleanUid);
      setSavedName(cleanName);
      setSavedUid(cleanUid);
      setExists(true);

      Alert.alert("Success", "Your profile has been saved.");
    } catch (error) {
      console.log("Profile save error:", error);

      Alert.alert("Save Failed", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function confirmLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: handleLogout,
      },
    ]);
  }

  async function handleLogout() {
    if (loggingOut || saving) return;

    try {
      setLoggingOut(true);

      await logout();

      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Logout Failed", getErrorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-[#100D20]"
        edges={["top", "bottom"]}
      >
        <ActivityIndicator color="#A78BFA" size="large" />
        <Text className="mt-3 text-sm text-[#AAA3C2]">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-[#100D20] px-6"
        edges={["top", "bottom"]}
      >
        <Text className="text-lg font-bold text-white">
          Could not load profile
        </Text>

        <Text className="mt-2 text-center text-sm text-[#AAA3C2]">
          {loadError}
        </Text>

        <Pressable
          className="mt-6 rounded-xl bg-[#7C3AED] px-7 py-3"
          onPress={loadProfile}
        >
          <Text className="font-bold text-white">Try Again</Text>
        </Pressable>

        <Pressable className="mt-4" onPress={confirmLogout}>
          <Text className="text-sm text-[#FCA5A5]">Logout</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#100D20]" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[22px] py-4 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-5 text-[26px] font-bold text-white">
          My Profile
        </Text>

        <Text className="mt-1.5 text-sm text-[#AAA3C2]">
          Manage your player information
        </Text>

        {/* Avatar */}
        <View className="mt-[30px] h-[90px] w-[90px] items-center justify-center self-center rounded-full border border-[#4C3970] bg-[#30204F]">
          <Text className="text-4xl font-bold text-[#C4B5FD]">
            {name ? name.charAt(0).toUpperCase() : "P"}
          </Text>
        </View>

        {/* Account Information */}
        <View className="mt-5 items-center">
          <Text className="text-base font-semibold text-white">{email}</Text>

          <Text className="mt-1 text-[11px] text-[#817A96]">
            Player ID: {userId}
          </Text>

          <View className="mt-3 rounded-full border border-[#332A4B] bg-[#1D1833] px-3 py-1">
            <Text className="text-xs text-[#C4B5FD]">
              {exists ? "Player Profile" : "Profile Not Created"}
            </Text>
          </View>
        </View>

        {/* In-game Name */}
        <Text className="mb-2 mt-8 text-sm font-medium text-[#D6D0E5]">
          In-game Name
        </Text>

        <TextInput
          className="rounded-xl border border-[#332A4B] bg-[#1D1833] p-4 text-white"
          placeholder="Enter your game name"
          placeholderTextColor="#817A96"
          value={name}
          onChangeText={setName}
          maxLength={50}
          autoCapitalize="words"
          editable={!saving && !loggingOut}
        />

        <Text className="mt-1 text-right text-[11px] text-[#817A96]">
          {name.length}/50
        </Text>

        {/* Free Fire UID */}
        <Text className="mb-2 mt-5 text-sm font-medium text-[#D6D0E5]">
          Free Fire UID
        </Text>

        <TextInput
          className="rounded-xl border border-[#332A4B] bg-[#1D1833] p-4 text-white"
          placeholder="Enter your Free Fire UID"
          placeholderTextColor="#817A96"
          value={uid}
          onChangeText={(value) => setUid(value.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          maxLength={20}
          editable={!saving && !loggingOut}
        />

        <Text className="mt-1 text-[11px] text-[#817A96]">
          Enter your numeric Free Fire player ID.
        </Text>

        {/* Save Button */}
        <Pressable
          className={`mt-7 items-center rounded-xl p-4 ${
            saving || loggingOut || !hasChanges
              ? "bg-[#49366D] opacity-60"
              : "bg-[#7C3AED] active:opacity-80"
          }`}
          onPress={handleSave}
          disabled={saving || loggingOut || !hasChanges}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-bold text-white">
              {exists ? "Update Profile" : "Create Profile"}
            </Text>
          )}
        </Pressable>

        {/* Logout Button */}
        <Pressable
          className={`mb-[30px] mt-4 items-center rounded-xl border border-[#713B50] p-4 ${
            loggingOut || saving ? "opacity-50" : "active:bg-[#2A1725]"
          }`}
          onPress={confirmLogout}
          disabled={loggingOut || saving}
        >
          {loggingOut ? (
            <ActivityIndicator color="#FCA5A5" />
          ) : (
            <Text className="font-bold text-[#FCA5A5]">Logout</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
