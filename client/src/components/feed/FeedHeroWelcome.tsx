import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
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
      </div>
    </motion.div>
  );
}
