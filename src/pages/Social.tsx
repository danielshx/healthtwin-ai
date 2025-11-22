import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Flame, Heart, Award, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Social() {
  const navigate = useNavigate();

  const achievements = [
    { id: "1", title: "7-Day Streak", icon: Flame, color: "text-secondary", earned: true },
    { id: "2", title: "Sleep Champion", icon: Award, color: "text-accent", earned: true },
    { id: "3", title: "Recovery Master", icon: Heart, color: "text-success", earned: false },
    { id: "4", title: "Consistency King", icon: Trophy, color: "text-primary", earned: false },
  ];

  const weeklyStatus = {
    readinessAvg: 78,
    sleepQuality: 85,
    trainingDays: 4,
    recoveryDays: 3,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Social & Motivation</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Weekly Share Card */}
          <Card className="shadow-card bg-gradient-wellness text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Weekly Status</span>
                <Share2 className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-90">Avg Readiness</p>
                  <p className="text-3xl font-bold">{weeklyStatus.readinessAvg}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Sleep Quality</p>
                  <p className="text-3xl font-bold">{weeklyStatus.sleepQuality}%</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Training Days</p>
                  <p className="text-3xl font-bold">{weeklyStatus.trainingDays}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Recovery Days</p>
                  <p className="text-3xl font-bold">{weeklyStatus.recoveryDays}</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                Share with Accountability Buddy
              </Button>
            </CardContent>
          </Card>

          {/* Streaks */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-secondary" />
                Current Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Training Consistency</p>
                  <p className="text-sm text-muted-foreground">3 workouts per week</p>
                </div>
                <Badge className="bg-secondary text-secondary-foreground">7 days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Recovery Streak</p>
                  <p className="text-sm text-muted-foreground">Agent-recommended rest days taken</p>
                </div>
                <Badge className="bg-success text-success-foreground">12 days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Sleep Target</p>
                  <p className="text-sm text-muted-foreground">7.5+ hours per night</p>
                </div>
                <Badge className="bg-accent text-accent-foreground">5 days</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.05 }}
                      className={`p-4 rounded-2xl text-center ${
                        achievement.earned ? "bg-primary/10" : "bg-muted/50 opacity-50"
                      }`}
                    >
                      <Icon className={`w-12 h-12 mx-auto mb-2 ${achievement.earned ? achievement.color : "text-muted-foreground"}`} />
                      <p className="text-sm font-medium">{achievement.title}</p>
                      {achievement.earned && (
                        <Badge variant="outline" className="mt-2">
                          Earned
                        </Badge>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Buddy Message */}
          <Card className="shadow-card bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Message from your Buddy</p>
                  <p className="text-sm text-muted-foreground">
                    "Great job this week! Your consistency is inspiring. Keep prioritizing recovery and you'll hit your
                    goals. Let's catch up after your next rest day! 💪"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
