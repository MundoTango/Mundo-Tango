import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Sparkles, Heart, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export function FeedHeroWelcome() {
  const { user } = useAuth();
  
  // Fetch quick stats
  const { data: stats } = useQuery<{
    postsToday: number;
    activeUsers: number;
    upcomingEvents: number;
  }>({
    queryKey: ['/api/feed/stats'],
    staleTime: 30000,
  });

  const firstName = user?.name?.split(' ')[0] || user?.username || 'Dancer';
  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? 'Good morning' :
    currentHour < 18 ? 'Good afternoon' : 
    'Good evening';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full h-[50vh] md:h-[60vh] mb-12 rounded-2xl overflow-hidden"
      data-testid="hero-feed"
    >
      {/* Background Image with 16:9 Aspect Ratio */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=2070&auto=format&fit=crop"
          alt="Tango dancers in elegant embrace"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay - Editorial Standard */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
      </div>

      
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay: number;
}

function StatCard({ icon, value, label, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="flex flex-col items-center p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20"
      data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="text-white mb-2">
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold text-white">
        {value}
      </div>
      <div className="text-sm text-white/80 text-center mt-1">
        {label}
      </div>
    </motion.div>
  );
}
