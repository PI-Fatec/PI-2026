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

type InfoErrors = {
  value?: string;
  date?: string;
  time?: string;
};

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
  const [errors, setErrors] = useState<InfoErrors>({});
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    const parsedValue = Number(value.replace(',', '.'));
    const recordedAt = buildIsoDate(date, time);
    const nextErrors: InfoErrors = {
      value: Number.isFinite(parsedValue) && parsedValue > 0 ? undefined : 'Informe um valor numérico maior que zero.',
      date: isValidDateInput(date) ? undefined : 'Use uma data no formato AAAA-MM-DD.',
      time: isValidTimeInput(time) ? undefined : 'Use uma hora no formato HH:mm.',
    };

    setErrors(nextErrors);

    if (nextErrors.value || nextErrors.date || nextErrors.time || !recordedAt) {
      Alert.alert('Revise o registro', 'Alguns campos precisam de ajuste antes de salvar.');
      return;
    }

    const payload = {
      type: selectedType,
      value: parsedValue,
      unit: selectedTypeMeta.unit,
      notes,
      recordedAt,
    };

    try {
      setIsSaving(true);
      if (editId) {
        await updateRecord(editId, payload);
      } else {
        await addRecord(payload);
      }

      router.replace('/main/dashboard');
    } catch (error) {
      Alert.alert('Falha ao salvar', error instanceof Error ? error.message : 'Não foi possível salvar o registro.');
    } finally {
      setIsSaving(false);
    }
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

      <View className="mt-5 rounded-3xl border border-[#E2E8F0] bg-white p-5">
        <Text className="text-center text-xs font-semibold uppercase tracking-[2px] text-[#6B7280]">
          Valor medido
        </Text>
        <View className="mt-4 flex-row items-end justify-center gap-2">
          <TextInput
            value={value}
            onChangeText={(nextValue) => {
              setValue(nextValue);
              setErrors((current) => ({ ...current, value: undefined }));
            }}
            keyboardType="decimal-pad"
            placeholder={selectedTypeMeta.placeholder}
            placeholderTextColor="#94A3B8"
            editable={!isSaving}
            className={`w-40 border-b text-center text-5xl font-extrabold ${
              errors.value ? 'border-[#DC2626] text-[#DC2626]' : 'border-[#38BDF8] text-[#0F3D8C]'
            }`}
          />
          <Text className="mb-2 text-2xl font-semibold text-[#6B7280]">{selectedTypeMeta.unit}</Text>
        </View>
        {errors.value ? <Text className="mt-3 text-center text-xs font-semibold text-[#DC2626]">{errors.value}</Text> : null}
      </View>

      <View className="mt-5 flex-row gap-3">
        <InfoInput
          label="Data"
          value={date}
          onChangeText={(nextValue) => {
            setDate(nextValue);
            setErrors((current) => ({ ...current, date: undefined }));
          }}
          placeholder="YYYY-MM-DD"
          icon="calendar-outline"
          error={errors.date}
        />
        <InfoInput
          label="Hora"
          value={time}
          onChangeText={(nextValue) => {
            setTime(nextValue);
            setErrors((current) => ({ ...current, time: undefined }));
          }}
          placeholder="HH:mm"
          icon="time-outline"
          error={errors.time}
        />
      </View>

      <View className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white p-4">
        <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#64748B]">Notas e observações</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          editable={!isSaving}
          placeholder="Ex: sintomas, origem do exame, orientação médica ou contexto da medição."
          placeholderTextColor="#94A3B8"
          className="mt-3 min-h-24 rounded-xl border border-[#CBD5E1] px-3 py-3 text-base text-[#1E293B]"
        />
      </View>

      <Pressable
        onPress={handleSave}
        disabled={isSaving}
        className={`mt-7 h-14 items-center justify-center rounded-full ${isSaving ? 'bg-[#93A4BD]' : 'bg-[#0F3D8C]'}`}>
        <Text className="text-xl font-semibold text-white">
          {isSaving ? 'Salvando...' : editRecord ? 'Salvar alterações' : 'Salvar registro'}
        </Text>
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
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
}) {
  return (
    <View className={`flex-1 rounded-2xl border bg-white p-3 ${error ? 'border-[#DC2626]' : 'border-transparent'}`}>
      <Text className="text-xs font-semibold uppercase tracking-[2px] text-[#64748B]">{label}</Text>
      <View className="mt-2 flex-row items-center gap-2">
        <Ionicons name={icon} size={18} color={error ? '#DC2626' : '#0EA5E9'} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          className="flex-1 text-lg font-semibold text-[#0F3D8C]"
        />
      </View>
      {error ? <Text className="mt-2 text-xs font-semibold text-[#DC2626]">{error}</Text> : null}
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
  if (!isValidDateInput(date) || !isValidTimeInput(time)) {
    return null;
  }

  const parsed = new Date(`${date}T${time}:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function isValidTimeInput(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
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
