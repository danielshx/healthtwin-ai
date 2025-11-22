import { DailyMetrics, Baseline } from "@/types";

export type AlertLevel = "none" | "warning" | "critical";

export type HealthAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  metrics: {
    hrv?: number;
    restingHr?: number;
    sleepHours?: number;
    stressScore?: number;
  };
  timestamp: string;
  requiresVoiceCall: boolean;
};

export type MonitoringState = {
  isMonitoring: boolean;
  lastCheck: string;
  alerts: HealthAlert[];
  callInitiated: boolean;
};

/**
 * Proaktiver Agent der kontinuierlich Gesundheitsmetriken überwacht
 * und autonom Interventionen initiiert
 */
export class ProactiveHealthAgent {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private state: MonitoringState = {
    isMonitoring: false,
    lastCheck: new Date().toISOString(),
    alerts: [],
    callInitiated: false,
  };

  constructor(
    private onAlert: (alert: HealthAlert) => void,
    private onCallRequired: () => void
  ) {}

  /**
   * Startet kontinuierliches Monitoring (alle 30 Sekunden)
   */
  startMonitoring(metrics: DailyMetrics[], baseline: Baseline) {
    if (this.state.isMonitoring) {
      console.log('[ProactiveAgent] Already monitoring');
      return;
    }

    console.log('[ProactiveAgent] Starting proactive monitoring...');
    this.state.isMonitoring = true;

    // Initial check
    this.checkHealthStatus(metrics, baseline);

    // Check every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkHealthStatus(metrics, baseline);
    }, 30000);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.state.isMonitoring = false;
    console.log('[ProactiveAgent] Monitoring stopped');
  }

  /**
   * Autonome Analyse der Gesundheitsdaten
   */
  private checkHealthStatus(metrics: DailyMetrics[], baseline: Baseline) {
    console.log('[ProactiveAgent] Running health check...');
    this.state.lastCheck = new Date().toISOString();

    const today = metrics[metrics.length - 1];
    const last3Days = metrics.slice(-3);
    const alerts: HealthAlert[] = [];

    // CRITICAL: HRV drastically below baseline
    const hrvDrop = ((baseline.hrv - today.hrv) / baseline.hrv) * 100;
    if (hrvDrop > 25) {
      alerts.push({
        id: `hrv-critical-${Date.now()}`,
        level: "critical",
        title: "Kritischer HRV-Abfall erkannt",
        message: `Dein HRV ist ${hrvDrop.toFixed(0)}% unter Baseline. Dein Körper zeigt starke Stressanzeichen!`,
        metrics: { hrv: today.hrv },
        timestamp: new Date().toISOString(),
        requiresVoiceCall: true,
      });
    } else if (hrvDrop > 15) {
      alerts.push({
        id: `hrv-warning-${Date.now()}`,
        level: "warning",
        title: "HRV unter Baseline",
        message: `Dein HRV ist ${hrvDrop.toFixed(0)}% niedriger als normal. Zeit für Erholung?`,
        metrics: { hrv: today.hrv },
        timestamp: new Date().toISOString(),
        requiresVoiceCall: false,
      });
    }

    // CRITICAL: Multiple nights of poor sleep
    const avgSleep = last3Days.reduce((sum, m) => sum + m.sleepHours, 0) / last3Days.length;
    if (avgSleep < 5.5) {
      alerts.push({
        id: `sleep-critical-${Date.now()}`,
        level: "critical",
        title: "Chronischer Schlafmangel",
        message: `Du schläfst im Schnitt nur ${avgSleep.toFixed(1)}h pro Nacht. Das ist gefährlich!`,
        metrics: { sleepHours: avgSleep },
        timestamp: new Date().toISOString(),
        requiresVoiceCall: true,
      });
    } else if (avgSleep < 6.5) {
      alerts.push({
        id: `sleep-warning-${Date.now()}`,
        level: "warning",
        title: "Unzureichender Schlaf",
        message: `${avgSleep.toFixed(1)}h Schlaf pro Nacht ist zu wenig für optimale Erholung.`,
        metrics: { sleepHours: avgSleep },
        timestamp: new Date().toISOString(),
        requiresVoiceCall: false,
      });
    }

    // CRITICAL: Elevated resting heart rate
    const hrIncrease = ((today.restingHr - baseline.restingHr) / baseline.restingHr) * 100;
    if (hrIncrease > 15) {
      alerts.push({
        id: `hr-critical-${Date.now()}`,
        level: "critical",
        title: "Erhöhte Ruheherzfrequenz",
        message: `Deine Ruheherzfrequenz ist ${hrIncrease.toFixed(0)}% über Baseline. Überlastung oder Krankheit?`,
        metrics: { restingHr: today.restingHr },
        timestamp: new Date().toISOString(),
        requiresVoiceCall: true,
      });
    }

    // CRITICAL: Sustained high stress
    const avgStress = last3Days.reduce((sum, m) => sum + m.stressScore, 0) / last3Days.length;
    if (avgStress > 75) {
      alerts.push({
        id: `stress-critical-${Date.now()}`,
        level: "critical",
        title: "Anhaltend hoher Stress",
        message: `Dein Stresslevel liegt seit Tagen über 75/100. Burnout-Gefahr!`,
        metrics: { stressScore: avgStress },
        timestamp: new Date().toISOString(),
        requiresVoiceCall: true,
      });
    }

    // PROACTIVE ACTION: Initiate voice call if critical
    const criticalAlerts = alerts.filter(a => a.level === "critical" && a.requiresVoiceCall);
    if (criticalAlerts.length > 0 && !this.state.callInitiated) {
      console.log('[ProactiveAgent] CRITICAL ALERTS DETECTED - Initiating voice call!');
      this.state.callInitiated = true;
      this.onCallRequired();
      
      // Reset call flag after 5 minutes
      setTimeout(() => {
        this.state.callInitiated = false;
      }, 300000);
    }

    // Notify about all alerts
    alerts.forEach(alert => {
      this.onAlert(alert);
    });

    this.state.alerts = alerts;
  }

  getState(): MonitoringState {
    return { ...this.state };
  }

  resetCallFlag() {
    this.state.callInitiated = false;
  }
}

/**
 * Singleton instance für globales Monitoring
 */
let agentInstance: ProactiveHealthAgent | null = null;

export function getProactiveAgent(
  onAlert: (alert: HealthAlert) => void,
  onCallRequired: () => void
): ProactiveHealthAgent {
  if (!agentInstance) {
    agentInstance = new ProactiveHealthAgent(onAlert, onCallRequired);
  }
  return agentInstance;
}

export function stopGlobalMonitoring() {
  if (agentInstance) {
    agentInstance.stopMonitoring();
  }
}
