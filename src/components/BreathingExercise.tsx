import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type BreathingExerciseProps = {
  type: "coherent" | "box" | "478";
  duration?: number; // in minutes
  onComplete?: () => void;
};

export function BreathingExercise({ type, duration = 5, onComplete }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "pause">("inhale");
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [cycleCount, setCycleCount] = useState(0);

  const patterns = {
    coherent: { inhale: 5, hold: 0, exhale: 5, pause: 0 }, // 5-5 breathing
    box: { inhale: 4, hold: 4, exhale: 4, pause: 4 }, // Box breathing
    "478": { inhale: 4, hold: 7, exhale: 8, pause: 0 }, // 4-7-8 breathing
  };

  const currentPattern = patterns[type];

  useEffect(() => {
    if (!isActive) return;

    const phaseTimer = setTimeout(() => {
      if (phase === "inhale" && currentPattern.hold > 0) setPhase("hold");
      else if ((phase === "inhale" && currentPattern.hold === 0) || phase === "hold")
        setPhase("exhale");
      else if (phase === "exhale" && currentPattern.pause > 0) setPhase("pause");
      else {
        setPhase("inhale");
        setCycleCount((c) => c + 1);
      }
    }, currentPattern[phase] * 1000);

    return () => clearTimeout(phaseTimer);
  }, [isActive, phase, currentPattern]);

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const countdown = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          setIsActive(false);
          onComplete?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isActive, timeRemaining, onComplete]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("inhale");
    setTimeRemaining(duration * 60);
    setCycleCount(0);
  };

  const getPhaseInstructions = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "pause":
        return "Pause";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-primary" />
          {type === "coherent" && "Coherent Breathing (5-5)"}
          {type === "box" && "Box Breathing (4-4-4-4)"}
          {type === "478" && "4-7-8 Breathing"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <motion.div
                className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                animate={{
                  scale: phase === "inhale" ? 1.2 : phase === "exhale" ? 0.8 : 1,
                }}
                transition={{ duration: currentPattern[phase] }}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold mb-2">{getPhaseInstructions()}</p>
                  <p className="text-5xl font-bold text-primary">
                    {currentPattern[phase]}s
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Time Remaining</p>
            <p className="text-xl font-bold">{formatTime(timeRemaining)}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Cycles</p>
            <p className="text-xl font-bold">{cycleCount}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleToggle}
            className="flex-1"
            variant={isActive ? "secondary" : "default"}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs font-medium mb-1">Benefits:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {type === "coherent" && (
              <>
                <li>• Balances autonomic nervous system</li>
                <li>• Improves HRV and recovery</li>
                <li>• Reduces stress and anxiety</li>
              </>
            )}
            {type === "box" && (
              <>
                <li>• Calms the mind quickly</li>
                <li>• Enhances focus and concentration</li>
                <li>• Used by Navy SEALs for stress control</li>
              </>
            )}
            {type === "478" && (
              <>
                <li>• Promotes deep relaxation</li>
                <li>• Helps with falling asleep</li>
                <li>• Reduces anxiety and tension</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
