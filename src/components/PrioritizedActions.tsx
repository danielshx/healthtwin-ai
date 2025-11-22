import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, Ban } from "lucide-react";
import { motion } from "framer-motion";
import { DailyPlan } from "@/types";

type PrioritizedActionsProps = {
  plan: DailyPlan;
};

export function PrioritizedActions({ plan }: PrioritizedActionsProps) {
  // Split interventions into priorities
  const doNow = plan.microInterventions.slice(0, 2);
  const canWait = plan.microInterventions.slice(2, 4);
  const avoid = [];

  // Add avoid items based on training intensity
  if (plan.trainingIntensity === "Rest") {
    avoid.push("Any high-intensity workouts");
    avoid.push("Late-night activities");
  } else if (plan.trainingIntensity === "HIIT") {
    avoid.push("Back-to-back intense sessions");
    avoid.push("Skipping warm-up or cool-down");
  }

  // Add avoid items from priorities if they mention risks
  plan.priorities.forEach(priority => {
    if (priority.toLowerCase().includes("avoid")) {
      avoid.push(priority.replace(/^.*avoid\s+/i, ""));
    }
  });

  // Default avoid if none found
  if (avoid.length === 0) {
    avoid.push("Skipping meals before workouts");
    avoid.push("Late caffeine (after 2pm)");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            What to Do (Prioritized)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Do Now */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-destructive text-destructive-foreground">Do Now</Badge>
              <p className="text-xs text-muted-foreground">Highest impact actions</p>
            </div>
            <div className="space-y-2">
              {doNow.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-destructive/5 rounded-lg border-l-2 border-destructive">
                  <span className="text-destructive font-bold text-sm mt-0.5">→</span>
                  <p className="text-sm flex-1">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Can Wait */}
          {canWait.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">Can Wait</Badge>
                <p className="text-xs text-muted-foreground">Do when you have time</p>
              </div>
              <div className="space-y-2">
                {canWait.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm flex-1">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avoid */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-muted-foreground/30">Avoid Today</Badge>
              <p className="text-xs text-muted-foreground">Will hurt more than help</p>
            </div>
            <div className="space-y-2">
              {avoid.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg border border-muted-foreground/20">
                  <Ban className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm flex-1 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
