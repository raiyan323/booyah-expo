import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    getMyRequests,
    getRoomDetails,
    getTournament,
} from "../../services/tournaments";

type Room = {
  $id: string;
  tournamentId: string;
  roomId: string;
  roomPassword: string;
};

export default function RoomDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setRoom(null);

      if (!id) {
        throw new Error("Tournament ID is missing.");
      }

      // Get tournament information
      const tournament = await getTournament(id);

      // Check whether tournament is public
      const isPublic =
        String(tournament.visibility ?? "").toLowerCase() === "public";

      // Private tournaments require approval
      if (!isPublic) {
        const requestData = await getMyRequests();
        const requests = requestData.rows ?? [];

        const approved = requests.some(
          (request) =>
            request.tournamentId === id &&
            String(request.status).toLowerCase() === "approved",
        );

        if (!approved) {
          throw new Error("Your request has not been approved.");
        }
      }

      // Get room information
      const roomData = await getRoomDetails(id);
      const rooms = roomData.rows ?? [];

      if (rooms.length === 0) {
        throw new Error("Room details have not been added yet.");
      }

      setRoom(rooms[0] as Room);
    } catch (err) {
      console.log("Room loading error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to load room details.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadRoom();
    }, [loadRoom]),
  );

  return (
    <SafeAreaView className="flex-1 bg-[#100D20]" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-[22px] py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Pressable onPress={() => router.back()} className="self-start">
          <Text className="text-base font-semibold text-[#A78BFA]">
            ← Back to My Room
          </Text>
        </Pressable>

        {/* Header */}
        <View className="mt-8">
          <Text className="text-[28px] font-bold text-white">Room Details</Text>

          <Text className="mt-2 text-sm text-[#AAA3C2]">
            Your tournament room information
          </Text>
        </View>

        {/* Loading */}
        {loading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#A78BFA" />

            <Text className="mt-4 text-sm text-[#AAA3C2]">
              Loading room details...
            </Text>
          </View>
        ) : error ? (
          /* Error */
          <View className="mt-7 rounded-2xl border border-[#332A4B] bg-[#1D1833] p-5">
            <Text className="text-base font-semibold text-red-300">
              ⚠️ Unable to Load Room
            </Text>

            <Text className="mt-3 text-sm leading-6 text-[#AAA3C2]">
              {error}
            </Text>

            <Pressable
              className="mt-5 items-center rounded-xl bg-[#7C3AED] p-4 active:opacity-80"
              onPress={loadRoom}
            >
              <Text className="font-bold text-white">Try Again</Text>
            </Pressable>
          </View>
        ) : room ? (
          /* Room Information */
          <View className="mt-7 rounded-2xl border border-[#594184] bg-[#1D1833] p-5">
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-bold uppercase tracking-[2px] text-[#AAA3C2]">
                  Tournament Room
                </Text>

                <Text className="mt-2 text-lg font-bold text-white">
                  Room Information
                </Text>
              </View>

              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#332451]">
                <Text className="text-2xl">🎮</Text>
              </View>
            </View>

            {/* Room ID */}
            <View className="rounded-xl bg-[#100D20] p-4">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#AAA3C2]">
                Room ID
              </Text>

              <Text
                selectable
                className="mt-3 text-2xl font-extrabold text-[#C4A7FF]"
              >
                {room.roomId}
              </Text>
            </View>

            {/* Password */}
            <View className="mt-4 rounded-xl bg-[#100D20] p-4">
              <Text className="text-xs font-bold uppercase tracking-wider text-[#AAA3C2]">
                Room Password
              </Text>

              <Text
                selectable
                className="mt-3 text-2xl font-extrabold text-white"
              >
                {room.roomPassword}
              </Text>
            </View>

            {/* Note */}
            <View className="mt-5 rounded-xl border border-[#332A4B] bg-[#251D3D] p-4">
              <Text className="text-sm leading-6 text-[#AAA3C2]">
                🔒 Keep your room details private. Use the Room ID and Password
                above to join your tournament room.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
