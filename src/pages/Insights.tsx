import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadMetrics } from "@/lib/storage";
import { DailyMetrics } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

export default function Insights() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [period, setPeriod] = useState<"7" | "30">("7");

  useEffect(() => {
    const allMetrics = loadMetrics();
    setMetrics(allMetrics);
  }, []);

  const data = metrics.slice(period === "7" ? -7 : -30).map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    hrv: m.hrv,
    restingHr: m.restingHr,
    sleepHours: m.sleepHours,
    sleepEfficiency: m.sleepEfficiency,
    trainingLoad: m.trainingLoad,
    stressScore: m.stressScore,
    moodScore: m.moodScore * 20, // Scale to 100
    energyScore: m.energyScore * 20, // Scale to 100
  }));

  const avgHRV = (data.reduce((sum, d) => sum + d.hrv, 0) / data.length).toFixed(1);
  const avgSleep = (data.reduce((sum, d) => sum + d.sleepHours, 0) / data.length).toFixed(1);
  const avgStress = (data.reduce((sum, d) => sum + d.stressScore, 0) / data.length).toFixed(0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Insights</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg HRV</p>
                    <p className="text-3xl font-bold">{avgHRV} <span className="text-sm">ms</span></p>
                  </div>
                  <Activity className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Sleep</p>
                    <p className="text-3xl font-bold">{avgSleep} <span className="text-sm">hrs</span></p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Stress</p>
                    <p className="text-3xl font-bold">{avgStress}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Period selector */}
          <div className="flex gap-2">
            <Button
              variant={period === "7" ? "default" : "outline"}
              onClick={() => setPeriod("7")}
            >
              7 Days
            </Button>
            <Button
              variant={period === "30" ? "default" : "outline"}
              onClick={() => setPeriod("30")}
            >
              30 Days
            </Button>
          </div>

          {/* Charts */}
          <Tabs defaultValue="recovery" className="space-y-4">
            <TabsList>
              <TabsTrigger value="recovery">Recovery Markers</TabsTrigger>
              <TabsTrigger value="sleep">Sleep Quality</TabsTrigger>
              <TabsTrigger value="stress">Stress & Mood</TabsTrigger>
              <TabsTrigger value="training">Training Load</TabsTrigger>
            </TabsList>

            <TabsContent value="recovery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>HRV & Resting HR Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--destructive))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="hrv"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="HRV (ms)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="restingHr"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        name="Resting HR (bpm)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sleep" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sleep Hours & Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="left" stroke="hsl(var(--accent))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--primary))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sleepHours"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        name="Sleep Hours"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="sleepEfficiency"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="Sleep Efficiency %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stress vs Mood & Energy</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="stressScore" fill="hsl(var(--warning))" name="Stress" />
                      <Bar dataKey="moodScore" fill="hsl(var(--success))" name="Mood (scaled)" />
                      <Bar dataKey="energyScore" fill="hsl(var(--secondary))" name="Energy (scaled)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Training Load vs Recovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="trainingLoad" fill="hsl(var(--secondary))" name="Training Load" />
                      <Bar dataKey="sleepEfficiency" fill="hsl(var(--primary))" name="Sleep Efficiency %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* AI Summary */}
          <Card className="bg-accent/5 border-accent">
            <CardHeader>
              <CardTitle>What Changed Recently?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {period === "7"
                  ? "Over the last week, your HRV has shown some variation, with recent dips suggesting elevated stress or training load. Sleep quality has been consistent, but consider earlier bedtimes if stress remains high."
                  : "Over the last 30 days, you've gone through distinct phases: a normal period, an exam prep phase with elevated stress, followed by recovery. Your body responded well to lighter training during high-stress periods. Keep monitoring HRV for early warning signs."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
