import { AIAgent, AgentContext } from "./types";
import { AgentRecommendation } from "@/types";
import { computeReadiness } from "@/lib/metrics";

/**
 * NutritionAgent - Provides personalized nutrition recommendations
 * based on training load, recovery status, and user goals
 */
export class NutritionAgent implements AIAgent {
  id = "nutrition";
  name = "Nutrition Coach";
  description = "Provides personalized meal recommendations based on your activity and recovery needs";

  analyze(context: AgentContext): AgentRecommendation[] {
    const { profile, today, last7Days, baseline } = context;
    const recommendations: AgentRecommendation[] = [];
    const readiness = computeReadiness(today, baseline, last7Days);

    // Calculate nutrition needs based on activity
    const baseCalories = this.calculateCalorieNeeds(profile, today);
    const proteinNeeds = this.calculateProteinNeeds(profile, today);

    // High training load - need more fuel
    if (today.trainingLoad > 70) {
      recommendations.push({
        id: "nutrition-high-load",
        createdAt: new Date().toISOString(),
        agent: "NutritionAgent",
        type: "nutrition",
        title: "Increase Carb Intake",
        rationale: `Your training load is ${today.trainingLoad.toFixed(0)}. Focus on complex carbs for energy and recovery.`,
        priority: "high",
        actions: [
          { label: "View Meals", kind: "accept" },
          { label: "Later", kind: "snooze" }
        ]
      });
    }

    // Low energy - nutrition support
    if (today.energyScore <= 2) {
      recommendations.push({
        id: "nutrition-low-energy",
        createdAt: new Date().toISOString(),
        agent: "NutritionAgent",
        type: "nutrition",
        title: "Energy-Boosting Meals",
        rationale: "Your energy is low. Focus on nutrient-dense, balanced meals with steady energy release.",
        priority: "medium",
        actions: [
          { label: "See Recipes", kind: "accept" },
          { label: "Dismiss", kind: "reject" }
        ]
      });
    }

    // Recovery day - anti-inflammatory foods
    if (readiness.score < 60 || today.stressScore > 70) {
      recommendations.push({
        id: "nutrition-recovery",
        createdAt: new Date().toISOString(),
        agent: "NutritionAgent",
        type: "nutrition",
        title: "Recovery-Focused Nutrition",
        rationale: "Your body needs recovery. Focus on anti-inflammatory foods rich in omega-3s and antioxidants.",
        priority: "medium",
        actions: [
          { label: "View Foods", kind: "accept" },
          { label: "Skip", kind: "snooze" }
        ]
      });
    }

    // Hydration reminder
    const avgSteps = last7Days.reduce((sum, d) => sum + d.steps, 0) / last7Days.length;
    if (today.steps > avgSteps * 1.2 || today.workoutMinutes > 45) {
      recommendations.push({
        id: "nutrition-hydration",
        createdAt: new Date().toISOString(),
        agent: "NutritionAgent",
        type: "nutrition",
        title: "Stay Hydrated",
        rationale: `High activity today (${today.steps} steps, ${today.workoutMinutes}min workout). Aim for extra water.`,
        priority: "medium"
      });
    }

    // Muscle building support
    if (profile.goal === "build_muscle" && today.workoutMinutes > 30) {
      recommendations.push({
        id: "nutrition-muscle-building",
        createdAt: new Date().toISOString(),
        agent: "NutritionAgent",
        type: "nutrition",
        title: "Post-Workout Protein",
        rationale: `Target ${proteinNeeds}g protein today to support muscle recovery and growth.`,
        priority: "high",
        actions: [
          { label: "View Options", kind: "accept" },
          { label: "Later", kind: "snooze" }
        ]
      });
    }

    return recommendations;
  }

  private calculateCalorieNeeds(profile: any, today: any): number {
    // Simple BMR estimation (Harris-Benedict)
    const age = profile.age || 25;
    const bmr = 1800; // Simplified base
    
    // Activity multiplier
    const activityMultiplier = 1.2 + (today.steps / 10000) * 0.3 + (today.workoutMinutes / 60) * 0.2;
    
    return Math.round(bmr * activityMultiplier);
  }

  private calculateProteinNeeds(profile: any, today: any): number {
    // Base protein needs: 1.6-2.2g per kg body weight for athletes
    const baseProtein = 140; // Assuming 70kg person
    
    if (profile.goal === "build_muscle") {
      return Math.round(baseProtein * 1.3);
    }
    if (profile.goal === "lose_fat") {
      return Math.round(baseProtein * 1.2);
    }
    return baseProtein;
  }
}
