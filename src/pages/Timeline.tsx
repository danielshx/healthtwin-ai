import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadMetrics } from "@/lib/storage";
import { DailyMetrics } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Moon, Dumbbell, Coffee, Book } from "lucide-react";
import { motion } from "framer-motion";

export default function Timeline() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);

  useEffect(() => {
    const allMetrics = loadMetrics();
    setMetrics(allMetrics.slice(-7)); // Last 7 days
  }, []);

  const getTimeBlocks = (metric: DailyMetrics) => {
    const blocks = [];
    
    // Sleep block
    blocks.push({
      time: "11:00 PM - 7:00 AM",
      type: "sleep",
      icon: Moon,
      label: `Sleep: ${metric.sleepHours.toFixed(1)}hrs`,
      color: "bg-accent/20 border-accent",
    });

    // Morning
    blocks.push({
      time: "7:00 AM - 12:00 PM",
      type: "morning",
      icon: Coffee,
      label: "Morning routine & classes",
      color: "bg-muted border-border",
    });

    // Workout (if any)
    if (metric.workoutMinutes > 0) {
      blocks.push({
        time: "12:00 PM - 1:00 PM",
        type: "workout",
        icon: Dumbbell,
        label: `Workout: ${metric.workoutMinutes}min`,
        color: "bg-secondary/20 border-secondary",
      });
    }

    // Afternoon study
    blocks.push({
      time: "2:00 PM - 6:00 PM",
      type: "study",
      icon: Book,
      label: "Study & university",
      color: "bg-muted border-border",
    });

    return blocks;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Timeline</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-4">
                    {new Date(metric.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>

                  <div className="space-y-3">
                    {getTimeBlocks(metric).map((block, blockIdx) => {
                      const Icon = block.icon;
                      return (
                        <div
                          key={blockIdx}
                          className={`flex items-start gap-4 p-4 rounded-xl border-l-4 ${block.color}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">{block.time}</p>
                            <p className="font-medium">{block.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Stress</p>
                      <p className="text-lg font-bold">{metric.stressScore.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mood</p>
                      <p className="text-lg font-bold">{metric.moodScore}/5</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Energy</p>
                      <p className="text-lg font-bold">{metric.energyScore}/5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
