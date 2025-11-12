import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function AdminUsersPage() {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "User", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Teacher", status: "Active" },
    { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "Admin", status: "Active" }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Admin Users" fallbackRoute="/admin">
      <SEO 
        title="Platform Users"
        description="Browse and manage all user accounts, roles, and permissions across the Mundo Tango platform"
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <Users className="w-3 h-3 mr-1.5" />
                User Directory
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                Platform Users
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Browse and manage all user accounts on the platform
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-background py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">All Users ({users.length})</CardTitle>
                </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  data-testid={`user-${user.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === "Active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                    <Button variant="outline" size="sm" data-testid={`button-edit-${user.id}`}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
