import { useRouter } from 'expo-router';

import { OnboardingStepScreen } from '@/components/onboarding/onboarding-step-screen';

export default function OnboardingStepOneScreen() {
  const router = useRouter();

  return (
    <OnboardingStepScreen
      currentStep={1}
      image={require('@/assets/images/onbording/image.png')}
      title="Título lorem"
      description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text"
      buttonLabel="Continuar"
      onButtonPress={() => router.push('/onboarding/step-2')}
    />
  );
}
