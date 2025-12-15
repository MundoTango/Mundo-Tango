import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Upload, Sparkles, ArrowRight, CheckCircle, FileText, Brain, Zap, Target, X, Files } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

interface UploadedDocument {
  file: File;
  text: string;
  base64Buffer: string;
  status: "pending" | "parsed" | "error";
}

export default function TalentMatchPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<"upload" | "clarifier" | "results">("upload");
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getAllResumeText = () => uploadedDocuments.map(d => d.text).join("\n\n---\n\n");

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    const newDocuments: UploadedDocument[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid format. Please upload PDF, DOCX, or TXT files.`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive"
        });
        continue;
      }

      const isDuplicate = uploadedDocuments.some(d => d.file.name === file.name && d.file.size === file.size);
      if (isDuplicate) {
        toast({
          title: "Duplicate file",
          description: `${file.name} has already been uploaded`,
        });
        continue;
      }

      newDocuments.push({ file, text: "", base64Buffer: "", status: "pending" });
    }

    if (newDocuments.length > 0) {
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      
      for (const doc of newDocuments) {
        const reader = new FileReader();
        const docName = doc.file.name;
        const docSize = doc.file.size;
        const extension = docName.toLowerCase().split('.').pop();
        const isBinaryFile = extension === 'pdf' || extension === 'docx';
        
        reader.onload = (event) => {
          if (isBinaryFile) {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
              binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64Buffer = btoa(binaryString);
            setUploadedDocuments(prev => 
              prev.map(d => (d.file.name === docName && d.file.size === docSize) 
                ? { ...d, base64Buffer, text: `[Binary file - ${extension?.toUpperCase()}]`, status: "parsed" } 
                : d)
            );
          } else {
            const text = event.target?.result as string;
            setUploadedDocuments(prev => 
              prev.map(d => (d.file.name === docName && d.file.size === docSize) 
                ? { ...d, text, base64Buffer: "", status: "parsed" } 
                : d)
            );
          }
        };
        reader.onerror = () => {
          setUploadedDocuments(prev => 
            prev.map(d => (d.file.name === docName && d.file.size === docSize) ? { ...d, status: "error" } : d)
          );
        };
        
        if (isBinaryFile) {
          reader.readAsArrayBuffer(doc.file);
        } else {
          reader.readAsText(doc.file);
        }
      }

      toast({
        title: `${newDocuments.length} document${newDocuments.length > 1 ? 's' : ''} added`,
        description: "Your career history is being processed"
      });
    }

    e.target.value = "";
  };

  const removeDocument = (fileName: string, fileSize: number) => {
    setUploadedDocuments(prev => prev.filter(d => !(d.file.name === fileName && d.file.size === fileSize)));
    toast({
      title: "Document removed",
      description: fileName
    });
  };

  const handleStartClarifier = async () => {
    const hasDocuments = uploadedDocuments.length > 0 && uploadedDocuments.some(d => d.status === "parsed");
    if (!hasDocuments) {
      toast({
        title: "Resume required",
        description: "Please upload at least one resume to continue",
        variant: "destructive"
      });
      return;
    }

    if (authLoading) {
      toast({
        title: "Please wait",
        description: "Verifying authentication...",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to continue with talent matching",
        variant: "destructive"
      });
      setLocation("/login");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const volunteerResponse = await apiRequest("POST", "/api/v1/volunteers", {
        userId: user.id,
        profile: {
          hasDocuments: uploadedDocuments.length > 0,
          uploadedFileNames: uploadedDocuments.map(d => d.file.name)
        },
        skills: [],
        availability: "flexible",
        hoursPerWeek: 10
      });
      const volunteer = await volunteerResponse.json();

      for (const doc of uploadedDocuments) {
        const extension = doc.file.name.toLowerCase().split('.').pop();
        const isBinaryFile = extension === 'pdf' || extension === 'docx';
        
        await apiRequest("POST", `/api/v1/volunteers/${volunteer.id}/resume`, {
          filename: doc.file.name,
          fileUrl: "",
          fileBuffer: isBinaryFile ? doc.base64Buffer : undefined,
          parsedText: isBinaryFile ? undefined : doc.text,
          links: []
        });
      }

      const sessionResponse = await apiRequest("POST", `/api/v1/volunteers/${volunteer.id}/clarifier`);
      const session = await sessionResponse.json();

      toast({
        title: "Profile created!",
        description: "Starting AI interview. After completion, visit H2AC Dashboard for your agent assignments.",
      });

      setLocation(`/talent-match-interview?session=${session.id}&volunteer=${volunteer.id}&returnTo=/h2ac-dashboard`);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create volunteer profile",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <PageLayout title="AI Talent Match" showBreadcrumbs>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Talent Match" fallbackRoute="/platform">
      <PageLayout title="AI Talent Match" showBreadcrumbs>
        <SEO
          title="AI Talent Match - Mundo Tango"
          description="Let AI match your skills with perfect volunteer opportunities at Mundo Tango. Our intelligent matching system finds the ideal role for your talents."
        />

        {/* Editorial Hero Section - 16:9 */}
        <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          
          <div className="relative z-10 h-full flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center max-w-4xl"
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-ai-powered">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered Matching
              </Badge>

              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight" data-testid="heading-hero">
                Your Perfect Role Awaits
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Our AI analyzes your experience and matches you with volunteer opportunities where you'll make the greatest impact
              </p>

              {/* AI Features */}
              <div className="flex flex-wrap gap-6 justify-center text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Perfect Matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Smart Recommendations</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-background py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            {/* How It Works Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">How It Works</h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Three simple steps to find your perfect volunteer role
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Share Your Experience",
                    description: "Upload your resumes and career documents. Our AI will analyze your skills and background.",
                    icon: Upload
                  },
                  {
                    step: "02",
                    title: "AI Interview",
                    description: "Have a brief conversation with Mr Blue AI to clarify your interests and availability.",
                    icon: Brain
                  },
                  {
                    step: "03",
                    title: "Get Matched",
                    description: "Receive personalized recommendations for volunteer roles that align with your talents.",
                    icon: Target
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="h-full hover-elevate">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <item.icon className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-4xl font-serif font-bold text-muted-foreground/30">{item.step}</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-3">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Application Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Start Your Journey</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Share your professional background and let our AI find the perfect match for you
                </p>
              </div>

              <Card className="overflow-hidden border-2">
                <CardContent className="p-8 md:p-12 space-y-6">
                  {/* File Upload - Multiple Documents */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Files className="h-5 w-5 text-primary" />
                      <Label htmlFor="resume-upload" className="text-base font-medium">Upload Your Resumes</Label>
                    </div>
                    
                    {/* Compelling Messaging */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                      <p className="text-sm leading-relaxed">
                        <strong>We want ALL of your resumes</strong> so we can truly understand who you are, what you have worked on, and what you want to do.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The paper resume should die. Your current job gets 12-15 bullets, your 2nd job 9-11, your 3rd 3-6. With each new resume you short-change yourself and forget what you've accomplished.
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        In this AI age where both talent and companies use AI to match, why limit yourself to one page? We want you to be excited to partner with us and work on the things you really want to help the Tango community.
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT • Maximum 5MB each • Select multiple files</p>
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      multiple
                      onChange={handleResumeUpload}
                      data-testid="input-resume-upload"
                      className="cursor-pointer"
                    />
                    
                    {/* Uploaded Documents List */}
                    <AnimatePresence mode="popLayout">
                      {uploadedDocuments.map((doc) => (
                        <motion.div
                          key={`${doc.file.name}-${doc.file.size}`}
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
                          data-testid={`document-${doc.file.name}-${doc.file.size}`}
                        >
                          <FileText className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm font-medium flex-1 truncate">{doc.file.name}</span>
                          {doc.status === "parsed" && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                          {doc.status === "pending" && <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />}
                          {doc.status === "error" && <span className="text-xs text-destructive">Error</span>}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeDocument(doc.file.name, doc.file.size)}
                            data-testid={`button-remove-${doc.file.name}-${doc.file.size}`}
                            className="h-8 w-8 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {uploadedDocuments.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {uploadedDocuments.length} document{uploadedDocuments.length > 1 ? 's' : ''} uploaded • Click above to add more
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      onClick={handleStartClarifier}
                      disabled={isSubmitting || authLoading || uploadedDocuments.length === 0}
                      size="lg"
                      className="w-full gap-2 text-base"
                      data-testid="button-start-clarifier"
                    >
                      {isSubmitting ? (
                        <>
                          <Sparkles className="h-5 w-5 animate-pulse" />
                          Creating Your Profile...
                        </>
                      ) : authLoading ? (
                        "Verifying..."
                      ) : (
                        <>
                          Begin AI Interview
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground mt-4">
                      You'll be redirected to chat with Mr Blue AI for a personalized interview
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* H2AC Integration Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12"
            >
              <Card className="bg-gradient-to-r from-blue-500/10 via-accent/5 to-blue-500/10 border-blue-500/20">
                <CardContent className="py-8 px-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold">What Happens Next?</h3>
                      <p className="text-muted-foreground">Your journey to H2AC Dashboard</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">AI Interview</h4>
                        <p className="text-sm text-muted-foreground">Mr Blue AI conducts a personalized interview to understand your skills</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Agent Assignment</h4>
                        <p className="text-sm text-muted-foreground">Specialized AI agents are assigned to match you with opportunities</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">H2AC Dashboard</h4>
                        <p className="text-sm text-muted-foreground">View your agents, matched opportunities, and communicate with AI</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-blue-500/20 text-center">
                    <Link href="/h2ac-dashboard" className="text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-2 font-medium" data-testid="link-h2ac-preview">
                      Preview H2AC Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Back Link */}
            <div className="text-center mt-12">
              <Link href="/volunteer" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2" data-testid="link-back">
                ← Back to Volunteer Opportunities
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
