import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  Trash2,
  PenTool,
  MessageSquare,
  Clock,
  Users,
  FileText,
} from "lucide-react";
import { DocumentViewer } from "@/components/legal/DocumentViewer";
import { SignatureStatusBadge } from "@/components/legal/SignatureStatusBadge";
import { VersionTimeline } from "@/components/legal/VersionTimeline";
import { ParticipantList } from "@/components/legal/ParticipantList";
import { AuditLogTable } from "@/components/legal/AuditLogTable";
import { DocumentShareModal } from "@/components/legal/DocumentShareModal";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function LegalDocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: document, isLoading } = useQuery({
    queryKey: ['/api/legal/documents', id],
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['/api/legal/versions', id],
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['/api/legal/signatures', id],
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['/api/legal/audit', id],
  });

  const shareMutation = useMutation({
    mutationFn: async ({ emails, message }: { emails: string[]; message: string }) => {
      return apiRequest(`/api/legal/documents/${id}/share`, 'POST', { emails, message });
    },
  });

  // Mock data for demonstration
  const mockDocument = {
    id: Number(id),
    title: "Event Liability Waiver - Tango Festival 2024",
    type: "Waiver",
    category: "Event Waiver",
    status: "pending",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "Admin User",
    content: `
      <h1>Event Liability Waiver</h1>
      <h2>Tango Festival 2024</h2>
      
      <p>This Liability Waiver and Release Agreement ("Agreement") is entered into by and between the participant and the Event Organizer.</p>
      
      <h3>1. Acknowledgment of Risk</h3>
      <p>Participant acknowledges that tango dancing involves physical activity and carries inherent risks including but not limited to injury from physical contact, falls, or other accidents.</p>
      
      <h3>2. Assumption of Risk</h3>
      <p>Participant voluntarily assumes all risks associated with participation in the Tango Festival 2024, including any workshops, classes, and social dancing events.</p>
      
      <h3>3. Release and Waiver</h3>
      <p>Participant hereby releases, waives, and discharges the Event Organizer, its officers, employees, and agents from any and all liability for injury, illness, death, or property damage arising from participation.</p>
      
      <h3>4. Medical Treatment</h3>
      <p>Participant authorizes the Event Organizer to secure emergency medical treatment if necessary.</p>
      
      <h3>5. Photography and Video</h3>
      <p>Participant grants permission for photographs and videos taken during the event to be used for promotional purposes.</p>
    `,
    description: "Liability waiver for all participants of the Tango Festival 2024",
  };

  const mockParticipants = [
    {
      id: 1,
      name: "Maria González",
      email: "maria@example.com",
      role: "Participant",
      status: "signed" as const,
      signedAt: new Date("2024-01-14"),
      profileImage: undefined,
    },
    {
      id: 2,
      name: "Carlos Rodriguez",
      email: "carlos@example.com",
      role: "Participant",
      status: "pending" as const,
      profileImage: undefined,
    },
    {
      id: 3,
      name: "Ana Silva",
      email: "ana@example.com",
      role: "Participant",
      status: "pending" as const,
      profileImage: undefined,
    },
  ];

  const mockVersions = [
    {
      id: 1,
      version: 2,
      createdAt: new Date("2024-01-15"),
      createdBy: "Admin User",
      changes: "Updated photography clause wording",
      isCurrent: true,
    },
    {
      id: 2,
      version: 1,
      createdAt: new Date("2024-01-10"),
      createdBy: "Admin User",
      changes: "Initial version created",
      isCurrent: false,
    },
  ];

  const mockAuditLogs = [
    {
      id: 1,
      action: "Document Created",
      performedBy: "Admin User",
      timestamp: new Date("2024-01-10T10:00:00"),
      ipAddress: "192.168.1.1",
      details: "Created from Event Waiver template",
    },
    {
      id: 2,
      action: "Document Updated",
      performedBy: "Admin User",
      timestamp: new Date("2024-01-15T14:30:00"),
      ipAddress: "192.168.1.1",
      details: "Updated photography clause",
    },
    {
      id: 3,
      action: "Document Shared",
      performedBy: "Admin User",
      timestamp: new Date("2024-01-15T15:00:00"),
      ipAddress: "192.168.1.1",
      details: "Shared with 3 participants",
    },
    {
      id: 4,
      action: "Document Signed",
      performedBy: "Maria González",
      timestamp: new Date("2024-01-14T16:45:00"),
      ipAddress: "192.168.1.50",
      details: "Signed via draw signature",
    },
  ];

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your document is being downloaded",
    });
  };

  const handleShare = async (emails: string[], message: string) => {
    await shareMutation.mutateAsync({ emails, message });
  };

  const handleSendReminder = (participantId: number) => {
    toast({
      title: "Reminder sent",
      description: "Email reminder has been sent to the participant",
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/legal/documents">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documents
            </Link>
          </Button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold font-serif">{mockDocument.title}</h1>
            <SignatureStatusBadge status={mockDocument.status} />
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <Badge variant="secondary">{mockDocument.type}</Badge>
            <span>Created {format(mockDocument.createdAt, "MMM d, yyyy")}</span>
            <span>•</span>
            <span>Modified {format(mockDocument.updatedAt, "MMM d, yyyy")}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShareModalOpen(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            data-testid="button-download-pdf"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {mockDocument.status === 'draft' && (
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            data-testid="button-request-signature"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Request Signature
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Document Viewer */}
        <div className="lg:col-span-2">
          <DocumentViewer
            title={mockDocument.title}
            content={mockDocument.content}
            onDownload={handleDownload}
          />
        </div>

        {/* Right Column - Metadata & Info */}
        <div className="space-y-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="font-medium">{mockDocument.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="font-medium">{mockDocument.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <p className="font-medium">{mockDocument.createdBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <SignatureStatusBadge status={mockDocument.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm mt-1">{mockDocument.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Participants</span>
                  </div>
                  <p className="text-2xl font-bold">{mockParticipants.length}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PenTool className="w-4 h-4" />
                    <span className="text-sm">Signed</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {mockParticipants.filter(p => p.status === 'signed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs - Details */}
      <Tabs defaultValue="participants" className="w-full">
        <TabsList>
          <TabsTrigger value="participants">
            <Users className="w-4 h-4 mr-2" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="versions">
            <Clock className="w-4 h-4 mr-2" />
            Version History
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6">
          <ParticipantList
            participants={mockParticipants}
            onSendReminder={handleSendReminder}
          />
        </TabsContent>

        <TabsContent value="versions" className="mt-6">
          <VersionTimeline versions={mockVersions} />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogTable logs={mockAuditLogs} />
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      <DocumentShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        documentTitle={mockDocument.title}
        onShare={handleShare}
      />
    </div>
  );
}
