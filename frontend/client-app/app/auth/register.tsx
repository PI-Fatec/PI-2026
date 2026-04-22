import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AuthBackground } from '@/components/auth/auth-background';
import { AuthBottomSheet } from '@/components/auth/auth-bottom-sheet';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import { useSession } from '@/providers/session-provider';

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha nome, email e senha para criar sua conta.');
      return;
    }

    try {
      setIsSubmitting(true);
      const mockToken = `token_${Date.now()}`;
      await signIn(mockToken, name.trim());
      router.replace('/main');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <View className="flex-1 justify-end">
        <AuthBottomSheet>
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.replace('/auth')}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#ECECEC]">
              <Ionicons name="close" size={20} color="#696969" />
            </Pressable>
            <Text className="text-base font-semibold text-[#1E1E1E]">Crie sua conta</Text>
            <View className="h-8 w-8" />
          </View>

          <View className="mt-12 gap-4">
            <AuthTextInput value={name} onChangeText={setName} placeholder="Nome" />

            <AuthTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthTextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Pressable
            onPress={handleRegister}
            className="mt-6 h-12 items-center justify-center rounded-full bg-[#2D8DE8]">
            <Text className="text-lg font-semibold text-white">
              {isSubmitting ? 'Criando...' : 'Criar conta'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/auth/login')} className="mt-6">
            <Text className="text-center text-xs text-[#2D8DE8]">
              Ja tem uma conta? Clique aqui pra entrar
            </Text>
          </Pressable>
        </AuthBottomSheet>
      </View>
    </AuthBackground>
  );
}
