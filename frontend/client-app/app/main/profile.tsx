import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useSession } from '@/providers/session-provider';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, token } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Text className="text-3xl font-bold text-[#111827]">Perfil</Text>

      <View className="mt-6 rounded-2xl bg-[#F3F7FC] p-4">
        <Text className="text-sm text-[#4B5563]">Token salvo</Text>
        <Text className="mt-2 text-xs text-[#111827]">{token ?? 'Sem token'}</Text>
      </View>

      <Pressable
        onPress={handleSignOut}
        className="mt-8 h-12 items-center justify-center rounded-full bg-[#EF4444]">
        <Text className="text-base font-semibold text-white">Sair</Text>
      </Pressable>
    </View>
  );
}
