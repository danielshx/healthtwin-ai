import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

type ReadinessCardProps = {
  score: number;
  explanation: string[];
};

export function ReadinessCard({ score, explanation }: ReadinessCardProps) {
  let color = "bg-success";
  if (score < 40) color = "bg-destructive";
  else if (score < 70) color = "bg-warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{score}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <Progress value={score} className="h-3" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Why this score?</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {explanation.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={`w-2 h-2 mt-1.5 rounded-full ${color}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
