import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Brain } from "lucide-react";
import { motion } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ActionChip = {
  id: string;
  label: string;
  status: "pending" | "accepted" | "snoozed" | "rejected";
};

export default function Coach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your FitTwin Coach. I've analyzed your recent data and I'm ready to help. What would you like to discuss?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [actionChips, setActionChips] = useState<ActionChip[]>([
    { id: "1", label: "Get today's workout plan", status: "pending" },
    { id: "2", label: "Review sleep recommendations", status: "pending" },
    { id: "3", label: "Check stress management tips", status: "pending" },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on your readiness score of 75, I recommend a moderate intensity workout today. Your HRV is slightly below baseline, so avoid HIIT and stick to Zone-2 cardio or light strength training.",
        "Your sleep efficiency has been around 85% lately. Try setting your phone to Do Not Disturb 1 hour before bed, and keep your room temperature between 65-68°F for optimal sleep.",
        "I notice your stress levels have been elevated. I recommend three 5-minute breathing breaks during the day, and consider a 20-minute walk outside during lunch. Fresh air and movement help regulate cortisol.",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleActionChip = (id: string, action: "accept" | "snooze" | "reject") => {
    setActionChips(
      actionChips.map((chip) =>
        chip.id === id
          ? { ...chip, status: action === "accept" ? "accepted" : action === "snooze" ? "snoozed" : "rejected" }
          : chip
      )
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">FitTwin Coach</h1>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                >
                  <CardContent className="pt-4 pb-3">
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t bg-card/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask your coach anything..."
                className="flex-1"
              />
              <Button onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Feed */}
        <div className="w-80 border-l bg-muted/20 p-4 overflow-y-auto hidden md:block">
          <h2 className="font-bold mb-4">Action Feed</h2>
          <div className="space-y-3">
            {actionChips.map((chip) => (
              <Card key={chip.id} className="shadow-soft">
                <CardContent className="pt-4">
                  <p className="text-sm mb-3">{chip.label}</p>
                  {chip.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleActionChip(chip.id, "accept")}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleActionChip(chip.id, "snooze")}>
                        Snooze
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleActionChip(chip.id, "reject")}>
                        ✕
                      </Button>
                    </div>
                  )}
                  {chip.status !== "pending" && (
                    <Badge
                      variant={
                        chip.status === "accepted" ? "default" : chip.status === "snoozed" ? "secondary" : "outline"
                      }
                    >
                      {chip.status}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
