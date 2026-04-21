import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useSession } from '@/providers/session-provider';

export default function OnboardingLayout() {
  const { hasOnboarded, isLoading, token } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2D8DE8" />
      </View>
    );
  }

  if (hasOnboarded) {
    return <Redirect href={token ? '/main' : '/auth'} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
