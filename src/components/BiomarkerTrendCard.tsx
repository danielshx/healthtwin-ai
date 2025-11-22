import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Heart, Activity, Moon } from "lucide-react";
import { BiomarkerTrend } from "@/types";
import { motion } from "framer-motion";

type BiomarkerTrendCardProps = {
  trends: BiomarkerTrend[];
};

export function BiomarkerTrendCard({ trends }: BiomarkerTrendCardProps) {
  const getTrendIcon = (trend: BiomarkerTrend["trend"]) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-success" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getMetricIcon = (metric: string) => {
    if (metric.toLowerCase().includes("hrv")) return Heart;
    if (metric.toLowerCase().includes("sleep")) return Moon;
    return Activity;
  };

  const getTrendColor = (trend: BiomarkerTrend["trend"]) => {
    switch (trend) {
      case "improving":
        return "default";
      case "declining":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Biomarker Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trends.length > 0 ? (
          trends.map((trend, idx) => {
            const MetricIcon = getMetricIcon(trend.metric);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="p-4 bg-muted/30 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MetricIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{trend.metric}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(trend.startDate).toLocaleDateString()} -{" "}
                        {new Date(trend.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(trend.trend)}
                    <Badge variant={getTrendColor(trend.trend)}>
                      {trend.trend}
                    </Badge>
                  </div>
                </div>

                <div className="pl-13">
                  <p className="text-sm mb-2">{trend.story}</p>
                  <div className="p-2 bg-primary/5 rounded text-xs text-muted-foreground">
                    <span className="font-medium">Recommendation: </span>
                    {trend.recommendation}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-sm text-muted-foreground">
              Not enough data yet to detect biomarker trends
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
