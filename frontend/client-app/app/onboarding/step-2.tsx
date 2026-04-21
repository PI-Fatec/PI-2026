import { useRouter } from 'expo-router';

import { OnboardingStepScreen } from '@/components/onboarding/onboarding-step-screen';

export default function OnboardingStepTwoScreen() {
  const router = useRouter();

  return (
    <OnboardingStepScreen
      currentStep={2}
      image={require('@/assets/images/onbording/image 1.png')}
      title="Título lorem"
      description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text"
      buttonLabel="Continuar"
      onButtonPress={() => router.push('/onboarding/step-3')}
    />
  );
}
