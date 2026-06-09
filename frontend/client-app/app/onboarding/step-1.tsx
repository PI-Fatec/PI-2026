import { useRouter } from 'expo-router';

import { OnboardingStepScreen } from '@/components/onboarding/onboarding-step-screen';

export default function OnboardingStepOneScreen() {
  const router = useRouter();

  return (
    <OnboardingStepScreen
      currentStep={1}
      image={require('@/assets/images/onbording/image.png')}
      title="Healtrack AI"
      description="Acompanhe sua saúde de forma fácil e prática, com o Healtrack AI."
      buttonLabel="Continuar"
      onButtonPress={() => router.push('/onboarding/step-2')}
    />
  );
}
