import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { CalendarEvent } from "@/types";
import { motion } from "framer-motion";

type CalendarIntegrationCardProps = {
  events: CalendarEvent[];
  impact?: {
    sleepRecommendation?: string;
    stressWarning?: string;
    trainingAdjustment?: string;
  };
};

export function CalendarIntegrationCard({ events, impact }: CalendarIntegrationCardProps) {
  const upcomingEvents = events
    .filter((e) => new Date(e.start) > new Date())
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 5);

  const earlyMorningEvent = upcomingEvents.find((e) => {
    const hour = new Date(e.start).getHours();
    return hour < 7;
  });

  const examEvent = upcomingEvents.find((e) =>
    e.title.toLowerCase().includes("exam") || e.title.toLowerCase().includes("test")
  );

  const workoutEvents = upcomingEvents.filter((e) =>
    e.title.toLowerCase().includes("workout") ||
    e.title.toLowerCase().includes("gym") ||
    e.title.toLowerCase().includes("training")
  );

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Calendar Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingEvents.length > 0 ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Upcoming Events</p>
              {upcomingEvents.slice(0, 3).map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-2 bg-muted/30 rounded-lg flex items-start gap-2"
                >
                  <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(event.start).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Automatic adjustments based on calendar */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Automatic Adjustments</p>
              
              {earlyMorningEvent && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Early Wake-Up Detected</p>
                    <p className="text-xs text-muted-foreground">
                      Sleep timer adjusted for {earlyMorningEvent.title}. Recommended bedtime moved earlier.
                    </p>
                  </div>
                </div>
              )}

              {examEvent && (
                <div className="p-3 bg-warning/5 rounded-lg border border-warning/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">High-Stress Event Approaching</p>
                    <p className="text-xs text-muted-foreground">
                      {examEvent.title} detected. Recovery priority increased, training intensity will be reduced.
                    </p>
                  </div>
                </div>
              )}

              {workoutEvents.length > 0 && (
                <div className="p-3 bg-success/5 rounded-lg border border-success/20 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Scheduled Workouts Detected</p>
                    <p className="text-xs text-muted-foreground">
                      {workoutEvents.length} workout(s) planned. Sleep recommendations optimized for recovery.
                    </p>
                  </div>
                </div>
              )}

              {!earlyMorningEvent && !examEvent && workoutEvents.length === 0 && (
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">
                    No special adjustments needed for upcoming events
                  </p>
                </div>
              )}
            </div>

            {impact && (
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="text-xs font-medium mb-2">AI Insights</p>
                {impact.sleepRecommendation && (
                  <p className="text-xs text-muted-foreground mb-1">
                    💤 {impact.sleepRecommendation}
                  </p>
                )}
                {impact.stressWarning && (
                  <p className="text-xs text-muted-foreground mb-1">
                    ⚠️ {impact.stressWarning}
                  </p>
                )}
                {impact.trainingAdjustment && (
                  <p className="text-xs text-muted-foreground">
                    💪 {impact.trainingAdjustment}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
            <p className="text-sm text-muted-foreground">
              No upcoming events in your calendar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
