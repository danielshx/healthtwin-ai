import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DailyMetrics, Baseline, CalendarEvent } from "@/types";
import { computeBurnoutRisk } from "@/lib/metrics";

type ShortTermForecastProps = {
  last7Days: DailyMetrics[];
  baseline: Baseline;
  upcomingEvents: CalendarEvent[];
};

export function ShortTermForecast({ last7Days, baseline, upcomingEvents }: ShortTermForecastProps) {
  const burnoutRisk = computeBurnoutRisk(last7Days, baseline);
  
  // Calculate sleep debt
  const avgSleep = last7Days.reduce((sum, m) => sum + m.sleepHours, 0) / last7Days.length;
  const sleepDebt = (baseline.sleepHours * 7) - (avgSleep * 7);
  
  // Calculate stress trend
  const recentStress = last7Days.slice(-3).reduce((sum, m) => sum + m.stressScore, 0) / 3;
  const olderStress = last7Days.slice(0, 3).reduce((sum, m) => sum + m.stressScore, 0) / 3;
  const stressTrend = recentStress - olderStress;
  
  // Check for high-stress events in next 48h
  const next48h = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const highStressEvents = upcomingEvents.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate <= next48h && (
      event.title.toLowerCase().includes('exam') ||
      event.title.toLowerCase().includes('test') ||
      event.title.toLowerCase().includes('presentation') ||
      event.title.toLowerCase().includes('deadline')
    );
  });

  const forecasts = [];

  // Sleep debt forecast
  if (sleepDebt > 3) {
    forecasts.push({
      type: "warning" as const,
      timeframe: "24-48h",
      title: "Sleep debt building",
      description: `You're ${sleepDebt.toFixed(1)}h behind. Energy and focus will decline without recovery sleep.`,
    });
  } else if (sleepDebt < -2) {
    forecasts.push({
      type: "positive" as const,
      timeframe: "24-48h",
      title: "Sleep surplus",
      description: "You're well-rested. Good window for high-intensity training or demanding tasks.",
    });
  }

  // Stress trend forecast
  if (stressTrend > 15) {
    forecasts.push({
      type: "warning" as const,
      timeframe: "48-72h",
      title: "Stress buildup detected",
      description: "Stress rising fast. Plan recovery time or risk burnout spike by week's end.",
    });
  }

  // High-stress events forecast
  if (highStressEvents.length > 0) {
    forecasts.push({
      type: "warning" as const,
      timeframe: "24-48h",
      title: `${highStressEvents.length} high-demand event${highStressEvents.length > 1 ? 's' : ''} ahead`,
      description: `"${highStressEvents[0].title}" coming up. Prioritize sleep and light activity today.`,
    });
  }

  // Burnout risk forecast
  if (burnoutRisk.level === "Red") {
    forecasts.push({
      type: "critical" as const,
      timeframe: "3-7 days",
      title: "Burnout risk critical",
      description: "Multiple markers in red zone. Take a deload week or expect performance drop.",
    });
  } else if (burnoutRisk.level === "Yellow") {
    forecasts.push({
      type: "info" as const,
      timeframe: "3-7 days",
      title: "Recovery margins tightening",
      description: "You're trending toward burnout. Add extra rest day this week.",
    });
  }

  // Recovery opportunity forecast
  const avgHRV = last7Days.reduce((sum, m) => sum + m.hrv, 0) / last7Days.length;
  if (avgHRV > baseline.hrv * 1.05 && burnoutRisk.level === "Green") {
    forecasts.push({
      type: "positive" as const,
      timeframe: "24-72h",
      title: "Recovery window open",
      description: "Markers are strong. Great time for strength training or HIIT.",
    });
  }

  const typeColors = {
    critical: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-primary/10 text-primary border-primary/20",
    positive: "bg-success/10 text-success border-success/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            What's Coming (24h - 2 weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecasts.length > 0 ? (
            <div className="space-y-3">
              {forecasts.map((forecast, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${typeColors[forecast.type]}`}>
                  <div className="flex items-start gap-2 mb-1">
                    {forecast.type === "critical" && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                    {forecast.type === "warning" && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                    {forecast.type === "positive" && <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold">{forecast.title}</p>
                        <Badge variant="outline" className="text-xs">{forecast.timeframe}</Badge>
                      </div>
                      <p className="text-xs">{forecast.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-success" />
              <p className="text-sm font-medium text-success">All clear ahead</p>
              <p className="text-xs text-muted-foreground mt-1">
                No major risks detected in the next 2 weeks
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
