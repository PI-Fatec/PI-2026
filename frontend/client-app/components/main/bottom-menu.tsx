import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, Text, View } from 'react-native';

type MenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const menuItems: MenuItem[] = [
  { key: 'index', label: 'Home', icon: 'home-outline' },
  { key: 'dashboard', label: 'Dashboard', icon: 'pie-chart-outline' },
  { key: 'history', label: 'Historico', icon: 'time-outline' },
  { key: 'profile', label: 'Perfil', icon: 'person-outline' },
];

export function BottomMenu({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="bg-white px-4 pb-6 pt-2">
      <View className="flex-row rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] px-2 py-2">
        {menuItems.map((item) => {
          const routeIndex = state.routes.findIndex((route) => route.name === item.key);

          if (routeIndex === -1) {
            return null;
          }

          const route = state.routes[routeIndex];
          const focused = state.index === routeIndex;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const accessibilityLabel =
            descriptors[route.key].options.tabBarAccessibilityLabel ?? item.label;

          return (
            <Pressable
              key={item.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={accessibilityLabel}
              className={`flex-1 items-center justify-center rounded-2xl py-2 ${
                focused ? 'bg-[#E4EEFF]' : 'bg-transparent'
              }`}>
              <Ionicons name={item.icon} size={20} color={focused ? '#2563EB' : '#6B7280'} />
              <Text
                className={`mt-1 text-xs ${
                  focused ? 'font-semibold text-[#2563EB]' : 'text-[#6B7280]'
                }`}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
