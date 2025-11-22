import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { DailyMetrics, Baseline } from "@/types";
import { computeReadiness } from "@/lib/metrics";

type HealthRadarProps = {
  today: DailyMetrics;
  baseline: Baseline;
  last7Days: DailyMetrics[];
};

export function HealthRadar({ today, baseline, last7Days }: HealthRadarProps) {
  const readiness = computeReadiness(today, baseline, last7Days);
  
  // Determine state level
  let stateLevel: "optimal" | "good" | "moderate" | "low";
  let stateColor: string;
  let stateText: string;
  
  if (readiness.score >= 85) {
    stateLevel = "optimal";
    stateColor = "bg-success text-success-foreground";
    stateText = "Optimal";
  } else if (readiness.score >= 70) {
    stateLevel = "good";
    stateColor = "bg-primary text-primary-foreground";
    stateText = "Good";
  } else if (readiness.score >= 50) {
    stateLevel = "moderate";
    stateColor = "bg-warning text-warning-foreground";
    stateText = "Moderate";
  } else {
    stateLevel = "low";
    stateColor = "bg-destructive text-destructive-foreground";
    stateText = "Low";
  }

  // Key metrics with trends
  const hrvTrend = ((today.hrv - baseline.hrv) / baseline.hrv) * 100;
  const hrTrend = ((today.restingHr - baseline.restingHr) / baseline.restingHr) * 100;
  const sleepTrend = ((today.sleepHours - baseline.sleepHours) / baseline.sleepHours) * 100;

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="w-3 h-3 text-success" />;
    if (trend < -5) return <TrendingDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-card border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Your Current State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* State Badge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Readiness</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{readiness.score}%</span>
                <Badge className={stateColor}>{stateText}</Badge>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-xs text-muted-foreground">HRV</p>
                {getTrendIcon(hrvTrend)}
              </div>
              <p className="text-lg font-semibold">{today.hrv}</p>
              <p className="text-xs text-muted-foreground">ms</p>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-xs text-muted-foreground">HR</p>
                {getTrendIcon(-hrTrend)}
              </div>
              <p className="text-lg font-semibold">{today.restingHr}</p>
              <p className="text-xs text-muted-foreground">bpm</p>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-xs text-muted-foreground">Sleep</p>
                {getTrendIcon(sleepTrend)}
              </div>
              <p className="text-lg font-semibold">{today.sleepHours.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">hrs</p>
            </div>
          </div>

          {/* What's Driving It */}
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">What's driving your state:</p>
            <ul className="space-y-1.5">
              {readiness.explanation.slice(0, 3).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
