import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/main/app-header';
import {
  HEALTH_RECORD_TYPE_OPTIONS,
  getRecordTypeMeta,
  useHealthRecords,
  type HealthRecordType,
} from '@/providers/health-records-provider';

export default function AddInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const { addRecord, getRecordById, updateRecord } = useHealthRecords();

  const editId = normalizeParam(params.id);
  const editRecord = useMemo(() => (editId ? getRecordById(editId) : undefined), [editId, getRecordById]);

  const initialType = normalizeType(params.type) ?? editRecord?.type ?? 'glicemia';

  const [selectedType, setSelectedType] = useState<HealthRecordType>(initialType);
  const [value, setValue] = useState(editRecord?.value ? String(editRecord.value) : '');
  const [date, setDate] = useState(formatDateInput(editRecord?.recordedAt));
  const [time, setTime] = useState(formatTimeInput(editRecord?.recordedAt));
  const [notes, setNotes] = useState(editRecord?.notes ?? '');

  useEffect(() => {
    if (!editRecord) {
      return;
    }

    setSelectedType(editRecord.type);
    setValue(String(editRecord.value));
    setDate(formatDateInput(editRecord.recordedAt));
    setTime(formatTimeInput(editRecord.recordedAt));
    setNotes(editRecord.notes);
  }, [editRecord]);

  const selectedTypeMeta = getRecordTypeMeta(selectedType);

  const handleSave = () => {
    const parsedValue = Number(value.replace(',', '.'));

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor numérico válido.');
      return;
    }

    const recordedAt = buildIsoDate(date, time);
    const payload = {
      type: selectedType,
      value: parsedValue,
      unit: selectedTypeMeta.unit,
      notes,
      recordedAt,
    };

    if (editId) {
      updateRecord(editId, payload);
    } else {
      addRecord(payload);
    }

    router.replace('/main/dashboard');
  };

  return (
    <ScrollView className="flex-1 bg-[#F3F4F6]" contentContainerClassName="px-5 pb-8 pt-14">
      <AppHeader
        title="Adicionar informação"
        showBackButton
        onPressBack={() => router.back()}
        showAction={false}
        onPressNotifications={() => Alert.alert('Notificações', 'Sem novos avisos.')}
      />

      <View className="mt-8 rounded-3xl bg-white p-4">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-[#64748B]">Tipo de registro</Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {HEALTH_RECORD_TYPE_OPTIONS.map((option) => {
            const active = option.value === selectedType;

            return (
              <Pressable
                key={option.value}
                onPress={() => setSelectedType(option.value)}
                className={`rounded-xl border px-3 py-2 ${
                  active ? 'border-[#2563EB] bg-[#DBEAFE]' : 'border-[#E5E7EB] bg-[#F8FAFC]'
                }`}>
                <Text className={`font-semibold ${active ? 'text-[#1D4ED8]' : 'text-[#334155]'}`}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-5 rounded-3xl border-l-4 border-l-[#0E7490] bg-white p-5">
        <Text className="text-center text-xs font-semibold uppercase tracking-[2px] text-[#6B7280]">
          Valor medido
        </Text>
        <View className="mt-4 flex-row items-end justify-center gap-2">
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholder={selectedTypeMeta.placeholder}
            placeholderTextColor="#BFDBFE"
            className="w-40 border-b border-[#BFDBFE] text-center text-5xl font-extrabold text-[#BFDBFE]"
          />
          <Text className="mb-2 text-2xl font-semibold text-[#6B7280]">{selectedTypeMeta.unit}</Text>
        </View>
        <View className="mt-4 self-center rounded-full bg-[#DCFCE7] px-4 py-1">
          <Text className="text-xs font-semibold uppercase text-[#3F6212]">Registro local</Text>
        </View>
      </View>

      <View className="mt-5 flex-row gap-3">
        <InfoInput
          label="Data"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          icon="calendar-outline"
        />
        <InfoInput
          label="Hora"
          value={time}
          onChangeText={setTime}
          placeholder="HH:mm"
          icon="time-outline"
        />
      </View>

      <View className="mt-4 rounded-2xl border border-dashed border-[#60A5FA] bg-white p-4">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#64748B]">Notas e observações</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholder="Ex: observações do registro, origem do exame, refeição etc."
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-xl border border-dashed border-[#93C5FD] px-3 py-3 text-base text-[#1E293B]"
        />
      </View>

      <Pressable
        onPress={handleSave}
        className="mt-7 h-14 items-center justify-center rounded-full bg-[#0F3D8C]">
        <Text className="text-xl font-semibold text-white">{editRecord ? 'Salvar alterações' : 'Salvar registro'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-3">
      <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#64748B]">{label}</Text>
      <View className="mt-2 flex-row items-center gap-2">
        <Ionicons name={icon} size={18} color="#0EA5E9" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          className="flex-1 text-lg font-semibold text-[#0F3D8C]"
        />
      </View>
    </View>
  );
}

function formatDateInput(dateIso?: string) {
  const date = dateIso ? new Date(dateIso) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function formatTimeInput(dateIso?: string) {
  const date = dateIso ? new Date(dateIso) : new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function buildIsoDate(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00`);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function normalizeParam(value?: string | string[]) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

function normalizeType(value?: string): HealthRecordType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value as HealthRecordType;
  const exists = HEALTH_RECORD_TYPE_OPTIONS.some((option) => option.value === normalized);
  return exists ? normalized : undefined;
}
