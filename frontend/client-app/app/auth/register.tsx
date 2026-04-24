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
  const { registerSelf } = useSession();
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [crm, setCrm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatorios', 'Preencha nome, email e senha para criar sua conta.');
      return;
    }

    if (role === 'PATIENT' && !cpf.trim()) {
      Alert.alert('CPF obrigatorio', 'Informe o CPF para cadastro de cliente.');
      return;
    }

    if (role === 'DOCTOR' && !crm.trim()) {
      Alert.alert('CRM obrigatorio', 'Informe o CRM para cadastro de medico.');
      return;
    }

    try {
      setIsSubmitting(true);
      await registerSelf({
        role,
        name: name.trim(),
        email: email.trim(),
        password,
        ...(role === 'PATIENT' ? { cpf: cpf.trim() } : { crm: crm.trim() }),
      });
      router.replace('/main');
    } catch (error) {
      Alert.alert('Falha no cadastro', error instanceof Error ? error.message : 'Nao foi possivel concluir o cadastro.');
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

          <View className="mt-5 flex-row gap-2">
            <Pressable
              onPress={() => setRole('PATIENT')}
              className={`flex-1 rounded-full px-4 py-2 ${role === 'PATIENT' ? 'bg-[#2D8DE8]' : 'bg-[#ECECEC]'}`}>
              <Text className={`text-center font-semibold ${role === 'PATIENT' ? 'text-white' : 'text-[#1E1E1E]'}`}>Cliente</Text>
            </Pressable>
            <Pressable
              onPress={() => setRole('DOCTOR')}
              className={`flex-1 rounded-full px-4 py-2 ${role === 'DOCTOR' ? 'bg-[#2D8DE8]' : 'bg-[#ECECEC]'}`}>
              <Text className={`text-center font-semibold ${role === 'DOCTOR' ? 'text-white' : 'text-[#1E1E1E]'}`}>Medico</Text>
            </Pressable>
          </View>

          <View className="mt-6 gap-4">
            <AuthTextInput value={name} onChangeText={setName} placeholder="Nome" />

            <AuthTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {role === 'PATIENT' ? (
              <AuthTextInput value={cpf} onChangeText={setCpf} placeholder="CPF" autoCapitalize="none" />
            ) : (
              <AuthTextInput value={crm} onChangeText={setCrm} placeholder="CRM" autoCapitalize="characters" />
            )}

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
