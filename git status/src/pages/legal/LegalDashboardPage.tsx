import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Files,
  BookTemplate,
  PenTool,
  Plus,
  Upload,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { DocumentCard } from "@/components/legal/DocumentCard";
import { SignatureStatusBadge } from "@/components/legal/SignatureStatusBadge";

export default function LegalDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/legal/stats'],
  });

  // Fetch recent documents
  const { data: recentDocuments = [] } = useQuery({
    queryKey: ['/api/legal/documents', { limit: 5 }],
  });

  // Fetch pending signatures
  const { data: pendingSignatures = [] } = useQuery({
    queryKey: ['/api/legal/signatures/pending'],
  });

  const mockStats = {
    totalDocuments: 24,
    pendingSignatures: 5,
    completedDocuments: 15,
    drafts: 4,
  };

  const mockRecentDocs = [
    {
      id: 1,
      title: "Event Liability Waiver - Tango Festival 2024",
      type: "Waiver",
      status: "pending",
      lastModified: new Date("2024-01-15"),
      participants: 3,
      signedCount: 1,
      totalSignatures: 3,
    },
    {
      id: 2,
      title: "Teacher Employment Contract - Maria González",
      type: "Contract",
      status: "signed",
      lastModified: new Date("2024-01-14"),
      participants: 2,
      signedCount: 2,
      totalSignatures: 2,
    },
    {
      id: 3,
      title: "Venue Rental Agreement - La Milonga Space",
      type: "Agreement",
      status: "draft",
      lastModified: new Date("2024-01-13"),
      participants: 0,
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2">Legal Documents</h1>
          <p className="text-muted-foreground">
            Manage contracts, waivers, and agreements for your tango community
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/legal/templates">
              <BookTemplate className="w-4 h-4 mr-2" />
              Browse Templates
            </Link>
          </Button>
          <Button asChild data-testid="button-create-document">
            <Link href="/legal/documents/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Document
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <PenTool className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendingSignatures}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting signatures
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.completedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Fully signed documents
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.drafts}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              asChild
              data-testid="button-create-from-template"
            >
              <Link href="/legal/templates">
                <BookTemplate className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">Create from Template</div>
                  <div className="text-xs text-muted-foreground">
                    Use pre-built templates
                  </div>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              data-testid="button-upload-document"
            >
              <Upload className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Upload Document</div>
                <div className="text-xs text-muted-foreground">
                  Import existing files
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              data-testid="button-request-signature"
            >
              <PenTool className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Request Signature</div>
                <div className="text-xs text-muted-foreground">
                  Send for signing
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts - Pending Signatures */}
      {mockStats.pendingSignatures > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <CardTitle>Pending Signatures</CardTitle>
              <Badge variant="secondary">{mockStats.pendingSignatures}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You have {mockStats.pendingSignatures} documents awaiting signatures
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/legal/documents?filter=pending">
                View All Pending
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Document Categories & Recent Documents */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="waivers">Waivers</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
          </TabsList>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Documents</h3>
            <Button variant="outline" size="sm" asChild>
              <Link href="/legal/documents">
                View All Documents
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {mockRecentDocs.map((doc) => (
              <Link key={doc.id} href={`/legal/documents/${doc.id}`}>
                <DocumentCard {...doc} />
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No contracts found</p>
        </TabsContent>

        <TabsContent value="waivers" className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No waivers found</p>
        </TabsContent>

        <TabsContent value="agreements" className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No agreements found</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
