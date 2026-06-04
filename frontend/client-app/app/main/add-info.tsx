import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/main/app-header';
import { usePatientProfile } from '@/providers/patient-profile-provider';
import { HealthOverallStatus, Sex } from '@/types/patient-profile';

const sexOptions: Sex[] = ['Feminino', 'Masculino', 'Outro'];
const healthStatusOptions: HealthOverallStatus[] = ['MUITO_BOM', 'BOM', 'ATENCAO', 'CRITICO'];

const healthStatusLabel: Record<HealthOverallStatus, string> = {
  MUITO_BOM: 'Muito bom',
  BOM: 'Bom',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico',
};

type ClinicalForm = {
  telefone: string;
  dataNascimento: string;
  sexo: Sex;
  alturaCm: string;
  pesoKg: string;
  pressaoSistolica: string;
  pressaoDiastolica: string;
  glicemiaMgDl: string;
  fumante: boolean;
  colesterolAlto: boolean;
  atividadeFisica: boolean;
  historicoAvc: boolean;
  doencaCardiaca: boolean;
  consomeFrutas: boolean;
  consomeVegetais: boolean;
  dificuldadeCaminhar: boolean;
  consumoAlcoolDoses: string;
  estadoGeralSaude: HealthOverallStatus;
};

export default function AddInfoScreen() {
  const router = useRouter();
  const { account, isLoading, isSaving, updateProfile } = usePatientProfile();
  const profile = account?.patientProfile;
  const [form, setForm] = useState<ClinicalForm>(() => buildForm());

  useEffect(() => {
    if (!profile) return;
    setForm(buildForm(profile));
  }, [profile]);

  const imc = useMemo(() => {
    const alturaCm = parseNumber(form.alturaCm);
    const pesoKg = parseNumber(form.pesoKg);

    if (!alturaCm || !pesoKg) return 0;

    return Number((pesoKg / Math.pow(alturaCm / 100, 2)).toFixed(1));
  }, [form.alturaCm, form.pesoKg]);

  const updateField = <K extends keyof ClinicalForm>(field: K, value: ClinicalForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    const alturaCm = parseNumber(form.alturaCm);
    const pesoKg = parseNumber(form.pesoKg);
    const pressaoSistolica = parseNumber(form.pressaoSistolica);
    const pressaoDiastolica = parseNumber(form.pressaoDiastolica);
    const glicemiaMgDl = parseNumber(form.glicemiaMgDl);
    const consumoAlcoolDoses = parseNumber(form.consumoAlcoolDoses);

    if (!alturaCm || !pesoKg || !pressaoSistolica || !pressaoDiastolica || !glicemiaMgDl) {
      Alert.alert('Revise os dados', 'Preencha altura, peso, pressão e glicemia com números válidos.');
      return;
    }

    try {
      await updateProfile({
        telefone: form.telefone.trim(),
        dataNascimento: form.dataNascimento || null,
        sexo: form.sexo,
        alturaCm,
        pesoKg,
        imc,
        pressaoSistolica,
        pressaoDiastolica,
        glicemiaMgDl,
        fumante: form.fumante,
        colesterolAlto: form.colesterolAlto,
        atividadeFisica: form.atividadeFisica,
        historicoAvc: form.historicoAvc,
        doencaCardiaca: form.doencaCardiaca,
        consomeFrutas: form.consomeFrutas,
        consomeVegetais: form.consomeVegetais,
        dificuldadeCaminhar: form.dificuldadeCaminhar,
        consumoAlcoolDoses: consumoAlcoolDoses ?? 0,
        estadoGeralSaude: form.estadoGeralSaude,
      });

      Alert.alert('Dados atualizados', 'Seu perfil clínico foi salvo e já pode alimentar a análise da IA.');
      router.replace('/main/dashboard');
    } catch (error) {
      Alert.alert('Falha ao salvar', error instanceof Error ? error.message : 'Não foi possível salvar seus dados.');
    }
  };

  if (isLoading && !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F3F4F6]">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F3F4F6]" contentContainerClassName="px-5 pb-8 pt-14">
      <AppHeader
        title="Dados de saúde"
        showBackButton
        onPressBack={() => router.back()}
        showAction={false}
        onPressNotifications={() => Alert.alert('Notificações', 'Sem novos avisos.')}
      />

      <View className="mt-5 rounded-3xl border border-[#DBE4F1] bg-white p-5">
        <Text className="text-lg font-semibold text-[#111827]">Informações pessoais</Text>
        <TextInputField
          label="Telefone"
          value={form.telefone}
          onChangeText={(value) => updateField('telefone', value)}
          keyboardType="phone-pad"
          placeholder="(00) 00000-0000"
        />
        <TextInputField
          label="Data de nascimento"
          value={form.dataNascimento}
          onChangeText={(value) => updateField('dataNascimento', value)}
          placeholder="AAAA-MM-DD"
        />
        <OptionGroup
          label="Sexo"
          options={sexOptions}
          value={form.sexo}
          getLabel={(value) => value}
          onChange={(value) => updateField('sexo', value)}
        />
      </View>

      <View className="mt-4 rounded-3xl border border-[#DBE4F1] bg-white p-5">
        <Text className="text-lg font-semibold text-[#111827]">Biometria e medições</Text>
        <View className="mt-3 flex-row gap-3">
          <TextInputField
            label="Altura"
            value={form.alturaCm}
            onChangeText={(value) => updateField('alturaCm', value)}
            keyboardType="decimal-pad"
            suffix="cm"
          />
          <TextInputField
            label="Peso"
            value={form.pesoKg}
            onChangeText={(value) => updateField('pesoKg', value)}
            keyboardType="decimal-pad"
            suffix="kg"
          />
        </View>

        <View className="mt-3 rounded-2xl bg-[#EEF2FF] p-4">
          <Text className="text-xs font-semibold uppercase tracking-[1px] text-[#64748B]">IMC calculado</Text>
          <Text className="mt-1 text-3xl font-bold text-[#1D4ED8]">{imc || '--'}</Text>
        </View>

        <View className="mt-3 flex-row gap-3">
          <TextInputField
            label="Pressão sistólica"
            value={form.pressaoSistolica}
            onChangeText={(value) => updateField('pressaoSistolica', value)}
            keyboardType="number-pad"
            suffix="mmHg"
          />
          <TextInputField
            label="Pressão diastólica"
            value={form.pressaoDiastolica}
            onChangeText={(value) => updateField('pressaoDiastolica', value)}
            keyboardType="number-pad"
            suffix="mmHg"
          />
        </View>

        <TextInputField
          label="Glicemia"
          value={form.glicemiaMgDl}
          onChangeText={(value) => updateField('glicemiaMgDl', value)}
          keyboardType="decimal-pad"
          suffix="mg/dL"
        />
      </View>

      <View className="mt-4 rounded-3xl border border-[#DBE4F1] bg-white p-5">
        <Text className="text-lg font-semibold text-[#111827]">Preditores da IA</Text>
        <ToggleRow label="Fumante" value={form.fumante} onChange={(value) => updateField('fumante', value)} />
        <ToggleRow
          label="Colesterol alto"
          value={form.colesterolAlto}
          onChange={(value) => updateField('colesterolAlto', value)}
        />
        <ToggleRow
          label="Atividade física regular"
          value={form.atividadeFisica}
          onChange={(value) => updateField('atividadeFisica', value)}
        />
        <ToggleRow
          label="Histórico de AVC"
          value={form.historicoAvc}
          onChange={(value) => updateField('historicoAvc', value)}
        />
        <ToggleRow
          label="Doença cardíaca"
          value={form.doencaCardiaca}
          onChange={(value) => updateField('doencaCardiaca', value)}
        />
        <ToggleRow
          label="Consome frutas"
          value={form.consomeFrutas}
          onChange={(value) => updateField('consomeFrutas', value)}
        />
        <ToggleRow
          label="Consome vegetais"
          value={form.consomeVegetais}
          onChange={(value) => updateField('consomeVegetais', value)}
        />
        <ToggleRow
          label="Dificuldade para caminhar"
          value={form.dificuldadeCaminhar}
          onChange={(value) => updateField('dificuldadeCaminhar', value)}
        />
        <TextInputField
          label="Consumo de álcool"
          value={form.consumoAlcoolDoses}
          onChangeText={(value) => updateField('consumoAlcoolDoses', value)}
          keyboardType="number-pad"
          suffix="doses/semana"
        />
        <OptionGroup
          label="Estado geral de saúde"
          options={healthStatusOptions}
          value={form.estadoGeralSaude}
          getLabel={(value) => healthStatusLabel[value]}
          onChange={(value) => updateField('estadoGeralSaude', value)}
        />
      </View>

      <Pressable
        onPress={handleSave}
        disabled={isSaving}
        className={`mt-7 h-14 items-center justify-center rounded-full ${isSaving ? 'bg-[#93A4BD]' : 'bg-[#0F3D8C]'}`}>
        <Text className="text-xl font-semibold text-white">{isSaving ? 'Salvando...' : 'Salvar dados'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function TextInputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad' | 'phone-pad';
  suffix?: string;
}) {
  return (
    <View className="mt-3 flex-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3">
      <Text className="text-xs font-semibold uppercase tracking-[1px] text-[#64748B]">{label}</Text>
      <View className="mt-2 flex-row items-center gap-2">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          className="min-w-0 flex-1 text-lg font-semibold text-[#0F172A]"
        />
        {suffix ? <Text className="text-sm font-semibold text-[#64748B]">{suffix}</Text> : null}
      </View>
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View className="mt-3 flex-row items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
      <Text className="flex-1 text-base font-semibold text-[#334155]">{label}</Text>
      <View className="flex-row rounded-full bg-[#E5E7EB] p-1">
        <Pressable
          onPress={() => onChange(true)}
          className={`rounded-full px-3 py-1.5 ${value ? 'bg-[#2563EB]' : 'bg-transparent'}`}>
          <Text className={`font-semibold ${value ? 'text-white' : 'text-[#475569]'}`}>Sim</Text>
        </Pressable>
        <Pressable
          onPress={() => onChange(false)}
          className={`rounded-full px-3 py-1.5 ${!value ? 'bg-[#2563EB]' : 'bg-transparent'}`}>
          <Text className={`font-semibold ${!value ? 'text-white' : 'text-[#475569]'}`}>Não</Text>
        </Pressable>
      </View>
    </View>
  );
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  getLabel,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  getLabel: (value: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <View className="mt-3">
      <Text className="text-xs font-semibold uppercase tracking-[1px] text-[#64748B]">{label}</Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className={`rounded-full border px-3 py-2 ${
                active ? 'border-[#2563EB] bg-[#DBEAFE]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
              }`}>
              <Text className={`font-semibold ${active ? 'text-[#1D4ED8]' : 'text-[#334155]'}`}>
                {getLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function buildForm(profile?: {
  telefone: string;
  dataNascimento: string | null;
  sexo: Sex;
  alturaCm: number;
  pesoKg: number;
  pressaoSistolica: number;
  pressaoDiastolica: number;
  glicemiaMgDl: number;
  fumante: boolean;
  colesterolAlto: boolean;
  atividadeFisica: boolean;
  historicoAvc: boolean;
  doencaCardiaca: boolean;
  consomeFrutas: boolean;
  consomeVegetais: boolean;
  dificuldadeCaminhar: boolean;
  consumoAlcoolDoses: number;
  estadoGeralSaude: HealthOverallStatus;
}): ClinicalForm {
  return {
    telefone: profile?.telefone ?? '',
    dataNascimento: profile?.dataNascimento ? String(profile.dataNascimento).slice(0, 10) : '',
    sexo: profile?.sexo ?? 'Outro',
    alturaCm: profile ? String(profile.alturaCm) : '',
    pesoKg: profile ? String(profile.pesoKg) : '',
    pressaoSistolica: profile ? String(profile.pressaoSistolica) : '',
    pressaoDiastolica: profile ? String(profile.pressaoDiastolica) : '',
    glicemiaMgDl: profile ? String(profile.glicemiaMgDl) : '',
    fumante: profile?.fumante ?? false,
    colesterolAlto: profile?.colesterolAlto ?? false,
    atividadeFisica: profile?.atividadeFisica ?? true,
    historicoAvc: profile?.historicoAvc ?? false,
    doencaCardiaca: profile?.doencaCardiaca ?? false,
    consomeFrutas: profile?.consomeFrutas ?? true,
    consomeVegetais: profile?.consomeVegetais ?? true,
    dificuldadeCaminhar: profile?.dificuldadeCaminhar ?? false,
    consumoAlcoolDoses: profile ? String(profile.consumoAlcoolDoses) : '0',
    estadoGeralSaude: profile?.estadoGeralSaude ?? 'BOM',
  };
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}
