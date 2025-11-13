import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CampaignStatsPanelProps {
  campaignId: number;
  analytics: {
    donationTimeline: Array<{
      date: string;
      amount: number;
      count: number;
    }>;
    topDonors: Array<{
      donor: {
        name: string;
        username: string;
        profileImage?: string;
      };
      totalAmount: number;
      donationCount: number;
    }>;
  };
  campaign: {
    currentAmount: string;
    goalAmount: string;
    backerCount: number;
    daysRemaining?: number;
  };
}

export function CampaignStatsPanel({ analytics, campaign }: CampaignStatsPanelProps) {
  const currentAmount = parseFloat(campaign.currentAmount);
  const goalAmount = parseFloat(campaign.goalAmount);
  const percentage = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;

  const stats = [
    {
      label: "Total Raised",
      value: `$${currentAmount.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: "Goal",
      value: `$${goalAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      label: "Backers",
      value: campaign.backerCount.toString(),
      icon: Users,
      color: "text-violet-500",
    },
    {
      label: "Days Left",
      value: campaign.daysRemaining !== null && campaign.daysRemaining !== undefined 
        ? Math.round(campaign.daysRemaining).toString() 
        : "N/A",
      icon: Calendar,
      color: "text-cyan-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.label}
            className="border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card 
        className="border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CardHeader>
          <CardTitle>Campaign Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Donation Timeline</TabsTrigger>
              <TabsTrigger value="donors">Top Donors</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4 mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.donationTimeline}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(10, 24, 40, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#40E0D0" 
                    strokeWidth={2}
                    dot={{ fill: '#40E0D0', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="donors" className="space-y-4 mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topDonors.slice(0, 10)}>
                  <XAxis 
                    dataKey="donor.username" 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#888"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(10, 24, 40, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="totalAmount" 
                    fill="#1E90FF"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
