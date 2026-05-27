import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import {
  HEALTH_RECORD_TYPE_OPTIONS,
  getRecordTypeMeta,
  useHealthRecords,
  type HealthRecord,
  type HealthRecordType,
} from '@/providers/health-records-provider';

type RecordEditSheetProps = {
  visible: boolean;
  record?: HealthRecord;
  onClose: () => void;
};

export function RecordEditSheet({ visible, record, onClose }: RecordEditSheetProps) {
  const { updateRecord } = useHealthRecords();
  const [selectedType, setSelectedType] = useState<HealthRecordType>('glicemia');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!record) {
      return;
    }

    setSelectedType(record.type);
    setValue(String(record.value));
    setNotes(record.notes);
    setErrorMessage('');
  }, [record]);

  const handleSave = async () => {
    if (!record) {
      return;
    }

    const parsedValue = Number(value.replace(',', '.'));

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setErrorMessage('Informe um valor numérico maior que zero.');
      return;
    }

    const unit = getRecordTypeMeta(selectedType).unit;

    try {
      setIsSaving(true);
      setErrorMessage('');
      await updateRecord(record.id, {
        type: selectedType,
        value: parsedValue,
        unit,
        notes: notes.trim(),
        recordedAt: record.recordedAt,
      });

      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o registro.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable onPress={onClose} className="flex-1" />
        <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-[#D1D5DB]" />
          <Text className="text-xl font-semibold text-[#0F172A]">Editar registro</Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {HEALTH_RECORD_TYPE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setSelectedType(option.value)}
                disabled={isSaving}
                className={`rounded-xl border px-3 py-2 ${
                  selectedType === option.value ? 'border-[#2563EB] bg-[#DBEAFE]' : 'border-[#E5E7EB] bg-[#F8FAFC]'
                }`}>
                <Text
                  className={`font-semibold ${
                    selectedType === option.value ? 'text-[#1D4ED8]' : 'text-[#4B5563]'
                  }`}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-4 rounded-2xl border border-[#E5E7EB] px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-[#64748B]">Valor</Text>
            <TextInput
              value={value}
              onChangeText={(nextValue) => {
                setValue(nextValue);
                setErrorMessage('');
              }}
              keyboardType="decimal-pad"
              placeholder={getRecordTypeMeta(selectedType).placeholder}
              placeholderTextColor="#94A3B8"
              editable={!isSaving}
              className="mt-1 text-xl font-semibold text-[#0F172A]"
            />
          </View>

          <View className="mt-3 rounded-2xl border border-[#E5E7EB] px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-[#64748B]">
              Observacoes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              editable={!isSaving}
              placeholder="Anotações do registro"
              placeholderTextColor="#94A3B8"
              className="mt-1 text-base text-[#0F172A]"
            />
          </View>

          {errorMessage ? <Text className="mt-3 text-sm font-semibold text-[#DC2626]">{errorMessage}</Text> : null}

          <View className="mt-5 flex-row gap-2">
            <Pressable onPress={onClose} disabled={isSaving} className="flex-1 items-center rounded-xl bg-[#E5E7EB] py-3">
              <Text className="font-semibold text-[#374151]">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              className={`flex-1 items-center rounded-xl py-3 ${isSaving ? 'bg-[#93A4BD]' : 'bg-[#1D4ED8]'}`}>
              <Text className="font-semibold text-white">{isSaving ? 'Salvando...' : 'Salvar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
