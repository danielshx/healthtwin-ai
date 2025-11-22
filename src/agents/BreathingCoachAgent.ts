import { AIAgent, AgentContext } from "./types";
import { AgentRecommendation } from "@/types";

export class BreathingCoachAgent implements AIAgent {
  id = "breathing_coach";
  name = "Breathing Coach Agent";
  description = "Provides HRV-guided breathing exercises and stress interventions";

  analyze(context: AgentContext): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];
    const { today, baseline } = context;

    // HRV-based breathing recommendation
    const hrvDrop = ((baseline.hrv - today.hrv) / baseline.hrv) * 100;
    
    if (hrvDrop > 15) {
      recommendations.push({
        id: `breathing_hrv_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "BreathingCoachAgent",
        type: "stress",
        title: "🫁 HRV Recovery Breathing",
        rationale: `Your HRV is ${hrvDrop.toFixed(0)}% below baseline. A 5-minute coherent breathing session can help restore balance.`,
        priority: "high",
        actions: [
          { label: "Start Session", kind: "accept" },
          { label: "Later", kind: "snooze" },
        ],
      });
    }

    // Stress spike intervention
    if (today.stressScore > 75) {
      recommendations.push({
        id: `breathing_stress_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "BreathingCoachAgent",
        type: "stress",
        title: "😤 Stress Relief Breathing",
        rationale: `High stress detected (${today.stressScore}/100). Box breathing can help you regain calm in 3 minutes.`,
        priority: "high",
        actions: [
          { label: "Start Now", kind: "accept" },
          { label: "Not Now", kind: "reject" },
        ],
      });
    }

    // Pre-sleep breathing recommendation
    const hour = new Date().getHours();
    if (hour >= 21 && today.sleepEfficiency < 85) {
      recommendations.push({
        id: `breathing_sleep_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "BreathingCoachAgent",
        type: "sleep",
        title: "🌙 Sleep Preparation Breathing",
        rationale: "Evening breathing exercise can improve sleep quality. Try 4-7-8 breathing before bed.",
        priority: "medium",
        actions: [
          { label: "Start Session", kind: "accept" },
        ],
      });
    }

    return recommendations;
  }
}
