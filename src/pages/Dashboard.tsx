import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadProfile, loadMetrics, loadRecommendations, saveRecommendations } from "@/lib/storage";
import { computeBaseline, computeReadiness, computeBurnoutRisk, generateRecommendations } from "@/lib/agentLoop";
import { UserProfile, DailyMetrics, AgentRecommendation, ReadinessScore, BurnoutRisk } from "@/types";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TwinAvatar } from "@/components/TwinAvatar";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/PullToRefresh";
import { PageTransition } from "@/components/PageTransition";
import { Heart, Activity, Moon, Zap, Flame, Shield, Target } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [todayMetrics, setTodayMetrics] = useState<DailyMetrics | null>(null);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [burnoutRisk, setBurnoutRisk] = useState<BurnoutRisk | null>(null);
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

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const allMetrics = loadMetrics();
    setMetrics(allMetrics);
    const today = allMetrics[allMetrics.length - 1];
    setTodayMetrics(today);
    toast.success("Dashboard aktualisiert!");
  };

  if (!profile || !todayMetrics || !readiness || !burnoutRisk) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your digital twin...</p>
      </div>
    );
  }


  return (
    <MobileLayout title="HealthTwin">
      <PullToRefresh onRefresh={handleRefresh}>
        <PageTransition>
          <div className="px-4 py-6 space-y-6">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <TwinAvatar readiness={readiness.score} burnoutLevel={burnoutRisk.level} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Hello, {profile.name}!</h2>
                <p className="text-muted-foreground">Here's your health snapshot</p>
              </div>
            </motion.div>

            {/* Readiness Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-card bg-gradient-wellness text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      <span className="font-medium">Readiness</span>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">Today</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2">{readiness.score}</div>
                    <div className="text-sm opacity-90 mb-4">out of 100</div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${readiness.score}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="shadow-soft">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Moon className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-xs text-muted-foreground">Sleep</span>
                    </div>
                    <div className="text-2xl font-bold">{todayMetrics.sleepHours.toFixed(1)}<span className="text-sm text-muted-foreground ml-1">hrs</span></div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="shadow-soft">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">HRV</span>
                    </div>
                    <div className="text-2xl font-bold">{todayMetrics.hrv.toFixed(0)}<span className="text-sm text-muted-foreground ml-1">ms</span></div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Card className="shadow-soft">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Heart className="w-4 h-4 text-destructive" />
                      </div>
                      <span className="text-xs text-muted-foreground">Resting HR</span>
                    </div>
                    <div className="text-2xl font-bold">{todayMetrics.restingHr.toFixed(0)}<span className="text-sm text-muted-foreground ml-1">bpm</span></div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="shadow-soft">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Energy</span>
                    </div>
                    <div className="text-2xl font-bold">{todayMetrics.energyScore}<span className="text-sm text-muted-foreground ml-1">/5</span></div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Card 
                  className="shadow-card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate("/today")}
                >
                  <CardContent className="pt-6 pb-6 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold mb-1">Today's Plan</p>
                    <p className="text-xs text-muted-foreground">Your priorities</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card 
                  className="shadow-card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate("/recovery")}
                >
                  <CardContent className="pt-6 pb-6 text-center">
                    <Shield className={`w-8 h-8 mx-auto mb-2 ${
                      burnoutRisk.level === "Green" ? "text-success" :
                      burnoutRisk.level === "Yellow" ? "text-warning" : "text-destructive"
                    }`} />
                    <p className="font-semibold mb-1">Recovery</p>
                    <Badge className="text-xs">{burnoutRisk.level}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* AI Suggestions Preview */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        <h3 className="font-bold">AI Suggestions</h3>
                      </div>
                      <Badge variant="secondary">{recommendations.length}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {recommendations[0]?.title}
                    </p>
                    <Button className="w-full" onClick={() => navigate("/coach")}>
                      View All Suggestions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="h-20" />
          </div>
        </PageTransition>
      </PullToRefresh>
    </MobileLayout>
  );
}
