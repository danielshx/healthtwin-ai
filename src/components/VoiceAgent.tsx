import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Phone, PhoneOff, Mic, MicOff, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RealtimeVoiceChat } from "@/utils/RealtimeAudio";
import { toast } from "sonner";
import { COACH_PROFILES, CoachPersonality } from "@/types/coach";
import { loadCoach } from "@/lib/storage";

type VoiceAgentProps = {
  readiness: number;
  burnoutLevel: "Green" | "Yellow" | "Red";
  triggerProactiveCall?: boolean;
  onCallComplete?: () => void;
};

export function VoiceAgent({ 
  readiness, 
  burnoutLevel, 
  triggerProactiveCall = false,
  onCallComplete 
}: VoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [coachId, setCoachId] = useState<CoachPersonality>("buddy");
  const chatRef = useRef<RealtimeVoiceChat | null>(null);

  useEffect(() => {
    const savedCoach = loadCoach();
    setCoachId(savedCoach);
  }, []);

  const coach = COACH_PROFILES[coachId];

  // Proactive call trigger
  useEffect(() => {
    if (triggerProactiveCall && !isConnected) {
      console.log('[VoiceAgent] Proactive call triggered!');
      handleConnect();
    }
  }, [triggerProactiveCall]);

  const handleMessage = (event: any) => {
    if (event.type === 'response.audio_transcript.delta') {
      setTranscript(prev => {
        const newTranscript = [...prev];
        if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].startsWith('🤖')) {
          newTranscript[newTranscript.length - 1] += event.delta;
        } else {
          newTranscript.push('🤖 ' + event.delta);
        }
        return newTranscript.slice(-10);
      });
    } else if (event.type === 'input_audio_transcription.completed') {
      setTranscript(prev => [...prev, '🎤 ' + event.transcript].slice(-10));
    } else if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    } else if (event.type === 'session.created') {
      console.log('[VoiceAgent] Session created, sending initial context...');
      
      // Send health context proactively
      const contextMessage = `User health context: Readiness score is ${readiness}/100, burnout risk level is ${burnoutLevel}. ${
        burnoutLevel === 'Red' 
          ? 'This is critical - very low HRV and poor sleep patterns detected.'
          : burnoutLevel === 'Yellow'
          ? 'Warning signs detected - stress is building up.'
          : 'Metrics are healthy but monitoring continues.'
      }`;
      
      setTimeout(() => {
        chatRef.current?.sendText(contextMessage);
      }, 1000);
    }
  };

  const handleConnect = async () => {
    try {
      toast.info("Verbinde mit deinem AI Coach...");
      
      chatRef.current = new RealtimeVoiceChat(
        handleMessage,
        (connected) => {
          setIsConnected(connected);
          if (connected) {
            toast.success(`${coach.name} ist jetzt im Gespräch!`);
          } else {
            toast.info("Gespräch beendet");
            onCallComplete?.();
          }
        }
      );

      await chatRef.current.connect();
    } catch (error) {
      console.error('[VoiceAgent] Connection error:', error);
      toast.error("Konnte nicht verbinden. Überprüfe Mikrofon-Zugriff.");
    }
  };

  const handleDisconnect = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setTranscript([]);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className="shadow-glow border-2 border-primary/30">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full bg-cover bg-center ring-2 ring-primary"
              style={{ backgroundImage: `url(${coach.avatar})` }}
            />
            <div>
              <h3 className="font-bold text-lg">{coach.name}</h3>
              <p className="text-sm text-muted-foreground">{coach.title}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isConnected && (
              <Badge variant={isSpeaking ? "default" : "secondary"} className="gap-1">
                {isSpeaking ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                {isSpeaking ? "Spricht..." : "Hört zu..."}
              </Badge>
            )}
          </div>
        </div>

        {!isConnected ? (
          <Button 
            onClick={handleConnect} 
            className="w-full gap-2"
            size="lg"
          >
            <Phone className="w-5 h-5" />
            Voice Chat starten
          </Button>
        ) : (
          <>
            <Button 
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full gap-2"
              size="lg"
            >
              <PhoneOff className="w-5 h-5" />
              Gespräch beenden
            </Button>

            <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <MessageSquare className="w-3 h-3" />
                Live Transcript
              </div>
              <AnimatePresence>
                {transcript.map((text, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm p-2 rounded ${
                      text.startsWith('🤖') 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-secondary/10 text-secondary'
                    }`}
                  >
                    {text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          💡 Dein Coach kann proaktiv Gespräche initiieren wenn kritische Muster erkannt werden
        </div>
      </CardContent>
    </Card>
  );
}
