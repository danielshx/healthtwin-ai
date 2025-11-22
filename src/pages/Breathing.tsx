import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { PageTransition } from "@/components/PageTransition";
import { BreathingExercise } from "@/components/BreathingExercise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wind, Activity, Heart, Brain } from "lucide-react";
import { toast } from "sonner";
import { loadMetrics, loadProfile, loadBaseline, getTodayBreathingSessions } from "@/lib/storage";
import { getAgentOrchestrator } from "@/agents/AgentOrchestrator";
import type { AgentRecommendation } from "@/types";

export default function Breathing() {
  const [breathingRecommendations, setBreathingRecommendations] = useState<AgentRecommendation[]>([]);
  const [todaySessions, setTodaySessions] = useState(0);

  useEffect(() => {
    const metrics = loadMetrics();
    const profile = loadProfile();
    const baseline = loadBaseline(metrics);
    const last7Days = metrics.slice(-7);
    const today = metrics[metrics.length - 1];

    const orchestrator = getAgentOrchestrator();
    const recommendations = orchestrator.analyze({
      profile,
      today,
      last7Days,
      baseline,
      allMetrics: metrics,
    });

    const breathingRecs = recommendations.filter(
      r => r.agent === "BreathingCoachAgent"
    );
    setBreathingRecommendations(breathingRecs);

    const sessions = getTodayBreathingSessions();
    setTodaySessions(sessions.length);
  }, []);

  const handleComplete = (type: string, duration: number, cycles: number) => {
    setTodaySessions(prev => prev + 1);
    toast.success(`${type} breathing session completed! 🎉`);
  };

  return (
    <MobileLayout title="Breathing Coach">
      <PageTransition>
        <div className="space-y-4 pb-20">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-primary" />
                Guided Breathing Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose a breathing pattern based on your current needs. Each technique
                offers unique benefits for stress relief, recovery, or sleep preparation.
              </p>
              
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Today's Sessions:</span>
                  <Badge variant="secondary">{todaySessions}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {breathingRecommendations.length > 0 && (
            <Card className="shadow-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {breathingRecommendations.map((rec) => (
                  <div key={rec.id} className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.rationale}</p>
                      </div>
                      <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                        {rec.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}


          <BreathingExercise
            type="coherent"
            duration={5}
            onComplete={(duration, cycles) => handleComplete("Coherent", duration, cycles)}
          />

          <BreathingExercise
            type="box"
            duration={3}
            onComplete={(duration, cycles) => handleComplete("Box", duration, cycles)}
          />

          <BreathingExercise
            type="478"
            duration={5}
            onComplete={(duration, cycles) => handleComplete("4-7-8", duration, cycles)}
          />
        </div>
      </PageTransition>
    </MobileLayout>
  );
}
