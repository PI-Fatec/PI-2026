import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { AppHeader } from '@/components/main/app-header';
import { useHealthRecords } from '@/providers/health-records-provider';
import { useSession } from '@/providers/session-provider';

export default function HomeScreen() {
  const router = useRouter();
  const { userName } = useSession();
  const { records } = useHealthRecords();
  const latestGlucose = records.find((record) => record.type === 'glicemia');

  return (
    <View className="flex-1 bg-[#F3F7FC] px-5 pt-14">
      <AppHeader
        title={`Ola, ${userName || 'Usuario'}!`}
        actionLabel="Perfil"
        onPressAction={() => router.push('/main/profile')}
        onPressNotifications={() => Alert.alert('Notificacoes', 'Voce tem 2 novas notificacoes.')}
      />

      <Pressable
        onPress={() => router.push('/main/add-info')}
        className="mt-8 rounded-[28px] bg-[#0F2859] px-6 py-8">
        <Text className="text-sm text-[#D1D5DB]">Hoje, 08:30</Text>
        <View className="mt-3 flex-row items-end gap-2">
          <Text className="text-5xl font-extrabold text-white">{latestGlucose?.value ?? 110}</Text>
          <Text className="mb-1 text-xl font-semibold text-[#D1D5DB]">
            {latestGlucose?.unit ?? 'mg/dL'}
          </Text>
        </View>
        <Text className="mt-3 text-base font-semibold text-[#93C5FD]">Adicionar Novo</Text>
      </Pressable>

      <Text className="mt-8 text-2xl font-semibold text-[#1F2937]">Acoes Rapidas</Text>
      <View className="mt-4 flex-row gap-3">
        <QuickAction
          label="Registrar Glicemia"
          icon="water-outline"
          onPress={() => router.push('/main/add-info?type=glicemia')}
        />
        <QuickAction
          label="Registrar Pressao"
          icon="heart-outline"
          onPress={() => router.push('/main/add-info?type=pressao_arterial')}
        />
        <QuickAction
          label="Ver Dashboard"
          icon="pie-chart-outline"
          onPress={() => router.push('/main/dashboard')}
        />
      </View>

      <View className="mt-8 flex-row items-center justify-between">
        <Text className="text-xl font-semibold text-[#1F2937]">Proximos agendamentos</Text>
        <Pressable>
          <Text className="text-sm font-semibold text-[#2563EB]">ver mais</Text>
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-center rounded-2xl border border-[#D1D5DB] bg-white p-4">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#CFFAFE]">
          <Text className="font-semibold text-[#0369A1]">A</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-[#111827]">Consulta: DR. jobison</Text>
          <Text className="text-sm text-[#6B7280]">Amanha 10:00 AM</Text>
        </View>
        <View className="h-16 w-3 rounded-full bg-[#4F46E5]" />
      </View>
    </View>
  );
}

type QuickActionProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function QuickAction({ label, icon, onPress }: QuickActionProps) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center rounded-2xl bg-[#E6EDF8] px-3 py-4">
      <Ionicons name={icon} size={26} color="#4F46E5" />
      <Text className="mt-2 text-center text-sm font-semibold text-[#4338CA]">{label}</Text>
    </Pressable>
  );
}

