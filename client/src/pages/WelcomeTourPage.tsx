import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Music, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react";

const tourSteps = [
  {
    icon: Users,
    title: "Connect with Dancers",
    description: "Find and follow dancers in your area. Build your tango network and discover new practice partners.",
    color: "text-blue-500"
  },
  {
    icon: Calendar,
    title: "Discover Events",
    description: "Browse milongas, workshops, and festivals near you. RSVP to events and never miss a dance opportunity.",
    color: "text-purple-500"
  },
  {
    icon: Music,
    title: "Learn & Improve",
    description: "Access video tutorials, music playlists, and technique guides from expert teachers worldwide.",
    color: "text-green-500"
  },
  {
    icon: MessageCircle,
    title: "Stay Connected",
    description: "Chat with friends, join groups, and participate in the vibrant tango community discussions.",
    color: "text-orange-500"
  }
];

export default function WelcomeTourPage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="container max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Mundo Tango!</h1>
          <p className="text-muted-foreground">Let's take a quick tour of what you can do</p>
        </div>

        <Card>
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <div className={`mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ${tourSteps[currentStep].color}`}>
                {(() => {
                  const IconComponent = tourSteps[currentStep].icon;
                  return <IconComponent className="h-10 w-10" />;
                })()}
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-3">{tourSteps[currentStep].title}</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  {tourSteps[currentStep].description}
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-4">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            data-testid="button-prev"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === tourSteps.length - 1 ? (
            <Button onClick={() => window.location.href = "/feed"} data-testid="button-finish">
              Get Started
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(Math.min(tourSteps.length - 1, currentStep + 1))}
              data-testid="button-next"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => window.location.href = "/feed"} data-testid="button-skip">
            Skip Tour
          </Button>
        </div>
      </div>
    </div>
  );
}
