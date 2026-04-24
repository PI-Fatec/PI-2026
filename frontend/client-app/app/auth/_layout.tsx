import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useSession } from '@/providers/session-provider';

export default function AuthLayout() {
  const { hasOnboarded, isLoading, token } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2D8DE8" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <Redirect href="/onboarding/step-1" />;
  }

  if (token) {
    return <Redirect href="/main" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
