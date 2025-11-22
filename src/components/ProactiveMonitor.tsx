import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, X, Phone } from "lucide-react";
import { HealthAlert, getProactiveAgent, AlertLevel } from "@/lib/agentMonitoring";
import { DailyMetrics, Baseline } from "@/types";
import { toast } from "sonner";

type ProactiveMonitorProps = {
  metrics: DailyMetrics[];
  baseline: Baseline;
  onCallInitiated: () => void;
};

export function ProactiveMonitor({ metrics, baseline, onCallInitiated }: ProactiveMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [lastCheck, setLastCheck] = useState<string>("");

  useEffect(() => {
    const agent = getProactiveAgent(
      (alert: HealthAlert) => {
        console.log('[ProactiveMonitor] New alert received:', alert.title);
        setAlerts(prev => {
          // Avoid duplicates
          if (prev.some(a => a.id === alert.id)) {
            return prev;
          }
          return [...prev, alert].slice(-5); // Keep last 5 alerts
        });

        // Show toast for critical alerts
        if (alert.level === "critical") {
          toast.error(alert.title, {
            description: alert.message,
            duration: 10000,
          });
        } else if (alert.level === "warning") {
          toast.warning(alert.title, {
            description: alert.message,
            duration: 5000,
          });
        }
      },
      () => {
        console.log('[ProactiveMonitor] VOICE CALL REQUIRED');
        toast.error("Kritische Gesundheitswerte erkannt!", {
          description: "Dein AI Coach möchte mit dir sprechen.",
          duration: 15000,
          action: {
            label: "Anruf annehmen",
            onClick: () => onCallInitiated(),
          },
        });
        onCallInitiated();
      }
    );

    agent.startMonitoring(metrics, baseline);
    setIsMonitoring(true);

    const interval = setInterval(() => {
      const state = agent.getState();
      setLastCheck(state.lastCheck);
    }, 1000);

    return () => {
      clearInterval(interval);
      agent.stopMonitoring();
    };
  }, [metrics, baseline, onCallInitiated]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return <ShieldAlert className="w-5 h-5 text-destructive" />;
      case "warning":
        return <Shield className="w-5 h-5 text-warning" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-success" />;
    }
  };

  const getAlertColor = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return "border-destructive bg-destructive/5";
      case "warning":
        return "border-warning bg-warning/5";
      default:
        return "border-success bg-success/5";
    }
  };

  const timeSinceCheck = lastCheck 
    ? Math.floor((Date.now() - new Date(lastCheck).getTime()) / 1000)
    : 0;

  return (
    <div className="space-y-4">
      {/* Monitoring Status */}
      <Card className="shadow-card border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: isMonitoring ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                <ShieldCheck className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h3 className="font-semibold">Proaktives Monitoring</h3>
                <p className="text-xs text-muted-foreground">
                  {isMonitoring 
                    ? `Aktiv • Letzter Check vor ${timeSinceCheck}s`
                    : "Inaktiv"
                  }
                </p>
              </div>
            </div>
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? "Live" : "Offline"}
            </Badge>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <p className="text-muted-foreground">
              🤖 Dein AI Agent überwacht autonom deine Gesundheitsdaten und wird dich <strong>proaktiv kontaktieren</strong> wenn kritische Muster erkannt werden.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className={getAlertColor(alert.level)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.level)}
                  <div className="flex-1">
                    <AlertTitle className="mb-1">{alert.title}</AlertTitle>
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                    
                    {alert.requiresVoiceCall && (
                      <Button
                        size="sm"
                        className="mt-3 gap-2"
                        onClick={onCallInitiated}
                      >
                        <Phone className="w-4 h-4" />
                        Mit Coach sprechen
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {alerts.length === 0 && isMonitoring && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 text-center">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-sm font-medium text-success">Alles im grünen Bereich</p>
            <p className="text-xs text-muted-foreground mt-1">
              Keine kritischen Werte erkannt
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
