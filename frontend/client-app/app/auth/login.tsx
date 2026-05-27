import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AuthBackground } from '@/components/auth/auth-background';
import { AuthBottomSheet } from '@/components/auth/auth-bottom-sheet';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import { useSession } from '@/providers/session-provider';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithCredentials } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const nextErrors = {
      email: email.trim() ? undefined : 'Informe seu e-mail.',
      password: password.trim() ? undefined : 'Informe sua senha.',
    };

    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha para entrar.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithCredentials(email.trim(), password);
      router.replace('/main');
    } catch (error) {
      Alert.alert('Falha no login', error instanceof Error ? error.message : 'Não foi possível autenticar.');
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
            <Text className="text-base font-semibold text-[#1E1E1E]">Entre na sua conta</Text>
            <View className="h-8 w-8" />
          </View>

          <View className="mt-12 gap-4">
            <AuthTextInput
              label="E-mail"
              value={email}
              onChangeText={(nextValue) => {
                setEmail(nextValue);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={errors.email}
            />

            <AuthTextInput
              label="Senha"
              value={password}
              onChangeText={(nextValue) => {
                setPassword(nextValue);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              placeholder="Senha"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              error={errors.password}
            />
          </View>

          <Pressable onPress={() => router.push('/auth/forgot-password')} className="mt-3">
            <Text className="text-right text-xs text-[#2D8DE8]">Esqueceu sua senha?</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            className="mt-6 h-12 items-center justify-center rounded-full bg-[#2D8DE8]">
            <Text className="text-lg font-semibold text-white">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/auth')} className="mt-6">
            <Text className="text-center text-xs text-[#2D8DE8]">Voltar para início</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/auth/register')} className="mt-3">
            <Text className="text-center text-sm font-semibold text-[#0F3D8C]">Criar minha conta</Text>
          </Pressable>
        </AuthBottomSheet>
      </View>
    </AuthBackground>
  );
}
