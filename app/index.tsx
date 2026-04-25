import { View, Text, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in subtitle after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 800);

    // Navigate to onboarding after 3 seconds
    const navigateTimer = setTimeout(() => {
      router.replace("/(onboarding)/welcome");
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, []);

  return (
    <LinearGradient
      colors={["#0A8F83", "#10A89B"]}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        
        <View className="w-[120px] h-[120px] rounded-full items-center justify-center bg-white/10">
          <Image
            source={require("../assets/images/Logo.png")}
            className="w-[120px] h-[120px]"
            resizeMode="contain"
          />
        </View>

        <View className="mt-10">
          <Text
            className="text-white font-bold text-[32px]"
            style={{ fontFamily: "poppins" }}
          >
            FlexyFuel
          </Text>
        </View>

        <Animated.View style={{ marginTop: 20, opacity: subtitleOpacity }}>
          <Text className="text-white text-[16px] opacity-90">
            YOUR FUEL, YOUR CONVENIENCE
          </Text>
        </Animated.View>

      </View>
    </LinearGradient>
  );
}
