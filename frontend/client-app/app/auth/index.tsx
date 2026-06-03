import { Link } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import { AuthBackground } from '@/components/auth/auth-background';

export default function AuthLandingScreen() {
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

          <Link href="/auth/login" asChild>
            <Pressable className="h-14 items-center justify-center rounded-full bg-[#2D8DE8]">
              <Text className="text-xl font-semibold text-white">Fazer login</Text>
            </Pressable>
          </Link>

          <Link href="/auth/register" asChild>
            <Pressable className="mt-3 h-14 items-center justify-center rounded-full border border-white/70 bg-white/10">
              <Text className="text-lg font-semibold text-white">Criar conta</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthBackground>
  );
}
