import { motion } from "framer-motion";
import { Smile, Meh, Frown, AlertTriangle } from "lucide-react";

type TwinAvatarProps = {
  readiness: number;
  burnoutLevel: "Green" | "Yellow" | "Red";
};

export function TwinAvatar({ readiness, burnoutLevel }: TwinAvatarProps) {
  let state: "fresh" | "neutral" | "tired" | "overloaded" = "neutral";
  let icon = <Meh className="w-16 h-16" />;
  let bgGradient = "bg-gradient-to-br from-primary/20 to-primary/10";

  if (burnoutLevel === "Red" || readiness < 40) {
    state = "overloaded";
    icon = <AlertTriangle className="w-16 h-16 text-destructive" />;
    bgGradient = "bg-gradient-to-br from-destructive/30 to-destructive/10";
  } else if (burnoutLevel === "Yellow" || readiness < 60) {
    state = "tired";
    icon = <Frown className="w-16 h-16 text-warning" />;
    bgGradient = "bg-gradient-to-br from-warning/30 to-warning/10";
  } else if (readiness >= 80) {
    state = "fresh";
    icon = <Smile className="w-16 h-16 text-success" />;
    bgGradient = "bg-gradient-to-br from-success/30 to-success/10";
  }

  return (
    <motion.div
      className={`relative flex items-center justify-center w-32 h-32 rounded-3xl ${bgGradient} shadow-card`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <motion.div
        animate={{
          scale: state === "fresh" ? [1, 1.1, 1] : state === "overloaded" ? [1, 0.95, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        {icon}
      </motion.div>
      <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-card rounded-full shadow-soft text-xs font-medium border border-border">
        {state}
      </div>
    </motion.div>
  );
}
