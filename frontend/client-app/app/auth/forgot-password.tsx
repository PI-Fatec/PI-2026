import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AuthBackground } from '@/components/auth/auth-background';
import { AuthBottomSheet } from '@/components/auth/auth-bottom-sheet';
import { AuthTextInput } from '@/components/auth/auth-text-input';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSend = () => {
    if (!email.trim()) {
      Alert.alert('Email obrigatorio', 'Preencha o email para enviar a recuperacao.');
      return;
    }

    Alert.alert('Email enviado', 'Se o email existir, voce recebera as instrucoes de recuperacao.');
    router.replace('/auth/login');
  };

  return (
    <AuthBackground>
      <View className="flex-1 justify-end">
        <AuthBottomSheet>
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.replace('/auth/login')}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#ECECEC]">
              <Ionicons name="close" size={20} color="#696969" />
            </Pressable>

            <Text className="text-base font-semibold text-[#1E1E1E]">Esqueceu a senha?</Text>

            <Pressable
              onPress={() => router.replace('/auth/login')}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#2D8DE8]">
              <Ionicons name="arrow-left" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text className="mt-8 text-center text-sm text-[#5D5D5D]">
            Preencha seu email cadastrado
          </Text>

          <View className="mt-6">
            <AuthTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Pressable
            onPress={handleSend}
            className="mt-6 h-12 items-center justify-center rounded-full bg-[#2D8DE8]">
            <Text className="text-lg font-semibold text-white">Enviar email</Text>
          </Pressable>
        </AuthBottomSheet>
      </View>
    </AuthBackground>
  );
}
