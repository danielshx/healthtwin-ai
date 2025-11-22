import { useEffect, useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadCalendarEvents } from "@/lib/storage";
import { CalendarEvent } from "@/types";
import { Calendar as CalendarIcon, Clock, MapPin, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  useEffect(() => {
    const allEvents = loadCalendarEvents();
    setEvents(allEvents);
  }, []);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => {
      const eventDate = event.start.split("T")[0];
      return eventDate === dateStr;
    }).sort((a, b) => a.start.localeCompare(b.start));
  };

  const getEventsForWeek = (startDate: Date) => {
    const weekEvents: { date: Date; events: CalendarEvent[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      weekEvents.push({
        date,
        events: getEventsForDate(date),
      });
    }
    return weekEvents;
  };

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(newDate);
  };

  const getEventTypeColor = (title: string) => {
    if (title.toLowerCase().includes("exam") || title.toLowerCase().includes("test")) {
      return "destructive";
    }
    if (title.toLowerCase().includes("workout") || title.toLowerCase().includes("gym") || 
        title.toLowerCase().includes("run") || title.toLowerCase().includes("yoga") ||
        title.toLowerCase().includes("training") || title.toLowerCase().includes("hiit")) {
      return "default";
    }
    if (title.toLowerCase().includes("study") || title.toLowerCase().includes("presentation")) {
      return "secondary";
    }
    return "outline";
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (eventStart: string) => {
    return new Date(eventStart) < new Date();
  };

  const currentDayEvents = getEventsForDate(selectedDate);
  const weekEvents = getEventsForWeek(selectedDate);

  return (
    <MobileLayout title="Calendar">
      <PageTransition>
        <div className="space-y-4 pb-20">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {viewMode === "day" ? "Daily Schedule" : "Week View"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                  >
                    Day
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => viewMode === "day" ? navigateDay("prev") : navigateWeek("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center">
                  <p className="text-lg font-bold">
                    {selectedDate.toLocaleDateString("en-US", { 
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric" 
                    })}
                  </p>
                  {isToday(selectedDate) && (
                    <Badge className="mt-1">Today</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => viewMode === "day" ? navigateDay("next") : navigateWeek("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {viewMode === "day" ? (
                <div className="space-y-3">
                  {currentDayEvents.length > 0 ? (
                    currentDayEvents.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className={`p-4 rounded-lg border ${
                          isPast(event.start) ? "bg-muted/30 opacity-60" : "bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getEventTypeColor(event.title) as any}>
                                {event.title}
                              </Badge>
                              {isPast(event.start) && (
                                <Badge variant="outline" className="text-xs">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.start).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                                {event.end && (
                                  <> - {new Date(event.end).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}</>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}
                        {event.description && (
                          <div className="flex items-start gap-1 text-xs text-muted-foreground">
                            <FileText className="w-3 h-3 mt-0.5" />
                            {event.description}
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30" />
                      <p className="text-sm text-muted-foreground">No events scheduled</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {weekEvents.map((day, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={`p-3 rounded-lg ${
                        isToday(day.date) ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <Badge variant="outline">{day.events.length} events</Badge>
                      </div>
                      {day.events.length > 0 && (
                        <div className="space-y-1">
                          {day.events.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs flex items-center gap-2 text-muted-foreground"
                            >
                              <Clock className="w-3 h-3" />
                              {new Date(event.start).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}{" "}
                              - {event.title}
                            </div>
                          ))}
                          {day.events.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{day.events.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">
                💡 <span className="font-medium">Calendar Integration</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Your schedule automatically influences sleep recommendations, training suggestions,
                and stress management alerts. Events like early mornings and exams trigger
                proactive health adjustments.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </MobileLayout>
  );
}
