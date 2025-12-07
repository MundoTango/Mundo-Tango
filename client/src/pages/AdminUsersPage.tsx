import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  profileImage?: string;
  role: string;
  isActive?: boolean;
  suspended?: boolean;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: usersResponse, isLoading } = useQuery<UsersResponse>({
    queryKey: ['/api/admin/users', { search, page, limit }],
  });

  const users = usersResponse?.users || [];
  const total = usersResponse?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const getStatusBadge = (user: User) => {
    if (user.suspended) return <Badge variant="destructive">Suspended</Badge>;
    if (user.isActive === false) return <Badge variant="outline">Inactive</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

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
                {total > 0 ? `${total} registered users across the platform` : 'Browse and manage all user accounts'}
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-serif" data-testid="text-user-count">
                      All Users ({total})
                    </CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        className="pl-10"
                        data-testid="input-search-users"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {search ? `No users found matching "${search}"` : 'No users found'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                          data-testid={`user-row-${user.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profileImage || ''} alt={user.name} />
                              <AvatarFallback>
                                {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold" data-testid={`text-name-${user.id}`}>{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={user.role === "admin" ? "default" : "secondary"}
                              data-testid={`badge-role-${user.id}`}
                            >
                              {user.role}
                            </Badge>
                            {getStatusBadge(user)}
                            <Link href={`/admin/users/${user.id}`}>
                              <Button variant="outline" size="sm" data-testid={`button-view-${user.id}`}>
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground" data-testid="text-pagination">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        data-testid="button-next-page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
