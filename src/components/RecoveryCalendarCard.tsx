import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { RecoveryPrediction } from "@/types";
import { motion } from "framer-motion";

type RecoveryCalendarCardProps = {
  prediction: RecoveryPrediction;
};

export function RecoveryCalendarCard({ prediction }: RecoveryCalendarCardProps) {
  const getDaysUntilRecovery = () => {
    const target = new Date(prediction.fullRecoveryDate);
    const today = new Date(prediction.date);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysUntilRecovery = getDaysUntilRecovery();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Recovery Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Current Recovery</p>
              <p className="text-3xl font-bold text-primary">
                {prediction.currentRecoveryPercent}%
              </p>
              <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.currentRecoveryPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Full Recovery In</p>
              <p className="text-3xl font-bold">{daysUntilRecovery}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
          </div>

          {prediction.deloadWeekRecommended && (
            <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium">Deload Week Recommended</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Consider reducing training volume by 40-50% next week to optimize long-term progress
                </p>
              </div>
            </div>
          )}

          {prediction.factors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Recovery Factors
              </p>
              <ul className="space-y-1">
                {prediction.factors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-primary/50" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Predicted Full Recovery</p>
            <p className="text-sm font-medium">
              {new Date(prediction.fullRecoveryDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
