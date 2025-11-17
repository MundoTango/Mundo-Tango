import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Crown, Award, Music, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Role {
  id: string;
  name: string;
  level: number;
  description: string;
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const roles: Role[] = [
  { id: 'god', name: 'God', level: 8, description: 'Full system access', userCount: 1 },
  { id: 'super_admin', name: 'Super Admin', level: 7, description: 'Platform administration', userCount: 2 },
  { id: 'admin', name: 'Admin', level: 4, description: 'Content & user management', userCount: 5 },
  { id: 'moderator', name: 'Moderator', level: 3, description: 'Content moderation', userCount: 12 },
  { id: 'teacher', name: 'Teacher', level: 2, description: 'Create workshops & teach', userCount: 45 },
  { id: 'dj', name: 'DJ', level: 2, description: 'Music & playlist management', userCount: 38 },
  { id: 'organizer', name: 'Organizer', level: 2, description: 'Event organization', userCount: 67 },
  { id: 'user', name: 'User', level: 1, description: 'Basic platform access', userCount: 1247 },
];

const permissions: Permission[] = [
  { id: 'users.view', name: 'View Users', description: 'View user profiles', category: 'Users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user information', category: 'Users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'Users' },
  { id: 'users.ban', name: 'Ban Users', description: 'Suspend or ban users', category: 'Users' },
  { id: 'content.view', name: 'View Content', description: 'View all content', category: 'Content' },
  { id: 'content.moderate', name: 'Moderate Content', description: 'Remove inappropriate content', category: 'Content' },
  { id: 'events.create', name: 'Create Events', description: 'Create new events', category: 'Events' },
  { id: 'events.edit', name: 'Edit Events', description: 'Edit any event', category: 'Events' },
  { id: 'events.delete', name: 'Delete Events', description: 'Delete any event', category: 'Events' },
  { id: 'settings.view', name: 'View Settings', description: 'View platform settings', category: 'Settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify platform settings', category: 'Settings' },
];

export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, boolean>>({
    'users.view': true,
    'users.edit': true,
    'users.delete': true,
    'users.ban': true,
    'content.view': true,
    'content.moderate': true,
    'events.create': true,
    'events.edit': true,
    'events.delete': false,
    'settings.view': true,
    'settings.edit': false,
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'god': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'super_admin': return <Shield className="h-4 w-4 text-red-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'moderator': return <Shield className="h-4 w-4 text-green-500" />;
      case 'teacher': return <Award className="h-4 w-4 text-purple-500" />;
      case 'dj': return <Music className="h-4 w-4 text-pink-500" />;
      case 'organizer': return <Calendar className="h-4 w-4 text-orange-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-8" data-testid="page-roles-permissions">
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and permissions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-roles-list">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>8-tier role hierarchy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 rounded-lg border cursor-pointer hover-elevate transition-colors ${
                    selectedRole === role.id ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                  data-testid={`role-${role.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(role.id)}
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" data-testid={`badge-level-${role.id}`}>Level {role.level}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {role.userCount} users
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-permissions-matrix">
          <CardHeader>
            <CardTitle>Permissions for {roles.find(r => r.id === selectedRole)?.name}</CardTitle>
            <CardDescription>Configure role permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-semibold text-sm">{category}</h4>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">{perm.name}</div>
                          <div className="text-xs text-muted-foreground">{perm.description}</div>
                        </div>
                        <Switch
                          checked={permissionsMatrix[perm.id] ?? false}
                          onCheckedChange={(checked) => 
                            setPermissionsMatrix({ ...permissionsMatrix, [perm.id]: checked })
                          }
                          data-testid={`switch-${perm.id}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6" data-testid="button-save-permissions">
              Save Permissions
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-audit-log">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Recent role and permission changes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow data-testid="audit-1">
                <TableCell>2024-01-15 14:32</TableCell>
                <TableCell>admin@mundotango.com</TableCell>
                <TableCell>Role Updated</TableCell>
                <TableCell>Changed user john@example.com to Moderator</TableCell>
              </TableRow>
              <TableRow data-testid="audit-2">
                <TableCell>2024-01-15 10:15</TableCell>
                <TableCell>admin@mundotango.com</TableCell>
                <TableCell>Permission Modified</TableCell>
                <TableCell>Granted events.delete to DJ role</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
