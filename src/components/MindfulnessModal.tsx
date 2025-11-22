import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wind, Circle } from "lucide-react";

type MindfulnessModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "breathing" | "body_scan" | "stretch";
};

export function MindfulnessModal({ open, onOpenChange, type = "breathing" }: MindfulnessModalProps) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(180); // 3 minutes

  useEffect(() => {
    if (!open) return;

    const cyclePhases = () => {
      setPhase("inhale");
      setTimeout(() => setPhase("hold"), 4000);
      setTimeout(() => setPhase("exhale"), 8000);
      setTimeout(() => cyclePhases(), 12000);
    };

    cyclePhases();

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          onOpenChange(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [open, onOpenChange]);

  const instructions = {
    breathing: {
      title: "Box Breathing",
      description: "Breathe in sync with the circle. 4 seconds each phase.",
      phases: {
        inhale: "Breathe In",
        hold: "Hold",
        exhale: "Breathe Out",
      },
    },
    body_scan: {
      title: "Body Scan",
      description: "Notice sensations in each part of your body from head to toe.",
      phases: {
        inhale: "Relax your shoulders",
        hold: "Notice your chest",
        exhale: "Release tension",
      },
    },
    stretch: {
      title: "Quick Stretch",
      description: "Gentle movements to release physical tension.",
      phases: {
        inhale: "Reach up",
        hold: "Hold the stretch",
        exhale: "Release down",
      },
    },
  };

  const currentType = instructions[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-primary" />
            {currentType.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground text-center">{currentType.description}</p>

          <div className="flex items-center justify-center py-8">
            <motion.div
              className="relative"
              animate={{
                scale: phase === "inhale" ? 1.5 : phase === "hold" ? 1.5 : 1,
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
              }}
            >
              <Circle className="w-32 h-32 text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-medium">{currentType.phases[phase]}</p>
              </div>
            </motion.div>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold">{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}</p>
            <p className="text-xs text-muted-foreground">remaining</p>
          </div>

          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            End Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
