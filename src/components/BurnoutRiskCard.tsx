import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BurnoutRisk } from "@/types";

type BurnoutRiskCardProps = {
  risk: BurnoutRisk;
};

export function BurnoutRiskCard({ risk }: BurnoutRiskCardProps) {
  const colors = {
    Green: { bg: "bg-success/10", border: "border-success", text: "text-success", icon: Shield },
    Yellow: { bg: "bg-warning/10", border: "border-warning", text: "text-warning", icon: AlertCircle },
    Red: { bg: "bg-destructive/10", border: "border-destructive", text: "text-destructive", icon: AlertTriangle },
  };

  const config = colors[risk.level];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className={`shadow-card border-2 ${config.border}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.text}`} />
            Burnout Risk: <span className={config.text}>{risk.level}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-xl ${config.bg}`}>
            <p className="font-medium mb-2">Why {risk.level}?</p>
            <ul className="space-y-1 text-sm">
              {risk.rationale.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={`w-1.5 h-1.5 mt-2 rounded-full ${config.text}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          {risk.actions.length > 0 && (
            <div>
              <p className="font-medium mb-2">Recommended Actions</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {risk.actions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
