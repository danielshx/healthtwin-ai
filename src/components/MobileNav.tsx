import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, Shield, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/today", icon: Target, label: "Today" },
  { path: "/recovery", icon: Shield, label: "Recovery" },
  { path: "/coach", icon: MessageCircle, label: "Coach" },
  { path: "/settings", icon: User, label: "Settings" },
];

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
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
      </div>
    </nav>
  );
}
