import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type MiniChartProps = {
  title: string;
  data: { date: string; value: number }[];
  color?: string;
  icon?: LucideIcon;
  unit?: string;
};

export function MiniChart({ title, data, color = "hsl(var(--primary))", icon: Icon, unit }: MiniChartProps) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2} 
              dot={false} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value}${unit || ""}`, title]}
            />
            <XAxis 
              dataKey="date" 
              hide 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
