import { useFocusEffect } from "expo-router";
import {
    Bell,
    CalendarDays,
    ChevronRight,
    Megaphone,
    Newspaper,
    RefreshCw,
    Sparkles,
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

import { DATABASE_ID, Query, TABLES, tablesDB } from "../../lib/appwrite";

type NewsItem = {
  $id: string;
  $createdAt: string;
  title: string;
  content: string;
  category: string;
};

const COLORS: Record<string, string> = {
  announcement: "#A78BFA",
  update: "#38BDF8",
  tournament: "#FBBF24",
  maintenance: "#FB7185",
};

function getCategoryColor(category: string) {
  return COLORS[category?.toLowerCase()] || "#A78BFA";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NewsCard({ item }: { item: NewsItem }) {
  const color = getCategoryColor(item.category);

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-[#332A4B] bg-[#1D1833]">
      <View className="p-4">
        <View className="mb-3 flex-row items-center justify-between">
          <View
            className="rounded-md px-2.5 py-1"
            style={{ backgroundColor: `${color}18` }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color }}
            >
              {item.category}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            <CalendarDays size={12} color="#827B98" />
            <Text className="text-[11px] text-[#827B98]">
              {formatDate(item.$createdAt)}
            </Text>
          </View>
        </View>

        <Text className="text-base font-bold leading-6 text-white">
          {item.title}
        </Text>

        <Text
          className="mt-2 text-sm leading-6 text-[#AAA3C2]"
          numberOfLines={4}
        >
          {item.content}
        </Text>

        <View className="mt-4 h-px bg-[#332A4B]" />

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-[10px] font-bold tracking-widest text-[#77708F]">
            BOOYAHX
          </Text>

          <View className="flex-row items-center">
            <Text className="text-xs font-semibold text-[#A78BFA]">NEWS</Text>
            <ChevronRight size={14} color="#A78BFA" />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function NewsScreen() {
  const insets = useSafeAreaInsets();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNews = useCallback(async () => {
    try {
      setError("");

      const response = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.news,
        queries: [Query.orderDesc("$createdAt"), Query.limit(100)],
      });

      setNews((response.rows ?? []) as NewsItem[]);
    } catch (err: unknown) {
      console.log("News loading error:", err);

      setError(err instanceof Error ? err.message : "Unable to load news.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const fetchNews = async () => {
        setLoading(true);
        await loadNews();

        if (active) {
          setLoading(false);
        }
      };

      fetchNews();

      return () => {
        active = false;
      };
    }, [loadNews]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const featuredNews = news[0];
  const remainingNews = news.slice(1);

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#100D20]"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text className="mt-4 text-sm text-[#AAA3C2]">Loading updates...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#100D20]" style={{ paddingTop: insets.top }}>
      <FlatList
        data={remainingNews}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <NewsCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#A78BFA"
            colors={["#A78BFA"]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="mb-7 mt-4 flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-bold tracking-[3px] text-[#A78BFA]">
                  BOOYAHX
                </Text>

                <Text className="mt-2 text-3xl font-extrabold tracking-tight text-white">
                  News
                </Text>

                <Text className="mt-1 text-sm text-[#827B98]">
                  Updates from the battlefield.
                </Text>
              </View>

              <View className="h-11 w-11 items-center justify-center rounded-2xl border border-[#332A4B] bg-[#1D1833]">
                <Bell size={19} color="#A78BFA" />
              </View>
            </View>

            {/* Featured news */}
            {featuredNews ? (
              <View className="mb-7 overflow-hidden rounded-3xl border border-[#49366C] bg-[#211936]">
                <View className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#A78BFA]/10" />

                <View className="p-5">
                  <View className="mb-5 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="h-8 w-8 items-center justify-center rounded-xl bg-[#A78BFA]/15">
                        <Megaphone size={16} color="#A78BFA" />
                      </View>

                      <Text className="text-xs font-bold text-[#C4B5FD]">
                        FEATURED UPDATE
                      </Text>
                    </View>

                    <Sparkles size={17} color="#A78BFA" />
                  </View>

                  <Text className="mb-3 text-2xl font-extrabold leading-8 text-white">
                    {featuredNews.title}
                  </Text>

                  <Text
                    className="text-sm leading-6 text-[#B8AFCB]"
                    numberOfLines={5}
                  >
                    {featuredNews.content}
                  </Text>

                  <View className="mt-5 flex-row items-center justify-between border-t border-[#49366C] pt-4">
                    <View
                      className="rounded-md px-2.5 py-1"
                      style={{
                        backgroundColor: `${getCategoryColor(featuredNews.category)}18`,
                      }}
                    >
                      <Text
                        className="text-[10px] font-bold uppercase"
                        style={{
                          color: getCategoryColor(featuredNews.category),
                        }}
                      >
                        {featuredNews.category}
                      </Text>
                    </View>

                    <Text className="text-[11px] text-[#827B98]">
                      {formatDate(featuredNews.$createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Section heading */}
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Newspaper size={17} color="#A78BFA" />
                <Text className="text-lg font-bold text-white">
                  Latest News
                </Text>
              </View>

              <Text className="text-xs text-[#827B98]">
                {news.length} posts
              </Text>
            </View>

            {/* Error */}
            {error ? (
              <View className="mb-4 rounded-2xl border border-red-400/20 bg-[#291A2A] p-4">
                <Text className="font-semibold text-red-300">
                  Unable to load news
                </Text>

                <Text className="mt-2 text-xs leading-5 text-[#D5A9B5]">
                  {error}
                </Text>

                <Pressable
                  onPress={loadNews}
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
                <Newspaper size={25} color="#A78BFA" />
              </View>

              <Text className="mt-4 text-base font-bold text-white">
                No updates yet
              </Text>

              <Text className="mt-2 text-center text-sm leading-6 text-[#827B98]">
                New announcements and tournament updates will appear here.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
