import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="saved-addresses" />
      <Stack.Screen name="order-history" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="notification-settings" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="terms-privacy" />
    </Stack>
  );
}
