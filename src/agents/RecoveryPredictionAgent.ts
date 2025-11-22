import { AIAgent, AgentContext } from "./types";
import { AgentRecommendation, RecoveryPrediction } from "@/types";

export class RecoveryPredictionAgent implements AIAgent {
  id = "recovery_prediction";
  name = "Recovery Prediction Agent";
  description = "Forecasts full recovery times and recommends deload weeks";

  analyze(context: AgentContext): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];
    const prediction = this.predictRecovery(context);

    if (prediction.currentRecoveryPercent < 70) {
      const daysToRecovery = this.getDaysUntil(prediction.fullRecoveryDate);
      recommendations.push({
        id: `recovery_pred_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "RecoveryPredictionAgent",
        type: "training",
        title: "📊 Recovery Status Update",
        rationale: `Current recovery: ${prediction.currentRecoveryPercent}%. Full recovery predicted in ${daysToRecovery} days. Factors: ${prediction.factors.join(", ")}`,
        priority: prediction.currentRecoveryPercent < 50 ? "high" : "medium",
      });
    }

    if (prediction.deloadWeekRecommended) {
      recommendations.push({
        id: `recovery_deload_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "RecoveryPredictionAgent",
        type: "training",
        title: "⚠️ Deload Week Recommended",
        rationale: "Your training load and recovery metrics suggest scheduling a deload week to prevent overtraining and maximize long-term progress.",
        priority: "high",
        actions: [
          { label: "Schedule Deload", kind: "accept" },
          { label: "Remind Me", kind: "snooze" },
        ],
      });
    }

    return recommendations;
  }

  predictRecovery(context: AgentContext): RecoveryPrediction {
    const { today, last7Days, baseline } = context;
    
    // Calculate recovery factors
    const hrvRecovery = (today.hrv / baseline.hrv) * 100;
    const sleepRecovery = (today.sleepHours / baseline.sleepHours) * 100;
    const hrRecovery = (1 - (today.restingHr - baseline.restingHr) / baseline.restingHr) * 100;
    
    const currentRecoveryPercent = Math.min(
      100,
      Math.max(0, (hrvRecovery * 0.4 + sleepRecovery * 0.3 + hrRecovery * 0.3))
    );

    const factors: string[] = [];
    if (hrvRecovery < 90) factors.push("Low HRV");
    if (sleepRecovery < 90) factors.push("Sleep debt");
    if (today.trainingLoad > 70) factors.push("High training load");
    if (today.stressScore > 60) factors.push("Elevated stress");

    // Predict recovery timeline
    const recoveryRate = 10; // % per day (simplified)
    const daysToFullRecovery = Math.ceil((100 - currentRecoveryPercent) / recoveryRate);
    
    const fullRecoveryDate = new Date();
    fullRecoveryDate.setDate(fullRecoveryDate.getDate() + daysToFullRecovery);

    // Check if deload week is needed
    const avgLoad = last7Days.reduce((sum, m) => sum + m.trainingLoad, 0) / 7;
    const deloadWeekRecommended = avgLoad > 75 && currentRecoveryPercent < 65;

    return {
      date: new Date().toISOString().split("T")[0],
      fullRecoveryDate: fullRecoveryDate.toISOString().split("T")[0],
      currentRecoveryPercent: Math.round(currentRecoveryPercent),
      factors,
      deloadWeekRecommended,
    };
  }

  private getDaysUntil(dateStr: string): number {
    const target = new Date(dateStr);
    const today = new Date();
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
