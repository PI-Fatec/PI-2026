import type { PropsWithChildren } from 'react';
import { ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AUTH_BACKGROUND_URI =
  'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1400';

type AuthBackgroundProps = PropsWithChildren<{
  dimmed?: boolean;
}>;

export function AuthBackground({ children, dimmed = false }: AuthBackgroundProps) {
  return (
    <ImageBackground source={{ uri: AUTH_BACKGROUND_URI }} resizeMode="cover" className="flex-1">
      <View className={dimmed ? 'flex-1 bg-black/55' : 'flex-1 bg-black/30'}>
        <SafeAreaView className="flex-1">{children}</SafeAreaView>
      </View>
    </ImageBackground>
  );
}
