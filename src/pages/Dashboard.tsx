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
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Ready to optimize your health?
                </h2>
                <p className="text-foreground/80 font-medium mt-2">Your AI coach is standing by</p>
              </div>
            </motion.div>

            {/* Coach CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3"
            >
              <Button
                onClick={() => navigate("/coach")}
                className="h-auto py-4 bg-gradient-to-br from-primary to-primary-glow hover:shadow-glow transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-semibold">Chat with Coach</span>
                </div>
              </Button>
              <Button
                onClick={() => navigate("/coach")}
                className="h-auto py-4 bg-gradient-to-br from-secondary to-accent hover:shadow-glow transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-2">
                  <Video className="w-6 h-6" />
                  <span className="font-semibold">Video Call</span>
                </div>
              </Button>
            </motion.div>

            {/* Readiness Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
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

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
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

            {/* Today's Calendar */}
            {todayEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-bold">Today's Schedule</h3>
                      </div>
                      <Badge variant="secondary">{todayEvents.length} events</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      {todayEvents.slice(0, 3).map((event) => {
                        const isPast = new Date(event.start) < new Date();
                        return (
                          <div
                            key={event.id}
                            className={`p-2 rounded-lg flex items-start gap-2 ${
                              isPast ? "bg-muted/30 opacity-60" : "bg-primary/5"
                            }`}
                          >
                            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(event.start).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                                {event.end && (
                                  <> - {new Date(event.end).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}</>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/calendar")}>
                      View Full Calendar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* AI Suggestions Preview */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        <h3 className="font-bold">AI Suggestions</h3>
                      </div>
                      <Badge variant="secondary">{recommendations.length}</Badge>
                    </div>
                    <div className="space-y-3 mb-4">
                      {recommendations.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="p-3 bg-muted/30 rounded-lg">
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
                    <Button className="w-full" onClick={() => navigate("/coach")}>
                      Chat with Coach
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
