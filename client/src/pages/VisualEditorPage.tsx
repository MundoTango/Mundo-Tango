/**
 * Visual Editor - Replit-style Development Environment (Rebuilt from scratch)
 * Phase 3: Tab Structure
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShieldAlert, Crown, Bot, Cpu, GitBranch, Key, Rocket, Database, Terminal, Bug } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function VisualEditorPage() {
  const [activeTab, setActiveTab] = useState("autonomous");

  // Fetch current user
  const { data: authResponse, isLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
  });

  const user = authResponse?.user;

  // God Level check
  const isGodLevel = user?.role === 'god';

  // Loading state
  if (isLoading) {
    return (
      <>
        <SEO 
          title="Visual Editor - Mundo Tango"
          description="Replit-style development environment with AI assistance"
        />
        <div className="h-screen w-full bg-background flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Loading Visual Editor...
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Access denied for non-God Level users
  if (!isGodLevel) {
    return (
      <>
        <SEO 
          title="Access Denied - Visual Editor"
          description="God Level access required"
        />
        <div className="h-screen w-full bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  The Visual Editor requires God Level (Tier 8) access.
                  {user ? ` Your current role: ${user.role}` : ' Please log in.'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // God Level access confirmed - Full Visual Editor
  return (
    <>
      <SEO 
        title="Visual Editor - Mundo Tango"
        description="Replit-style development environment with AI assistance"
      />
      
      <div className="h-screen w-full bg-background flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Visual Editor</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {user.name} (God Level)
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="mr-blue" 
              data-testid="tab-mr-blue"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Bot className="h-4 w-4 mr-2" />
              Mr. Blue
            </TabsTrigger>
            <TabsTrigger 
              value="autonomous" 
              data-testid="tab-autonomous"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Cpu className="h-4 w-4 mr-2" />
              Autonomous
            </TabsTrigger>
            <TabsTrigger 
              value="git" 
              data-testid="tab-git"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Git
            </TabsTrigger>
            <TabsTrigger 
              value="secrets" 
              data-testid="tab-secrets"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Key className="h-4 w-4 mr-2" />
              Secrets
            </TabsTrigger>
            <TabsTrigger 
              value="deploy" 
              data-testid="tab-deploy"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </TabsTrigger>
            <TabsTrigger 
              value="database" 
              data-testid="tab-database"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger 
              value="console" 
              data-testid="tab-console"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Console
            </TabsTrigger>
            <TabsTrigger 
              value="debug" 
              data-testid="tab-debug"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            <TabsContent value="mr-blue" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🤖 Mr. Blue AI Assistant - Coming in Phase 6
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="autonomous" className="h-full m-0 p-4">
              <div data-testid="autonomous-workflow-panel" className="h-full flex flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Autonomous Task Execution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="autonomous-prompt" className="text-sm font-medium mb-2 block">
                        Describe what you want Mr. Blue to build:
                      </label>
                      <textarea
                        id="autonomous-prompt"
                        data-testid="input-autonomous-prompt"
                        placeholder="Example: Add a file upload component with image preview thumbnails..."
                        className="w-full min-h-[120px] p-3 border rounded-md resize-y"
                      />
                    </div>
                    <button
                      data-testid="button-start-autonomous"
                      className="w-full bg-primary text-primary-foreground hover-elevate active-elevate-2 rounded-md px-4 py-2 font-medium"
                    >
                      Execute Autonomous Task
                    </button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Task Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertDescription className="text-sm">
                        🎯 God Level: Unlimited operations, no rate limits, no cost caps
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="git" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🌿 Git Integration - Coming in Phase 6
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="secrets" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🔐 Secrets Management - Coming in Phase 6
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="deploy" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🚀 Deployment Controls - Coming in Phase 6
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="database" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  💾 Database Operations - Coming in Phase 6
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="console" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  💻 Shell Console - Coming in Phase 6
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="debug" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🐛 Debug Tools - Coming in Phase 6
                </AlertDescription>
              </Alert>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
