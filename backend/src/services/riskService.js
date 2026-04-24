function computeRiskMetrics(patient) {
  let score = 0;

  if (patient.fumante) score += 0.18;
  if (!patient.atividadeFisica) score += 0.14;
  if (patient.historicoAvc) score += 0.23;
  if (patient.diabetes) score += 0.19;

  if (patient.consumoAlcoolDoses >= 14) score += 0.13;
  else if (patient.consumoAlcoolDoses >= 8) score += 0.07;

  if (patient.imc >= 30) score += 0.12;
  else if (patient.imc >= 25) score += 0.06;

  if (patient.glicemiaMgDl >= 126) score += 0.12;
  else if (patient.glicemiaMgDl >= 100) score += 0.05;

  if (patient.pressaoSistolica >= 140 || patient.pressaoDiastolica >= 90) score += 0.12;

  const probabilidadeRisco = Number(Math.min(score, 0.98).toFixed(2));

  if (probabilidadeRisco >= 0.55) {
    return { risco: 'ALTO', probabilidadeRisco };
  }

  if (probabilidadeRisco >= 0.3) {
    return { risco: 'MEDIO', probabilidadeRisco };
  }

  return { risco: 'BAIXO', probabilidadeRisco };
}

module.exports = { computeRiskMetrics };
