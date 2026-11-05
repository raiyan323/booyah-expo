import { Tabs } from "expo-router";
import { DoorOpen, Home, Newspaper, UserRound } from "lucide-react-native";

const ACTIVE = "#A78BFA";
const INACTIVE = "#AAA3C2";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: "#1D1833",
          borderTopColor: "#332A4B",
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color, size }) => (
            <Newspaper color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-tournaments"
        options={{
          title: "My Room",
          tabBarIcon: ({ color, size }) => (
            <DoorOpen color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
