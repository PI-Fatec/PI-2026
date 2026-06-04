import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { AppHeader } from '@/components/main/app-header';
import { usePatientProfile } from '@/providers/patient-profile-provider';
import { useSession } from '@/providers/session-provider';

const riskColor = {
  ALTO: 'text-[#B91C1C]',
  MEDIO: 'text-[#B45309]',
  BAIXO: 'text-[#166534]',
};

const healthStatusLabel = {
  MUITO_BOM: 'Muito bom',
  BOM: 'Bom',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useSession();
  const { account, isLoading, error } = usePatientProfile();
  const profile = account?.patientProfile;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  if (isLoading && !account) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F3F4F6]">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F3F4F6]" contentContainerClassName="px-5 pb-8 pt-14">
      <AppHeader
        title="Perfil"
        actionLabel="Editar"
        onPressAction={() => router.push('/main/add-info')}
        showNotifications={false}
      />

      {error ? (
        <View className="mt-5 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-4">
          <Text className="font-semibold text-[#B91C1C]">{error}</Text>
        </View>
      ) : null}

      <View className="mt-5 rounded-3xl bg-[#0F2859] p-5">
        <Text className="text-sm text-[#BFDBFE]">Paciente</Text>
        <Text className="mt-2 text-2xl font-bold text-white">{account?.name ?? 'Usuário'}</Text>
        <Text className="mt-1 text-sm text-[#D1D5DB]">{account?.email ?? '-'}</Text>
        <Text className="mt-3 text-sm text-[#BFDBFE]">CPF {profile?.cpf ?? '-'}</Text>
      </View>

      {profile ? (
        <>
          <View className="mt-4 rounded-3xl border border-[#DBE4F1] bg-white p-5">
            <Text className="text-lg font-semibold text-[#111827]">Risco atual</Text>
            <View className="mt-3 flex-row items-end gap-2">
              <Text className={`text-4xl font-extrabold ${riskColor[profile.risco]}`}>
                {Math.round(profile.probabilidadeRisco * 100)}%
              </Text>
              <Text className={`mb-1 text-base font-bold ${riskColor[profile.risco]}`}>{profile.risco}</Text>
            </View>
          </View>

          <View className="mt-4 rounded-3xl border border-[#DBE4F1] bg-white p-5">
            <Text className="text-lg font-semibold text-[#111827]">Dados clínicos</Text>
            <InfoRow label="Nascimento" value={formatDate(profile.dataNascimento)} />
            <InfoRow label="Sexo" value={profile.sexo} />
            <InfoRow label="Telefone" value={profile.telefone || '-'} />
            <InfoRow label="Altura" value={`${profile.alturaCm} cm`} />
            <InfoRow label="Peso" value={`${profile.pesoKg} kg`} />
            <InfoRow label="IMC" value={String(profile.imc)} />
            <InfoRow label="Pressão" value={`${profile.pressaoSistolica}/${profile.pressaoDiastolica} mmHg`} />
            <InfoRow label="Glicemia" value={`${profile.glicemiaMgDl} mg/dL`} />
          </View>

          <View className="mt-4 rounded-3xl border border-[#DBE4F1] bg-white p-5">
            <Text className="text-lg font-semibold text-[#111827]">Preditores da IA</Text>
            <InfoRow label="Fumante" value={profile.fumante ? 'Sim' : 'Não'} />
            <InfoRow label="Colesterol alto" value={profile.colesterolAlto ? 'Sim' : 'Não'} />
            <InfoRow label="Atividade física" value={profile.atividadeFisica ? 'Sim' : 'Não'} />
            <InfoRow label="Histórico de AVC" value={profile.historicoAvc ? 'Sim' : 'Não'} />
            <InfoRow label="Doença cardíaca" value={profile.doencaCardiaca ? 'Sim' : 'Não'} />
            <InfoRow label="Consome frutas" value={profile.consomeFrutas ? 'Sim' : 'Não'} />
            <InfoRow label="Consome vegetais" value={profile.consomeVegetais ? 'Sim' : 'Não'} />
            <InfoRow label="Dificuldade para caminhar" value={profile.dificuldadeCaminhar ? 'Sim' : 'Não'} />
            <InfoRow label="Álcool" value={`${profile.consumoAlcoolDoses} doses/semana`} />
            <InfoRow label="Estado geral" value={healthStatusLabel[profile.estadoGeralSaude]} />
          </View>
        </>
      ) : (
        <View className="mt-5 rounded-2xl bg-white p-5">
          <Text className="text-sm text-[#6B7280]">Perfil clínico ainda não disponível.</Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push('/main/add-info')}
        className="mt-6 h-12 items-center justify-center rounded-full bg-[#2563EB]">
        <Text className="text-base font-semibold text-white">Atualizar dados de saúde</Text>
      </Pressable>

      <Pressable
        onPress={handleSignOut}
        className="mt-3 h-12 items-center justify-center rounded-full bg-[#EF4444]">
        <Text className="text-base font-semibold text-white">Sair</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mt-3 flex-row items-center justify-between border-b border-[#EEF2F7] pb-3">
      <Text className="flex-1 text-sm text-[#64748B]">{label}</Text>
      <Text className="ml-3 text-right text-sm font-semibold text-[#111827]">{value}</Text>
    </View>
  );
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
}
