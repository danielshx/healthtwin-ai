import { AIAgent, AgentContext } from "./types";
import { AgentRecommendation, BurnoutPrediction } from "@/types";

export class PredictiveAnalyticsAgent implements AIAgent {
  id = "predictive_analytics";
  name = "Predictive Analytics Agent";
  description = "Predicts burnout risk and optimal training windows 3-7 days ahead";

  analyze(context: AgentContext): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];
    const predictions = this.predictBurnout(context);
    
    // Generate recommendations based on predictions
    const highRiskDays = predictions.filter(p => p.riskLevel === "High" || p.riskLevel === "Critical");
    
    if (highRiskDays.length > 0) {
      const nearestRisk = highRiskDays[0];
      recommendations.push({
        id: `pred_burnout_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "PredictiveAnalyticsAgent",
        type: "alert",
        title: `⚠️ Burnout Risk Predicted for ${nearestRisk.date}`,
        rationale: `Based on current trends, we predict ${nearestRisk.riskLevel.toLowerCase()} burnout risk in ${this.getDaysUntil(nearestRisk.date)} days. Key factors: ${nearestRisk.factors.join(", ")}`,
        priority: nearestRisk.riskLevel === "Critical" ? "high" : "medium",
        actions: [
          { label: "View Prevention Plan", kind: "accept" },
          { label: "Remind Me Later", kind: "snooze" },
        ],
      });
    }

    // Predict optimal training windows
    const optimalDays = this.predictOptimalTrainingDays(context);
    if (optimalDays.length > 0) {
      recommendations.push({
        id: `pred_training_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "PredictiveAnalyticsAgent",
        type: "training",
        title: "🎯 Optimal Training Windows Ahead",
        rationale: `Based on recovery predictions: ${optimalDays.join(", ")} are ideal for high-intensity training.`,
        priority: "low",
      });
    }

    return recommendations;
  }

  predictBurnout(context: AgentContext): BurnoutPrediction[] {
    const predictions: BurnoutPrediction[] = [];
    const { last7Days, baseline } = context;

    // Calculate trend indicators
    const recentHRV = last7Days.slice(-3).reduce((sum, m) => sum + m.hrv, 0) / 3;
    const hrvTrend = (recentHRV / baseline.hrv - 1) * 100;
    
    const recentStress = last7Days.slice(-3).reduce((sum, m) => sum + m.stressScore, 0) / 3;
    const stressTrend = (recentStress / baseline.stressScore - 1) * 100;

    const recentSleep = last7Days.slice(-3).reduce((sum, m) => sum + m.sleepHours, 0) / 3;
    const sleepTrend = (recentSleep / baseline.sleepHours - 1) * 100;

    // Predict for next 7 days
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const dateStr = futureDate.toISOString().split("T")[0];

      let riskScore = 0;
      const factors: string[] = [];
      const preventiveActions: string[] = [];

      // HRV declining trend
      if (hrvTrend < -10) {
        riskScore += 30;
        factors.push("HRV declining");
        preventiveActions.push("Prioritize rest days");
      }

      // High stress trend
      if (stressTrend > 15) {
        riskScore += 25;
        factors.push("Elevated stress");
        preventiveActions.push("Schedule stress-relief activities");
      }

      // Sleep debt accumulation
      if (sleepTrend < -10) {
        riskScore += 25;
        factors.push("Sleep debt building");
        preventiveActions.push("Aim for 8+ hours tonight");
      }

      // Training load
      const avgLoad = last7Days.reduce((sum, m) => sum + m.trainingLoad, 0) / 7;
      if (avgLoad > 75) {
        riskScore += 20;
        factors.push("High training load");
        preventiveActions.push("Consider deload week");
      }

      let riskLevel: BurnoutPrediction["riskLevel"] = "Low";
      if (riskScore >= 70) riskLevel = "Critical";
      else if (riskScore >= 50) riskLevel = "High";
      else if (riskScore >= 30) riskLevel = "Medium";

      predictions.push({
        date: dateStr,
        riskLevel,
        probability: Math.min(riskScore, 95),
        factors,
        preventiveActions,
      });
    }

    return predictions;
  }

  predictOptimalTrainingDays(context: AgentContext): string[] {
    const predictions = this.predictBurnout(context);
    return predictions
      .filter(p => p.riskLevel === "Low" && p.probability < 20)
      .slice(0, 3)
      .map(p => {
        const date = new Date(p.date);
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      });
  }

  private getDaysUntil(dateStr: string): number {
    const target = new Date(dateStr);
    const today = new Date();
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
