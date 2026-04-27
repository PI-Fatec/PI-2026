import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import LineChart from 'react-native-chart-kit/dist/line-chart';

import { AppHeader } from '@/components/main/app-header';
import { RecordEditSheet } from '@/components/main/record-edit-sheet';
import { getRecordTypeMeta, useHealthRecords, type HealthRecord } from '@/providers/health-records-provider';

type Period = 'dia' | 'semana';

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { records, deleteRecord } = useHealthRecords();
  const [period, setPeriod] = useState<Period>('dia');
  const [editingRecord, setEditingRecord] = useState<HealthRecord | undefined>(undefined);

  const glucoseRecords = useMemo(
    () => records.filter((record) => record.type === 'glicemia').sort(sortByDateAsc),
    [records]
  );

  const latestRecords = useMemo(() => records.slice(0, 6), [records]);

  const chartWidth = Math.max(width - 72, 260);
  const chartData = {
    labels: glucoseRecords.map((record) => {
      const date = new Date(record.recordedAt);
      return `${String(date.getHours()).padStart(2, '0')}h`;
    }),
    datasets: [
      {
        data: glucoseRecords.map((record) => record.value),
      },
    ],
  };

  const score = Math.max(
    0,
    Math.min(100, Math.round(100 - Math.max((glucoseRecords.at(-1)?.value ?? 90) - 140, 0) / 2))
  );

  return (
    <ScrollView className="flex-1 bg-[#F3F4F6]" contentContainerClassName="px-5 pb-8 pt-14">
      <AppHeader
        actionLabel="Add info"
        onPressAction={() => router.push('/main/add-info')}
        onPressNotifications={() => Alert.alert('Notificacoes', 'Lembrete de medicao em 30 minutos.')}
      />

      <View className="mt-5 flex-row rounded-full bg-[#E5E7EB] p-1">
        <PeriodButton active={period === 'dia'} label="Dia" onPress={() => setPeriod('dia')} />
        <PeriodButton active={period === 'semana'} label="Semana" onPress={() => setPeriod('semana')} />
      </View>

      <View className="mt-4 rounded-3xl border border-[#D1D5DB] bg-[#EEF2FF] p-5">
        <Text className="text-xl font-semibold text-[#111827]">Pontuacao de Saude</Text>
        <View className="mt-4 flex-row items-end gap-2">
          <Text className="text-4xl font-extrabold text-[#166534]">{score}</Text>
          <Text className="mb-1 text-sm font-semibold text-[#15803D]">Excelente</Text>
        </View>
        <Text className="mt-4 rounded-2xl bg-white px-3 py-2 text-sm text-[#334155]">
          {period === 'dia'
            ? 'Continue registrando seus dados ao longo do dia para acompanhar tendencias.'
            : 'Na semana voce manteve um bom controle. Continue com hidratacao e rotina.'}
        </Text>
      </View>

      <View className="mt-8 rounded-3xl bg-white p-4">
        <Text className="text-2xl font-semibold text-[#111827]">Ultimos Registros de Glicemia</Text>

        {glucoseRecords.length > 1 ? (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            yAxisSuffix=""
            withShadow
            withInnerLines
            withOuterLines={false}
            chartConfig={{
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#38BDF8',
              },
            }}
            bezier
            style={{ marginTop: 14, borderRadius: 12 }}
          />
        ) : (
          <Text className="mt-4 text-sm text-[#6B7280]">Registre mais valores para visualizar o grafico.</Text>
        )}
      </View>

      <View className="mt-8 rounded-3xl bg-white p-4">
        <Text className="text-xl font-semibold text-[#111827]">Lista de ultimos registros</Text>
        <View className="mt-3 gap-3">
          {latestRecords.map((record) => (
            <RecordRow
              key={record.id}
              record={record}
              onEdit={() => setEditingRecord(record)}
              onDelete={() => {
                Alert.alert('Excluir registro', 'Deseja remover este registro?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Excluir', style: 'destructive', onPress: () => deleteRecord(record.id) },
                ]);
              }}
            />
          ))}

          {latestRecords.length === 0 ? (
            <Text className="text-sm text-[#6B7280]">Sem registros ainda. Adicione seu primeiro dado.</Text>
          ) : null}
        </View>
      </View>

      <RecordEditSheet
        visible={Boolean(editingRecord)}
        record={editingRecord}
        onClose={() => setEditingRecord(undefined)}
      />
    </ScrollView>
  );
}

function PeriodButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center rounded-full py-2 ${active ? 'bg-[#4F46E5]' : 'bg-transparent'}`}>
      <Text className={`font-semibold ${active ? 'text-white' : 'text-[#111827]'}`}>{label}</Text>
    </Pressable>
  );
}

function RecordRow({
  record,
  onEdit,
  onDelete,
}: {
  record: HealthRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const when = new Date(record.recordedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
      <Text className="text-base font-semibold text-[#111827]">{getRecordTypeMeta(record.type).label}</Text>
      <Text className="mt-1 text-[#334155]">
        {record.value} {record.unit} | {when}
      </Text>
      <Text className="mt-1 text-sm text-[#64748B]">{record.notes || 'Sem observações'}</Text>
      <View className="mt-3 flex-row gap-2">
        <Pressable onPress={onEdit} className="rounded-xl bg-[#DBEAFE] px-3 py-2">
          <Text className="font-semibold text-[#1D4ED8]">Editar</Text>
        </Pressable>
        <Pressable onPress={onDelete} className="rounded-xl bg-[#FEE2E2] px-3 py-2">
          <Text className="font-semibold text-[#B91C1C]">Deletar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function sortByDateAsc(a: HealthRecord, b: HealthRecord) {
  return new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
}
