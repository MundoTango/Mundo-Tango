import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Calendar, 
  Users, 
  Plane, 
  Sparkles, 
  Play, 
  ArrowRight,
  Star,
  CheckCircle
} from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const highlights = [
  {
    icon: Bot,
    title: "AI-Powered Assistant",
    description: "Mr. Blue helps you discover events and connect with dancers"
  },
  {
    icon: Calendar,
    title: "Global Events",
    description: "Find milongas, festivals, and workshops worldwide"
  },
  {
    icon: Users,
    title: "Vibrant Community",
    description: "Connect with passionate dancers across the globe"
  },
  {
    icon: Star,
    title: "Talent Matching",
    description: "AI-powered matching for ideal dance partners"
  },
  {
    icon: Plane,
    title: "Travel Planning",
    description: "Plan your tango journey with ease"
  },
  {
    icon: Sparkles,
    title: "Interactive 3D",
    description: "Stunning avatars and visual experiences"
  }
];

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-demo-modal">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              <Play className="h-3 w-3 mr-1" />
              Platform Overview
            </Badge>
          </div>
          <DialogTitle className="text-2xl ocean-gradient-text" data-testid="text-modal-title">
            Discover Mundo Tango
          </DialogTitle>
          <DialogDescription data-testid="text-modal-description">
            The global platform connecting the tango community. Explore our features below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-6">
          {highlights.map((item) => (
            <div 
              key={item.title}
              className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 hover-elevate transition-all"
              data-testid={`demo-highlight-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-10 h-10 rounded-lg ocean-gradient flex items-center justify-center mb-2">
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-medium text-sm">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">7-Day Free Trial</p>
              <p className="text-xs text-muted-foreground">
                Experience all features with no commitment. No credit card required.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/demos" className="flex-1">
              <Button 
                className="w-full ocean-gradient text-white" 
                size="lg"
                onClick={() => onOpenChange(false)}
                data-testid="button-explore-demos"
              >
                Explore All Demos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => onOpenChange(false)}
                data-testid="button-start-trial-modal"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
