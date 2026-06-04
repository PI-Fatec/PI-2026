import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { AppHeader } from '@/components/main/app-header';
import { RecordEditSheet } from '@/components/main/record-edit-sheet';
import { getRecordTypeMeta, useHealthRecords, type HealthRecord } from '@/providers/health-records-provider';

export default function HistoryScreen() {
  const router = useRouter();
  const { records, deleteRecord } = useHealthRecords();
  const [editingRecord, setEditingRecord] = useState<HealthRecord | undefined>(undefined);

  return (
    <ScrollView className="flex-1 bg-[#F3F4F6]" contentContainerClassName="px-5 pb-8 pt-14">
      <AppHeader
        title="Histórico"
        actionLabel="Dashboard"
        onPressAction={() => router.push('/main/dashboard')}
        onPressNotifications={() => Alert.alert('Notificações', 'Sem novas notificações no momento.')}
      />

      <Text className="mt-2 text-sm text-[#6B7280]">
        Visualize, edite ou remova seus registros recentes.
      </Text>

      <View className="mt-6 gap-3">
        {records.map((record) => {
          const when = new Date(record.recordedAt).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const isAiPrediction = record.type === 'predicao_risco';
          const meta = getRecordTypeMeta(record.type);

          if (isAiPrediction) {
            const probability = formatRiskProbability(record.value);
            const riskLevel = getPredictionRiskLevel(probability);

            return (
              <View key={record.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-[#1F2937]">Predição de risco</Text>
                    <Text className="mt-1 text-sm text-[#64748B]">
                      Probabilidade calculada pela análise do perfil atual.
                    </Text>
                  </View>

                  <View className={`rounded-full px-3 py-1 ${riskLevel.badgeClass}`}>
                    <Text className={`text-xs font-bold ${riskLevel.textClass}`}>
                      {riskLevel.label}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 rounded-2xl bg-[#F8FAFC] p-4">
                  <View className="flex-row items-end justify-between">
                    <View>
                      <Text className="text-sm text-[#64748B]">Probabilidade</Text>
                      <Text className="mt-1 text-3xl font-bold text-[#0F172A]">
                        {probability}%
                      </Text>
                    </View>

                    <Text className={`text-sm font-bold ${riskLevel.textClass}`}>
                      {riskLevel.description}
                    </Text>
                  </View>

                  <View className="mt-4 h-3 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <View
                      className={`h-full rounded-full ${riskLevel.barClass}`}
                      style={{ width: `${probability}%` }}
                    />
                  </View>
                </View>

                <Text className="mt-3 text-sm text-[#475569]">{when}</Text>

                <Text className="mt-1 text-sm text-[#64748B]">
                  {record.notes || 'Registro gerado automaticamente pela análise de risco.'}
                </Text>
              </View>
            );
          }

          return (
            <View key={record.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-lg font-semibold text-[#1F2937]">
                  {meta.label}
                </Text>

                <Text className="text-base font-bold text-[#0F172A]">
                  {record.value} {record.unit}
                </Text>
              </View>

              <Text className="mt-2 text-sm text-[#475569]">{when}</Text>

              <Text className="mt-1 text-sm text-[#64748B]">
                {record.notes || 'Sem observações'}
              </Text>

              <View className="mt-4 flex-row gap-2">
                <Pressable onPress={() => setEditingRecord(record)} className="rounded-xl bg-[#DBEAFE] px-3 py-2">
                  <Text className="font-semibold text-[#1D4ED8]">Editar</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Alert.alert('Excluir registro', 'Deseja remover este registro?', [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Excluir', style: 'destructive', onPress: () => deleteRecord(record.id) },
                    ]);
                  }}
                  className="rounded-xl bg-[#FEE2E2] px-3 py-2"
                >
                  <Text className="font-semibold text-[#B91C1C]">Deletar</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {records.length === 0 ? (
          <View className="rounded-2xl bg-white p-5">
            <Text className="text-sm text-[#6B7280]">Nenhum registro encontrado.</Text>
          </View>
        ) : null}
      </View>

      <RecordEditSheet
        visible={Boolean(editingRecord)}
        record={editingRecord}
        onClose={() => setEditingRecord(undefined)}
      />
    </ScrollView>
  );
}

function formatRiskProbability(value: number) {
  if (value <= 1) {
    return Math.round(value * 100);
  }

  return Math.round(value);
}

function getPredictionRiskLevel(probability: number) {
  if (probability >= 70) {
    return {
      label: 'Risco alto',
      description: 'Alta atenção',
      textClass: 'text-[#991B1B]',
      badgeClass: 'bg-[#FEE2E2]',
      barClass: 'bg-[#EF4444]',
    };
  }

  if (probability >= 40) {
    return {
      label: 'Risco médio',
      description: 'Atenção moderada',
      textClass: 'text-[#92400E]',
      badgeClass: 'bg-[#FEF3C7]',
      barClass: 'bg-[#F59E0B]',
    };
  }

  return {
    label: 'Risco baixo',
    description: 'Baixa atenção',
    textClass: 'text-[#166534]',
    badgeClass: 'bg-[#DCFCE7]',
    barClass: 'bg-[#22C55E]',
  };
}