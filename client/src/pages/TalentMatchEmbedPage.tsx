import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Upload, Sparkles, ArrowRight, CheckCircle, FileText, Brain, Zap, Target, X, Files, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

interface UploadedDocument {
  file: File;
  text: string;
  base64Buffer: string;
  status: "pending" | "parsed" | "error";
}

export default function TalentMatchEmbedPage() {
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
                ? { ...d, text, status: "parsed" } 
                : d)
            );
          }
        };
        
        reader.onerror = () => {
          setUploadedDocuments(prev => 
            prev.map(d => (d.file.name === docName && d.file.size === docSize) 
              ? { ...d, status: "error" } 
              : d)
          );
        };

        if (isBinaryFile) {
          reader.readAsArrayBuffer(doc.file);
        } else {
          reader.readAsText(doc.file);
        }
      }
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartClarifier = async () => {
    if (uploadedDocuments.length === 0) {
      toast({
        title: "No documents uploaded",
        description: "Please upload at least one document to continue",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const resumeEntries = uploadedDocuments.map(doc => ({
        type: "resume" as const,
        content: doc.text || doc.base64Buffer,
        metadata: JSON.stringify({ 
          filename: doc.file.name, 
          parsed: doc.status === "parsed",
          isBinary: doc.base64Buffer.length > 0
        }),
      }));

      const volunteerResult = await apiRequest("/api/v1/volunteers", {
        method: "POST",
        body: JSON.stringify({
          status: "profile_submitted",
        }),
      }) as { id: number } | { message: string };

      if (!volunteerResult || typeof volunteerResult !== 'object' || !('id' in volunteerResult)) {
        throw new Error("Failed to create volunteer profile");
      }

      const volunteerId = volunteerResult.id;

      for (const entry of resumeEntries) {
        await apiRequest("/api/resume-entries", {
          method: "POST",
          body: JSON.stringify({
            ...entry,
            volunteerId,
          }),
        });
      }

      setLocation(`/talent-match/interview?volunteerId=${volunteerId}`);
      
    } catch (error: any) {
      console.error("Volunteer creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start the talent match process",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedCount = uploadedDocuments.filter(d => d.status === "parsed").length;
  const pendingCount = uploadedDocuments.filter(d => d.status === "pending").length;
  const hasValidDocuments = parsedCount > 0 && pendingCount === 0;

  return (
    <SelfHealingErrorBoundary pageName="Talent Match Embed" fallbackRoute="/register">
      <SEO
        title="AI Talent Match - Mundo Tango"
        description="Let AI match your skills with perfect volunteer opportunities at Mundo Tango."
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary/90 via-primary to-primary/80 py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 container mx-auto max-w-4xl text-center"
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Matching
            </Badge>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight" data-testid="heading-hero">
              Your Perfect Role Awaits
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our AI analyzes your experience and matches you with volunteer opportunities where you'll make the greatest impact
            </p>

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
                    description: "Have a conversation with Mr. Blue, our AI interviewer, to understand your interests and availability.",
                    icon: Brain
                  },
                  {
                    step: "03",
                    title: "Get Matched",
                    description: "Receive personalized role recommendations based on your unique skills and experience.",
                    icon: Target
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden h-full border-0 bg-card/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <item.icon className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-4xl font-serif font-bold text-primary/20">{item.step}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Upload Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="border-2 border-dashed border-primary/20">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Files className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold mb-2">Start Your Journey</h2>
                    <p className="text-muted-foreground">
                      Upload your resume, CV, or portfolio documents to begin
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                      <Input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        multiple
                        onChange={handleResumeUpload}
                        className="hidden"
                        data-testid="input-resume-upload"
                      />
                      <Label
                        htmlFor="resume-upload"
                        className="cursor-pointer flex flex-col items-center gap-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-lg">Click to upload or drag & drop</p>
                          <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT (max 5MB each)</p>
                        </div>
                      </Label>
                    </div>

                    {/* Uploaded Documents List */}
                    <AnimatePresence>
                      {uploadedDocuments.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? 's' : ''} uploaded</span>
                            {parsedCount > 0 && (
                              <Badge variant="secondary" className="text-green-600 bg-green-50">
                                {parsedCount} ready
                              </Badge>
                            )}
                          </div>
                          
                          {uploadedDocuments.map((doc, index) => (
                            <motion.div
                              key={`${doc.file.name}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm truncate max-w-[200px]">{doc.file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(doc.file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.status === "pending" && (
                                  <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                    Processing...
                                  </Badge>
                                )}
                                {doc.status === "parsed" && (
                                  <CheckCircle className="w-5 h-5 text-green-500" data-testid={`icon-parsed-${index}`} />
                                )}
                                {doc.status === "error" && (
                                  <Badge variant="destructive">Error</Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeDocument(index)}
                                  className="h-8 w-8"
                                  data-testid={`button-remove-doc-${index}`}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      onClick={handleStartClarifier}
                      disabled={!hasValidDocuments || isSubmitting || authLoading}
                      className="w-full"
                      size="lg"
                      data-testid="button-start-clarifier"
                    >
                      {isSubmitting ? (
                        <>
                          <Brain className="w-5 h-5 mr-2 animate-pulse" />
                          Starting AI Interview...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Begin AI Interview
                        </>
                      )}
                    </Button>

                    {!user && !authLoading && (
                      <p className="text-center text-sm text-muted-foreground">
                        Please{" "}
                        <Link href="/login" className="text-primary hover:underline">
                          log in
                        </Link>
                        {" "}to save your progress
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* H2AC Integration Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-16"
            >
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-semibold mb-2">Part of H2AC Program</h3>
                    <p className="text-muted-foreground">
                      Our Human to Agent Collaboration program combines AI efficiency with human expertise to 
                      match volunteers with roles where they can make the greatest impact on the global tango community.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
