import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AuthBackground } from '@/components/auth/auth-background';
import { AuthBottomSheet } from '@/components/auth/auth-bottom-sheet';
import { AuthTextInput } from '@/components/auth/auth-text-input';
import { useSession } from '@/providers/session-provider';

type SexOption = 'Masculino' | 'Feminino' | 'Outro';

const sexOptions: SexOption[] = ['Masculino', 'Feminino', 'Outro'];

const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

export default function InviteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const inviteToken = useMemo(() => (Array.isArray(params.token) ? params.token[0] : params.token) ?? '', [params.token]);

  const { validateInvite, acceptInvite } = useSession();

  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [role, setRole] = useState<'DOCTOR' | 'PATIENT'>('PATIENT');
  const [email, setEmail] = useState('');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<SexOption>('Outro');
  const [crm, setCrm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!inviteToken) {
      Alert.alert('Convite inválido', 'Token não informado.');
      router.replace('/auth');
      return;
    }

    const loadInvite = async () => {
      try {
        setIsLoadingInvite(true);
        const response = await validateInvite(inviteToken);
        if (response.role !== 'PATIENT') {
          Alert.alert('Convite inválido', 'Convites de médico devem ser finalizados no portal clínico.');
          router.replace('/auth');
          return;
        }
        setRole(response.role);
        setEmail(response.email);
        setCpf(response.cpf ?? '');
        setDataNascimento(toDateInputValue(response.dataNascimento));
        setSexo(response.sexo ?? 'Outro');
      } catch (error) {
        Alert.alert('Convite inválido', error instanceof Error ? error.message : 'Não foi possível validar convite.');
        router.replace('/auth');
      } finally {
        setIsLoadingInvite(false);
      }
    };

    void loadInvite();
  }, [inviteToken, router, validateInvite]);

  const handleAccept = async () => {
    if (!name.trim() || !password.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome e senha para concluir.');
      return;
    }

    if (role === 'PATIENT' && !cpf.trim()) {
      Alert.alert('CPF obrigatório', 'Informe o CPF para concluir o convite.');
      return;
    }

    if (role === 'DOCTOR' && !crm.trim()) {
      Alert.alert('CRM obrigatório', 'Informe o CRM para concluir o convite.');
      return;
    }

    try {
      setIsSubmitting(true);
      await acceptInvite({
        token: inviteToken,
        role,
        email,
        name: name.trim(),
        password,
        ...(role === 'PATIENT' ? { cpf: cpf.trim(), dataNascimento, sexo } : { crm: crm.trim() }),
      });
      router.replace('/main');
    } catch (error) {
      Alert.alert('Falha', error instanceof Error ? error.message : 'Não foi possível aceitar convite.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <View className="flex-1 justify-end">
        <AuthBottomSheet>
          <Text className="text-xl font-semibold text-[#1E1E1E]">Aceitar convite</Text>
          {isLoadingInvite ? (
            <Text className="mt-4 text-sm text-[#475569]">Validando token...</Text>
          ) : (
            <>
              <Text className="mt-2 text-xs text-[#64748B]">E-mail do convite: {email}</Text>
              <View className="mt-6 gap-4">
                <AuthTextInput value={name} onChangeText={setName} placeholder="Nome" />
                <AuthTextInput value={password} onChangeText={setPassword} placeholder="Senha" secureTextEntry autoCapitalize="none" />
                {role === 'PATIENT' ? (
                  <>
                    <AuthTextInput value={cpf} onChangeText={setCpf} placeholder="CPF" autoCapitalize="none" />
                    <AuthTextInput value={dataNascimento} onChangeText={setDataNascimento} placeholder="Nascimento" keyboardType="numeric" />
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
                  </>
                ) : (
                  <AuthTextInput value={crm} onChangeText={setCrm} placeholder="CRM" autoCapitalize="characters" />
                )}
              </View>

              <Pressable onPress={handleAccept} className="mt-6 h-12 items-center justify-center rounded-full bg-[#2D8DE8]">
                <Text className="text-lg font-semibold text-white">{isSubmitting ? 'Concluindo...' : 'Concluir cadastro'}</Text>
              </Pressable>
            </>
          )}
        </AuthBottomSheet>
      </View>
    </AuthBackground>
  );
}
