import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadProfile, loadMetrics, loadRecommendations, saveRecommendations, addFeedback } from "@/lib/storage";
import { computeBaseline, computeReadiness, computeBurnoutRisk, generateDailyPlan, generateRecommendations } from "@/lib/agentLoop";
import { UserProfile, DailyMetrics, AgentRecommendation, ReadinessScore, BurnoutRisk, DailyPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { TwinAvatar } from "@/components/TwinAvatar";
import { ReadinessCard } from "@/components/ReadinessCard";
import { BurnoutRiskCard } from "@/components/BurnoutRiskCard";
import { DailyPlanCard } from "@/components/DailyPlanCard";
import { MetricCard } from "@/components/MetricCard";
import { AgentRecommendationCard } from "@/components/AgentRecommendationCard";
import { MiniChart } from "@/components/MiniChart";
import { Heart, Activity, Moon, Zap, MessageCircle, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [burnoutRisk, setBurnoutRisk] = useState<BurnoutRisk | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);

  useEffect(() => {
    const prof = loadProfile();
    if (!prof.onboardingComplete) {
      navigate("/onboarding");
      return;
    }
    setProfile(prof);

    const allMetrics = loadMetrics();
    setMetrics(allMetrics);

    const today = allMetrics[allMetrics.length - 1];
    setTodayMetrics(today);

    const last7 = allMetrics.slice(-7);
    const baseline = computeBaseline(allMetrics);

    const ready = computeReadiness(today, baseline, last7);
    setReadiness(ready);

    const risk = computeBurnoutRisk(last7, baseline);
    setBurnoutRisk(risk);

    const plan = generateDailyPlan(prof, today, last7, baseline);
    setDailyPlan(plan);

    // Generate recommendations if not already generated today
    let recs = loadRecommendations();
    const todayStr = new Date().toISOString().split("T")[0];
    const hasRecsToday = recs.some((r) => r.createdAt.startsWith(todayStr));
    if (!hasRecsToday) {
      const newRecs = generateRecommendations(prof, today, last7, baseline);
      recs = [...recs, ...newRecs];
      saveRecommendations(recs);
    }
    setRecommendations(recs.slice(-10));
  }, [navigate]);

  const handleAction = (recId: string, action: "accept" | "snooze" | "reject") => {
    const feedbackMap: Record<"accept" | "snooze" | "reject", "accepted" | "snoozed" | "rejected"> = {
      accept: "accepted",
      snooze: "snoozed",
      reject: "rejected",
    };
    
    addFeedback({
      recId,
      userResponse: feedbackMap[action],
      timestamp: new Date().toISOString(),
    });
    // Remove from UI
    setRecommendations(recommendations.filter((r) => r.id !== recId));
  };

  if (!profile || !todayMetrics || !readiness || !burnoutRisk || !dailyPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your digital twin...</p>
      </div>
    );
  }

  const last7 = metrics.slice(-7);
  const hrvData = last7.map((m) => ({ date: m.date.slice(5), value: m.hrv }));
  const hrData = last7.map((m) => ({ date: m.date.slice(5), value: m.restingHr }));
  const sleepData = last7.map((m) => ({ date: m.date.slice(5), value: m.sleepHours }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">FitTwin</h1>
          </div>
          <nav className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/timeline")}>
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </Button>
            <Button variant="ghost" onClick={() => navigate("/insights")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </Button>
            <Button variant="ghost" onClick={() => navigate("/coach")}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Coach
            </Button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold">Hello, {profile.name}!</h2>
            <p className="text-muted-foreground">Here's your health snapshot for today</p>
          </div>
          <TwinAvatar readiness={readiness.score} burnoutLevel={burnoutRisk.level} />
        </motion.div>

        {/* Top Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <ReadinessCard score={readiness.score} explanation={readiness.explanation} />
          <BurnoutRiskCard risk={burnoutRisk} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Sleep Last Night"
            value={todayMetrics.sleepHours.toFixed(1)}
            unit="hrs"
            icon={Moon}
            delay={0}
          />
          <MetricCard
            title="HRV"
            value={todayMetrics.hrv.toFixed(0)}
            unit="ms"
            icon={Activity}
            delay={0.05}
          />
          <MetricCard
            title="Resting HR"
            value={todayMetrics.restingHr.toFixed(0)}
            unit="bpm"
            icon={Heart}
            delay={0.1}
          />
          <MetricCard
            title="Energy"
            value={todayMetrics.energyScore}
            unit="/5"
            icon={Zap}
            delay={0.15}
          />
        </div>

        {/* Daily Plan */}
        <DailyPlanCard plan={dailyPlan} />

        {/* Mini Charts */}
        <div className="grid md:grid-cols-3 gap-4">
          <MiniChart
            title="HRV Trend (7 days)"
            data={hrvData}
            color="hsl(var(--primary))"
            icon={TrendingUp}
            unit="ms"
          />
          <MiniChart
            title="Resting HR (7 days)"
            data={hrData}
            color="hsl(var(--destructive))"
            icon={Heart}
            unit="bpm"
          />
          <MiniChart
            title="Sleep Hours (7 days)"
            data={sleepData}
            color="hsl(var(--accent))"
            icon={Moon}
            unit="hrs"
          />
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Agent Recommendations</h3>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <AgentRecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAction={handleAction}
                  delay={idx * 0.1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-6" onClick={() => navigate("/simulate")}>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">What-If Simulator</p>
              <p className="text-xs text-muted-foreground">See impact of choices</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-6" onClick={() => navigate("/coach")}>
            <div className="text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">Chat with Coach</p>
              <p className="text-xs text-muted-foreground">Get personalized advice</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-6" onClick={() => navigate("/social")}>
            <div className="text-center">
              <Heart className="w-8 h-8 mx-auto mb-2" />
              <p className="font-semibold">Social & Streaks</p>
              <p className="text-xs text-muted-foreground">Stay motivated</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
