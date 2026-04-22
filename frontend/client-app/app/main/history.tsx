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
        title="Historico"
        actionLabel="Dashboard"
        onPressAction={() => router.push('/main/dashboard')}
        onPressNotifications={() => Alert.alert('Notificacoes', 'Sem novas notificacoes no momento.')}
      />
      <Text className="mt-2 text-sm text-[#6B7280]">Visualize, edite ou remova seus registros recentes.</Text>

      <View className="mt-6 gap-3">
        {records.map((record) => {
          const when = new Date(record.recordedAt).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <View key={record.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-[#1F2937]">{getRecordTypeMeta(record.type).label}</Text>
                <Text className="text-base font-bold text-[#0F172A]">
                  {record.value} {record.unit}
                </Text>
              </View>
              <Text className="mt-2 text-sm text-[#475569]">{when}</Text>
              <Text className="mt-1 text-sm text-[#64748B]">{record.notes || 'Sem observacoes'}</Text>

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
                  className="rounded-xl bg-[#FEE2E2] px-3 py-2">
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
