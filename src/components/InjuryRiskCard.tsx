import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Activity } from "lucide-react";
import { InjuryRisk } from "@/types";
import { motion } from "framer-motion";

type InjuryRiskCardProps = {
  risk: InjuryRisk;
};

export function InjuryRiskCard({ risk }: InjuryRiskCardProps) {
  const getRiskColor = (level: InjuryRisk["level"]) => {
    switch (level) {
      case "Critical":
        return { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", badge: "destructive" };
      case "High":
        return { bg: "bg-destructive/5", text: "text-destructive", border: "border-destructive/10", badge: "destructive" };
      case "Medium":
        return { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", badge: "secondary" };
      default:
        return { bg: "bg-success/10", text: "text-success", border: "border-success/20", badge: "default" };
    }
  };

  const colors = getRiskColor(risk.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`shadow-card border ${colors.border}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {risk.level === "Low" ? (
                <Shield className={`w-5 h-5 ${colors.text}`} />
              ) : (
                <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
              )}
              Injury Risk Assessment
            </div>
            <Badge variant={colors.badge as any}>{risk.level} Risk</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 ${colors.bg} rounded-lg`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Risk Score</p>
              <p className={`text-3xl font-bold ${colors.text}`}>{risk.score}</p>
            </div>
            <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk.score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${risk.level === "Low" ? "bg-success" : risk.level === "Medium" ? "bg-warning" : "bg-destructive"}`}
              />
            </div>
          </div>

          {risk.affectedAreas.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Potentially Affected Areas</p>
              <div className="flex flex-wrap gap-2">
                {risk.affectedAreas.map((area, idx) => (
                  <Badge key={idx} variant="outline">
                    <Activity className="w-3 h-3 mr-1" />
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {risk.factors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Contributing Factors</p>
              <ul className="space-y-1">
                {risk.factors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className={`w-2 h-2 mt-1.5 rounded-full ${risk.level === "Low" ? "bg-success" : "bg-destructive"}`} />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {risk.preventiveActions.length > 0 && (
            <div className={`p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
              <p className="text-sm font-medium mb-2">Preventive Actions</p>
              <ul className="space-y-1">
                {risk.preventiveActions.map((action, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">✓</span>
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
