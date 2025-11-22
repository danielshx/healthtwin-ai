import { UserProfile, DailyMetrics, AgentRecommendation, Feedback, CheckIn, Achievement, CalendarEvent } from "@/types";
import { CoachPersonality } from "@/types/coach";
import { generateMockMetrics, getDefaultProfile, generateMockCalendar } from "./mockData";

const STORAGE_KEYS = {
  PROFILE: "healthtwin_profile",
  METRICS: "healthtwin_metrics",
  RECOMMENDATIONS: "healthtwin_recommendations",
  FEEDBACK: "healthtwin_feedback",
  CHECKINS: "healthtwin_checkins",
  ACHIEVEMENTS: "healthtwin_achievements",
  COACH: "healthtwin_coach",
  CALENDAR: "healthtwin_calendar",
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

// Coach Selection
export function saveCoach(coachId: CoachPersonality) {
  localStorage.setItem(STORAGE_KEYS.COACH, coachId);
}

export function loadCoach(): CoachPersonality {
  const stored = localStorage.getItem(STORAGE_KEYS.COACH);
  return (stored as CoachPersonality) || "buddy";
}

// Calendar Events
export function saveCalendarEvents(events: CalendarEvent[]) {
  localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
}

export function loadCalendarEvents(): CalendarEvent[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CALENDAR);
  if (!stored) {
    // Generate and save mock calendar on first load
    const mockCalendar = generateMockCalendar();
    saveCalendarEvents(mockCalendar);
    return mockCalendar;
  }
  return JSON.parse(stored);
}

// Breathing Sessions
const BREATHING_SESSIONS_KEY = "healthtwin_breathing_sessions";

export interface BreathingSession {
  id: string;
  type: "coherent" | "box" | "478";
  duration: number; // in seconds
  completedAt: string;
  cyclesCompleted: number;
}

export function loadBreathingSessions(): BreathingSession[] {
  const stored = localStorage.getItem(BREATHING_SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveBreathingSession(session: BreathingSession) {
  const sessions = loadBreathingSessions();
  sessions.push(session);
  localStorage.setItem(BREATHING_SESSIONS_KEY, JSON.stringify(sessions));
}

export function getTodayBreathingSessions(): BreathingSession[] {
  const sessions = loadBreathingSessions();
  const today = new Date().toDateString();
  return sessions.filter(s => new Date(s.completedAt).toDateString() === today);
}

// Baseline calculation helper
export function loadBaseline(metrics: DailyMetrics[]): any {
  const { computeBaseline } = require("./agentLoop");
  return computeBaseline(metrics);
}
