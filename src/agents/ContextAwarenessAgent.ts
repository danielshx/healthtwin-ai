import { AIAgent, AgentContext } from "./types";
import { AgentRecommendation, ContextData } from "@/types";

export class ContextAwarenessAgent implements AIAgent {
  id = "context_awareness";
  name = "Context Awareness Agent";
  description = "Adjusts recommendations based on weather, location, and time of day";

  analyze(context: AgentContext): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];
    const currentContext = this.getCurrentContext();
    
    // Weather-based recommendations
    if (currentContext.weather) {
      if (currentContext.weather.temp < 5) {
        recommendations.push({
          id: `ctx_cold_${Date.now()}`,
          createdAt: new Date().toISOString(),
          agent: "ContextAwarenessAgent",
          type: "training",
          title: "🥶 Cold Weather Advisory",
          rationale: `It's ${currentContext.weather.temp}°C outside. Indoor training or proper warm-up recommended to prevent injury.`,
          priority: "medium",
        });
      } else if (currentContext.weather.temp > 28) {
        recommendations.push({
          id: `ctx_hot_${Date.now()}`,
          createdAt: new Date().toISOString(),
          agent: "ContextAwarenessAgent",
          type: "training",
          title: "☀️ Hot Weather Advisory",
          rationale: `It's ${currentContext.weather.temp}°C outside. Stay hydrated and consider training during cooler hours.`,
          priority: "medium",
        });
      }

      if (currentContext.weather.condition === "rainy" && context.today.workoutMinutes === 0) {
        recommendations.push({
          id: `ctx_rainy_${Date.now()}`,
          createdAt: new Date().toISOString(),
          agent: "ContextAwarenessAgent",
          type: "training",
          title: "🌧️ Rainy Day Indoor Workout",
          rationale: "It's raining outside. Perfect day for an indoor strength session or yoga practice.",
          priority: "low",
        });
      }
    }

    // Time-based recommendations
    if (currentContext.timeOfDay === "evening" && context.today.stressScore > 70) {
      recommendations.push({
        id: `ctx_evening_stress_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "ContextAwarenessAgent",
        type: "stress",
        title: "🌙 Evening Wind-Down Needed",
        rationale: "High stress detected this evening. Consider a gentle stretching routine or meditation before bed.",
        priority: "medium",
      });
    }

    if (currentContext.timeOfDay === "morning" && context.today.sleepHours < 6) {
      recommendations.push({
        id: `ctx_morning_tired_${Date.now()}`,
        createdAt: new Date().toISOString(),
        agent: "ContextAwarenessAgent",
        type: "sleep",
        title: "☕ Low Energy Morning",
        rationale: "You slept less than 6 hours. Skip intense morning workouts today and focus on recovery.",
        priority: "high",
      });
    }

    return recommendations;
  }

  getCurrentContext(): ContextData {
    const hour = new Date().getHours();
    let timeOfDay: ContextData["timeOfDay"];
    
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else timeOfDay = "night";

    const month = new Date().getMonth();
    let season: string;
    if (month >= 2 && month <= 4) season = "Spring";
    else if (month >= 5 && month <= 7) season = "Summer";
    else if (month >= 8 && month <= 10) season = "Autumn";
    else season = "Winter";

    // Simulate weather (in production, this would call a weather API)
    const weather = {
      temp: Math.floor(Math.random() * 30) + 5, // 5-35°C
      condition: ["sunny", "cloudy", "rainy", "windy"][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
    };

    return {
      weather,
      timeOfDay,
      season,
      location: "Local", // Would use geolocation in production
    };
  }
}
