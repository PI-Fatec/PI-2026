import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#F3F7FC] px-6">
      <Text className="text-center text-3xl font-bold text-[#1F2937]">HealthTrackAI</Text>
      <Text className="mt-4 text-center text-base leading-7 text-[#4B5563]">
        Fluxo inicial configurado com onboarding, autenticação, notificações e token em storage.
      </Text>
    </View>
  );
}
