import { AIAgent, AgentContext } from "./types";
import { AgentRecommendation } from "@/types";

export class SleepEnvironmentAgent implements AIAgent {
  id = "sleep_environment";
  name = "Sleep Environment Agent";
  description = "Tracks and optimizes bedroom conditions for better sleep quality";

  analyze(context: AgentContext): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];
    const { today, last7Days } = context;

    // Check if sleep quality is consistently poor
    const avgSleepEfficiency = last7Days.reduce((sum, m) => sum + m.sleepEfficiency, 0) / 7;
    
    if (avgSleepEfficiency < 80 && today.sleepEfficiency < 75) {
      recommendations.push({
        id: `sleep_env_quality_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "SleepEnvironmentAgent",
        type: "sleep",
        title: "🛏️ Sleep Environment Check",
        rationale: `Your sleep efficiency has been below 80% for the past week. Environmental factors like temperature, noise, or light may be affecting your rest.`,
        priority: "medium",
        actions: [
          { label: "Review Environment", kind: "accept" },
          { label: "Dismiss", kind: "reject" },
        ],
      });
    }

    // Evening environment optimization reminder
    const hour = new Date().getHours();
    if (hour >= 20 && hour <= 22) {
      recommendations.push({
        id: `sleep_env_evening_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "SleepEnvironmentAgent",
        type: "sleep",
        title: "🌡️ Optimize Bedroom Environment",
        rationale: "Time to prepare your sleep environment: cool temperature (16-19°C), minimal light, and quiet setting for optimal rest.",
        priority: "low",
      });
    }

    return recommendations;
  }
}
