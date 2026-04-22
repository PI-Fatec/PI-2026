import { useRouter } from 'expo-router';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OnboardingStepScreenProps = {
  title: string;
  description: string;
  image: ImageSourcePropType;
  currentStep: 1 | 2 | 3;
  buttonLabel: string;
  onButtonPress: () => void;
  isLoading?: boolean;
};

export function OnboardingStepScreen({
  title,
  description,
  image,
  currentStep,
  buttonLabel,
  onButtonPress,
  isLoading = false,
}: OnboardingStepScreenProps) {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F5F7FB]">
      <SafeAreaView className="flex-1 px-6">
        <View className="flex-row items-start justify-between pt-1">
          <Image
            source={require('@/assets/images/logo-healtrack.png')}
            resizeMode="contain"
            className="h-1"
          />

          <Pressable onPress={() => router.replace('/onboarding/step-3')} hitSlop={8}>
            <Text className="text-xs font-medium text-[#2D8DE8]">Pular</Text>
          </Pressable>
        </View>

        <View className="flex-1 justify-between pb-8">
          <View className="items-center px-1 pt-6">
            <Image source={image} resizeMode="contain" className="h-72 w-72 max-w-[92%]" />

            <Text className="mt-6 text-center text-[30px] font-bold text-[#1E1E1E]">{title}</Text>
            <Text className="mt-4 text-center text-base leading-7 text-[#3F3F3F]">{description}</Text>
          </View>

          <View className="items-center">
            <View className="mb-7 flex-row items-center gap-2">
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  className={
                    currentStep === step
                      ? 'h-2.5 w-8 rounded-full bg-[#2D8DE8]'
                      : 'h-2.5 w-2.5 rounded-full bg-[#666666]'
                  }
                />
              ))}
            </View>

            <Pressable
              onPress={onButtonPress}
              disabled={isLoading}
              className="h-14 w-full items-center justify-center rounded-full bg-[#2D8DE8]">
              <Text className="text-lg font-semibold text-white">
                {isLoading ? 'Carregando...' : buttonLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
