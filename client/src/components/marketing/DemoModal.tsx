import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  Pause,
  ArrowRight,
  ArrowLeft,
  Star,
  MapPin,
  Music,
  MessageCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const demoSlides = [
  {
    id: 1,
    icon: Bot,
    title: "Meet Mr. Blue",
    subtitle: "Your AI Dance Companion",
    description: "Ask anything about tango - events near you, dance tips, partner matching, or travel planning. Mr. Blue understands context and learns your preferences.",
    features: [
      "Natural language conversations",
      "10 expressive emotional states",
      "Personalized recommendations",
      "Available 24/7"
    ],
    color: "from-blue-500 to-cyan-500",
    preview: (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 h-48 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-white text-sm font-medium">Mr. Blue</span>
          <Badge className="text-xs bg-green-500/20 text-green-400 border-0">Online</Badge>
        </div>
        <div className="space-y-2 flex-1">
          <div className="bg-blue-500/20 rounded-lg p-2 max-w-[80%]">
            <p className="text-blue-200 text-xs">Find milongas in Buenos Aires this weekend</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-2 max-w-[90%] ml-auto">
            <p className="text-slate-200 text-xs">I found 12 milongas this weekend! La Viruta on Friday has live orchestra. Shall I show you the details?</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700">
          <div className="flex-1 bg-slate-700/50 rounded-full px-3 py-1.5 text-xs text-slate-400">Ask Mr. Blue anything...</div>
          <Button size="icon" className="h-7 w-7 rounded-full bg-blue-500">
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  },
  {
    id: 2,
    icon: Calendar,
    title: "Discover Events",
    subtitle: "Global Tango Calendar",
    description: "Browse thousands of milongas, festivals, and workshops worldwide. Filter by date, location, style, and more. Never miss an event.",
    features: [
      "Real-time event listings",
      "Interactive map view",
      "RSVP and save favorites",
      "Personalized suggestions"
    ],
    color: "from-purple-500 to-pink-500",
    preview: (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 h-48 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm font-medium">Upcoming Events</span>
          <Badge className="text-xs bg-purple-500/20 text-purple-400 border-0">12 new</Badge>
        </div>
        <div className="space-y-2 flex-1 overflow-hidden">
          {[
            { name: "La Viruta Milonga", location: "Buenos Aires", time: "Tonight 11PM", attendees: 45 },
            { name: "Tango Festival Berlin", location: "Germany", time: "Mar 15-17", attendees: 230 },
            { name: "Practica Nights", location: "New York", time: "Tomorrow 8PM", attendees: 18 }
          ].map((event, i) => (
            <div key={i} className="bg-slate-700/30 rounded-lg p-2 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-4 w-4 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{event.name}</p>
                <p className="text-slate-400 text-[10px] flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" /> {event.location} · {event.time}
                </p>
              </div>
              <div className="text-[10px] text-slate-400">{event.attendees} going</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 3,
    icon: Users,
    title: "Connect & Dance",
    subtitle: "Find Your Community",
    description: "Build your tango network. Connect with dancers who match your level, style, and goals. Join city groups and professional communities.",
    features: [
      "Smart partner matching",
      "Role-based profiles (19+ roles)",
      "City & pro communities",
      "Private messaging"
    ],
    color: "from-green-500 to-emerald-500",
    preview: (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 h-48 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm font-medium">Talent Match</span>
          <Badge className="text-xs bg-green-500/20 text-green-400 border-0">AI Powered</Badge>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="flex -space-x-3">
              {['bg-gradient-to-br from-blue-400 to-blue-600', 'bg-gradient-to-br from-pink-400 to-pink-600', 'bg-gradient-to-br from-amber-400 to-amber-600', 'bg-gradient-to-br from-green-400 to-green-600'].map((color, i) => (
                <div key={i} className={`w-12 h-12 rounded-full ${color} flex items-center justify-center border-2 border-slate-800 text-white text-sm font-bold`}>
                  {['M', 'S', 'J', 'L'][i]}
                </div>
              ))}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
              98% match
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['Leader', 'Follower', 'Both'].map((role) => (
            <div key={role} className="bg-slate-700/30 rounded px-2 py-1 text-center">
              <p className="text-[10px] text-slate-400">{role}</p>
              <p className="text-xs text-white font-medium">{Math.floor(Math.random() * 50) + 10}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 4,
    icon: Plane,
    title: "Plan Your Journey",
    subtitle: "Tango Travel Made Easy",
    description: "Planning a tango trip? Get personalized itineraries with the best milongas, teachers, and venues. Connect with locals before you arrive.",
    features: [
      "AI-powered itineraries",
      "Local insider tips",
      "Pre-trip connections",
      "City guides worldwide"
    ],
    color: "from-orange-500 to-amber-500",
    preview: (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 h-48 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm font-medium">Buenos Aires Trip</span>
          <Badge className="text-xs bg-orange-500/20 text-orange-400 border-0">7 days</Badge>
        </div>
        <div className="flex-1 space-y-1.5">
          {[
            { day: "Day 1", activity: "Arrive + Practica El Beso", icon: Plane },
            { day: "Day 2", activity: "Class with maestros + La Viruta", icon: Star },
            { day: "Day 3", activity: "Caminito tour + Salon Canning", icon: MapPin },
            { day: "Day 4", activity: "Shoe shopping + Milonga Parakultural", icon: Music }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-700/30 rounded p-1.5">
              <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <item.icon className="h-3 w-3 text-orange-400" />
              </div>
              <span className="text-[10px] text-orange-400 font-medium w-10">{item.day}</span>
              <span className="text-xs text-slate-300 truncate">{item.activity}</span>
            </div>
          ))}
        </div>
        <Button size="sm" className="w-full mt-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs h-7">
          Generate My Itinerary
        </Button>
      </div>
    )
  },
  {
    id: 5,
    icon: Sparkles,
    title: "3D Avatar Experience",
    subtitle: "Meet Mr. Blue in 3D",
    description: "Interact with Mr. Blue's stunning 3D avatar. Watch him react with 10 different expressions - from thinking to celebrating your milonga plans!",
    features: [
      "Real-time 3D rendering",
      "10 emotional expressions",
      "Interactive gestures",
      "Voice integration ready"
    ],
    color: "from-cyan-500 to-blue-500",
    preview: (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 h-48 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-3 animate-pulse">
            <Bot className="h-10 w-10 text-white" />
          </div>
          <div className="flex gap-2 mb-2">
            {['Happy', 'Thinking', 'Excited'].map((mood) => (
              <Badge key={mood} className="text-[10px] bg-cyan-500/20 text-cyan-400 border-0">{mood}</Badge>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center">
            Click expressions to see Mr. Blue react!
          </p>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    )
  }
];

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!open) {
      setCurrentSlide(0);
      setIsPlaying(true);
    }
  }, [open]);

  useEffect(() => {
    if (!isPlaying || !open) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPlaying, open]);

  const slide = demoSlides[currentSlide];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
    setIsPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + demoSlides.length) % demoSlides.length);
    setIsPlaying(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden" data-testid="dialog-demo-modal">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6 flex flex-col">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  <Play className="h-3 w-3 mr-1" />
                  Interactive Demo
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentSlide + 1} / {demoSlides.length}
                </Badge>
              </div>
              <DialogTitle className="text-2xl" data-testid="text-modal-title">
                <span className={`bg-gradient-to-r ${slide.color} bg-clip-text text-transparent`}>
                  {slide.title}
                </span>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{slide.subtitle}</p>
            </DialogHeader>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 py-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  {slide.description}
                </p>
                <ul className="space-y-2">
                  {slide.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button
                size="icon"
                variant="ghost"
                onClick={prevSlide}
                data-testid="button-prev-slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-1 flex-1 justify-center">
                {demoSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentSlide 
                        ? 'w-6 bg-primary' 
                        : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    data-testid={`button-slide-${i}`}
                  />
                ))}
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={nextSlide}
                data-testid="button-next-slide"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="md:w-1/2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-6 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                {slide.preview}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-4">
              <Link href="/register" className="flex-1">
                <Button 
                  className="w-full ocean-gradient text-white" 
                  size="lg"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-start-trial-modal"
                >
                  Start 7-Day Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing" className="flex-1">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-view-pricing-modal"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
