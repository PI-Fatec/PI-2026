import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

type AppHeaderProps = {
  title?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
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
  actionIcon,
  onPressAction,
  showBackButton = false,
  onPressBack,
  showAction = true,
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
              className="flex-row items-center gap-1.5 rounded-full bg-[#DBEAFE] px-4 py-2 active:bg-[#BFDBFE]">
              {actionIcon ? <Ionicons name={actionIcon} size={16} color="#1D4ED8" /> : null}
              <Text className="text-sm font-semibold text-[#1D4ED8]">{actionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {title ? <Text className="mt-6 text-3xl font-bold text-[#111827]">{title}</Text> : null}
    </View>
  );
}
