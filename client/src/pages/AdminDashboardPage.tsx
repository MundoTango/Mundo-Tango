import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Flag, BarChart } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Users", value: "12,453", icon: Users, change: "+12.5%" },
    { label: "Posts Today", value: "342", icon: FileText, change: "+8.2%" },
    { label: "Pending Reports", value: "23", icon: Flag, change: "-15.3%" },
    { label: "Active Sessions", value: "1,847", icon: BarChart, change: "+23.1%" }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label} data-testid={`stat-${stat.label.toLowerCase().replace(/ /g, "-")}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change} from last week</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">User joined the platform</span>
                    <span className="ml-auto text-xs text-muted-foreground">2m ago</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">API Response Time</span>
                  <span className="text-sm font-medium text-green-500">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Database</span>
                  <span className="text-sm font-medium text-green-500">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Storage</span>
                  <span className="text-sm font-medium text-green-500">Healthy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
