import { useEffect, useState } from "react";
import { loadMetrics, loadCalendarEvents } from "@/lib/storage";
import { DailyMetrics, CalendarEvent } from "@/types";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { CalendarIntegrationCard } from "@/components/CalendarIntegrationCard";
import { Activity, Moon, Brain, Dumbbell } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function Insights() {
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [period, setPeriod] = useState<"7" | "30">("7");

  useEffect(() => {
    const allMetrics = loadMetrics();
    setMetrics(allMetrics);
    
    const allEvents = loadCalendarEvents();
    const now = new Date();
    const futureEvents = allEvents.filter((e) => new Date(e.start) > now);
    setEvents(futureEvents);
  }, []);

  const data = metrics.slice(period === "7" ? -7 : -30).map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    hrv: m.hrv,
    restingHr: m.restingHr,
    sleepHours: m.sleepHours,
    sleepEfficiency: m.sleepEfficiency,
    trainingLoad: m.trainingLoad,
    stressScore: m.stressScore,
    moodScore: m.moodScore * 20,
    energyScore: m.energyScore * 20,
  }));

  const avgHRV = (data.reduce((sum, d) => sum + d.hrv, 0) / data.length).toFixed(1);
  const avgSleep = (data.reduce((sum, d) => sum + d.sleepHours, 0) / data.length).toFixed(1);
  const avgStress = (data.reduce((sum, d) => sum + d.stressScore, 0) / data.length).toFixed(0);

  return (
    <MobileLayout title="Insights">
      <PageTransition>
        <div className="px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{avgHRV}</div>
                <p className="text-xs text-muted-foreground">Avg HRV</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Moon className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold">{avgSleep}</div>
                <p className="text-xs text-muted-foreground">Avg Sleep</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 text-warning" />
                <div className="text-2xl font-bold">{avgStress}</div>
                <p className="text-xs text-muted-foreground">Avg Stress</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Period Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("7")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              period === "7" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod("30")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              period === "30" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            30 Days
          </button>
        </div>

        {/* Charts */}
        <Tabs defaultValue="recovery" className="space-y-4">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="recovery" className="text-xs">Recovery</TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs">Sleep</TabsTrigger>
            <TabsTrigger value="stress" className="text-xs">Stress</TabsTrigger>
            <TabsTrigger value="training" className="text-xs">Training</TabsTrigger>
          </TabsList>

          <TabsContent value="recovery">
            <Card>
              <CardContent className="pt-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-sm">HRV Trend</h3>
                  <p className="text-xs text-muted-foreground">Higher is better</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="hrv" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sleep">
            <Card>
              <CardContent className="pt-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-sm">Sleep Quality</h3>
                  <p className="text-xs text-muted-foreground">Hours & Efficiency</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="sleepHours" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stress">
            <Card>
              <CardContent className="pt-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-sm">Stress Levels</h3>
                  <p className="text-xs text-muted-foreground">Daily stress score</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="stressScore" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training">
            <Card>
              <CardContent className="pt-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-sm">Training Load</h3>
                  <p className="text-xs text-muted-foreground">Daily training intensity</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="trainingLoad" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Summary */}
        <Card className="bg-accent/5 border-accent">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">AI Analysis</h3>
                <p className="text-xs text-muted-foreground">
                  {period === "7"
                    ? "Your HRV shows some variation this week, suggesting elevated stress. Sleep quality is consistent. Consider earlier bedtimes if stress remains high."
                    : "You've gone through distinct phases: normal period, exam prep with elevated stress, then recovery. Your body responded well to lighter training during high-stress periods."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Impact */}
        <CalendarIntegrationCard 
          events={events}
          impact={{
            sleepRecommendation: "Early events detected - sleep timer adjusted automatically",
            stressWarning: parseFloat(avgStress) > 60 ? "High stress period - training intensity reduced" : undefined,
            trainingAdjustment: "Workout schedule synchronized with recovery needs",
          }}
        />
      </div>
      </PageTransition>
    </MobileLayout>
  );
}
