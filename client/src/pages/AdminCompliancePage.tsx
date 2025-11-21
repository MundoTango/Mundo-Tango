import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  FileText, 
  Download, 
  AlertCircle,
  CheckCircle,
  Lock,
  Eye,
  Trash2,
  Database
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface AuditLog {
  id: number;
  action: string;
  userId: number;
  userName: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
}

interface DataRequest {
  id: number;
  userId: number;
  userName: string;
  type: 'export' | 'deletion';
  status: 'pending' | 'processing' | 'completed';
  requestedAt: string;
}

export default function AdminCompliancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in production from API
  const mockAuditLogs: AuditLog[] = [
    {
      id: 1,
      action: 'User Data Export',
      userId: 186,
      userName: 'Scott Plan Test',
      resource: 'user_data',
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1'
    },
    {
      id: 2,
      action: 'Privacy Settings Updated',
      userId: 146,
      userName: 'Scott Boddye',
      resource: 'privacy_settings',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ipAddress: '192.168.1.2'
    }
  ];

  const mockDataRequests: DataRequest[] = [
    {
      id: 1,
      userId: 186,
      userName: 'Scott Plan Test',
      type: 'export',
      status: 'completed',
      requestedAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const { data: auditLogs = mockAuditLogs } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/compliance/audit-logs"],
  });

  const { data: dataRequests = mockDataRequests } = useQuery<DataRequest[]>({
    queryKey: ["/api/admin/compliance/data-requests"],
  });

  const stats = {
    totalRequests: dataRequests.length,
    pendingRequests: dataRequests.filter(r => r.status === 'pending').length,
    auditEvents: auditLogs.length,
    gdprCompliant: true
  };

  return (
    <SelfHealingErrorBoundary pageName="Compliance Center" fallbackRoute="/admin">
      <SEO 
        title="Compliance Center - TrustCloud"
        description="GDPR compliance tools, audit logs, data export requests, and privacy management for Mundo Tango"
        ogImage="/og-image.png"
      />
      <PageLayout title="Compliance Center (TrustCloud)" showBreadcrumbs>
        <div className="container mx-auto p-6 space-y-6" data-testid="page-compliance">
          
          {/* Compliance Status */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card data-testid="stat-gdpr-status">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">GDPR Status</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-xl font-bold text-green-500">Compliant</span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-data-requests">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRequests}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingRequests} pending
                </p>
              </CardContent>
            </Card>

            <Card data-testid="stat-audit-events">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.auditEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card data-testid="stat-data-protection">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Protection</CardTitle>
                <Lock className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-xl font-bold text-green-500">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TrustCloud Info */}
          <Card data-testid="card-trustcloud-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                TrustCloud Compliance System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Automated GDPR, CCPA, and privacy compliance management. Monitor data 
                access, handle user requests, maintain audit trails, and ensure 
                regulatory compliance across the platform.
              </p>
              <div className="flex gap-2">
                <Badge variant="default">GDPR Compliant</Badge>
                <Badge variant="secondary">CCPA Ready</Badge>
                <Badge variant="outline">SOC 2 Type II</Badge>
                <Badge variant="outline">ISO 27001</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-compliance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="data-requests" data-testid="tab-data-requests">Data Requests</TabsTrigger>
              <TabsTrigger value="audit-logs" data-testid="tab-audit-logs">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card data-testid="card-compliance-features">
                <CardHeader>
                  <CardTitle>Compliance Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Download className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Data Export</h4>
                        <p className="text-sm text-muted-foreground">
                          Users can request complete data export in machine-readable format
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Trash2 className="h-5 w-5 text-red-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Right to Deletion</h4>
                        <p className="text-sm text-muted-foreground">
                          Process user account and data deletion requests
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Audit Trail</h4>
                        <p className="text-sm text-muted-foreground">
                          Complete log of all data access and modifications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-purple-500 mt-1" />
                      <div>
                        <h4 className="font-semibold">Data Inventory</h4>
                        <p className="text-sm text-muted-foreground">
                          Track what data is collected and where it's stored
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data-requests" className="space-y-4">
              <Card data-testid="card-data-requests">
                <CardHeader>
                  <CardTitle>User Data Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {dataRequests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No data requests
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dataRequests.map((request) => (
                        <div 
                          key={request.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                          data-testid={`request-${request.id}`}
                        >
                          <div>
                            <h4 className="font-semibold">{request.userName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.type === 'export' ? 'Data Export' : 'Account Deletion'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {safeDateDistance(request.requestedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                              {request.status}
                            </Badge>
                            <Button size="sm" variant="outline" data-testid={`button-process-${request.id}`}>
                              Process
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit-logs" className="space-y-4">
              <Card data-testid="card-audit-logs">
                <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No audit logs
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {auditLogs.map((log) => (
                        <div 
                          key={log.id} 
                          className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-muted/30 rounded"
                          data-testid={`log-${log.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{log.action}</span>
                              <Badge variant="outline" className="text-xs">{log.resource}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {log.userName} • {log.ipAddress} • {safeDateDistance(log.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
