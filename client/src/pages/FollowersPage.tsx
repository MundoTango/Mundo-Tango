import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function FollowersPage() {
  const { data: followers, isLoading } = useQuery({
    queryKey: ["/api/followers"],
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <SelfHealingErrorBoundary pageName="Followers" fallbackRoute="/profile">
      <PageLayout title="Followers" showBreadcrumbs>
        {/* Editorial Hero */}
        <div className="relative h-[40vh] w-full overflow-hidden mb-12">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&h=900&fit=crop')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                <Users className="w-3 h-3 mr-2" />
                Community
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Your Followers
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Connect with fellow dancers who follow your journey
              </p>
            </motion.div>
          </div>
        </div>

        <div className="min-h-screen bg-background py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : followers && Array.isArray(followers) && followers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {followers.map((user: any, idx: number) => (
                  <motion.div 
                    key={user.id}
                    {...fadeInUp}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="overflow-hidden hover-elevate h-full" data-testid={`user-${user.id}`}>
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <motion.img
                          src={user.avatar || `https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=450&fit=crop`}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <Avatar className="w-16 h-16 border-2 border-white/30 mb-2">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xl">{user.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                            {user.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {user.username}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" data-testid={`button-follow-${user.id}`}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow Back
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div {...fadeInUp}>
                <Card data-testid="card-no-followers" className="overflow-hidden max-w-3xl mx-auto">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&h=900&fit=crop"
                      alt="No followers"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                  </div>
                  <CardContent className="py-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                    <h3 className="text-3xl font-serif font-bold mb-4">No followers yet</h3>
                    <p className="text-lg text-muted-foreground">
                      Share your tango journey to grow your community
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
