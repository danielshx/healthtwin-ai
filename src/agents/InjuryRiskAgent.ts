import { AIAgent, AgentContext } from "./types";
import { AgentRecommendation, InjuryRisk } from "@/types";

export class InjuryRiskAgent implements AIAgent {
  id = "injury_risk";
  name = "Injury Risk Agent";
  description = "Detects overtraining patterns and predicts injury risk";

  analyze(context: AgentContext): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];
    const risk = this.assessInjuryRisk(context);

    if (risk.level === "High" || risk.level === "Critical") {
      recommendations.push({
        id: `injury_risk_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "InjuryRiskAgent",
        type: "alert",
        title: `🚨 ${risk.level} Injury Risk Detected`,
        rationale: `Risk score: ${risk.score}/100. Key factors: ${risk.factors.join(", ")}. Affected areas: ${risk.affectedAreas.join(", ")}`,
        priority: risk.level === "Critical" ? "high" : "medium",
        actions: [
          { label: "View Prevention Plan", kind: "accept" },
          { label: "Acknowledge", kind: "snooze" },
        ],
      });
    }

    // Progressive overload warning
    const { last7Days } = context;
    const trainingIncrease = this.calculateTrainingIncrease(last7Days);
    
    if (trainingIncrease > 20) {
      recommendations.push({
        id: `injury_overload_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "InjuryRiskAgent",
        type: "training",
        title: "⚠️ Training Load Spike Detected",
        rationale: `Your training volume increased by ${trainingIncrease}% this week. The 10% rule suggests limiting increases to reduce injury risk.`,
        priority: "high",
      });
    }

    return recommendations;
  }

  assessInjuryRisk(context: AgentContext): InjuryRisk {
    const { today, last7Days, baseline } = context;
    
    let riskScore = 0;
    const factors: string[] = [];
    const preventiveActions: string[] = [];
    const affectedAreas: string[] = [];

    // High training load
    if (today.trainingLoad > 80) {
      riskScore += 25;
      factors.push("Very high training load");
      preventiveActions.push("Reduce training volume by 30%");
    }

    // Poor recovery indicators
    const hrvDrop = ((baseline.hrv - today.hrv) / baseline.hrv) * 100;
    if (hrvDrop > 20) {
      riskScore += 20;
      factors.push("Significant HRV decline");
      preventiveActions.push("Take 2-3 rest days");
    }

    // Sleep deprivation
    if (today.sleepHours < 6) {
      riskScore += 15;
      factors.push("Insufficient sleep");
      preventiveActions.push("Prioritize 8+ hours sleep");
    }

    // Elevated resting heart rate
    const hrIncrease = ((today.restingHr - baseline.restingHr) / baseline.restingHr) * 100;
    if (hrIncrease > 10) {
      riskScore += 15;
      factors.push("Elevated resting heart rate");
      preventiveActions.push("Focus on active recovery");
    }

    // High stress
    if (today.stressScore > 75) {
      riskScore += 15;
      factors.push("High stress levels");
      preventiveActions.push("Include stress management techniques");
    }

    // Consecutive high-intensity days
    const recentIntensity = last7Days.slice(-3).filter(m => m.trainingLoad > 70).length;
    if (recentIntensity >= 3) {
      riskScore += 10;
      factors.push("Consecutive high-intensity sessions");
      preventiveActions.push("Add recovery days between hard sessions");
      affectedAreas.push("Joints", "Tendons");
    }

    // Determine most likely affected areas based on training load
    if (today.trainingLoad > 75) {
      affectedAreas.push("Lower body", "Connective tissue");
    }

    let level: InjuryRisk["level"] = "Low";
    if (riskScore >= 70) level = "Critical";
    else if (riskScore >= 50) level = "High";
    else if (riskScore >= 30) level = "Medium";

    return {
      level,
      score: Math.min(riskScore, 100),
      factors,
      preventiveActions,
      affectedAreas: affectedAreas.length > 0 ? affectedAreas : ["General"],
    };
  }

  private calculateTrainingIncrease(last7Days: any[]): number {
    if (last7Days.length < 14) return 0;
    
    const thisWeek = last7Days.slice(-7).reduce((sum, m) => sum + m.workoutMinutes, 0);
    const lastWeek = last7Days.slice(-14, -7).reduce((sum, m) => sum + m.workoutMinutes, 0);
    
    if (lastWeek === 0) return 0;
    return Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  }
}
