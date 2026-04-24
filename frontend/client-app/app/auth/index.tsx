import { useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import { AuthBackground } from '@/components/auth/auth-background';

export default function AuthLandingScreen() {
  const router = useRouter();

  return (
    <AuthBackground dimmed>
      <View className="flex-1 px-6">
        <Image
          source={require('@/assets/images/logo-healtrack.png')}
          resizeMode="contain"
          className="mt-3 h-7 w-32"
        />

        <View className="flex-1 justify-end pb-12">
          <Text className="mb-10 text-4xl font-bold italic leading-[44px] text-white">
            O cuidado do amanhã, na palma da sua mão, hoje.
          </Text>

          <Pressable
            onPress={() => router.push('/auth/login')}
            className="h-14 items-center justify-center rounded-full bg-[#2D8DE8]">
            <Text className="text-xl font-semibold text-white">Fazer login</Text>
          </Pressable>
        </View>
      </View>
    </AuthBackground>
  );
}
