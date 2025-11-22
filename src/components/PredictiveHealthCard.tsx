import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { BurnoutPrediction } from "@/types";
import { motion } from "framer-motion";

type PredictiveHealthCardProps = {
  predictions: BurnoutPrediction[];
};

export function PredictiveHealthCard({ predictions }: PredictiveHealthCardProps) {
  const highRiskPredictions = predictions.filter(
    (p) => p.riskLevel === "High" || p.riskLevel === "Critical"
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Critical":
        return "destructive";
      case "High":
        return "destructive";
      case "Medium":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            7-Day Burnout Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {highRiskPredictions.length > 0 ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <p className="text-sm font-medium">
                  {highRiskPredictions.length} high-risk day(s) detected
                </p>
              </div>
              <div className="space-y-3">
                {predictions.slice(0, 5).map((pred, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(pred.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pred.probability}% probability
                        </p>
                      </div>
                    </div>
                    <Badge variant={getRiskColor(pred.riskLevel)}>
                      {pred.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Activity className="w-12 h-12 text-success mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No high-risk days predicted in the next week
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
