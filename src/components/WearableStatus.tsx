import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Watch, Heart, Activity, Wifi, WifiOff } from "lucide-react";
import { WearableData } from "@/types";
import { motion } from "framer-motion";

export function WearableStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState<WearableData | null>(null);

  useEffect(() => {
    // Simulate wearable connection
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    // Simulate real-time data streaming
    const dataInterval = setInterval(() => {
      setLiveData({
        timestamp: new Date().toISOString(),
        hrv: Math.floor(Math.random() * 30) + 40, // 40-70ms
        heartRate: Math.floor(Math.random() * 20) + 60, // 60-80bpm
        isLive: true,
      });
    }, 3000);

    return () => clearInterval(dataInterval);
  }, [isConnected]);

  const getHRVStatus = (hrv: number) => {
    if (hrv >= 60) return { label: "Excellent", color: "text-success" };
    if (hrv >= 50) return { label: "Good", color: "text-primary" };
    if (hrv >= 40) return { label: "Fair", color: "text-warning" };
    return { label: "Low", color: "text-destructive" };
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Watch className="w-5 h-5 text-primary" />
            Live Wearable Data
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Connecting...
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && liveData ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">HRV</p>
                </div>
                <p className="text-3xl font-bold">{liveData.hrv}</p>
                <p className="text-xs">ms</p>
                <p className={`text-xs font-medium mt-1 ${getHRVStatus(liveData.hrv).color}`}>
                  {getHRVStatus(liveData.hrv).label}
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-destructive" />
                  <p className="text-xs text-muted-foreground">Heart Rate</p>
                </div>
                <p className="text-3xl font-bold">{liveData.heartRate}</p>
                <p className="text-xs">bpm</p>
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-destructive rounded-full mt-1"
                />
              </motion.div>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
              <p className="text-sm font-medium">
                {new Date(liveData.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs font-medium mb-1">💡 Real-Time Insights</p>
              <p className="text-xs text-muted-foreground">
                Your current HRV suggests{" "}
                {liveData.hrv >= 50 ? "good recovery - you're ready for training" : "reduced recovery - prioritize rest today"}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Watch className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-30 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Establishing connection to wearable device...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
