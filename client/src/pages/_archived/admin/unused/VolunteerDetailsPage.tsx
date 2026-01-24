import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import {
  ArrowLeft,
  User,
  FileText,
  MessageSquare,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Bot,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface VolunteerDetails {
  volunteer: {
    id: number;
    userId: number;
    profile: string;
    skills: string[];
    availability: string;
    hoursPerWeek: number;
    createdAt: string;
  };
  resume: {
    id: number;
    filename: string;
    parsedText: string;
    links: string[];
  } | null;
  interviewSessions: Array<{
    id: number;
    chatLog: Array<{
      role: string;
      content?: string;
      message?: string;
      timestamp?: string;
    }>;
    status: string;
    completedAt: string | null;
    detectedSignals: string[];
  }>;
  assignments: Array<{
    id: number;
    taskId: number;
    matchReason: string;
    status: string;
  }>;
}

export default function VolunteerDetailsPage() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const volunteerId = params.id;

  const { data, isLoading, error } = useQuery<VolunteerDetails>({
    queryKey: ["/api/v1/volunteers", volunteerId, "details"],
    queryFn: async () => {
      const res = await fetch(`/api/v1/volunteers/${volunteerId}/details`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch volunteer details");
      return res.json();
    },
    enabled: !!volunteerId,
  });

  if (error) {
    return (
      <PageLayout title="Volunteer Details" showBreadcrumbs>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Error Loading Volunteer</h2>
              <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
              <Button onClick={() => setLocation("/admin/talent-pipeline")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pipeline
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Volunteer Details" fallbackRoute="/admin/talent-pipeline">
      <PageLayout title="Volunteer Details" showBreadcrumbs>
        <SEO
          title="Volunteer Details - Admin"
          description="View volunteer profile, interview transcript, and assignment details."
        />

        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-8 px-4" data-testid="page-volunteer-details">
          <div className="container mx-auto max-w-5xl">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin/talent-pipeline")}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pipeline
            </Button>

            {isLoading ? (
              <VolunteerDetailsSkeleton />
            ) : data ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-card mb-6">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/20 text-primary text-xl">
                          <User className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl" data-testid="text-volunteer-name">
                          Volunteer #{data.volunteer.id}
                        </CardTitle>
                        <p className="text-muted-foreground" data-testid="text-volunteer-profile">
                          {(() => {
                            const profile = data.volunteer.profile;
                            if (!profile) return "No profile summary";
                            if (typeof profile === 'string') return profile;
                            if (typeof profile === 'object') {
                              const p = profile as { resumeText?: string; githubUrl?: string };
                              return p.resumeText?.substring(0, 200) || p.githubUrl || "Profile data available";
                            }
                            return "No profile summary";
                          })()}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(() => {
                            const skills = data.volunteer.skills;
                            if (Array.isArray(skills) && skills.length > 0) {
                              return skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" data-testid={`badge-skill-${idx}`}>
                                  {skill}
                                </Badge>
                              ));
                            }
                            if (skills && typeof skills === 'object' && Object.keys(skills).length > 0) {
                              return Object.keys(skills).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" data-testid={`badge-skill-${idx}`}>
                                  {skill}
                                </Badge>
                              ));
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {data.volunteer.hoursPerWeek}h/week
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {data.volunteer.availability}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Tabs defaultValue="interview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3" data-testid="tabs-list">
                    <TabsTrigger value="interview" data-testid="tab-interview">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Interview
                    </TabsTrigger>
                    <TabsTrigger value="resume" data-testid="tab-resume">
                      <FileText className="w-4 h-4 mr-2" />
                      Resume
                    </TabsTrigger>
                    <TabsTrigger value="assignments" data-testid="tab-assignments">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Assignments
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="interview" className="mt-4">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-primary" />
                          Mr. Blue AI Interview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {data.interviewSessions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No interview sessions yet.</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              {data.interviewSessions.map((session) => (
                                <div key={session.id}>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                                      {session.status === "completed" ? (
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                      ) : (
                                        <Clock className="w-3 h-3 mr-1" />
                                      )}
                                      {session.status}
                                    </Badge>
                                    {session.completedAt && (
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(session.completedAt), "PPp")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-3">
                                    {session.chatLog?.map((msg, idx) => {
                                      const isAI = msg.role === "assistant" || msg.role === "ai";
                                      const messageText = msg.content || msg.message || "";
                                      if (!messageText) return null;
                                      
                                      return (
                                        <div
                                          key={idx}
                                          className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}
                                          data-testid={`message-${session.id}-${idx}`}
                                        >
                                          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAI ? "bg-primary/20" : "bg-secondary"}`}>
                                            {isAI ? (
                                              <Bot className="w-4 h-4 text-primary" />
                                            ) : (
                                              <User className="w-4 h-4" />
                                            )}
                                          </div>
                                          <div className={`flex-1 p-3 rounded-lg ${isAI ? "bg-primary/10" : "bg-secondary"}`}>
                                            <p className="text-sm whitespace-pre-wrap">{messageText}</p>
                                            {msg.timestamp && (
                                              <span className="text-xs text-muted-foreground">
                                                {format(new Date(msg.timestamp), "p")}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {session.detectedSignals?.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                      <p className="text-sm font-medium mb-2">Detected Signals:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {session.detectedSignals.map((signal, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {signal}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="resume" className="mt-4">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          Resume
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!data.resume ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No resume uploaded.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                <FileText className="w-3 h-3 mr-1" />
                                {data.resume.filename}
                              </Badge>
                            </div>
                            {data.resume.links?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Links Found:</p>
                                <div className="flex flex-wrap gap-2">
                                  {data.resume.links.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline text-sm"
                                    >
                                      {link}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium mb-2">Parsed Content:</p>
                              <ScrollArea className="h-[300px] border rounded-lg p-4">
                                <pre className="text-sm whitespace-pre-wrap font-mono" data-testid="text-resume-content">
                                  {data.resume.parsedText || "No content parsed."}
                                </pre>
                              </ScrollArea>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="assignments" className="mt-4">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-primary" />
                          Task Assignments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {data.assignments.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No task assignments yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {data.assignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className="p-3 rounded-lg border hover-elevate"
                                data-testid={`assignment-${assignment.id}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Task #{assignment.taskId}</span>
                                  <Badge
                                    variant={
                                      assignment.status === "approved"
                                        ? "default"
                                        : assignment.status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {assignment.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {assignment.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                                    {assignment.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                                    {assignment.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{assignment.matchReason}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : null}
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

function VolunteerDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Skeleton className="h-10 w-full" />
      <Card className="glass-card">
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
