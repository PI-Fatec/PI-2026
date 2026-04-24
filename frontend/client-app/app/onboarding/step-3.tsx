import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { OnboardingStepScreen } from '@/components/onboarding/onboarding-step-screen';
import { requestNotificationPermission } from '@/lib/notifications';
import { useSession } from '@/providers/session-provider';

export default function OnboardingStepThreeScreen() {
  const router = useRouter();
  const { completeOnboarding } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const handleFinishOnboarding = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const granted = await requestNotificationPermission();
      await completeOnboarding();
      router.replace('/auth');

      if (!granted) {
        Alert.alert(
          'Permissão pendente',
          'Você pode ativar as notificações depois nas configurações do dispositivo.'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingStepScreen
      currentStep={3}
      image={require('@/assets/images/onbording/image2.png')}
      title="Título lorem"
      description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text"
      buttonLabel="Começar"
      onButtonPress={() => {
        void handleFinishOnboarding();
      }}
      isLoading={isSaving}
    />
  );
}
