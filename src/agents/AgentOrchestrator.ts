import { AIAgent, AgentContext, AgentConfig } from "./types";
import { AgentRecommendation } from "@/types";
import { PlannerAgent } from "./PlannerAgent";
import { SleepAgent } from "./SleepAgent";
import { FitnessCoachAgent } from "./FitnessCoachAgent";
import { BurnoutGuardianAgent } from "./BurnoutGuardianAgent";
import { PredictiveAnalyticsAgent } from "./PredictiveAnalyticsAgent";
import { ContextAwarenessAgent } from "./ContextAwarenessAgent";
import { BreathingCoachAgent } from "./BreathingCoachAgent";
import { SleepEnvironmentAgent } from "./SleepEnvironmentAgent";
import { RecoveryPredictionAgent } from "./RecoveryPredictionAgent";
import { InjuryRiskAgent } from "./InjuryRiskAgent";

/**
 * Central orchestrator that manages all AI agents
 * Makes it easy to add/remove agents dynamically
 */
export class AgentOrchestrator {
  private agents: AIAgent[] = [];
  private config: AgentConfig;

  constructor(config: AgentConfig = {}) {
    this.config = {
      analysisInterval: 60000, // 1 minute default
      enableProactiveMonitoring: true,
      alertThresholds: {
        hrvDropPercent: 15,
        hrIncreasePercent: 10,
        minSleepHours: 6,
        maxStressScore: 70,
      },
      ...config,
    };

    // Register default agents
    this.registerDefaultAgents();
  }

  /**
   * Register the built-in agents
   */
  private registerDefaultAgents() {
    this.registerAgent(new PlannerAgent());
    this.registerAgent(new SleepAgent());
    this.registerAgent(new FitnessCoachAgent());
    this.registerAgent(new BurnoutGuardianAgent());
    this.registerAgent(new PredictiveAnalyticsAgent());
    this.registerAgent(new ContextAwarenessAgent());
    this.registerAgent(new BreathingCoachAgent());
    this.registerAgent(new SleepEnvironmentAgent());
    this.registerAgent(new RecoveryPredictionAgent());
    this.registerAgent(new InjuryRiskAgent());
  }

  /**
   * Register a new custom agent
   * @param agent - The agent to register
   */
  registerAgent(agent: AIAgent) {
    const existingIndex = this.agents.findIndex((a) => a.id === agent.id);
    if (existingIndex >= 0) {
      // Replace existing agent
      this.agents[existingIndex] = agent;
      console.log(`[AgentOrchestrator] Updated agent: ${agent.name}`);
    } else {
      // Add new agent
      this.agents.push(agent);
      console.log(`[AgentOrchestrator] Registered new agent: ${agent.name}`);
    }
  }

  /**
   * Unregister an agent by ID
   * @param agentId - ID of the agent to remove
   */
  unregisterAgent(agentId: string) {
    this.agents = this.agents.filter((a) => a.id !== agentId);
    console.log(`[AgentOrchestrator] Unregistered agent: ${agentId}`);
  }

  /**
   * Get all registered agents
   */
  getAgents(): AIAgent[] {
    return [...this.agents];
  }

  /**
   * Run all agents and collect their recommendations
   * @param context - The context data for analysis
   * @returns Combined recommendations from all agents
   */
  analyze(context: AgentContext): AgentRecommendation[] {
    console.log(`[AgentOrchestrator] Running analysis with ${this.agents.length} agents`);
    
    const allRecommendations: AgentRecommendation[] = [];

    for (const agent of this.agents) {
      try {
        const recommendations = agent.analyze(context);
        allRecommendations.push(...recommendations);
        console.log(`[AgentOrchestrator] ${agent.name} generated ${recommendations.length} recommendations`);
      } catch (error) {
        console.error(`[AgentOrchestrator] Error in ${agent.name}:`, error);
      }
    }

    return allRecommendations;
  }

  /**
   * Update orchestrator configuration
   */
  updateConfig(config: Partial<AgentConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }
}

/**
 * Singleton instance for global access
 */
let orchestratorInstance: AgentOrchestrator | null = null;

export function getAgentOrchestrator(config?: AgentConfig): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator(config);
  }
  return orchestratorInstance;
}
