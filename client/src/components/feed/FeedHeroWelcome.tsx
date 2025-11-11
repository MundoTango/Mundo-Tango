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
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mb-6 overflow-hidden"
    >
      <Card 
        className="relative p-8 border-2"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(64, 224, 208, 0.12) 0%, 
              rgba(30, 144, 255, 0.08) 50%,
              rgba(100, 180, 255, 0.06) 100%
            )
          `,
          borderImage: 'linear-gradient(135deg, rgba(64, 224, 208, 0.4), rgba(30, 144, 255, 0.3)) 1',
          backdropFilter: 'blur(20px)',
          boxShadow: `
            0 8px 32px rgba(64, 224, 208, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 1px 3px rgba(0, 0, 0, 0.05)
          `,
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(64, 224, 208, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(30, 144, 255, 0.12) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-3"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {greeting}, {firstName}!
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground mb-6 text-lg"
          >
            Welcome back to your tango community
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-3 gap-4"
          >
            <StatCard
              icon={<Heart className="w-5 h-5" />}
              value={stats?.postsToday || 0}
              label="Posts Today"
              delay={0.7}
            />
            <StatCard
              icon={<Users className="w-5 h-5" />}
              value={stats?.activeUsers || 0}
              label="Active Now"
              delay={0.8}
            />
            <StatCard
              icon={<Calendar className="w-5 h-5" />}
              value={stats?.upcomingEvents || 0}
              label="Events This Week"
              delay={0.9}
            />
          </motion.div>
        </div>
      </Card>
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
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 200 }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="flex flex-col items-center p-4 rounded-lg cursor-pointer"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(64, 224, 208, 0.2)',
      }}
    >
      <div className="text-primary mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-muted-foreground text-center mt-1">
        {label}
      </div>
    </motion.div>
  );
}
