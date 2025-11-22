import { MobileLayout } from "@/components/MobileLayout";
import { PageTransition } from "@/components/PageTransition";
import { BreathingExercise } from "@/components/BreathingExercise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind } from "lucide-react";
import { toast } from "sonner";

export default function Breathing() {
  const handleComplete = (type: string) => {
    toast.success(`${type} breathing session completed! 🎉`);
  };

  return (
    <MobileLayout title="Breathing Coach">
      <PageTransition>
        <div className="space-y-4 pb-20">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-primary" />
                Guided Breathing Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose a breathing pattern based on your current needs. Each technique
                offers unique benefits for stress relief, recovery, or sleep preparation.
              </p>
            </CardContent>
          </Card>

          <BreathingExercise
            type="coherent"
            duration={5}
            onComplete={() => handleComplete("Coherent")}
          />

          <BreathingExercise
            type="box"
            duration={3}
            onComplete={() => handleComplete("Box")}
          />

          <BreathingExercise
            type="478"
            duration={5}
            onComplete={() => handleComplete("4-7-8")}
          />
        </div>
      </PageTransition>
    </MobileLayout>
  );
}
