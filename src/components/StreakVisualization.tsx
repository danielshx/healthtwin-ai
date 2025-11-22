import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Moon, Dumbbell, CheckCircle2, Heart } from "lucide-react";
import { Streak } from "@/types";
import { motion } from "framer-motion";

type StreakVisualizationProps = {
  streaks: Streak[];
};

export function StreakVisualization({ streaks }: StreakVisualizationProps) {
  const getStreakIcon = (type: Streak["type"]) => {
    switch (type) {
      case "sleep":
        return Moon;
      case "workout":
        return Dumbbell;
      case "checkin":
        return CheckCircle2;
      case "recovery":
        return Heart;
    }
  };

  const getStreakLabel = (type: Streak["type"]) => {
    switch (type) {
      case "sleep":
        return "Sleep Quality";
      case "workout":
        return "Workout Consistency";
      case "checkin":
        return "Daily Check-ins";
      case "recovery":
        return "Recovery Priority";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          Habit Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {streaks.map((streak, idx) => {
          const Icon = getStreakIcon(streak.type);
          const isActive = streak.currentStreak > 0;
          
          return (
            <motion.div
              key={streak.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${isActive ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{getStreakLabel(streak.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      Last: {new Date(streak.lastActivityDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Flame className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-background/50 rounded">
                  <p className="text-2xl font-bold text-primary">
                    {streak.currentStreak}
                  </p>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                </div>
                <div className="text-center p-2 bg-background/50 rounded">
                  <p className="text-2xl font-bold">
                    {streak.longestStreak}
                  </p>
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
              </div>

              {/* Visual streak representation */}
              <div className="mt-3 flex gap-1">
                {Array.from({ length: Math.min(streak.currentStreak, 30) }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 flex-1 bg-primary/20 rounded-sm"
                    style={{
                      opacity: 1 - (i / 30) * 0.5,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}

        {streaks.length === 0 && (
          <div className="text-center py-8">
            <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-sm text-muted-foreground">
              Start building your streaks today!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
