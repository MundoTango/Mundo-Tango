import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Calendar,
  Bot,
  Users,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Star,
  Heart,
  Music
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

const demoContent = [
  {
    id: 0,
    title: "Global Tango Map",
    subtitle: "Find Your Dance Community Worldwide",
    description: "Explore our interactive map showing dancers, events, and venues across 95+ cities. Connect with local communities before you travel.",
    features: [
      "95+ cities with active communities",
      "Real-time dancer locations",
      "Venue and milonga markers",
      "Local event calendars"
    ],
    animatedElements: [
      { type: "marker", x: 20, y: 30, label: "Buenos Aires", count: 1240 },
      { type: "marker", x: 45, y: 25, label: "Berlin", count: 890 },
      { type: "marker", x: 75, y: 40, label: "Tokyo", count: 456 },
      { type: "marker", x: 35, y: 55, label: "London", count: 780 },
    ]
  },
  {
    id: 1,
    title: "Event Discovery",
    subtitle: "Never Miss a Milonga Again",
    description: "Browse thousands of tango events worldwide. Filter by date, location, type, and more. Get personalized recommendations based on your preferences.",
    features: [
      "Live event listings",
      "RSVP with one click",
      "Personal calendar sync",
      "Smart recommendations"
    ],
    animatedElements: [
      { name: "La Viruta", location: "Buenos Aires", time: "Tonight 11PM", attendees: 45 },
      { name: "Tango Festival", location: "Berlin", time: "Mar 15-17", attendees: 230 },
      { name: "Practica Night", location: "New York", time: "Tomorrow 8PM", attendees: 28 },
    ]
  },
  {
    id: 2,
    title: "Mr. Blue AI",
    subtitle: "Your Personal Tango Companion",
    description: "Ask anything about tango - from finding events to travel tips. Mr. Blue learns your preferences and provides personalized guidance 24/7.",
    features: [
      "Natural conversations",
      "10 emotional states",
      "Personalized advice",
      "Available 24/7"
    ],
    animatedElements: [
      { type: "user", text: "Find milongas in Buenos Aires this weekend" },
      { type: "bot", text: "I found 12 milongas! La Viruta on Friday has a live orchestra. Shall I show details?" },
      { type: "user", text: "Yes, and recommend a hotel nearby" },
      { type: "bot", text: "Here are 3 tango-friendly hotels within walking distance..." }
    ]
  },
  {
    id: 3,
    title: "Your Profile",
    subtitle: "Showcase Your Tango Journey",
    description: "Build your tango profile with photos, videos, and your dance history. Connect with dancers who match your style and experience level.",
    features: [
      "19+ tango roles",
      "Photo & video gallery",
      "Dance history timeline",
      "Partner matching"
    ],
    animatedElements: [
      { stat: "Events", value: 156 },
      { stat: "Connections", value: 89 },
      { stat: "Cities", value: 12 },
      { stat: "Years Dancing", value: 5 }
    ]
  }
];

export function VideoDemoModal({ open, onOpenChange, initialSlide, screenshots }: VideoDemoModalProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentSlide(initialSlide);
    setProgress(0);
  }, [initialSlide, open]);

  useEffect(() => {
    if (open && isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (currentSlide < screenshots.length - 1) {
              setCurrentSlide(c => c + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 0.5;
        });
      }, 50);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [open, isPlaying, currentSlide, screenshots.length]);

  const handlePrev = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentSlide(prev => Math.min(screenshots.length - 1, prev + 1));
    setProgress(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const currentContent = demoContent[currentSlide] || demoContent[0];
  const currentScreenshot = screenshots[currentSlide];
  const IconComponent = currentScreenshot?.icon || MapPin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-slate-900 border-slate-700">
        <div className="relative">
          {/* Video Player Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentScreenshot?.gradient || 'from-teal-500 to-cyan-600'} flex items-center justify-center`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{currentContent.title}</h3>
                <p className="text-white/70 text-sm">{currentContent.subtitle}</p>
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

          {/* Main Video Content Area */}
          <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            {/* Background Image */}
            {currentScreenshot?.image && (
              <img 
                src={currentScreenshot.image}
                alt={currentContent.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />

            {/* Animated Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                  {/* Left Side - Animated Demo */}
                  <div className="relative">
                    {currentSlide === 0 && <MapDemoAnimation elements={currentContent.animatedElements} />}
                    {currentSlide === 1 && <EventsDemoAnimation elements={currentContent.animatedElements} />}
                    {currentSlide === 2 && <ChatDemoAnimation elements={currentContent.animatedElements} />}
                    {currentSlide === 3 && <ProfileDemoAnimation elements={currentContent.animatedElements} />}
                  </div>

                  {/* Right Side - Info */}
                  <div className="flex flex-col justify-center space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{currentContent.title}</h2>
                      <p className="text-white/80">{currentContent.description}</p>
                    </motion.div>
                    
                    <motion.ul 
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {currentContent.features.map((feature, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          className="flex items-center gap-2 text-white/90"
                        >
                          <Sparkles className="h-4 w-4 text-cyan-400" />
                          {feature}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              data-testid="video-prev"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlide === screenshots.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              data-testid="video-next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
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

              <span className="text-white/60 text-sm w-16 text-right">
                {currentSlide + 1} / {screenshots.length}
              </span>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center gap-2">
              {screenshots.map((screenshot, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentSlide(i);
                    setProgress(0);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  data-testid={`video-indicator-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MapDemoAnimation({ elements }: { elements: any[] }) {
  return (
    <div className="relative w-full h-64 rounded-xl bg-slate-800/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30" />
      </div>
      
      {elements.map((marker, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.3, type: "spring" }}
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          className="absolute"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              className="absolute -inset-2 bg-cyan-500/30 rounded-full"
            />
            <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-lg" />
            <div className="absolute left-6 top-0 bg-slate-800 rounded-lg px-2 py-1 shadow-lg whitespace-nowrap">
              <p className="text-xs text-white font-medium">{marker.label}</p>
              <p className="text-[10px] text-cyan-400">{marker.count} dancers</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EventsDemoAnimation({ elements }: { elements: any[] }) {
  return (
    <div className="space-y-3">
      {elements.map((event, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
          className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-medium">{event.name}</h4>
            <p className="text-white/60 text-sm flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {event.location} · {event.time}
            </p>
          </div>
          <div className="text-right">
            <p className="text-cyan-400 font-medium">{event.attendees}</p>
            <p className="text-white/50 text-xs">attending</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ChatDemoAnimation({ elements }: { elements: any[] }) {
  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 space-y-3 max-h-64 overflow-hidden">
      {elements.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.5 }}
          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.type === 'bot' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-2 flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
          )}
          <div className={`rounded-2xl px-4 py-2 max-w-[80%] ${
            msg.type === 'user' 
              ? 'bg-cyan-500 text-white' 
              : 'bg-slate-700 text-white/90'
          }`}>
            <p className="text-sm">{msg.text}</p>
          </div>
        </motion.div>
      ))}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="flex items-center gap-2 pt-2 border-t border-slate-700"
      >
        <div className="flex-1 bg-slate-700 rounded-full px-4 py-2">
          <span className="text-white/40 text-sm">Ask Mr. Blue anything...</span>
        </div>
        <Button size="icon" className="rounded-full bg-cyan-500 hover:bg-cyan-600 h-9 w-9">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}

function ProfileDemoAnimation({ elements }: { elements: any[] }) {
  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white"
        >
          MT
        </motion.div>
        <div>
          <h3 className="text-white font-semibold text-lg">Tango Dancer</h3>
          <p className="text-white/60 text-sm">Buenos Aires, Argentina</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-rose-500/20 text-rose-300 border-0 text-xs">Leader</Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-0 text-xs">Follower</Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-700">
        {elements.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="text-center"
          >
            <motion.p 
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              {stat.value}
            </motion.p>
            <p className="text-xs text-white/60">{stat.stat}</p>
          </motion.div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 pt-2">
        <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600">
          <MessageCircle className="h-4 w-4 mr-2" /> Connect
        </Button>
        <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
