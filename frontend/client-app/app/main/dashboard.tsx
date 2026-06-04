import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { AppHeader } from '@/components/main/app-header';
import { useHealthRecords } from '@/providers/health-records-provider';
import { usePatientProfile } from '@/providers/patient-profile-provider';

const riskColor = {
  ALTO: 'text-[#B91C1C]',
  MEDIO: 'text-[#B45309]',
  BAIXO: 'text-[#166534]',
};

export default function DashboardScreen() {
  const router = useRouter();
  const { isAnalyzingRisk, requestRiskAnalysis } = useHealthRecords();
  const { account } = usePatientProfile();
  const profile = account?.patientProfile;

  const riskPercent = profile ? Math.round(profile.probabilidadeRisco * 100) : null;

  const handleRequestRiskAnalysis = async () => {
    try {
      await requestRiskAnalysis();
      Alert.alert('Análise concluída', 'O risco foi atualizado no seu perfil.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível concluir a análise.';
      Alert.alert('Falha na análise', message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#F3F4F6]" contentContainerClassName="px-5 pb-8 pt-14">
      <AppHeader actionIcon="add-outline" actionLabel="Adicionar" onPressAction={() => router.push('/main/add-info')} />

      <View className="mt-4 rounded-3xl border border-[#D1D5DB] bg-white p-5">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-[#111827]">Risco metabólico</Text>

            <Text className="mt-1 text-sm text-[#64748B]">
              {riskPercent === null ? 'Sem predição registrada' : `${riskPercent}% no perfil atual`}
            </Text>

            {profile ? (
              <Text className={`mt-2 text-sm font-bold ${riskColor[profile.risco]}`}>
                {profile.risco}
              </Text>
            ) : null}
          </View>

          <Pressable
            onPress={handleRequestRiskAnalysis}
            disabled={isAnalyzingRisk}
            className={`rounded-2xl px-4 py-3 ${isAnalyzingRisk ? 'bg-[#CBD5E1]' : 'bg-[#4F46E5]'}`}
          >
            <Text className="font-semibold text-white">
              {isAnalyzingRisk ? 'Analisando...' : 'Analisar'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-8 rounded-3xl bg-white p-4">
        <Text className="text-2xl font-semibold text-[#111827]">Perfil de risco atual</Text>

        <Text className="mt-2 text-sm text-[#6B7280]">
          Quanto maior a barra, maior a atenção necessária naquele eixo.
        </Text>

        {profile ? (
          <RiskProfileBars profile={profile as Record<string, unknown>} />
        ) : (
          <Text className="mt-4 text-sm text-[#6B7280]">
            Preencha seus dados de saúde para visualizar seu perfil de risco.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function RiskProfileBars({ profile }: { profile: Record<string, unknown> }) {
  const data = useMemo(() => buildRiskProfileData(profile), [profile]);

  return (
    <View className="mt-5 gap-4">
      {data.map((item) => {
        const level = getRiskLevel(item.value);

        return (
          <View key={item.label} className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <View className="mb-3 flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-base font-semibold text-[#111827]">{item.label}</Text>
                <Text className="mt-1 text-xs text-[#64748B]">{item.description}</Text>
              </View>

              <View className={`rounded-full px-3 py-1 ${level.badgeClass}`}>
                <Text className={`text-xs font-bold ${level.textClass}`}>{level.label}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="h-3 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
                <View
                  className={`h-full rounded-full ${level.barClass}`}
                  style={{ width: `${item.value}%` }}
                />
              </View>

            
            </View>
          </View>
        );
      })}
    </View>
  );
}

function buildRiskProfileData(profile: Record<string, unknown>) {
  const glucose = getNumber(profile, ['glicemia', 'glucose', 'bloodGlucose', 'glicemiaJejum']);
  const bmi = getBmi(profile);

  const systolic = getNumber(profile, [
    'pressaoSistolica',
    'sistolica',
    'systolic',
    'bloodPressureSystolic',
  ]);

  const diastolic = getNumber(profile, [
    'pressaoDiastolica',
    'diastolica',
    'diastolic',
    'bloodPressureDiastolic',
  ]);

  const doesExercise = getBoolean(profile, [
    'praticaAtividadeFisica',
    'atividadeFisica',
    'physicalActivity',
    'doesExercise',
  ]);

  const consumesFruit = getBoolean(profile, [
    'consomeFrutas',
    'consumoFrutas',
    'fruits',
    'consumeFruits',
  ]);

  const consumesVegetables = getBoolean(profile, [
    'consomeVegetais',
    'consumoVegetais',
    'vegetables',
    'consumeVegetables',
  ]);

  const smoker = getBoolean(profile, ['fumante', 'smoker']);
  const highCholesterol = getBoolean(profile, ['colesterolAlto', 'highCholesterol']);
  const strokeHistory = getBoolean(profile, ['historicoAvc', 'avc', 'strokeHistory']);
  const heartDisease = getBoolean(profile, ['doencaCardiaca', 'heartDisease']);

  return [
    {
      label: 'Glicemia',
      value: calculateGlucoseRisk(glucose),
      description: glucose
        ? `Valor atual considerado: ${glucose} mg/dL.`
        : 'Nenhum valor de glicemia informado.',
    },
    {
      label: 'IMC',
      value: calculateBmiRisk(bmi),
      description: bmi
        ? `IMC estimado: ${bmi.toFixed(1)}.`
        : 'Peso e altura não informados para calcular o IMC.',
    },
    {
      label: 'Pressão',
      value: calculatePressureRisk(systolic, diastolic),
      description:
        systolic && diastolic
          ? `Pressão considerada: ${systolic}/${diastolic} mmHg.`
          : 'Pressão arterial não informada.',
    },
    {
      label: 'Atividade',
      value: doesExercise === false ? 70 : 0,
      description:
        doesExercise === false
          ? 'Você não pratica atividade física regularmente.'
          : doesExercise === true
            ? 'Você pratica atividade física.'
            : 'Informação de atividade física não preenchida.',
    },
    {
      label: 'Alimentação',
      value: calculateFoodRisk(consumesFruit, consumesVegetables),
      description: getFoodDescription(consumesFruit, consumesVegetables),
    },
    {
      label: 'Histórico',
      value: calculateHistoryRisk(smoker, highCholesterol, strokeHistory, heartDisease),
      description: getHistoryDescription(smoker, highCholesterol, strokeHistory, heartDisease),
    },
  ];
}

function getRiskLevel(value: number) {
  if (value >= 70) {
    return {
      label: 'Alto',
      textClass: 'text-[#991B1B]',
      badgeClass: 'bg-[#FEE2E2]',
      barClass: 'bg-[#EF4444]',
    };
  }

  if (value >= 40) {
    return {
      label: 'Médio',
      textClass: 'text-[#92400E]',
      badgeClass: 'bg-[#FEF3C7]',
      barClass: 'bg-[#F59E0B]',
    };
  }

  return {
    label: 'Baixo',
    textClass: 'text-[#166534]',
    badgeClass: 'bg-[#DCFCE7]',
    barClass: 'bg-[#22C55E]',
  };
}

function calculateGlucoseRisk(glucose?: number) {
  if (!glucose) return 0;

  return clamp(((glucose - 100) / 100) * 100);
}

function calculateBmiRisk(bmi?: number) {
  if (!bmi) return 0;

  if (bmi >= 18.5 && bmi <= 24.9) {
    return 0;
  }

  if (bmi < 18.5) {
    return clamp(((18.5 - bmi) / 4.5) * 100);
  }

  return clamp(((bmi - 24.9) / 15.1) * 100);
}

function calculatePressureRisk(systolic?: number, diastolic?: number) {
  const systolicRisk = systolic ? ((systolic - 120) / 60) * 100 : 0;
  const diastolicRisk = diastolic ? ((diastolic - 80) / 40) * 100 : 0;

  return clamp(Math.max(systolicRisk, diastolicRisk));
}

function calculateFoodRisk(consumesFruit?: boolean, consumesVegetables?: boolean) {
  let risk = 0;

  if (consumesFruit === false) {
    risk += 50;
  }

  if (consumesVegetables === false) {
    risk += 50;
  }

  return clamp(risk);
}

function calculateHistoryRisk(
  smoker?: boolean,
  highCholesterol?: boolean,
  strokeHistory?: boolean,
  heartDisease?: boolean
) {
  let risk = 0;

  if (smoker) risk += 25;
  if (highCholesterol) risk += 25;
  if (strokeHistory) risk += 25;
  if (heartDisease) risk += 25;

  return clamp(risk);
}

function getFoodDescription(consumesFruit?: boolean, consumesVegetables?: boolean) {
  if (consumesFruit === undefined && consumesVegetables === undefined) {
    return 'Informações sobre alimentação não preenchidas.';
  }

  if (consumesFruit === true && consumesVegetables === true) {
    return 'Você consome frutas e vegetais.';
  }

  if (consumesFruit === false && consumesVegetables === false) {
    return 'Você não consome frutas nem vegetais regularmente.';
  }

  if (consumesFruit === false) {
    return 'Você não consome frutas regularmente.';
  }

  if (consumesVegetables === false) {
    return 'Você não consome vegetais regularmente.';
  }

  return 'Alimentação parcialmente preenchida.';
}

function getHistoryDescription(
  smoker?: boolean,
  highCholesterol?: boolean,
  strokeHistory?: boolean,
  heartDisease?: boolean
) {
  const factors: string[] = [];

  if (smoker) factors.push('fumante');
  if (highCholesterol) factors.push('colesterol alto');
  if (strokeHistory) factors.push('histórico de AVC');
  if (heartDisease) factors.push('doença cardíaca');

  if (factors.length === 0) {
    return 'Nenhum fator de histórico clínico informado.';
  }

  return `Fatores considerados: ${factors.join(', ')}.`;
}

function getBmi(profile: Record<string, unknown>) {
  const bmi = getNumber(profile, ['imc', 'bmi']);

  if (bmi) {
    return bmi;
  }

  const weight = getNumber(profile, ['peso', 'weight']);
  const height = getNumber(profile, ['altura', 'height']);

  if (!weight || !height) {
    return undefined;
  }

  const heightInMeters = height > 3 ? height / 100 : height;

  return weight / (heightInMeters * heightInMeters);
}

function getNumber(profile: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = profile[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsedValue = Number(value.replace(',', '.'));

      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return undefined;
}

function getBoolean(profile: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = profile[key];

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();

      if (['true', 'sim', 'yes', '1'].includes(normalizedValue)) {
        return true;
      }

      if (['false', 'nao', 'não', 'no', '0'].includes(normalizedValue)) {
        return false;
      }
    }

    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }
  }

  return undefined;
}

function clamp(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 100));
}