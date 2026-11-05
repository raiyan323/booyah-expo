import { Link, useFocusEffect } from "expo-router";
import {
    CalendarDays,
    ChevronRight,
    Gamepad2,
    Globe2,
    LockKeyhole,
    MapPin,
    RefreshCw,
    Sparkles,
    Swords,
    Trophy,
    Users,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getTournaments } from "../../services/tournaments";
import type { Tournament } from "../../types";

type TournamentWithPrize = Tournament & {
  prizePool?: string;
};

const PURPLE = "#A78BFA";
const MUTED = "#AAA3C2";

function formatDate(date?: string) {
  if (!date) return "Not announced";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not announced";

  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPrize(value?: string) {
  if (!value?.trim()) return null;

  const trimmed = value.trim();

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return `৳${Number(trimmed).toLocaleString("en-US")}`;
  }

  return trimmed;
}

function InfoItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-lg bg-[#29223E] px-3 py-2">
      {icon}
      <Text className="text-xs font-medium text-[#D6D0E5]">{label}</Text>
    </View>
  );
}

function TournamentCard({ item }: { item: TournamentWithPrize }) {
  const isPublic = item.visibility?.toLowerCase() === "public";
  const isUpcoming = item.status?.toLowerCase() === "upcoming";
  const prize = formatPrize(item.prizePool);

  return (
    <Link
      href={{
        pathname: "/tournament/[id]",
        params: { id: item.$id },
      }}
      asChild
    >
      <Pressable className="mb-4 overflow-hidden rounded-2xl border border-[#332A4B] bg-[#1D1833] active:opacity-80">
        <View className="p-4">
          {/* Top Row */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#A78BFA]/15">
                <Swords size={16} color={PURPLE} />
              </View>

              <Text className="text-xs font-bold uppercase tracking-wider text-[#C4B5FD]">
                {item.mode || "Battle"}
              </Text>
            </View>

            <View
              className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5 ${
                isPublic ? "bg-emerald-400/10" : "bg-amber-400/10"
              }`}
            >
              {isPublic ? (
                <Globe2 size={11} color="#4ADE80" />
              ) : (
                <LockKeyhole size={11} color="#FBBF24" />
              )}

              <Text
                className={`text-[10px] font-bold uppercase ${
                  isPublic ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isPublic ? "Public" : "Private"}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="mt-4 text-xl font-extrabold leading-7 text-white">
            {item.title}
          </Text>

          <Text
            className="mt-2 text-sm leading-6 text-[#AAA3C2]"
            numberOfLines={2}
          >
            {item.description ||
              "Join this tournament and compete for victory."}
          </Text>

          {/* Prize Pool */}
          {prize ? (
            <View className="mt-4 flex-row items-center justify-between rounded-xl border border-[#594184] bg-[#2A2042] p-3.5">
              <View className="flex-1 flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#A78BFA]/15">
                  <Trophy size={20} color={PURPLE} />
                </View>

                <View>
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-[#AAA3C2]">
                    Prize Pool
                  </Text>

                  <Text
                    className="mt-1 text-lg font-extrabold text-white"
                    numberOfLines={1}
                  >
                    {prize}
                  </Text>
                </View>
              </View>

              <View className="rounded-lg bg-[#A78BFA]/15 px-2.5 py-1.5">
                <Text className="text-[10px] font-bold text-[#C4B5FD]">
                  WIN REWARDS
                </Text>
              </View>
            </View>
          ) : null}

          {/* Tournament Information */}
          <View className="mt-4 flex-row flex-wrap gap-2">
            <InfoItem
              icon={<MapPin size={13} color={MUTED} />}
              label={item.map || "Map"}
            />

            <InfoItem
              icon={<Users size={13} color={MUTED} />}
              label={item.teamType || "Team"}
            />

            <InfoItem
              icon={<Trophy size={13} color={MUTED} />}
              label={`${item.maxSlots ?? 0} Slots`}
            />
          </View>

          <View className="my-4 h-px bg-[#332A4B]" />

          {/* Date and Details */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-1.5">
                <CalendarDays size={13} color="#827B98" />

                <Text className="text-[10px] font-bold uppercase tracking-wider text-[#827B98]">
                  Start Date
                </Text>
              </View>

              <Text className="mt-1.5 text-xs font-medium text-[#D6D0E5]">
                {formatDate(item.startAt)}
              </Text>
            </View>

            <View className="flex-row items-center gap-1 rounded-xl bg-[#30234F] px-3 py-2.5">
              <Text className="text-xs font-bold text-[#C4B5FD]">Details</Text>
              <ChevronRight size={14} color={PURPLE} />
            </View>
          </View>

          {/* Status */}
          <View className="mt-4 flex-row items-center gap-2">
            <View
              className={`h-1.5 w-1.5 rounded-full ${
                isUpcoming ? "bg-emerald-400" : "bg-[#827B98]"
              }`}
            />

            <Text className="text-xs capitalize text-[#AAA3C2]">
              {item.status || "Unknown"}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [tournaments, setTournaments] = useState<TournamentWithPrize[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTournaments = useCallback(async () => {
    try {
      setError("");

      const response = await getTournaments();
      const rows = Array.isArray(response.rows) ? response.rows : [];

      setTournaments(rows as TournamentWithPrize[]);
    } catch (err: unknown) {
      console.log("Tournament load error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to load tournaments.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTournaments();
    }, [loadTournaments]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTournaments();
  };

  const upcomingCount = tournaments.filter(
    (item) => item.status?.toLowerCase() === "upcoming",
  ).length;

  const publicCount = tournaments.filter(
    (item) => item.visibility?.toLowerCase() === "public",
  ).length;

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#100D20]"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color={PURPLE} />
        <Text className="mt-4 text-sm text-[#AAA3C2]">
          Loading tournaments...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#100D20]" style={{ paddingTop: insets.top }}>
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <TournamentCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PURPLE}
            colors={[PURPLE]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="mb-7 mt-4 flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center">
                  <Text className="text-3xl font-black tracking-tight text-white">
                    BOOYAH
                  </Text>
                  <Text className="text-3xl font-black text-[#A78BFA]">X</Text>
                </View>

                <Text className="mt-1 text-sm text-[#827B98]">
                  Your gaming arena.
                </Text>
              </View>

              <View className="h-11 w-11 items-center justify-center rounded-2xl border border-[#332A4B] bg-[#1D1833]">
                <Gamepad2 size={21} color={PURPLE} />
              </View>
            </View>

            {/* Welcome Card */}
            <View className="mb-5 overflow-hidden rounded-3xl border border-[#49366C] bg-[#211936]">
              <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#A78BFA]/10" />

              <View className="p-5">
                <View className="flex-row items-center gap-2">
                  <Sparkles size={14} color={PURPLE} />

                  <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#C4B5FD]">
                    Ready to compete?
                  </Text>
                </View>

                <Text className="mt-4 text-2xl font-extrabold leading-8 text-white">
                  Find your next{"\n"}
                  <Text className="text-[#A78BFA]">victory.</Text>
                </Text>

                <Text className="mt-2 max-w-[260px] text-sm leading-6 text-[#AAA3C2]">
                  Explore tournaments, join your squad and show your skills.
                </Text>

                <View className="mt-5 flex-row items-center gap-2">
                  <Swords size={15} color="#C4B5FD" />

                  <Text className="text-xs font-bold text-[#C4B5FD]">
                    LET'S PLAY
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View className="mb-8 flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-[#332A4B] bg-[#1D1833] p-4">
                <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-[#A78BFA]/10">
                  <Trophy size={17} color={PURPLE} />
                </View>

                <Text className="text-2xl font-extrabold text-white">
                  {tournaments.length}
                </Text>

                <Text className="mt-1 text-xs text-[#AAA3C2]">Tournaments</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-[#332A4B] bg-[#1D1833] p-4">
                <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                  <Sparkles size={17} color="#4ADE80" />
                </View>

                <Text className="text-2xl font-extrabold text-white">
                  {upcomingCount}
                </Text>

                <Text className="mt-1 text-xs text-[#AAA3C2]">Upcoming</Text>
              </View>

              <View className="flex-1 rounded-2xl border border-[#332A4B] bg-[#1D1833] p-4">
                <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10">
                  <Globe2 size={17} color="#38BDF8" />
                </View>

                <Text className="text-2xl font-extrabold text-white">
                  {publicCount}
                </Text>

                <Text className="mt-1 text-xs text-[#AAA3C2]">Public</Text>
              </View>
            </View>

            {/* Tournament Heading */}
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-extrabold text-white">
                  Tournaments
                </Text>

                <Text className="mt-1 text-xs text-[#827B98]">
                  Find your next competition.
                </Text>
              </View>

              <View className="rounded-lg bg-[#A78BFA]/10 px-3 py-2">
                <Text className="text-xs font-bold text-[#C4B5FD]">
                  {tournaments.length} Available
                </Text>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View className="mb-4 rounded-2xl border border-red-400/20 bg-[#291A2A] p-4">
                <Text className="font-bold text-red-300">
                  Unable to load tournaments
                </Text>

                <Text className="mt-2 text-xs leading-5 text-[#D5A9B5]">
                  {error}
                </Text>

                <Pressable
                  onPress={loadTournaments}
                  className="mt-4 flex-row items-center gap-2 self-start rounded-xl bg-[#452638] px-4 py-2.5"
                >
                  <RefreshCw size={13} color="#FCA5A5" />

                  <Text className="text-xs font-bold text-red-200">
                    Try Again
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <View className="items-center rounded-2xl border border-[#332A4B] bg-[#1D1833] px-6 py-10">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#A78BFA]/10">
                <Trophy size={26} color={PURPLE} />
              </View>

              <Text className="mt-4 text-base font-bold text-white">
                No tournaments yet
              </Text>

              <Text className="mt-2 text-center text-sm leading-6 text-[#827B98]">
                New tournaments will appear here. Check back later!
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
