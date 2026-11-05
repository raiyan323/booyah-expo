import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMyRequests, getTournaments } from "../../services/tournaments";

import type { Tournament, TournamentRequest } from "../../types";

type MyRoomItem = {
  request: TournamentRequest;
  tournament: Tournament;
};

export default function MyTournamentsScreen() {
  const router = useRouter();

  const [items, setItems] = useState<MyRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Load user's requests and tournaments
  const load = useCallback(async (isActive: () => boolean = () => true) => {
    try {
      setError("");

      const [requestData, tournamentData] = await Promise.all([
        getMyRequests(),
        getTournaments(),
      ]);

      if (!isActive()) return;

      const requests = (requestData.rows ?? []) as TournamentRequest[];
      const tournaments = (tournamentData.rows ?? []) as Tournament[];

      const result = requests
        .map((request) => {
          const tournament = tournaments.find(
            (item) => item.$id === request.tournamentId,
          );

          if (!tournament) return null;

          return {
            request,
            tournament,
          };
        })
        .filter((item): item is MyRoomItem => item !== null);

      if (isActive()) {
        setItems(result);
      }
    } catch (error) {
      console.log("My Room loading error:", error);

      if (isActive()) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your tournaments.",
        );

        setItems([]);
      }
    } finally {
      if (isActive()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Reload when screen gets focus
  useFocusEffect(
    useCallback(() => {
      let active = true;

      load(() => active);

      return () => {
        active = false;
      };
    }, [load]),
  );

  // Pull to refresh
  async function handleRefresh() {
    setRefreshing(true);
    await load();
  }

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-[#100D20]"
        edges={["top", "bottom"]}
      >
        <ActivityIndicator size="large" color="#A78BFA" />

        <Text className="mt-3 text-sm text-[#AAA3C2]">
          Loading your rooms...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#100D20]" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-[22px] py-4 pb-10"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A78BFA"
            colors={["#A78BFA"]}
          />
        }
      >
        {/* Header */}
        <View className="mt-4">
          <Text className="text-[28px] font-bold text-white">My Room</Text>

          <Text className="mt-2 text-sm leading-6 text-[#AAA3C2]">
            Your tournament requests and room access
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <View className="mt-5 rounded-xl border border-red-900/50 bg-red-950/30 p-4">
            <Text className="text-sm leading-6 text-red-300">{error}</Text>

            <Pressable onPress={handleRefresh} className="mt-3 self-start">
              <Text className="font-bold text-[#C4A7FF]">Try Again</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Empty State */}
        {items.length === 0 && !error ? (
          <View className="mt-14 items-center rounded-2xl border border-[#332A4B] bg-[#1D1833] p-6">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-[#332451]">
              <Text className="text-4xl">🎮</Text>
            </View>

            <Text className="mt-5 text-xl font-bold text-white">
              No tournaments yet
            </Text>

            <Text className="mt-2 text-center text-sm leading-6 text-[#AAA3C2]">
              Join a tournament and it will appear here.
            </Text>

            <Pressable
              className="mt-6 w-full items-center rounded-xl bg-[#7C3AED] p-4 active:opacity-80"
              onPress={() => router.push("/(tabs)")}
            >
              <Text className="font-bold text-white">Explore Tournaments</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Tournament Requests */}
        {items.map(({ request, tournament }) => {
          const requestStatus = request.status?.toLowerCase();
          const tournamentStatus = tournament.status?.toLowerCase();

          const isApproved = requestStatus === "approved";
          const isRejected = requestStatus === "rejected";
          const isPending = requestStatus === "pending";

          const isUpcoming = tournamentStatus === "upcoming";
          const isOngoing = tournamentStatus === "ongoing";
          const isEnded = tournamentStatus === "ended";

          const isPublic = tournament.visibility?.toLowerCase() === "public";

          // Public room: available to players with a request.
          // Private room: available only after admin approval.
          const canViewRoom = !isEnded && (isPublic || isApproved);

          const tournamentStatusLabel = isUpcoming
            ? "UPCOMING"
            : isOngoing
              ? "ONGOING"
              : isEnded
                ? "ENDED"
                : (tournament.status || "UNKNOWN").toUpperCase();

          const tournamentStatusColor = isUpcoming
            ? "text-blue-400"
            : isOngoing
              ? "text-green-400"
              : isEnded
                ? "text-red-400"
                : "text-[#AAA3C2]";

          return (
            <View
              key={request.$id}
              className="mt-5 rounded-2xl border border-[#332A4B] bg-[#1D1833] p-5"
            >
              {/* Tournament Title */}
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white">
                    {tournament.title}
                  </Text>

                  <Text className="mt-2 text-sm leading-5 text-[#AAA3C2]">
                    {tournament.mode} · {tournament.map} · {tournament.teamType}
                  </Text>
                </View>

                <View className="ml-3 rounded-lg bg-[#332451] px-3 py-2">
                  <Text className="text-[10px] font-bold uppercase text-[#C4A7FF]">
                    {isPublic ? "PUBLIC" : "PRIVATE"}
                  </Text>
                </View>
              </View>

              <View className="my-4 h-px bg-[#332A4B]" />

              {/* Request Status */}
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-[#AAA3C2]">Request Status</Text>

                <Text
                  className={`text-xs font-extrabold ${
                    isApproved
                      ? "text-green-400"
                      : isRejected
                        ? "text-red-400"
                        : "text-yellow-400"
                  }`}
                >
                  {requestStatus?.toUpperCase() ?? "PENDING"}
                </Text>
              </View>

              {/* Tournament Status */}
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-[#AAA3C2]">
                  Tournament Status
                </Text>

                <Text
                  className={`text-xs font-extrabold ${tournamentStatusColor}`}
                >
                  {tournamentStatusLabel}
                </Text>
              </View>

              {/* Room Type */}
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-[#AAA3C2]">Room Type</Text>

                <Text className="text-sm font-semibold text-white">
                  {isPublic ? "Public" : "Private"}
                </Text>
              </View>

              {/* Room Access */}
              {canViewRoom ? (
                <Pressable
                  className="mt-5 flex-row items-center justify-center rounded-xl bg-green-800 p-4 active:opacity-80"
                  onPress={() =>
                    router.push({
                      pathname: "/room/[id]",
                      params: {
                        id: tournament.$id,
                      },
                    })
                  }
                >
                  <Text className="font-bold text-white">
                    View Room Details →
                  </Text>
                </Pressable>
              ) : null}

              {/* Pending Private Room */}
              {!isPublic && isPending && !isEnded ? (
                <View className="mt-5 rounded-xl border border-yellow-900/50 bg-yellow-950/20 p-4">
                  <Text className="text-sm leading-6 text-yellow-300">
                    ⏳ Waiting for admin approval. Room details will be
                    available after approval.
                  </Text>
                </View>
              ) : null}

              {/* Rejected Request */}
              {isRejected && !isEnded ? (
                <View className="mt-5 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
                  <Text className="text-sm leading-6 text-red-300">
                    Your request was not approved.
                  </Text>
                </View>
              ) : null}

              {/* Tournament Ended */}
              {isEnded ? (
                <View className="mt-5">
                  <View className="rounded-xl border border-[#594184] bg-[#302451]/40 p-4">
                    <Text className="font-bold text-[#C4A7FF]">
                      🏆 Tournament Ended
                    </Text>

                    <Text className="mt-2 text-xs leading-5 text-[#AAA3C2]">
                      This tournament has ended. Check the official results to
                      see the winners.
                    </Text>
                  </View>

                  <Pressable
                    className="mt-3 items-center rounded-xl bg-[#7C3AED] p-4 active:opacity-80"
                    onPress={() =>
                      router.push({
                        pathname: "/tournament/[id]",
                        params: {
                          id: tournament.$id,
                        },
                      })
                    }
                  >
                    <Text className="font-bold text-white">
                      View Tournament Results →
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Approved Private Room Info */}
              {!isPublic && isApproved && !isEnded ? (
                <Text className="mt-3 text-center text-xs text-green-400">
                  ✓ Your request has been approved.
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
