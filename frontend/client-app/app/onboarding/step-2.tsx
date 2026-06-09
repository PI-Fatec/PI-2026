import { useRouter } from 'expo-router';

import { OnboardingStepScreen } from '@/components/onboarding/onboarding-step-screen';

export default function OnboardingStepTwoScreen() {
  const router = useRouter();

  return (
    <OnboardingStepScreen
      currentStep={2}
      image={require('@/assets/images/onbording/image 1.png')}
      title="Healtrack AI"
      description="Descubra como o Healtrack AI pode transformar a forma como você acompanha sua saúde."
      buttonLabel="Continuar"
      onButtonPress={() => router.push('/onboarding/step-3')}
    />
  );
}
