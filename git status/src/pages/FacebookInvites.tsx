/**
 * Facebook Invites Page
 * Manage Facebook Messenger invitations with AI-powered generation
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InviteSender } from "@/components/facebook/InviteSender";
import { 
  TrendingUp, 
  Mail, 
  CheckCircle2, 
  Clock,
  Users,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

interface InviteStats {
  totalSent: number;
  opened: number;
  registered: number;
  openRate: number;
  conversionRate: number;
  sentToday: number;
}

interface Invitation {
  id: number;
  invitedFriendName: string;
  invitedFriendEmail: string | null;
  sentAt: string;
  opened: boolean;
  registered: boolean;
  sentVia: string;
}

export default function FacebookInvites() {
  // Fetch progress/stats
  const { data: progressData, isLoading: progressLoading } = useQuery<{
    stats: InviteStats;
    rateLimit: any;
  }>({
    queryKey: ['/api/facebook/invites/progress'],
  });

  // Fetch invite history
  const { data: historyData, isLoading: historyLoading } = useQuery<{
    invites: Invitation[];
    pagination: any;
  }>({
    queryKey: ['/api/facebook/invites/history', { page: 1, limit: 10 }],
  });

  const stats = progressData?.stats;
  const invites = historyData?.invites || [];

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-facebook-invites">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Facebook Messenger Invites</h1>
          <p className="text-muted-foreground">
            Send AI-powered personalized invitations to grow your tango community
          </p>
        </div>
        <Button
          onClick={() => window.location.href = '/facebook-test-workflow'}
          variant="outline"
          data-testid="button-test-workflow"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Test Workflow
        </Button>
      </div>

      {/* Stats Grid */}
      {!progressLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-stat-sent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.sentToday} sent today
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-opened">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opened</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.opened}</div>
              <p className="text-xs text-muted-foreground">
                {stats.openRate}% open rate
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-registered">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.registered}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate}% conversion
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-performance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Overall success rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Sender */}
        <InviteSender />

        {/* Recent Invites */}
        <Card data-testid="card-recent-invites">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Invitations
            </CardTitle>
            <CardDescription>
              Track your sent invitations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No invitations sent yet</p>
                <p className="text-sm">Send your first invite to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                    data-testid={`invite-${invite.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {invite.invitedFriendName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {invite.invitedFriendEmail || 'No email'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invite.sentAt && format(new Date(invite.sentAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <Badge
                        variant={invite.registered ? "default" : invite.opened ? "secondary" : "outline"}
                      >
                        {invite.registered ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Registered</>
                        ) : invite.opened ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Opened</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" /> Sent</>
                        )}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {invite.sentVia === 'facebook_messenger' ? 'Messenger' : 'Email'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card data-testid="card-tips">
        <CardHeader>
          <CardTitle>Tips for Better Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
              <span>Review and personalize AI-generated messages before sending</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
              <span>Keep messages between 100-150 words for best engagement</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
              <span>Phase 1: Limited to 5 invites per day to prevent spam</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
              <span>Invitations reset daily at midnight</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
