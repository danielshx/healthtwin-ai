import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Moon, Dumbbell, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { AgentRecommendation } from "@/types";

const agentIcons = {
  PlannerAgent: Brain,
  SleepAgent: Moon,
  FitnessCoachAgent: Dumbbell,
  BurnoutGuardianAgent: Shield,
};

const agentColors = {
  PlannerAgent: "bg-accent/10 text-accent",
  SleepAgent: "bg-primary/10 text-primary",
  FitnessCoachAgent: "bg-secondary/10 text-secondary",
  BurnoutGuardianAgent: "bg-warning/10 text-warning",
};

type AgentRecommendationCardProps = {
  recommendation: AgentRecommendation;
  onAction?: (recId: string, action: "accept" | "snooze" | "reject") => void;
  delay?: number;
};

export function AgentRecommendationCard({ recommendation, onAction, delay = 0 }: AgentRecommendationCardProps) {
  const Icon = agentIcons[recommendation.agent];
  const colorClass = agentColors[recommendation.agent];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="shadow-soft hover:shadow-card transition-shadow border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{recommendation.title}</h3>
                <Badge variant={recommendation.priority === "high" ? "destructive" : "secondary"} className="shrink-0">
                  {recommendation.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
              <p className="text-xs text-muted-foreground">from {recommendation.agent}</p>
              
              {recommendation.actions && recommendation.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {recommendation.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={action.kind === "accept" ? "default" : "outline"}
                      onClick={() => onAction?.(recommendation.id, action.kind)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
