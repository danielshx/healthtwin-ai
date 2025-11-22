import { DailyMetrics, UserProfile, Baseline, ReadinessScore, BurnoutRisk, DailyPlan, Anomaly, AgentRecommendation } from "@/types";

export function computeBaseline(metrics: DailyMetrics[]): Baseline {
  if (metrics.length === 0) {
    return {
      hrv: 60,
      restingHr: 60,
      sleepHours: 7.5,
      sleepEfficiency: 85,
      stressScore: 50,
    };
  }

  const last14 = metrics.slice(-14);
  
  const sum = last14.reduce(
    (acc, m) => ({
      hrv: acc.hrv + m.hrv,
      restingHr: acc.restingHr + m.restingHr,
      sleepHours: acc.sleepHours + m.sleepHours,
      sleepEfficiency: acc.sleepEfficiency + m.sleepEfficiency,
      stressScore: acc.stressScore + m.stressScore,
    }),
    { hrv: 0, restingHr: 0, sleepHours: 0, sleepEfficiency: 0, stressScore: 0 }
  );

  return {
    hrv: sum.hrv / last14.length,
    restingHr: sum.restingHr / last14.length,
    sleepHours: sum.sleepHours / last14.length,
    sleepEfficiency: sum.sleepEfficiency / last14.length,
    stressScore: sum.stressScore / last14.length,
  };
}

export function computeReadiness(today: DailyMetrics, baseline: Baseline, last7Days: DailyMetrics[]): ReadinessScore {
  let score = 100;
  const explanation: string[] = [];

  // Sleep quality
  const sleepScore = (today.sleepHours / baseline.sleepHours) * (today.sleepEfficiency / 100) * 100;
  if (sleepScore < 70) {
    score -= 20;
    explanation.push("Poor sleep quality impacting recovery");
  } else if (sleepScore < 85) {
    score -= 10;
    explanation.push("Sleep could be better");
  } else {
    explanation.push("Good sleep quality");
  }

  // HRV
  const hrvDelta = ((today.hrv - baseline.hrv) / baseline.hrv) * 100;
  if (hrvDelta < -15) {
    score -= 25;
    explanation.push("HRV significantly below baseline - high stress or fatigue");
  } else if (hrvDelta < -5) {
    score -= 10;
    explanation.push("HRV slightly below baseline");
  } else if (hrvDelta > 5) {
    explanation.push("HRV above baseline - good recovery");
  }

  // Resting HR
  const hrDelta = ((today.restingHr - baseline.restingHr) / baseline.restingHr) * 100;
  if (hrDelta > 10) {
    score -= 20;
    explanation.push("Elevated resting heart rate - possible overtraining or illness");
  } else if (hrDelta > 5) {
    score -= 10;
    explanation.push("Slightly elevated resting heart rate");
  }

  // Training load
  if (today.trainingLoad > 80) {
    score -= 15;
    explanation.push("High training load - need recovery");
  }

  // Mood and energy
  if (today.moodScore <= 2 || today.energyScore <= 2) {
    score -= 15;
    explanation.push("Low mood or energy levels");
  }

  // Stress
  if (today.stressScore > 75) {
    score -= 10;
    explanation.push("High stress levels");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    explanation,
  };
}

export function computeBurnoutRisk(last7Days: DailyMetrics[], baseline: Baseline): BurnoutRisk {
  const rationale: string[] = [];
  const actions: string[] = [];
  let riskScore = 0;

  // HRV trending down
  const last3Days = last7Days.slice(-3);
  const avgHRV = last3Days.reduce((sum, m) => sum + m.hrv, 0) / last3Days.length;
  if (avgHRV < baseline.hrv * 0.85) {
    riskScore += 30;
    rationale.push("HRV has been declining for 3+ days");
    actions.push("Prioritize sleep and reduce training intensity");
  }

  // Resting HR elevated
  const avgHR = last3Days.reduce((sum, m) => sum + m.restingHr, 0) / last3Days.length;
  if (avgHR > baseline.restingHr * 1.1) {
    riskScore += 25;
    rationale.push("Resting heart rate elevated above baseline");
    actions.push("Take an extra rest day and monitor for illness");
  }

  // Poor sleep trend
  const avgSleepEff = last7Days.reduce((sum, m) => sum + m.sleepEfficiency, 0) / last7Days.length;
  if (avgSleepEff < baseline.sleepEfficiency * 0.9) {
    riskScore += 20;
    rationale.push("Sleep efficiency has been poor");
    actions.push("Focus on sleep hygiene: consistent bedtime, cool dark room");
  }

  // High stress + low mood/energy
  const avgStress = last7Days.reduce((sum, m) => sum + m.stressScore, 0) / last7Days.length;
  const avgMood = last7Days.reduce((sum, m) => sum + m.moodScore, 0) / last7Days.length;
  const avgEnergy = last7Days.reduce((sum, m) => sum + m.energyScore, 0) / last7Days.length;
  
  if (avgStress > 70 && (avgMood < 3 || avgEnergy < 3)) {
    riskScore += 25;
    rationale.push("High stress combined with low mood and energy");
    actions.push("Schedule mental health break, practice mindfulness, talk to someone");
  }

  let level: "Green" | "Yellow" | "Red" = "Green";
  if (riskScore >= 50) {
    level = "Red";
    actions.push("Consider consulting a healthcare professional");
  } else if (riskScore >= 25) {
    level = "Yellow";
  }

  if (level === "Green") {
    rationale.push("All key recovery markers are stable");
    actions.push("Keep up your current balance of training and recovery");
  }

  return { level, rationale, actions };
}

export function detectAnomalies(today: DailyMetrics, baseline: Baseline): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Resting HR spike
  const hrDelta = ((today.restingHr - baseline.restingHr) / baseline.restingHr) * 100;
  if (hrDelta > 10) {
    anomalies.push({
      metric: "Resting Heart Rate",
      deviation: `${hrDelta.toFixed(1)}% above baseline`,
      cause: "Possible overtraining, stress, or early illness",
      suggestion: "Rest today, hydrate, monitor body temperature",
    });
  }

  // HRV drop
  const hrvDelta = ((today.hrv - baseline.hrv) / baseline.hrv) * 100;
  if (hrvDelta < -15) {
    anomalies.push({
      metric: "Heart Rate Variability",
      deviation: `${Math.abs(hrvDelta).toFixed(1)}% below baseline`,
      cause: "High stress, insufficient recovery, or poor sleep",
      suggestion: "Switch to light activity (e.g., 20min walk), prioritize sleep tonight",
    });
  }

  // Sleep efficiency drop
  const sleepEffDelta = ((today.sleepEfficiency - baseline.sleepEfficiency) / baseline.sleepEfficiency) * 100;
  if (sleepEffDelta < -10) {
    anomalies.push({
      metric: "Sleep Efficiency",
      deviation: `${Math.abs(sleepEffDelta).toFixed(1)}% below baseline`,
      cause: "Stress, caffeine late in day, or environment issues",
      suggestion: "Review sleep hygiene: avoid screens 1hr before bed, cool room, consistent schedule",
    });
  }

  return anomalies;
}

export function generateDailyPlan(
  profile: UserProfile,
  today: DailyMetrics,
  last7Days: DailyMetrics[],
  baseline: Baseline
): DailyPlan {
  const readiness = computeReadiness(today, baseline, last7Days);
  const burnout = computeBurnoutRisk(last7Days, baseline);

  const priorities: string[] = [];
  let trainingIntensity: DailyPlan["trainingIntensity"] = "Moderate";
  const microInterventions: string[] = [];
  let sleepAdvice = "";

  // Determine training intensity
  if (burnout.level === "Red" || readiness.score < 40) {
    trainingIntensity = "Rest";
    priorities.push("Full recovery day");
  } else if (burnout.level === "Yellow" || readiness.score < 60 || profile.examPhase) {
    trainingIntensity = "Light";
    priorities.push("Light movement only");
  } else if (readiness.score >= 80 && today.trainingLoad < 60) {
    trainingIntensity = Math.random() > 0.5 ? "HIIT" : "Strength";
    priorities.push("High-quality training session");
  } else {
    trainingIntensity = "Moderate";
    priorities.push("Moderate training session");
  }

  // Micro-interventions
  if (today.stressScore > 60) {
    microInterventions.push("5-min box breathing between lectures");
    microInterventions.push("10-min walk outdoors during lunch");
  }

  if (today.energyScore <= 2) {
    microInterventions.push("18–22 min power nap (2-4pm window)");
  }

  if (today.steps < 5000) {
    microInterventions.push("Take stairs instead of elevator");
  }

  if (profile.examPhase && today.moodScore <= 3) {
    microInterventions.push("5-min stretch break every 90min of study");
  }

  microInterventions.push("Hydrate: 2L water throughout the day");

  // Sleep advice
  const sleepDebt = (baseline.sleepHours * 7) - last7Days.reduce((sum, m) => sum + m.sleepHours, 0);
  if (sleepDebt > 3) {
    sleepAdvice = `You have ${sleepDebt.toFixed(1)}hrs sleep debt. Aim for ${baseline.sleepHours + 0.5}hrs tonight. Bedtime by ${getOptimalBedtime(profile.chronotype)}.`;
  } else {
    sleepAdvice = `Sleep debt minimal. Maintain ${baseline.sleepHours}hrs tonight. Bedtime around ${getOptimalBedtime(profile.chronotype)}.`;
  }

  // Add recovery or focus priorities
  if (burnout.level === "Yellow" || burnout.level === "Red") {
    priorities.push("Mental recovery & stress reduction");
  } else {
    priorities.push("Maintain balance & consistency");
  }

  if (profile.examPhase) {
    priorities.push("Protect study focus with movement breaks");
  }

  return {
    date: today.date,
    priorities: priorities.slice(0, 3),
    trainingIntensity,
    microInterventions: microInterventions.slice(0, 5),
    sleepAdvice,
  };
}

function getOptimalBedtime(chronotype: "early" | "normal" | "night"): string {
  switch (chronotype) {
    case "early":
      return "9:30 PM";
    case "normal":
      return "10:30 PM";
    case "night":
      return "11:30 PM";
  }
}

export function generateRecommendations(
  profile: UserProfile,
  today: DailyMetrics,
  last7Days: DailyMetrics[],
  baseline: Baseline
): AgentRecommendation[] {
  const recs: AgentRecommendation[] = [];
  const plan = generateDailyPlan(profile, last7Days[last7Days.length - 1], last7Days, baseline);
  const burnout = computeBurnoutRisk(last7Days, baseline);
  const anomalies = detectAnomalies(today, baseline);

  // PlannerAgent - Daily priorities
  recs.push({
    id: `planner-${Date.now()}`,
    createdAt: new Date().toISOString(),
    agent: "PlannerAgent",
    type: "training",
    title: "Today's Plan",
    rationale: `Based on your readiness and recent trends, here are your top priorities.`,
    priority: "high",
    actions: [
      { label: "View Full Plan", kind: "accept" },
      { label: "Customize", kind: "snooze" },
    ],
  });

  // SleepAgent
  const sleepDebt = (baseline.sleepHours * 7) - last7Days.reduce((sum, m) => sum + m.sleepHours, 0);
  if (sleepDebt > 3) {
    recs.push({
      id: `sleep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      agent: "SleepAgent",
      type: "sleep",
      title: "Sleep Debt Detected",
      rationale: `You're ${sleepDebt.toFixed(1)}hrs behind on sleep this week. This affects recovery and performance.`,
      priority: "high",
      actions: [
        { label: "Set Early Bedtime", kind: "accept" },
        { label: "Remind Me Later", kind: "snooze" },
      ],
    });
  }

  // FitnessCoachAgent
  if (plan.trainingIntensity === "Rest") {
    recs.push({
      id: `fitness-${Date.now()}`,
      createdAt: new Date().toISOString(),
      agent: "FitnessCoachAgent",
      type: "training",
      title: "Recovery Day Recommended",
      rationale: "Your body needs rest. Light walking or stretching only today.",
      priority: "high",
      actions: [
        { label: "Accept Rest Day", kind: "accept" },
        { label: "Light Activity", kind: "snooze" },
      ],
    });
  } else if (plan.trainingIntensity === "HIIT" || plan.trainingIntensity === "Strength") {
    recs.push({
      id: `fitness-${Date.now()}`,
      createdAt: new Date().toISOString(),
      agent: "FitnessCoachAgent",
      type: "training",
      title: `${plan.trainingIntensity} Session Today`,
      rationale: "You're well-recovered. Great day for a quality session.",
      priority: "medium",
      actions: [
        { label: "Start Workout", kind: "accept" },
        { label: "Do Later", kind: "snooze" },
      ],
    });
  }

  // BurnoutGuardianAgent
  if (burnout.level === "Yellow" || burnout.level === "Red") {
    recs.push({
      id: `burnout-${Date.now()}`,
      createdAt: new Date().toISOString(),
      agent: "BurnoutGuardianAgent",
      type: "stress",
      title: `Burnout Risk: ${burnout.level}`,
      rationale: burnout.rationale.join(". "),
      priority: "high",
      actions: [
        { label: "View Actions", kind: "accept" },
        { label: "Dismiss", kind: "reject" },
      ],
    });
  }

  if (today.stressScore > 70) {
    recs.push({
      id: `stress-${Date.now()}`,
      createdAt: new Date().toISOString(),
      agent: "BurnoutGuardianAgent",
      type: "stress",
      title: "Stress Relief Needed",
      rationale: "Your stress is elevated. Try a 5-min breathing exercise.",
      priority: "medium",
      actions: [
        { label: "Start Breathing", kind: "accept" },
        { label: "Later", kind: "snooze" },
      ],
    });
  }

  // Anomaly alerts
  anomalies.forEach((anomaly, idx) => {
    recs.push({
      id: `anomaly-${Date.now()}-${idx}`,
      createdAt: new Date().toISOString(),
      agent: "BurnoutGuardianAgent",
      type: "alert",
      title: `Alert: ${anomaly.metric}`,
      rationale: `${anomaly.deviation}. ${anomaly.cause}. Suggestion: ${anomaly.suggestion}`,
      priority: "high",
    });
  });

  return recs;
}

export function simulateWhatIf(
  optionLabel: string,
  profile: UserProfile,
  baseline: Baseline,
  today: DailyMetrics
): { readinessDelta: number; sleepDelta: number; recoveryDelta: number; explanation: string } {
  let readinessDelta = 0;
  let sleepDelta = 0;
  let recoveryDelta = 0;
  let explanation = "";

  const option = optionLabel.toLowerCase();

  if (option.includes("zone-2") || option.includes("zone 2")) {
    readinessDelta = -5;
    sleepDelta = 0;
    recoveryDelta = 5;
    explanation = "Zone-2 cardio improves aerobic base without taxing recovery. Minimal impact on tomorrow's readiness.";
  } else if (option.includes("hiit")) {
    readinessDelta = -15;
    sleepDelta = -0.5;
    recoveryDelta = -10;
    explanation = "HIIT is demanding. Expect lower readiness tomorrow. Requires 48hr recovery.";
  } else if (option.includes("strength")) {
    readinessDelta = -10;
    sleepDelta = 0;
    recoveryDelta = -5;
    explanation = "Strength training causes muscle fatigue. Moderate impact on readiness. Good if well-rested.";
  } else if (option.includes("rest")) {
    readinessDelta = 10;
    sleepDelta = 0.5;
    recoveryDelta = 15;
    explanation = "Full rest accelerates recovery. Expect improved readiness and mood tomorrow.";
  } else if (option.includes("extra sleep") || option.includes("early bed")) {
    readinessDelta = 12;
    sleepDelta = 1;
    recoveryDelta = 20;
    explanation = "Extra sleep is the #1 recovery tool. Boosts HRV, lowers resting HR, improves mood.";
  } else {
    readinessDelta = -8;
    sleepDelta = 0;
    recoveryDelta = 0;
    explanation = "Moderate activity. Slight impact on readiness.";
  }

  return { readinessDelta, sleepDelta, recoveryDelta, explanation };
}
