export type UserProfile = {
  name: string;
  age?: number;
  goal: "lose_fat" | "build_muscle" | "maintain";
  chronotype: "early" | "normal" | "night";
  trainingFrequency: number;
  baselineSleepNeed: number;
  examPhase: boolean;
  onboardingComplete: boolean;
};

export type DailyMetrics = {
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepEfficiency: number; // 0-100
  hrv: number; // ms
  restingHr: number; // bpm
  steps: number;
  workoutMinutes: number;
  trainingLoad: number; // 0-100
  stressScore: number; // 0-100
  moodScore: number; // 1-5
  energyScore: number; // 1-5
  notes?: string;
};

export type AgentType = 
  | "PlannerAgent" 
  | "SleepAgent" 
  | "FitnessCoachAgent" 
  | "BurnoutGuardianAgent"
  | "PredictiveAnalyticsAgent"
  | "ContextAwarenessAgent"
  | "BreathingCoachAgent"
  | "SleepEnvironmentAgent"
  | "RecoveryPredictionAgent"
  | "InjuryRiskAgent";

export type AgentRecommendation = {
  id: string;
  createdAt: string;
  agent: AgentType;
  type: "sleep" | "training" | "stress" | "nutrition" | "break" | "alert" | "simulation";
  title: string;
  rationale: string;
  priority: "low" | "medium" | "high";
  actions?: { label: string; kind: "accept" | "snooze" | "reject" }[];
};

export type Feedback = {
  recId: string;
  userResponse: "accepted" | "snoozed" | "rejected";
  timestamp: string;
};

export type Baseline = {
  hrv: number;
  restingHr: number;
  sleepHours: number;
  sleepEfficiency: number;
  stressScore: number;
};

export type ReadinessScore = {
  score: number; // 0-100
  explanation: string[];
};

export type BurnoutRisk = {
  level: "Green" | "Yellow" | "Red";
  rationale: string[];
  actions: string[];
};

export type DailyPlan = {
  date: string;
  priorities: string[];
  trainingIntensity: "Rest" | "Light" | "Moderate" | "HIIT" | "Strength";
  microInterventions: string[];
  sleepAdvice: string;
};

export type Anomaly = {
  metric: string;
  deviation: string;
  cause: string;
  suggestion: string;
};

export type CheckIn = {
  date: string;
  mood: number; // 1-5
  energy: number; // 1-5
  note?: string;
  journalAnswers?: {
    drained: string;
    helped: string;
    overload: number; // 1-5
  };
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  icon: string;
};

export type WhatIfOption = {
  label: string;
  type: "zone2" | "hiit" | "strength" | "rest" | "sleep_extra" | "skip_workout";
  impact: {
    readiness: number; // delta
    sleep: number; // delta
    recovery: number; // delta
  };
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO datetime
  end?: string; // ISO datetime
  description?: string;
  location?: string;
  allDay?: boolean;
};

export type BurnoutPrediction = {
  date: string; // YYYY-MM-DD
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  probability: number; // 0-100
  factors: string[];
  preventiveActions: string[];
};

export type ContextData = {
  weather?: {
    temp: number;
    condition: string;
    humidity: number;
  };
  location?: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  season: string;
};

export type SleepEnvironment = {
  date: string;
  temperature: number; // celsius
  humidity: number; // percentage
  noise: number; // 0-100
  light: number; // 0-100 (lux equivalent)
  airQuality: number; // 0-100
};

export type RecoveryPrediction = {
  date: string;
  fullRecoveryDate: string;
  currentRecoveryPercent: number; // 0-100
  factors: string[];
  deloadWeekRecommended: boolean;
};

export type BiomarkerTrend = {
  metric: string;
  trend: "improving" | "stable" | "declining";
  story: string;
  startDate: string;
  endDate: string;
  recommendation: string;
};

export type Integration = {
  id: string;
  name: string;
  type: "calendar" | "task" | "music" | "food" | "wearable";
  connected: boolean;
  lastSync?: string;
  config?: any;
};

export type Streak = {
  type: "sleep" | "workout" | "checkin" | "recovery";
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
};

export type WearableData = {
  timestamp: string;
  hrv: number;
  heartRate: number;
  isLive: boolean;
};

export type InjuryRisk = {
  level: "Low" | "Medium" | "High" | "Critical";
  score: number; // 0-100
  factors: string[];
  preventiveActions: string[];
  affectedAreas: string[];
};

export type SmartNotification = {
  id: string;
  type: "reminder" | "alert" | "tip" | "achievement";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  scheduledFor: string;
  delivered: boolean;
  context?: ContextData;
};
