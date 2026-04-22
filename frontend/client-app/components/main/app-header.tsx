import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

type AppHeaderProps = {
  title?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  onPressNotifications?: () => void;
  showBackButton?: boolean;
  onPressBack?: () => void;
  showAction?: boolean;
  showNotifications?: boolean;
};

export function AppHeader({
  title,
  actionLabel = 'Acao',
  onPressAction,
  onPressNotifications,
  showBackButton = false,
  onPressBack,
  showAction = true,
  showNotifications = true,
}: AppHeaderProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {showBackButton ? (
            <Pressable
              onPress={onPressBack}
              className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </Pressable>
          ) : null}
          <Image
            source={require('@/assets/images/logo-healtrack.png')}
            contentFit="contain"
            style={{ width: 120, height: 100 }}
          />
        </View>

        <View className="flex-row items-center gap-2">
          {showAction ? (
            <Pressable
              onPress={onPressAction}
              className="rounded-full bg-[#DBEAFE] px-4 py-2 active:bg-[#BFDBFE]">
              <Text className="text-sm font-semibold text-[#1D4ED8]">{actionLabel}</Text>
            </Pressable>
          ) : null}
          {showNotifications ? (
            <Pressable
              onPress={onPressNotifications}
              className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <Ionicons name="notifications-outline" size={20} color="#0F172A" />
              <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {title ? <Text className="mt-6 text-3xl font-bold text-[#111827]">{title}</Text> : null}
    </View>
  );
}
