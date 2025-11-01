import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeployButton } from "@/components/platform/DeployButton";
import { SecretsManager } from "@/components/platform/SecretsManager";
import { PreviewManager } from "@/components/platform/PreviewManager";
import { DomainsManager } from "@/components/platform/DomainsManager";
import { AnalyticsDashboard } from "@/components/platform/AnalyticsDashboard";
import { TeamManager } from "@/components/platform/TeamManager";
import { CostDashboard } from "@/components/platform/CostDashboard";
import { BackupsManager } from "@/components/platform/BackupsManager";
import { CICDManager } from "@/components/platform/CICDManager";
import { Globe, BarChart3, Users, DollarSign, Database, GitBranch, Rocket, Key, Eye } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

export default function Platform() {
  const [activeTab, setActiveTab] = useState("deploy");

  return (
    <PageLayout title="Platform Dashboard" showBreadcrumbs>
<div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-2">
            <TabsTrigger value="deploy" className="gap-2" data-testid="tab-deploy">
              <Rocket className="w-4 h-4" />
              <span className="hidden sm:inline">Deploy</span>
            </TabsTrigger>
            <TabsTrigger value="secrets" className="gap-2" data-testid="tab-secrets">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Secrets</span>
            </TabsTrigger>
            <TabsTrigger value="previews" className="gap-2" data-testid="tab-previews">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Previews</span>
            </TabsTrigger>
            <TabsTrigger value="domains" className="gap-2" data-testid="tab-domains">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Domains</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2" data-testid="tab-team">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="costs" className="gap-2" data-testid="tab-costs">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Costs</span>
            </TabsTrigger>
            <TabsTrigger value="backups" className="gap-2" data-testid="tab-backups">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Backups</span>
            </TabsTrigger>
            <TabsTrigger value="cicd" className="gap-2" data-testid="tab-cicd">
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">CI/CD</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="space-y-4">
            <DeployButton />
          </TabsContent>

          <TabsContent value="secrets" className="space-y-4">
            <SecretsManager />
          </TabsContent>

          <TabsContent value="previews" className="space-y-4">
            <PreviewManager />
          </TabsContent>

          <TabsContent value="domains" className="space-y-4">
            <DomainsManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <TeamManager />
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <CostDashboard />
          </TabsContent>

          <TabsContent value="backups" className="space-y-4">
            <BackupsManager />
          </TabsContent>

          <TabsContent value="cicd" className="space-y-4">
            <CICDManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </PageLayout>);
}
