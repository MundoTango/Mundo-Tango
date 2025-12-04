/**
 * Mundo Tango - Video Demo Modal
 * Real video playback for customer journey recordings
 * 
 * MB.MD Pattern 41: Parallel Execution
 * MB.MD Pattern 26: OSI - Leveraging Playwright recordVideo
 * 
 * ZERO FAKE DATA POLICY: Uses actual recorded .mp4 videos, not mock animations
 */

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
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
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

interface JourneyVideoData {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  fallbackSteps: { image: string; caption: string }[];
}

const journeyData: JourneyVideoData[] = [
  {
    id: 'tango-map',
    name: 'Global Tango Map',
    description: 'Explore dancers and events worldwide',
    videoUrl: '/videos/customer/tango-map.mp4',
    thumbnailUrl: '/demos/tango-map.png',
    fallbackSteps: [
      { image: '/demos/tango-map.png', caption: 'Interactive global tango map with city markers' },
    ]
  },
  {
    id: 'events',
    name: 'Event Discovery',
    description: 'Find milongas and festivals near you',
    videoUrl: '/videos/customer/event-discovery.mp4',
    thumbnailUrl: '/demos/events-discovery.png',
    fallbackSteps: [
      { image: '/demos/events-discovery.png', caption: 'Browse upcoming tango events worldwide' },
    ]
  },
  {
    id: 'mr-blue',
    name: 'Mr. Blue AI',
    description: 'Your personal tango companion',
    videoUrl: '/videos/customer/mr-blue-chat.mp4',
    thumbnailUrl: '/demos/mr-blue-chat.png',
    fallbackSteps: [
      { image: '/demos/mr-blue-chat.png', caption: 'Meet Mr. Blue AI assistant' },
    ]
  },
  {
    id: 'profile',
    name: 'Your Profile',
    description: 'Showcase your tango journey',
    videoUrl: '/videos/customer/profile-view.mp4',
    thumbnailUrl: '/demos/profile-view.png',
    fallbackSteps: [
      { image: '/demos/profile-view.png', caption: 'Your personalized tango profile' },
    ]
  }
];

export function VideoDemoModal({ open, onOpenChange, initialSlide, screenshots }: VideoDemoModalProps) {
  const [currentJourney, setCurrentJourney] = useState(initialSlide);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const journey = journeyData[currentJourney] || journeyData[0];
  const currentScreenshot = screenshots[currentJourney];
  const IconComponent = currentScreenshot?.icon || MapPin;

  useEffect(() => {
    setCurrentJourney(initialSlide);
    setProgress(0);
    setIsPlaying(false);
    setVideoLoaded(false);
    setVideoError(false);
  }, [initialSlide, open]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setVideoLoaded(true);
      setDuration(video.duration);
      setVideoError(false);
    };

    const handleTimeUpdate = () => {
      if (video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    const handleError = () => {
      setVideoError(true);
      setVideoLoaded(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [currentJourney]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const handlePrevJourney = () => {
    if (currentJourney > 0) {
      setCurrentJourney(prev => prev - 1);
      setProgress(0);
      setIsPlaying(false);
      setVideoLoaded(false);
      setVideoError(false);
    }
  };

  const handleNextJourney = () => {
    if (currentJourney < journeyData.length - 1) {
      setCurrentJourney(prev => prev + 1);
      setProgress(0);
      setIsPlaying(false);
      setVideoLoaded(false);
      setVideoError(false);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newProgress = (clickX / rect.width) * 100;
      const newTime = (newProgress / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-slate-900 border-slate-700">
        <DialogDescription className="sr-only">
          Customer journey video demonstration of {journey.name}. Use play/pause and navigation controls to explore features.
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/10 text-white border-none">
                {videoLoaded ? 'HD Video' : videoError ? 'Preview' : 'Loading...'}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => onOpenChange(false)}
                data-testid="video-modal-close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Video Content Area */}
          <div className="relative aspect-video bg-slate-950 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentJourney}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {/* Video Element */}
                {!videoError ? (
                  <video
                    ref={videoRef}
                    key={journey.videoUrl}
                    src={journey.videoUrl}
                    poster={journey.thumbnailUrl}
                    className="w-full h-full object-contain"
                    muted={isMuted}
                    playsInline
                    preload="metadata"
                    data-testid="video-player"
                  />
                ) : (
                  <img
                    src={journey.fallbackSteps[0]?.image || journey.thumbnailUrl}
                    alt={journey.name}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Play Overlay (when paused) */}
                {!isPlaying && videoLoaded && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                    data-testid="video-play-overlay"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Play className="h-10 w-10 text-white ml-1" />
                    </div>
                  </button>
                )}

                {/* Video Error Overlay */}
                {videoError && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white text-lg font-medium text-center"
                    >
                      {journey.fallbackSteps[0]?.caption || journey.description}
                    </motion.p>
                    <p className="text-white/60 text-sm text-center mt-2">
                      Video recording pending - showing preview
                    </p>
                  </div>
                )}
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
          </div>

          {/* Video Controls */}
          <div className="bg-slate-900 p-4 space-y-3">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={videoError}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="video-play-pause"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              
              <div 
                className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
                data-testid="video-progress-bar"
              >
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-white/60 text-sm w-20 text-right font-mono">
                {videoLoaded ? formatTime((progress / 100) * duration) : '--:--'}
              </span>

              {/* Additional Controls */}
              <button
                onClick={handleRestart}
                disabled={videoError}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                data-testid="video-restart"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={toggleMute}
                disabled={videoError}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                data-testid="video-mute"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                onClick={handleFullscreen}
                disabled={videoError}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50"
                data-testid="video-fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </button>
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
                      setProgress(0);
                      setIsPlaying(false);
                      setVideoLoaded(false);
                      setVideoError(false);
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
