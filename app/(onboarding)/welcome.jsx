import { View, Text, Image, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#0A8F83", "#10A89B"]}
      style={{ flex: 1 }}
    >
      <View className="flex-1 items-center justify-center px-6">

        {/* Logo */}
         <View className="w-[120px] h-[120px] rounded-full items-center justify-center bg-white/10">
          <Image
            source={require("../../assets/images/Logo.png")}
            className="w-[120px] h-[120px]"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-white font-bold text-[32px] mt-8">
          FlexyFuel
        </Text>

        {/* Subtitle */}
        <Text className="text-white text-[16px] opacity-90 mt-1">
          Fuel Delivered to Your Doorstep
        </Text>

        {/* Feature Card */}
        <View className="bg-white/10 rounded-2xl w-full mt-10 p-5 space-y-4">

          {/* Item 1 */}
          <View className="flex-row my-3  items-start space-x-3">
            <View className="w-[35px] h-[35px] rounded-full bg-white/15 items-center justify-center">
              <Image source={require("../../assets/icons/flash.png")} />
            </View>
            <View className="flex-1 mb-4 mx-4">
              <Text className="text-white text-[16px] font-semibold">
                Fast Delivery
              </Text>
              <Text className="text-white/80 text-[14px] py-2">
                Get fuel delivered to your location in minutes
              </Text>
            </View>
          </View>

          {/* Item 2 */}
          <View className="flex-row  my-3 items-start space-x-3">
            <View className="w-[35px] h-[35px] mt-2 rounded-full bg-white/15 items-center justify-center">
              <Image source={require("../../assets/icons/badge.png")} />
            </View>
            <View className="flex-1  mx-4 mb-4 ">
              <Text className="text-white text-[16px] font-semibold">
                Secured Payment
              </Text>
              <Text className="text-white/80 text-[14px] pr-[10%] py-2">
                Multiple payment options with secure transactions
              </Text>
            </View>
          </View>

          {/* Item 3 */}
          <View className="flex-row my-3 items-start space-x-3">
            <View className="w-[35px]  h-[35px] rounded-full bg-white/15 items-center justify-center">
              <Image source={require("../../assets/icons/location.png")} />
            </View>
            <View className="flex-1 mx-4 mb-4">
              <Text className="text-white text-[16px] font-semibold">
                Live Tracking
              </Text>
              <Text className="text-white/80 py-2 text-[14px] ">
                Track your delivery in real-time on the map
              </Text>
            </View>
          </View>
        </View>

        {/* Pagination Dots */}
        

        {/* Button */}
        <Pressable
          className="bg-lime-400 w-full py-4 rounded-xl mt-8"
          onPress={() => router.push("/(auth)/registration")}
        >
          <Text className="text-center font-semibold text-[#0A8F83]">
            Get Started
          </Text>
        </Pressable>

        {/* Sign In */}
        <Pressable onPress={() => router.push("/(auth)/chooseMethod ")}>
          <Text className="text-white text-[14px] mt-4">
            Already have an account?{" "}
            <Text className="font-semibold underline">Sign In</Text>
          </Text>
        </Pressable>

      </View>
    </LinearGradient>
  );
}
