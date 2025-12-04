import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Calendar,
  Bot,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Screenshot {
  title: string;
  description: string;
  gradient: string;
  icon: LucideIcon;
  image: string;
}

interface VideoDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSlide: number;
  screenshots: Screenshot[];
}

const journeyData = [
  {
    id: 'tango-map',
    name: 'Global Tango Map',
    description: 'Explore dancers and events worldwide',
    steps: [
      { image: '/demos/journeys/tango-map-step-01.png', caption: 'View global tango map with city markers' },
      { image: '/demos/journeys/tango-map-step-02.png', caption: 'Interactive map with dancer locations' },
    ]
  },
  {
    id: 'events',
    name: 'Event Discovery',
    description: 'Find milongas and festivals near you',
    steps: [
      { image: '/demos/journeys/events-step-01.png', caption: 'Browse upcoming tango events' },
      { image: '/demos/journeys/events-step-02.png', caption: 'Event cards with details and RSVP' },
    ]
  },
  {
    id: 'mr-blue',
    name: 'Mr. Blue AI',
    description: 'Your personal tango companion',
    steps: [
      { image: '/demos/journeys/mr-blue-step-01.png', caption: 'Meet Mr. Blue AI assistant' },
      { image: '/demos/journeys/mr-blue-step-02.png', caption: 'Chat interface with suggestions' },
    ]
  },
  {
    id: 'profile',
    name: 'Your Profile',
    description: 'Showcase your tango journey',
    steps: [
      { image: '/demos/journeys/profile-step-01.png', caption: 'Your personalized feed' },
      { image: '/demos/journeys/profile-step-02.png', caption: 'Social features and connections' },
    ]
  }
];

export function VideoDemoModal({ open, onOpenChange, initialSlide, screenshots }: VideoDemoModalProps) {
  const [currentJourney, setCurrentJourney] = useState(initialSlide);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  const journey = journeyData[currentJourney] || journeyData[0];
  const currentScreenshot = screenshots[currentJourney];
  const IconComponent = currentScreenshot?.icon || MapPin;
  const totalSteps = journey.steps.length;
  const currentStepData = journey.steps[currentStep];

  useEffect(() => {
    setCurrentJourney(initialSlide);
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  }, [initialSlide, open]);

  useEffect(() => {
    if (open && isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (currentStep < totalSteps - 1) {
              setCurrentStep(s => s + 1);
              return 0;
            } else if (currentJourney < journeyData.length - 1) {
              setCurrentJourney(j => j + 1);
              setCurrentStep(0);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 0.4;
        });
      }, 50);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [open, isPlaying, currentStep, currentJourney, totalSteps]);

  const handlePrevJourney = () => {
    if (currentJourney > 0) {
      setCurrentJourney(prev => prev - 1);
      setCurrentStep(0);
      setProgress(0);
    }
  };

  const handleNextJourney = () => {
    if (currentJourney < journeyData.length - 1) {
      setCurrentJourney(prev => prev + 1);
      setCurrentStep(0);
      setProgress(0);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-slate-900 border-slate-700">
        <DialogDescription className="sr-only">
          Customer journey demonstration of {journey.name}. Use play/pause and navigation controls to explore features.
        </DialogDescription>
        <div className="relative">
          {/* Video Player Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentScreenshot?.gradient || 'from-teal-500 to-cyan-600'} flex items-center justify-center`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{journey.name}</h3>
                <p className="text-white/70 text-sm">{journey.description}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Video Content Area - Real Screenshots */}
          <div className="relative aspect-video bg-slate-900 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentJourney}-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <img
                  src={currentStepData.image}
                  alt={currentStepData.caption}
                  className="w-full h-full object-contain bg-slate-950"
                />
                
                {/* Caption Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-lg font-medium text-center"
                  >
                    {currentStepData.caption}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevJourney}
              disabled={currentJourney === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              data-testid="video-prev"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextJourney}
              disabled={currentJourney === journeyData.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              data-testid="video-next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Step Progress Dots */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-2">
              {journey.steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Video Controls */}
          <div className="bg-slate-900 p-4 space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                data-testid="video-play-pause"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-white/60 text-sm w-24 text-right">
                Step {currentStep + 1}/{totalSteps}
              </span>
            </div>

            {/* Journey Indicators */}
            <div className="flex items-center justify-center gap-3">
              {journeyData.map((j, i) => {
                const JIcon = [MapPin, Calendar, Bot, Users][i];
                return (
                  <button
                    key={j.id}
                    onClick={() => {
                      setCurrentJourney(i);
                      setCurrentStep(0);
                      setProgress(0);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                      i === currentJourney 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                    }`}
                    data-testid={`video-journey-${i}`}
                  >
                    <JIcon className="h-4 w-4" />
                    <span className="text-xs font-medium hidden sm:inline">{j.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
