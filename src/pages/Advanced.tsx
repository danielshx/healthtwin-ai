import { useEffect, useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { PageTransition } from "@/components/PageTransition";
import { BiomarkerTrendCard } from "@/components/BiomarkerTrendCard";
import { WearableStatus } from "@/components/WearableStatus";
import { InjuryRiskCard } from "@/components/InjuryRiskCard";
import { RecoveryCalendarCard } from "@/components/RecoveryCalendarCard";
import { loadProfile, loadMetrics } from "@/lib/storage";
import { computeBaseline } from "@/lib/metrics";
import { InjuryRiskAgent } from "@/agents/InjuryRiskAgent";
import { RecoveryPredictionAgent } from "@/agents/RecoveryPredictionAgent";
import { UserProfile, DailyMetrics, Baseline, BiomarkerTrend, InjuryRisk, RecoveryPrediction } from "@/types";
import { Loader2 } from "lucide-react";

export default function Advanced() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [trends, setTrends] = useState<BiomarkerTrend[]>([]);
  const [injuryRisk, setInjuryRisk] = useState<InjuryRisk | null>(null);
  const [recoveryPrediction, setRecoveryPrediction] = useState<RecoveryPrediction | null>(null);

  useEffect(() => {
    const prof = loadProfile();
    const metr = loadMetrics();
    setProfile(prof);
    setMetrics(metr);

    const base = computeBaseline(metr);
    setBaseline(base);

    // Generate biomarker trends
    const generatedTrends = generateBiomarkerTrends(metr, base);
    setTrends(generatedTrends);

    // Calculate injury risk
    const injuryAgent = new InjuryRiskAgent();
    const today = metr[metr.length - 1];
    const last7Days = metr.slice(-7);

    const risk = injuryAgent.assessInjuryRisk({
      profile: prof,
      today,
      last7Days,
      baseline: base,
      allMetrics: metr,
    });
    setInjuryRisk(risk);

    // Calculate recovery prediction
    const recoveryAgent = new RecoveryPredictionAgent();
    const prediction = recoveryAgent.predictRecovery({
      profile: prof,
      today,
      last7Days,
      baseline: base,
      allMetrics: metr,
    });
    setRecoveryPrediction(prediction);
  }, []);

  const generateBiomarkerTrends = (metrics: DailyMetrics[], baseline: Baseline): BiomarkerTrend[] => {
    const trends: BiomarkerTrend[] = [];
    const last14Days = metrics.slice(-14);
    
    if (last14Days.length < 7) return trends;

    // HRV trend
    const recentHRV = last14Days.slice(-7).reduce((sum, m) => sum + m.hrv, 0) / 7;
    const olderHRV = last14Days.slice(0, 7).reduce((sum, m) => sum + m.hrv, 0) / 7;
    const hrvChange = ((recentHRV - olderHRV) / olderHRV) * 100;

    let hrvTrend: BiomarkerTrend["trend"] = "stable";
    if (hrvChange > 5) hrvTrend = "improving";
    else if (hrvChange < -5) hrvTrend = "declining";

    trends.push({
      metric: "Heart Rate Variability (HRV)",
      trend: hrvTrend,
      story: `Your HRV has ${hrvTrend === "improving" ? "increased" : hrvTrend === "declining" ? "decreased" : "remained stable"} over the past two weeks. ${
        hrvTrend === "improving"
          ? "This indicates improved recovery capacity and nervous system balance."
          : hrvTrend === "declining"
          ? "This suggests increased stress or insufficient recovery between training sessions."
          : "Your nervous system is maintaining a consistent state."
      }`,
      startDate: last14Days[0].date,
      endDate: last14Days[last14Days.length - 1].date,
      recommendation:
        hrvTrend === "declining"
          ? "Prioritize sleep quality and reduce training intensity for 3-5 days"
          : hrvTrend === "improving"
          ? "Continue current recovery strategies - you're adapting well"
          : "Maintain current balance of training and recovery",
    });

    // Sleep quality trend
    const recentSleep = last14Days.slice(-7).reduce((sum, m) => sum + m.sleepEfficiency, 0) / 7;
    const olderSleep = last14Days.slice(0, 7).reduce((sum, m) => sum + m.sleepEfficiency, 0) / 7;
    const sleepChange = ((recentSleep - olderSleep) / olderSleep) * 100;

    let sleepTrend: BiomarkerTrend["trend"] = "stable";
    if (sleepChange > 3) sleepTrend = "improving";
    else if (sleepChange < -3) sleepTrend = "declining";

    trends.push({
      metric: "Sleep Efficiency",
      trend: sleepTrend,
      story: `Your sleep efficiency ${sleepTrend === "improving" ? "improved by" : sleepTrend === "declining" ? "declined by" : "remained stable with"} ${Math.abs(sleepChange).toFixed(1)}% over two weeks. ${
        sleepTrend === "improving"
          ? "Better sleep architecture means enhanced recovery and performance."
          : sleepTrend === "declining"
          ? "Reduced sleep quality can compound recovery deficit."
          : "Your sleep patterns are consistent."
      }`,
      startDate: last14Days[0].date,
      endDate: last14Days[last14Days.length - 1].date,
      recommendation:
        sleepTrend === "declining"
          ? "Review sleep environment (temperature, light, noise) and bedtime routine"
          : sleepTrend === "improving"
          ? "Excellent progress - maintain your current sleep hygiene practices"
          : "Continue current sleep schedule and environment",
    });

    return trends;
  };

  if (!profile || !baseline || !injuryRisk || !recoveryPrediction) {
    return (
      <MobileLayout title="Advanced Analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Advanced Analytics">
      <PageTransition>
        <div className="space-y-4 pb-20">
          <WearableStatus />
          <InjuryRiskCard risk={injuryRisk} />
          <RecoveryCalendarCard prediction={recoveryPrediction} />
          <BiomarkerTrendCard trends={trends} />
        </div>
      </PageTransition>
    </MobileLayout>
  );
}
