import { UserProfile, DailyMetrics, AgentRecommendation, Feedback, CheckIn, Achievement } from "@/types";
import { generateMockMetrics, getDefaultProfile } from "./mockData";

const STORAGE_KEYS = {
  PROFILE: "fittwin_profile",
  METRICS: "fittwin_metrics",
  RECOMMENDATIONS: "fittwin_recommendations",
  FEEDBACK: "fittwin_feedback",
  CHECKINS: "fittwin_checkins",
  ACHIEVEMENTS: "fittwin_achievements",
};

// Profile
export function saveProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadProfile(): UserProfile {
  const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return stored ? JSON.parse(stored) : getDefaultProfile();
}

// Metrics
export function saveMetrics(metrics: DailyMetrics[]) {
  localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
}

export function loadMetrics(): DailyMetrics[] {
  const stored = localStorage.getItem(STORAGE_KEYS.METRICS);
  if (!stored) {
    // Generate initial mock data
    const mockData = generateMockMetrics(30);
    saveMetrics(mockData);
    return mockData;
  }
  return JSON.parse(stored);
}

export function addMetric(metric: DailyMetrics) {
  const metrics = loadMetrics();
  const existing = metrics.findIndex((m) => m.date === metric.date);
  if (existing >= 0) {
    metrics[existing] = metric;
  } else {
    metrics.push(metric);
  }
  metrics.sort((a, b) => a.date.localeCompare(b.date));
  saveMetrics(metrics);
}

// Recommendations
export function saveRecommendations(recs: AgentRecommendation[]) {
  localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(recs));
}

export function loadRecommendations(): AgentRecommendation[] {
  const stored = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
  return stored ? JSON.parse(stored) : [];
}

export function addRecommendation(rec: AgentRecommendation) {
  const recs = loadRecommendations();
  recs.push(rec);
  saveRecommendations(recs);
}

// Feedback
export function saveFeedback(feedback: Feedback[]) {
  localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedback));
}

export function loadFeedback(): Feedback[] {
  const stored = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
  return stored ? JSON.parse(stored) : [];
}

export function addFeedback(feedback: Feedback) {
  const feedbacks = loadFeedback();
  feedbacks.push(feedback);
  saveFeedback(feedbacks);
}

// Check-ins
export function saveCheckIns(checkIns: CheckIn[]) {
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns));
}

export function loadCheckIns(): CheckIn[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CHECKINS);
  return stored ? JSON.parse(stored) : [];
}

export function addCheckIn(checkIn: CheckIn) {
  const checkIns = loadCheckIns();
  const existing = checkIns.findIndex((c) => c.date === checkIn.date);
  if (existing >= 0) {
    checkIns[existing] = checkIn;
  } else {
    checkIns.push(checkIn);
  }
  saveCheckIns(checkIns);
}

// Achievements
export function saveAchievements(achievements: Achievement[]) {
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
}

export function loadAchievements(): Achievement[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  return stored ? JSON.parse(stored) : [];
}

export function addAchievement(achievement: Achievement) {
  const achievements = loadAchievements();
  if (!achievements.find((a) => a.id === achievement.id)) {
    achievements.push(achievement);
    saveAchievements(achievements);
  }
}
