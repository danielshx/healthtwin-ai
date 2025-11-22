import { AIAgent, AgentContext } from "./types";
import { AgentRecommendation } from "@/types";
import { computeReadiness, computeBurnoutRisk } from "@/lib/metrics";

export class FitnessCoachAgent implements AIAgent {
  id = "fitness-coach";
  name = "FitnessCoachAgent";
  description = "Provides training recommendations based on readiness and recovery status";

  analyze(context: AgentContext): AgentRecommendation[] {
    const { profile, today, last7Days, baseline } = context;
    const recommendations: AgentRecommendation[] = [];

    const readiness = computeReadiness(today, baseline, last7Days);
    const burnout = computeBurnoutRisk(last7Days, baseline);

    // Determine training recommendation
    if (burnout.level === "Red" || readiness.score < 40) {
      recommendations.push({
        id: `fitness-recovery-${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "FitnessCoachAgent",
        type: "training",
        title: "30min Regenerations-Spaziergang",
        rationale: "Dein Körper braucht Erholung. Ein leichter Spaziergang fördert die Durchblutung ohne zusätzlichen Stress.",
        priority: "high",
        actions: [
          { label: "In Kalender eintragen", kind: "accept" },
          { label: "Später", kind: "snooze" },
        ],
      });
      
      recommendations.push({
        id: `fitness-stretch-${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "FitnessCoachAgent",
        type: "training",
        title: "15min Mobility & Stretching",
        rationale: "Sanfte Dehnübungen unterstützen deine Regeneration und verbessern die Beweglichkeit.",
        priority: "medium",
        actions: [
          { label: "In Kalender eintragen", kind: "accept" },
          { label: "Überspringen", kind: "reject" },
        ],
      });
    } else if (readiness.score >= 80 && today.trainingLoad < 60) {
      const workoutType = Math.random() > 0.5 
        ? { title: "45min HIIT Training", desc: "Hochintensives Intervalltraining für maximale Fitness" }
        : { title: "60min Krafttraining", desc: "Fokus auf Muskelaufbau und Kraftsteigerung" };
      
      recommendations.push({
        id: `fitness-high-${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "FitnessCoachAgent",
        type: "training",
        title: workoutType.title,
        rationale: `Du bist top-erholt (${readiness.score}% Readiness). ${workoutType.desc}.`,
        priority: "high",
        actions: [
          { label: "In Kalender eintragen", kind: "accept" },
          { label: "Später", kind: "snooze" },
        ],
      });
    } else if (readiness.score >= 60) {
      recommendations.push({
        id: `fitness-moderate-${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "FitnessCoachAgent",
        type: "training",
        title: "30min Moderates Cardio",
        rationale: "Gute Readiness für eine moderate Session. Joggen, Radfahren oder Schwimmen ideal.",
        priority: "medium",
        actions: [
          { label: "In Kalender eintragen", kind: "accept" },
          { label: "Später", kind: "snooze" },
        ],
      });
    }

    return recommendations;
  }
}
