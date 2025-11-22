import { DailyMetrics } from "@/types";

// Generate realistic mock data for the past 30 days
export function generateMockMetrics(days: number = 30): DailyMetrics[] {
  const metrics: DailyMetrics[] = [];
  const today = new Date();
  
  // Simulate different phases
  const phases = [
    { name: "normal", days: 10, stress: 40 },
    { name: "exam_prep", days: 7, stress: 70 },
    { name: "recovery", days: 7, stress: 30 },
    { name: "exam_week", days: 6, stress: 85 },
  ];
  
  let phaseIndex = 0;
  let daysInPhase = 0;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const currentPhase = phases[phaseIndex];
    daysInPhase++;
    
    if (daysInPhase > currentPhase.days && phaseIndex < phases.length - 1) {
      phaseIndex++;
      daysInPhase = 1;
    }
    
    const phase = phases[phaseIndex];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Base values with phase influence
    const baseHRV = 65 - (phase.stress / 5);
    const baseRestingHR = 55 + (phase.stress / 4);
    const baseSleep = isWeekend ? 8.5 : 7.2;
    const baseSleepEff = 88 - (phase.stress / 5);
    
    // Add realistic variation
    const hrvVariation = (Math.random() - 0.5) * 15;
    const hrVariation = (Math.random() - 0.5) * 8;
    const sleepVariation = (Math.random() - 0.5) * 1.5;
    const effVariation = (Math.random() - 0.5) * 12;
    
    metrics.push({
      date: dateStr,
      sleepHours: Math.max(5, Math.min(10, baseSleep + sleepVariation)),
      sleepEfficiency: Math.max(60, Math.min(98, baseSleepEff + effVariation)),
      hrv: Math.max(35, Math.min(90, baseHRV + hrvVariation)),
      restingHr: Math.max(45, Math.min(75, baseRestingHR + hrVariation)),
      steps: isWeekend ? Math.floor(5000 + Math.random() * 8000) : Math.floor(7000 + Math.random() * 8000),
      workoutMinutes: isWeekend ? Math.floor(Math.random() * 60) : (phase.stress > 70 ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 60)),
      trainingLoad: phase.stress > 70 ? Math.floor(30 + Math.random() * 30) : Math.floor(40 + Math.random() * 40),
      stressScore: Math.max(20, Math.min(95, phase.stress + (Math.random() - 0.5) * 20)),
      moodScore: Math.max(1, Math.min(5, Math.round(3.5 - (phase.stress / 40) + (Math.random() - 0.5)))),
      energyScore: Math.max(1, Math.min(5, Math.round(3.5 - (phase.stress / 40) + (Math.random() - 0.5)))),
    });
  }
  
  return metrics;
}

export function getDefaultProfile() {
  return {
    name: "",
    goal: "maintain" as const,
    chronotype: "normal" as const,
    trainingFrequency: 3,
    baselineSleepNeed: 8,
    examPhase: false,
    onboardingComplete: false,
  };
}
