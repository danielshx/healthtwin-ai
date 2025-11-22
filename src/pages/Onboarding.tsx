import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { saveProfile } from "@/lib/storage";
import { UserProfile } from "@/types";
import { ArrowRight, Heart } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: "",
    age: undefined,
    goal: "maintain",
    chronotype: "normal",
    trainingFrequency: 3,
    baselineSleepNeed: 8,
    examPhase: false,
  });

  const handleComplete = () => {
    const completeProfile: UserProfile = {
      name: profile.name || "User",
      age: profile.age,
      goal: profile.goal!,
      chronotype: profile.chronotype!,
      trainingFrequency: profile.trainingFrequency!,
      baselineSleepNeed: profile.baselineSleepNeed!,
      examPhase: profile.examPhase!,
      onboardingComplete: true,
    };
    saveProfile(completeProfile);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">FitTwin</h1>
          </div>
          <p className="text-muted-foreground">Your proactive AI fitness & recovery companion</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Welcome! Let's personalize your experience</CardTitle>
            <CardDescription>Step {step} of 3</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || undefined })}
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <Label>Fitness Goal</Label>
                  <RadioGroup
                    value={profile.goal}
                    onValueChange={(value) => setProfile({ ...profile, goal: value as any })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lose_fat" id="lose_fat" />
                      <Label htmlFor="lose_fat">Lose Fat</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="build_muscle" id="build_muscle" />
                      <Label htmlFor="build_muscle">Build Muscle</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maintain" id="maintain" />
                      <Label htmlFor="maintain">Maintain Health</Label>
                    </div>
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label>Chronotype (Sleep preference)</Label>
                  <RadioGroup
                    value={profile.chronotype}
                    onValueChange={(value) => setProfile({ ...profile, chronotype: value as any })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="early" id="early" />
                      <Label htmlFor="early">Early Bird (prefer early morning)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal">Normal (flexible)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="night" id="night" />
                      <Label htmlFor="night">Night Owl (prefer late night)</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="training">Weekly Training Sessions</Label>
                  <Input
                    id="training"
                    type="number"
                    min="0"
                    max="7"
                    value={profile.trainingFrequency}
                    onChange={(e) => setProfile({ ...profile, trainingFrequency: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="sleep">Baseline Sleep Need (hours)</Label>
                  <Input
                    id="sleep"
                    type="number"
                    min="6"
                    max="10"
                    step="0.5"
                    value={profile.baselineSleepNeed}
                    onChange={(e) => setProfile({ ...profile, baselineSleepNeed: parseFloat(e.target.value) })}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="exam">Currently in exam/deadline phase?</Label>
                    <p className="text-sm text-muted-foreground">
                      We'll adjust training recommendations accordingly
                    </p>
                  </div>
                  <Switch
                    id="exam"
                    checked={profile.examPhase}
                    onCheckedChange={(checked) => setProfile({ ...profile, examPhase: checked })}
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Privacy & Safety</p>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ FitTwin is not medical advice. All data stays local in your browser. For serious
                    symptoms, always consult a healthcare professional.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button
                className="ml-auto"
                onClick={() => (step === 3 ? handleComplete() : setStep(step + 1))}
              >
                {step === 3 ? "Get Started" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
