import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadProfile, loadMetrics, loadRecommendations, saveRecommendations, loadCalendarEvents } from "@/lib/storage";
import { computeBaseline, computeReadiness, computeBurnoutRisk, generateRecommendations } from "@/lib/agentLoop";
import { UserProfile, DailyMetrics, AgentRecommendation, ReadinessScore, BurnoutRisk, CalendarEvent } from "@/types";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TwinAvatar } from "@/components/TwinAvatar";
import { Badge } from "@/components/ui/badge";
import { PullToRefresh } from "@/components/PullToRefresh";
import { PageTransition } from "@/components/PageTransition";
import { Heart, Activity, Moon, Zap, Flame, Shield, Target, Calendar as CalendarIcon, Clock, MessageCircle, Video } from "lucide-react";
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
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
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
      const recTodayStr = new Date().toISOString().split("T")[0];
      const hasRecsToday = recs.some((r) => r.createdAt.startsWith(recTodayStr));
      if (!hasRecsToday) {
        const newRecs = await generateRecommendations(prof, today, last7, baseline);
        recs = [...recs, ...newRecs];
        saveRecommendations(recs);
      }
      setRecommendations(recs.slice(-10));

      // Load today's calendar events
      const allEvents = loadCalendarEvents();
      const todayStr = new Date().toISOString().split("T")[0];
      const eventsToday = allEvents
        .filter((event) => event.start.startsWith(todayStr))
        .sort((a, b) => a.start.localeCompare(b.start));
      setTodayEvents(eventsToday);
    };

    loadDashboardData();
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
          <div className="px-4 py-6 space-y-6 bg-gradient-to-b from-background via-primary/5 to-background">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center space-y-6 pt-4"
            >
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl rounded-full animate-pulse" />
                  <TwinAvatar readiness={readiness.score} burnoutLevel={burnoutRisk.level} />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
                  Your AI Health Coach
                </h1>
                <p className="text-lg text-foreground/70">Optimize your wellness, effortlessly</p>
              </motion.div>
            </motion.div>

            {/* Coach CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="grid grid-cols-2 gap-4 px-2"
            >
              <Button
                onClick={() => navigate("/coach")}
                className="h-24 bg-gradient-to-br from-primary to-primary-glow hover:shadow-glow hover:scale-105 transition-all duration-300 border-2 border-primary-glow/20"
              >
                <div className="flex flex-col items-center gap-2">
                  <MessageCircle className="w-7 h-7" />
                  <span className="font-bold text-base">Chat</span>
                </div>
              </Button>
              <Button
                onClick={() => navigate("/coach")}
                className="h-24 bg-gradient-to-br from-secondary to-accent hover:shadow-glow hover:scale-105 transition-all duration-300 border-2 border-accent/20"
              >
                <div className="flex flex-col items-center gap-2">
                  <Video className="w-7 h-7" />
                  <span className="font-bold text-base">Video Call</span>
                </div>
              </Button>
            </motion.div>

            {/* Readiness Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Card className="shadow-glow bg-gradient-to-br from-primary via-primary-glow to-secondary text-white border-0 overflow-hidden relative">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                <CardContent className="pt-6 pb-6 relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-6 h-6" />
                    <span className="font-bold text-lg">Today's Readiness</span>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-7xl font-bold mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, duration: 0.6, type: "spring" }}
                    >
                      {readiness.score}
                    </motion.div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-white rounded-full shadow-glow"
                        initial={{ width: 0 }}
                        animate={{ width: `${readiness.score}%` }}
                        transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-sm opacity-90">You're ready to perform at your best</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Metrics Grid */}
            <motion.div 
              className="grid grid-cols-4 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <Card className="shadow-soft hover:shadow-card transition-shadow">
                <CardContent className="pt-4 pb-4 text-center">
                  <Moon className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="text-xl font-bold">{todayMetrics.sleepHours.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">hrs</div>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-card transition-shadow">
                <CardContent className="pt-4 pb-4 text-center">
                  <Activity className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">{todayMetrics.hrv.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">HRV</div>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-card transition-shadow">
                <CardContent className="pt-4 pb-4 text-center">
                  <Heart className="w-5 h-5 text-destructive mx-auto mb-2" />
                  <div className="text-xl font-bold">{todayMetrics.restingHr.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">bpm</div>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-card transition-shadow">
                <CardContent className="pt-4 pb-4 text-center">
                  <Zap className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <div className="text-xl font-bold">{todayMetrics.energyScore}</div>
                  <div className="text-xs text-muted-foreground">/5</div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div 
              className="grid grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <Card 
                className="shadow-card cursor-pointer hover:scale-105 hover:shadow-glow transition-all bg-gradient-to-br from-primary/10 to-transparent"
                onClick={() => navigate("/nutrition")}
              >
                <CardContent className="pt-5 pb-5 text-center">
                  <Flame className="w-7 h-7 mx-auto mb-2 text-primary" />
                  <p className="font-bold text-sm">Nutrition</p>
                </CardContent>
              </Card>

              <Card 
                className="shadow-card cursor-pointer hover:scale-105 hover:shadow-glow transition-all bg-gradient-to-br from-accent/10 to-transparent"
                onClick={() => navigate("/recovery")}
              >
                <CardContent className="pt-5 pb-5 text-center">
                  <Shield className="w-7 h-7 mx-auto mb-2 text-accent" />
                  <p className="font-bold text-sm">Recovery</p>
                </CardContent>
              </Card>

              <Card 
                className="shadow-card cursor-pointer hover:scale-105 hover:shadow-glow transition-all bg-gradient-to-br from-secondary/10 to-transparent"
                onClick={() => navigate("/insights")}
              >
                <CardContent className="pt-5 pb-5 text-center">
                  <Target className="w-7 h-7 mx-auto mb-2 text-secondary" />
                  <p className="font-bold text-sm">Insights</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1, duration: 0.6 }}
            >
              <Card className="shadow-card bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-6 h-6 text-primary" />
                    <h3 className="font-bold text-lg">AI Suggestions</h3>
                  </div>
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((rec) => (
                      <div key={rec.id} className="p-3 bg-background/80 rounded-lg backdrop-blur-sm">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold flex-1">{rec.title}</p>
                          <Badge 
                            variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{rec.rationale}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="h-20" />
          </div>
        </PageTransition>
      </PullToRefresh>
    </MobileLayout>
  );
}
