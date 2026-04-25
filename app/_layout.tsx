import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, AppState } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as NavigationBar from "expo-navigation-bar";
import "./global.css";
import { logAPIConfig } from "../utils/debug";

SplashScreen.preventAutoHideAsync();

async function hideNavBar() {
  if (Platform.OS === "android") {
    await NavigationBar.setVisibilityAsync("hidden");
    await NavigationBar.setBehaviorAsync("overlay-swipe");
  }
}

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      try {
        logAPIConfig();
        await hideNavBar();
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") hideNavBar();
    });

    return () => sub.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(Tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
