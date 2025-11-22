import { useEffect, useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { PageTransition } from "@/components/PageTransition";
import { PredictiveHealthCard } from "@/components/PredictiveHealthCard";
import { ContextAwarenessCard } from "@/components/ContextAwarenessCard";
import { loadProfile, loadMetrics } from "@/lib/storage";
import { computeBaseline } from "@/lib/metrics";
import { PredictiveAnalyticsAgent } from "@/agents/PredictiveAnalyticsAgent";
import { ContextAwarenessAgent } from "@/agents/ContextAwarenessAgent";
import { UserProfile, DailyMetrics, Baseline, BurnoutPrediction, ContextData } from "@/types";
import { Loader2 } from "lucide-react";

export default function Predictions() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [predictions, setPredictions] = useState<BurnoutPrediction[]>([]);
  const [context, setContext] = useState<ContextData | null>(null);

  useEffect(() => {
    const prof = loadProfile();
    const metr = loadMetrics();
    setProfile(prof);
    setMetrics(metr);

    const base = computeBaseline(metr);
    setBaseline(base);

    // Generate predictions
    const predictiveAgent = new PredictiveAnalyticsAgent();
    const today = metr[metr.length - 1];
    const last7Days = metr.slice(-7);

    const preds = predictiveAgent.predictBurnout({
      profile: prof,
      today,
      last7Days,
      baseline: base,
      allMetrics: metr,
    });
    setPredictions(preds);

    // Get current context
    const contextAgent = new ContextAwarenessAgent();
    const currentContext = contextAgent.getCurrentContext();
    setContext(currentContext);
  }, []);

  if (!profile || !baseline || !context) {
    return (
      <MobileLayout title="Predictions">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Predictive Analytics">
      <PageTransition>
        <div className="space-y-4 pb-20">
          <PredictiveHealthCard predictions={predictions} />
          <ContextAwarenessCard context={context} />
        </div>
      </PageTransition>
    </MobileLayout>
  );
}
