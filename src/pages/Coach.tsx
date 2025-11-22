import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoachSelector } from "@/components/CoachSelector";
import { PageTransition } from "@/components/PageTransition";
import { Send, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { loadCoach } from "@/lib/storage";
import { CoachPersonality, COACH_PROFILES } from "@/types/coach";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function Coach() {
  const [coachId, setCoachId] = useState<CoachPersonality>("buddy");
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const savedCoach = loadCoach();
    setCoachId(savedCoach);
    
    // Set initial greeting from selected coach
    const coach = COACH_PROFILES[savedCoach];
    setMessages([
      {
        role: "assistant",
        content: coach.greeting,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const coach = COACH_PROFILES[coachId];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInput("");

    // Simulate AI response with personality
    setTimeout(() => {
      const responses: Record<CoachPersonality, string[]> = {
        motivator: [
          "YES! That's the spirit! Let's make it happen! 💪 Based on your readiness, I'd say go for a moderate session today.",
          "Love the energy! Your HRV is looking good. Perfect day to push a bit harder!",
          "You're on FIRE! 🔥 Let's channel that into a killer workout today!",
        ],
        zen: [
          "I sense you're looking for balance. Your body is telling us something. Let's listen to it.",
          "Take a deep breath. Your metrics show some stress. Perhaps a gentle yoga flow today?",
          "Remember, rest is progress too. Your recovery is just as important as your training.",
        ],
        drill_sergeant: [
          "Alright, listen up. Your readiness is at 75. That means you CAN push today. No excuses.",
          "Drop and give me 20... minutes of Zone-2 cardio. Your HRV says you're ready.",
          "I don't want to hear about being tired. The data shows you're good to go. Let's move!",
        ],
        scientist: [
          "Analyzing your biometrics: HRV at baseline -8%, resting HR elevated +3%. Recommendation: moderate intensity with focus on aerobic conditioning.",
          "Based on your sleep efficiency of 85% and stress markers, I'd suggest avoiding HIIT today. Zone-2 training would optimize recovery.",
          "Interesting data pattern. Your training load suggests a deload week. Let's discuss periodization.",
        ],
        buddy: [
          "Hey! I'm here for you. 😊 Looking at your numbers, I think a nice moderate workout would feel great today!",
          "You've been doing awesome! Your consistency is really paying off. How are you feeling about today's plan?",
          "I know you've got a lot going on. Remember, we're in this together. What would feel best for you today?",
        ],
      };

      const coachResponses = responses[coachId];
      const response = coachResponses[Math.floor(Math.random() * coachResponses.length)];

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 1000);
  };

  const handleCoachChange = (newCoach: CoachPersonality) => {
    setCoachId(newCoach);
    const newCoachProfile = COACH_PROFILES[newCoach];
    setMessages([
      {
        role: "assistant",
        content: newCoachProfile.greeting,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <>
      <MobileLayout
        title={coach.name}
        headerAction={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCoachSelector(true)}
          >
            <Settings2 className="w-5 h-5" />
          </Button>
        }
      >
        <PageTransition>
          <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)]">
          {/* Coach Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-b"
            style={{ backgroundColor: coach.color + "10" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-cover bg-center shrink-0 ring-2 ring-white"
                style={{
                  backgroundImage: `url(${coach.avatar})`,
                  backgroundColor: coach.color + "20",
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{coach.name} - {coach.title}</p>
                <p className="text-xs text-muted-foreground truncate">{coach.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCoachSelector(true)}
              >
                Change
              </Button>
            </div>
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] ${msg.role === "user" ? "" : "space-y-2"}`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-6 h-6 rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${coach.avatar})`,
                          backgroundColor: coach.color + "20",
                        }}
                      />
                      <Badge variant="outline" className="text-xs">{coach.name}</Badge>
                    </div>
                  )}
                  <Card
                    className={`shadow-soft ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                    }`}
                  >
                    <CardContent className="pt-3 pb-3 px-4">
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </CardContent>
                  </Card>
                  <p className="text-xs text-muted-foreground px-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-card/95 backdrop-blur">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Ask ${coach.name}...`}
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        </PageTransition>
      </MobileLayout>

      <CoachSelector
        open={showCoachSelector}
        onOpenChange={setShowCoachSelector}
        currentCoach={coachId}
        onCoachSelect={handleCoachChange}
      />
    </>
  );
}
