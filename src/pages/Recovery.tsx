import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadProfile, loadMetrics } from "@/lib/storage";
import { computeBaseline, computeBurnoutRisk } from "@/lib/agentLoop";
import { UserProfile, DailyMetrics, BurnoutRisk, Baseline } from "@/types";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { ProactiveMonitor } from "@/components/ProactiveMonitor";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Recovery() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [burnoutRisk, setBurnoutRisk] = useState<BurnoutRisk | null>(null);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);

  useEffect(() => {
    const prof = loadProfile();
    if (!prof.onboardingComplete) {
      navigate("/onboarding");
      return;
    }
    setProfile(prof);

    const allMetrics = loadMetrics();
    setMetrics(allMetrics);

    const last7 = allMetrics.slice(-7);
    const base = computeBaseline(allMetrics);
    setBaseline(base);

    const risk = computeBurnoutRisk(last7, base);
    setBurnoutRisk(risk);
  }, [navigate]);

  if (!profile || !burnoutRisk || !baseline) {
    return (
      <MobileLayout title="Recovery">
        <div className="flex items-center justify-center h-full">
          <p>Loading recovery status...</p>
        </div>
      </MobileLayout>
    );
  }

  const riskConfig = {
    Green: { 
      icon: CheckCircle, 
      bg: "bg-success/10", 
      border: "border-success", 
      text: "text-success",
      title: "All Clear"
    },
    Yellow: { 
      icon: Info, 
      bg: "bg-warning/10", 
      border: "border-warning", 
      text: "text-warning",
      title: "Caution"
    },
    Red: { 
      icon: AlertTriangle, 
      bg: "bg-destructive/10", 
      border: "border-destructive", 
      text: "text-destructive",
      title: "Action Needed"
    },
  };

  const config = riskConfig[burnoutRisk.level];
  const Icon = config.icon;

  return (
    <MobileLayout title="Recovery Status">
      <PageTransition>
        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold mb-1">Recovery & Burnout</h1>
            <p className="text-muted-foreground text-sm">Monitoring your health patterns</p>
          </motion.div>

          {/* Burnout Risk Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`shadow-card border-2 ${config.border}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-5 h-5 ${config.text}`} />
                    Burnout Risk
                  </div>
                  <Badge className={`${config.bg} ${config.text} border-0`}>
                    {burnoutRisk.level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`flex items-center gap-3 p-4 rounded-xl ${config.bg}`}>
                  <Icon className={`w-8 h-8 ${config.text}`} />
                  <div className="flex-1">
                    <p className={`font-semibold mb-1 ${config.text}`}>{config.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {burnoutRisk.level === "Green" 
                        ? "Your recovery markers are stable" 
                        : "Pay attention to recovery signals"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  What We're Seeing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {burnoutRisk.rationale.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${config.bg} shrink-0 mt-2`} />
                    <p className="text-sm flex-1">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommended Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {burnoutRisk.actions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-success">{idx + 1}</span>
                    </div>
                    <p className="text-sm flex-1">{action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Proactive Monitor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ProactiveMonitor 
              metrics={metrics}
              baseline={baseline}
              onCallInitiated={() => {
                toast.info("Critical health pattern detected. Check your Coach for guidance.");
              }}
            />
          </motion.div>

          <div className="h-20" />
        </div>
      </PageTransition>
    </MobileLayout>
  );
}
