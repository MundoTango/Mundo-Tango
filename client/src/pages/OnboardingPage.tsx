import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to Mundo Tango!</h1>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "Your tango experience"}
              {step === 3 && "Find your community"}
              {step === 4 && "You're all set!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" placeholder="How should we call you?" data-testid="input-name" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, Country" data-testid="input-location" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Dance Level</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <Button
                        key={level}
                        variant="outline"
                        className="hover-elevate"
                        data-testid={`button-${level.toLowerCase()}`}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Preferred Role</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["Leader", "Follower", "Both"].map((role) => (
                      <Button
                        key={role}
                        variant="outline"
                        className="hover-elevate"
                        data-testid={`button-${role.toLowerCase()}`}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Find groups and dancers that match your interests
                </p>
                <div className="space-y-2">
                  {["Local Milongas", "Online Classes", "Travel Dancers"].map((interest) => (
                    <div
                      key={interest}
                      className="flex items-center gap-2 p-3 border rounded-md hover-elevate cursor-pointer"
                      data-testid={`interest-${interest.toLowerCase().replace(/ /g, "-")}`}
                    >
                      <div className="h-5 w-5 border rounded flex items-center justify-center">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{interest}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold">Welcome to the community!</h3>
                <p className="text-muted-foreground">
                  You're ready to start your tango journey with Mundo Tango
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 && step < 4 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              <Button
                className={step === 1 ? "w-full" : "ml-auto"}
                onClick={() => step === 4 ? window.location.href = "/feed" : setStep(step + 1)}
                data-testid="button-next"
              >
                {step === 4 ? "Go to Feed" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
