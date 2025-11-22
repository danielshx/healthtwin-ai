import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, Shield, MessageCircle, MoreHorizontal, TrendingUp, Activity, BarChart3, Users, Moon, Wind, Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/today", icon: Target, label: "Today" },
  { path: "/recovery", icon: Shield, label: "Recovery" },
  { path: "/coach", icon: MessageCircle, label: "Coach" },
];

const moreNavItems = [
  { path: "/sleep-negotiator", icon: Moon, label: "Sleep Timer" },
  { path: "/predictions", icon: TrendingUp, label: "Predictions" },
  { path: "/breathing", icon: Wind, label: "Breathing" },
  { path: "/streaks", icon: Flame, label: "Streaks" },
  { path: "/advanced", icon: Zap, label: "Advanced" },
  { path: "/timeline", icon: Activity, label: "Timeline" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/simulate", icon: Activity, label: "What-If" },
  { path: "/social", icon: Users, label: "Social" },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 relative transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-6 h-6", isActive && "scale-110")} />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span className={cn("text-xs font-medium", isActive && "text-primary")}>{item.label}</span>
            </button>
          );
        })}

        {/* More Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative transition-colors text-muted-foreground">
              <MoreHorizontal className="w-6 h-6" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-6 mb-4">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => handleNavigate(item.path)}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                );
              })}
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => handleNavigate("/settings")}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
