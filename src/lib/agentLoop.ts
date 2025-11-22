import { DailyMetrics, UserProfile, Baseline, AgentRecommendation, DailyPlan } from "@/types";
import { getAgentOrchestrator } from "@/agents/AgentOrchestrator";
import { AgentContext } from "@/agents/types";
import { computeBaseline, computeReadiness, computeBurnoutRisk } from "@/lib/metrics";

// Re-export functions from metrics for backwards compatibility
export { 
  computeBaseline, 
  computeReadiness, 
  computeBurnoutRisk, 
  detectAnomalies, 
  simulateWhatIf 
} from "@/lib/metrics";

/**
 * Generate daily plan - extracted from PlannerAgent for backwards compatibility
 */
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
  const sleepDebt = baseline.sleepHours * 7 - last7Days.reduce((sum, m) => sum + m.sleepHours, 0);
  if (sleepDebt > 3) {
    sleepAdvice = `You have ${sleepDebt.toFixed(1)}hrs sleep debt. Aim for ${(baseline.sleepHours + 0.5).toFixed(1)}hrs tonight.`;
  } else {
    sleepAdvice = `Sleep debt minimal. Maintain ${baseline.sleepHours.toFixed(1)}hrs tonight.`;
  }

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

/**
 * Legacy function - now uses the new agent orchestrator
 * @deprecated Use AgentOrchestrator directly for better control
 */
export function generateRecommendations(
  profile: UserProfile,
  today: DailyMetrics,
  last7Days: DailyMetrics[],
  baseline: Baseline
): AgentRecommendation[] {
  const orchestrator = getAgentOrchestrator();
  
  const context: AgentContext = {
    profile,
    today,
    last7Days,
    baseline,
    allMetrics: last7Days,
  };

  return orchestrator.analyze(context);
}
