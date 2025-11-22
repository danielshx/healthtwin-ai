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
        title: "5min HRV Kohärenz-Atmung",
        rationale: `Dein HRV ist ${hrvDrop.toFixed(0)}% unter Baseline. Kohärente Atmung (5 Sek. ein, 5 Sek. aus) aktiviert deinen Parasympathikus.`,
        priority: "high",
        actions: [
          { label: "Jetzt starten", kind: "accept" },
          { label: "Später", kind: "snooze" },
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
        title: "3min Box Breathing",
        rationale: `Hoher Stress erkannt (${today.stressScore}/100). Box Breathing (4-4-4-4) senkt Cortisol und beruhigt das Nervensystem.`,
        priority: "high",
        actions: [
          { label: "Jetzt starten", kind: "accept" },
          { label: "Nicht jetzt", kind: "reject" },
        ],
      });
    } else if (today.stressScore > 50) {
      recommendations.push({
        id: `breathing_moderate_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "BreathingCoachAgent",
        type: "stress",
        title: "10min Atemmeditation",
        rationale: "Moderater Stress. Eine kurze Atemmeditation hilft dir, fokussiert und ruhig zu bleiben.",
        priority: "medium",
        actions: [
          { label: "In Kalender eintragen", kind: "accept" },
          { label: "Überspringen", kind: "reject" },
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
        title: "8min 4-7-8 Einschlaf-Atmung",
        rationale: "Abendliche Atemübung verbessert Einschlafzeit. 4-7-8 Atmung aktiviert Entspannungsreaktion.",
        priority: "medium",
        actions: [
          { label: "Vor dem Schlafengehen", kind: "accept" },
        ],
      });
    }

    // Morning energy breathing
    if (hour >= 6 && hour < 10 && today.energyScore < 3) {
      recommendations.push({
        id: `breathing_morning_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "BreathingCoachAgent",
        type: "training",
        title: "5min Wim Hof Atmung",
        rationale: "Niedrige Morgen-Energie. Wim Hof Atmung steigert Sauerstoffversorgung und Wachheit.",
        priority: "medium",
        actions: [
          { label: "In Kalender eintragen", kind: "accept" },
          { label: "Überspringen", kind: "reject" },
        ],
      });
    }

    return recommendations;
  }
}
