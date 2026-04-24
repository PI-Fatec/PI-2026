import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { BottomMenu } from '@/components/main/bottom-menu';
import { HealthRecordsProvider } from '@/providers/health-records-provider';
import { useSession } from '@/providers/session-provider';

export default function MainLayout() {
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

  if (!token) {
    return <Redirect href="/auth" />;
  }

  return (
    <HealthRecordsProvider>
      <Tabs
        tabBar={(props) => <BottomMenu {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Historico',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
          }}
        />
        <Tabs.Screen
          name="add-info"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </HealthRecordsProvider>
  );
}
