import { useEffect, useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { PageTransition } from "@/components/PageTransition";
import { StreakVisualization } from "@/components/StreakVisualization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadMetrics, loadCheckIns } from "@/lib/storage";
import { Streak } from "@/types";
import { Trophy, TrendingUp } from "lucide-react";

export default function Streaks() {
  const [streaks, setStreaks] = useState<Streak[]>([]);

  useEffect(() => {
    const metrics = loadMetrics();
    const checkIns = loadCheckIns();

    // Calculate streaks
    const calculatedStreaks: Streak[] = [];

    // Sleep streak (7+ hours)
    const sleepStreak = calculateStreak(
      metrics,
      (m) => m.sleepHours >= 7,
      "sleep"
    );
    calculatedStreaks.push(sleepStreak);

    // Workout streak (30+ minutes)
    const workoutStreak = calculateStreak(
      metrics,
      (m) => m.workoutMinutes >= 30,
      "workout"
    );
    calculatedStreaks.push(workoutStreak);

    // Check-in streak
    const checkinStreak: Streak = {
      type: "checkin",
      currentStreak: checkIns.length > 0 ? calculateConsecutiveDays(checkIns.map(c => c.date)) : 0,
      longestStreak: checkIns.length,
      lastActivityDate: checkIns.length > 0 ? checkIns[checkIns.length - 1].date : new Date().toISOString(),
    };
    calculatedStreaks.push(checkinStreak);

    // Recovery streak (HRV above baseline)
    const avgHRV = metrics.reduce((sum, m) => sum + m.hrv, 0) / metrics.length;
    const recoveryStreak = calculateStreak(
      metrics,
      (m) => m.hrv >= avgHRV * 0.95,
      "recovery"
    );
    calculatedStreaks.push(recoveryStreak);

    setStreaks(calculatedStreaks);
  }, []);

  const calculateStreak = (
    data: any[],
    condition: (item: any) => boolean,
    type: Streak["type"]
  ): Streak => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastActivityDate = new Date().toISOString();

    for (let i = data.length - 1; i >= 0; i--) {
      if (condition(data[i])) {
        tempStreak++;
        if (i === data.length - 1) {
          currentStreak = tempStreak;
          lastActivityDate = data[i].date;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
      type,
      currentStreak,
      longestStreak,
      lastActivityDate,
    };
  };

  const calculateConsecutiveDays = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    
    const sortedDates = dates.sort((a, b) => b.localeCompare(a));
    let streak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const dayDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const totalStreakDays = streaks.reduce((sum, s) => sum + s.currentStreak, 0);
  const longestOverall = Math.max(...streaks.map(s => s.longestStreak));

  return (
    <MobileLayout title="Habit Streaks">
      <PageTransition>
        <div className="space-y-4 pb-20">
          <Card className="shadow-card bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Streak Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{totalStreakDays}</p>
                  <p className="text-sm text-muted-foreground">Active Days</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{longestOverall}</p>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Streak Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Consistency beats intensity for building lasting habits</li>
                <li>• Track multiple streaks to stay motivated across areas</li>
                <li>• Don't break the chain - even small actions count</li>
                <li>• Celebrate milestones to reinforce positive behavior</li>
              </ul>
            </CardContent>
          </Card>

          <StreakVisualization streaks={streaks} />
        </div>
      </PageTransition>
    </MobileLayout>
  );
}
