import { Stack } from "expo-router";
import '../global.css'

export default function RootLayout() {
  return (
     <Stack>
      <Stack.Screen name="registration" options={{ headerShown: false }} />
      <Stack.Screen name="signIn" options={{ headerShown: false }} />
       <Stack.Screen name="numbIn" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false }} /> 
      <Stack.Screen name="chooseMethod" options={{ headerShown: false }} />
      <Stack.Screen name="forgetPassword" options={{ headerShown: false }} /> 
      <Stack.Screen name="resetLink" options={{ headerShown: false }} />
    </Stack>
  );
}