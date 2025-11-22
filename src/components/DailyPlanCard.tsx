import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { DailyPlan } from "@/types";

type DailyPlanCardProps = {
  plan: DailyPlan;
};

const intensityColors = {
  Rest: "bg-muted text-muted-foreground",
  Light: "bg-primary/10 text-primary",
  Moderate: "bg-secondary/10 text-secondary",
  HIIT: "bg-destructive/10 text-destructive",
  Strength: "bg-accent/10 text-accent",
};

export function DailyPlanCard({ plan }: DailyPlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Today's Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Top Priorities</p>
            <ul className="space-y-2">
              {plan.priorities.map((priority, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold">{idx + 1}.</span>
                  {priority}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Training Intensity
            </p>
            <Badge className={intensityColors[plan.trainingIntensity]}>
              {plan.trainingIntensity}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Micro-Interventions</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {plan.microInterventions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-1">Sleep Advice</p>
            <p className="text-sm text-muted-foreground">{plan.sleepAdvice}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
