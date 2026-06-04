import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { AuthBackground } from '@/components/auth/auth-background';
import { AuthBottomSheet } from '@/components/auth/auth-bottom-sheet';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import { useSession } from '@/providers/session-provider';

type SexOption = 'Masculino' | 'Feminino' | 'Outro';

type RegisterErrors = Partial<Record<'name' | 'email' | 'password' | 'cpf' | 'dataNascimento', string>>;

const sexOptions: SexOption[] = ['Masculino', 'Feminino', 'Outro'];

export default function RegisterScreen() {
  const router = useRouter();
  const { registerPatient } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<SexOption>('Outro');
  const [telefone, setTelefone] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (field: keyof RegisterErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const nextErrors: RegisterErrors = {
      name: name.trim() ? undefined : 'Informe seu nome.',
      email: isValidEmail(email) ? undefined : 'Informe um e-mail válido.',
      password: password.length >= 6 ? undefined : 'Use pelo menos 6 caracteres.',
      cpf: onlyDigits(cpf).length === 11 ? undefined : 'Informe um CPF válido.',
      dataNascimento: isValidDate(dataNascimento) ? undefined : 'Use o formato AAAA-MM-DD.',
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      Alert.alert('Revise o cadastro', 'Alguns campos precisam de ajuste antes de continuar.');
      return;
    }

    try {
      setIsSubmitting(true);
      await registerPatient({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        cpf: cpf.trim(),
        dataNascimento,
        sexo,
        telefone: telefone.trim(),
      });
      router.replace('/main');
    } catch (error) {
      Alert.alert('Falha no cadastro', error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <View className="flex-1 justify-end">
        <AuthBottomSheet expandedTopInset={70} collapsedTopInset={110}>
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.replace('/auth')}
              className="h-8 w-8 items-center justify-center rounded-full bg-[#ECECEC]">
              <Ionicons name="close" size={20} color="#696969" />
            </Pressable>
            <Text className="text-base font-semibold text-[#1E1E1E]">Criar conta</Text>
            <View className="h-8 w-8" />
          </View>

          <ScrollView className="mt-6" showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
            <Text className="text-sm leading-5 text-[#64748B]">
              Cadastre seus dados principais para acessar o app. As informações clínicas podem ser completadas depois.
            </Text>

            <View className="mt-5 gap-4">
              <AuthTextInput
                label="Nome completo"
                value={name}
                onChangeText={(nextValue) => {
                  setName(nextValue);
                  clearError('name');
                }}
                placeholder="Seu nome"
                autoComplete="name"
                textContentType="name"
                error={errors.name}
              />

              <AuthTextInput
                label="E-mail"
                value={email}
                onChangeText={(nextValue) => {
                  setEmail(nextValue);
                  clearError('email');
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
                  clearError('password');
                }}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                error={errors.password}
              />

              <AuthTextInput
                label="CPF"
                value={cpf}
                onChangeText={(nextValue) => {
                  setCpf(maskCpf(nextValue));
                  clearError('cpf');
                }}
                placeholder="000.000.000-00"
                keyboardType="numeric"
                autoComplete="off"
                error={errors.cpf}
              />

              <AuthTextInput
                label="Nascimento"
                value={dataNascimento}
                onChangeText={(nextValue) => {
                  setDataNascimento(maskDate(nextValue));
                  clearError('dataNascimento');
                }}
                placeholder="AAAA-MM-DD"
                keyboardType="numeric"
                error={errors.dataNascimento}
              />

              <View>
                <Text className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#64748B]">Sexo</Text>
                <View className="flex-row gap-2">
                  {sexOptions.map((option) => {
                    const active = sexo === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setSexo(option)}
                        className={`flex-1 items-center rounded-2xl border py-3 ${
                          active ? 'border-[#2D8DE8] bg-[#E0F2FE]' : 'border-[#CBD5E1] bg-white'
                        }`}>
                        <Text className={`text-sm font-semibold ${active ? 'text-[#075985]' : 'text-[#475569]'}`}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <AuthTextInput
                label="Telefone"
                value={telefone}
                onChangeText={(nextValue) => setTelefone(maskPhone(nextValue))}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                helperText="Opcional"
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.82}
              className={`mt-6 h-12 items-center justify-center rounded-full ${
                isSubmitting ? 'bg-[#93C5FD]' : 'bg-[#2D8DE8]'
              }`}>
              <Text className="text-lg font-semibold text-white">
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </Text>
            </TouchableOpacity>

            <Link href="/auth/login" asChild>
              <Pressable className="mt-4">
                <Text className="text-center text-sm font-semibold text-[#0F3D8C]">Já tenho conta</Text>
              </Pressable>
            </Link>
          </ScrollView>
        </AuthBottomSheet>
      </View>
    </AuthBackground>
  );
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function maskDate(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{4})(\d)/, '$1-$2').replace(/^(\d{4})-(\d{2})(\d)/, '$1-$2-$3');
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed <= new Date();
}
