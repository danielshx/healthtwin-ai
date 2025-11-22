import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, MapPin, Clock, Thermometer } from "lucide-react";
import { ContextData } from "@/types";
import { motion } from "framer-motion";

type ContextAwarenessCardProps = {
  context: ContextData;
};

export function ContextAwarenessCard({ context }: ContextAwarenessCardProps) {
  const getWeatherIcon = (condition: string) => {
    const icons: Record<string, string> = {
      sunny: "☀️",
      cloudy: "☁️",
      rainy: "🌧️",
      windy: "💨",
    };
    return icons[condition] || "🌤️";
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
            <Cloud className="w-5 h-5 text-primary" />
            Current Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {context.weather && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Temperature</p>
                </div>
                <p className="text-2xl font-bold">{context.weather.temp}°C</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Cloud className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Condition</p>
                </div>
                <p className="text-2xl">{getWeatherIcon(context.weather.condition)}</p>
                <p className="text-xs capitalize">{context.weather.condition}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Time of Day:</span>
              <span className="font-medium capitalize">{context.timeOfDay}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Season:</span>
              <span className="font-medium">{context.season}</span>
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Smart Insight</p>
            <p className="text-sm">
              {context.timeOfDay === "morning" && "Perfect time for high-intensity training"}
              {context.timeOfDay === "afternoon" && "Good for moderate workouts or meetings"}
              {context.timeOfDay === "evening" && "Focus on recovery and wind-down activities"}
              {context.timeOfDay === "night" && "Prepare for quality rest and recovery"}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
