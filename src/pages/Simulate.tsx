import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadProfile, loadMetrics } from "@/lib/storage";
import { computeBaseline, simulateWhatIf } from "@/lib/agentLoop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { UserProfile, DailyMetrics, Baseline } from "@/types";

export default function Simulate() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [today, setToday] = useState<DailyMetrics | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("zone2_run");
  const [result, setResult] = useState<any>(null);

  const options = [
    { value: "zone2_run", label: "30min Zone-2 Run" },
    { value: "hiit_session", label: "30min HIIT Session" },
    { value: "strength_session", label: "45min Strength Training" },
    { value: "rest_day", label: "Full Rest Day" },
    { value: "extra_sleep", label: "Extra 1hr Sleep Tonight" },
  ];

  useEffect(() => {
    const prof = loadProfile();
    setProfile(prof);

    const metrics = loadMetrics();
    const todayMetric = metrics[metrics.length - 1];
    setToday(todayMetric);

    const base = computeBaseline(metrics);
    setBaseline(base);
  }, []);

  const handleSimulate = () => {
    if (!profile || !baseline || !today) return;

    const option = options.find((o) => o.value === selectedOption);
    if (!option) return;

    const simulation = simulateWhatIf(option.label, profile, baseline, today);
    setResult(simulation);
  };

  if (!profile || !baseline || !today) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">What-If Simulator</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Choose Your Action</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2 mb-3">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-base cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button className="mt-6 w-full" size="lg" onClick={handleSimulate}>
                Simulate Impact
              </Button>
            </CardContent>
          </Card>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid md:grid-cols-3 gap-4"
            >
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Readiness Impact</p>
                    {result.readinessDelta >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${result.readinessDelta >= 0 ? "text-success" : "text-destructive"}`}>
                    {result.readinessDelta > 0 ? "+" : ""}
                    {result.readinessDelta}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">points tomorrow</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Sleep Impact</p>
                    {result.sleepDelta >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${result.sleepDelta >= 0 ? "text-success" : "text-destructive"}`}>
                    {result.sleepDelta > 0 ? "+" : ""}
                    {result.sleepDelta.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">hours tonight</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Recovery Impact</p>
                    {result.recoveryDelta >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <p className={`text-3xl font-bold ${result.recoveryDelta >= 0 ? "text-success" : "text-destructive"}`}>
                    {result.recoveryDelta > 0 ? "+" : ""}
                    {result.recoveryDelta}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">recovery points</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-card bg-accent/5 border-accent">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium mb-2">AI Explanation</p>
                  <p className="text-sm text-muted-foreground">{result.explanation}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
