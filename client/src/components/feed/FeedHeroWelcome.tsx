import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, MessageSquare } from "lucide-react";

export function FeedHeroWelcome() {
  const { user } = useAuth();
  
  // Fetch quick stats
  const { data: stats } = useQuery<{
    postsToday: number;
    activeUsers: number;
    upcomingEvents: number;
  }>({
    queryKey: ['/api/feed/stats'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/feed/stats', {
        credentials: 'include',
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch feed stats');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!localStorage.getItem('accessToken'),
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
      className="relative w-full mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8"
      data-testid="hero-feed"
    >
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
          {greeting}, {firstName}
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          Welcome back to the tango community
        </p>
        
        {stats && (
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{stats.postsToday || 0} posts today</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{stats.activeUsers || 0} active</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{stats.upcomingEvents || 0} upcoming events</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
