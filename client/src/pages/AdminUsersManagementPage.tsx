import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserCog, Trash2, Ban } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  verified: boolean;
  city?: string;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminUsersManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteAction, setDeleteAction] = useState<"delete" | "ban" | null>(null);
  const { toast } = useToast();

  const { data: usersData, isLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/admin/users", { page, search, role: roleFilter }],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, role, verified }: { userId: number; role: string; verified: boolean }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, { role, verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number; action: string }) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}?action=${action}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ 
        title: variables.action === "ban" ? "User banned" : "User deleted",
        description: variables.action === "ban" ? "User has been banned from the platform" : "User account has been permanently deleted"
      });
      setSelectedUser(null);
      setDeleteAction(null);
    },
    onError: () => {
      toast({ title: "Action failed", variant: "destructive" });
    },
  });

  const handleRoleChange = (userId: number, newRole: string, verified: boolean) => {
    updateUserMutation.mutate({ userId, role: newRole, verified });
  };

  const handleDeleteUser = () => {
    if (selectedUser && deleteAction) {
      deleteUserMutation.mutate({ userId: selectedUser.id, action: deleteAction });
    }
  };

  return (
    <PageLayout title="User Management" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="Admin Users" fallbackRoute="/admin">
        <div className="container mx-auto p-6" data-testid="page-admin-users">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48" data-testid="select-role-filter">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="god">God</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                All Users {usersData && `(${usersData.total})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted rounded" />
                          <div className="h-3 w-48 bg-muted rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : usersData?.users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No users found</p>
              ) : (
                <div className="space-y-4">
                  {usersData?.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                      data-testid={`user-row-${user.id}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{user.name}</p>
                            {user.verified && (
                              <Badge variant="outline" className="text-xs">✓ Verified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.email} • @{user.username}
                            {user.city && ` • ${user.city}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole, user.verified)}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-role-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="god">God</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteAction("ban");
                          }}
                          data-testid={`button-ban-${user.id}`}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteAction("delete");
                          }}
                          data-testid={`button-delete-${user.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {usersData && usersData.total > usersData.limit && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    data-testid="button-prev-page"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Page {page} of {Math.ceil(usersData.total / usersData.limit)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(usersData.total / usersData.limit)}
                    onClick={() => setPage((p) => p + 1)}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog open={!!selectedUser && !!deleteAction} onOpenChange={() => {
            setSelectedUser(null);
            setDeleteAction(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {deleteAction === "ban" ? "Ban User" : "Delete User"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteAction === "ban"
                    ? `Are you sure you want to ban ${selectedUser?.name}? They will be demoted to guest role and restricted from platform features.`
                    : `Are you sure you want to permanently delete ${selectedUser?.name}? This action cannot be undone and will remove all their data.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  className={deleteAction === "delete" ? "bg-destructive text-destructive-foreground" : ""}
                >
                  {deleteAction === "ban" ? "Ban User" : "Delete User"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SelfHealingErrorBoundary>
    </PageLayout>
  );
}
