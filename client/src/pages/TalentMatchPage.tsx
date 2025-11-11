import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Upload, Link as LinkIcon, Sparkles, ArrowRight, CheckCircle, FileText, Brain, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function TalentMatchPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<"upload" | "clarifier" | "results">("upload");
  const [resumeText, setResumeText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateUrl = (url: string, type: "linkedin" | "github"): boolean => {
    if (!url) return true;
    
    if (type === "linkedin") {
      return url.includes("linkedin.com/in/") || url.includes("linkedin.com/pub/");
    } else {
      return url.includes("github.com/");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);

    toast({
      title: "Resume uploaded",
      description: `${file.name} loaded successfully`
    });
  };

  const handleStartClarifier = async () => {
    if (!resumeText && !linkedinUrl && !githubUrl) {
      toast({
        title: "Information required",
        description: "Please provide at least one: resume text, LinkedIn, or GitHub URL",
        variant: "destructive"
      });
      return;
    }

    if (linkedinUrl && !validateUrl(linkedinUrl, "linkedin")) {
      toast({
        title: "Invalid LinkedIn URL",
        description: "Please enter a valid LinkedIn profile URL (e.g., linkedin.com/in/yourname)",
        variant: "destructive"
      });
      return;
    }

    if (githubUrl && !validateUrl(githubUrl, "github")) {
      toast({
        title: "Invalid GitHub URL",
        description: "Please enter a valid GitHub profile URL (e.g., github.com/yourname)",
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
          resumeText,
          linkedinUrl,
          githubUrl,
          uploadedFileName: uploadedFile?.name
        },
        skills: [],
        availability: "flexible",
        hoursPerWeek: 10
      });
      const volunteer = await volunteerResponse.json();

      if (resumeText) {
        await apiRequest("POST", `/api/v1/volunteers/${volunteer.id}/resume`, {
          filename: uploadedFile?.name || "pasted-resume.txt",
          fileUrl: linkedinUrl || githubUrl || "",
          parsedText: resumeText,
          links: [linkedinUrl, githubUrl].filter(Boolean)
        });
      }

      const sessionResponse = await apiRequest("POST", `/api/v1/volunteers/${volunteer.id}/clarifier`);
      const session = await sessionResponse.json();

      toast({
        title: "Profile created!",
        description: "Starting AI interview...",
      });

      setLocation(`/mr-blue-chat?session=${session.id}&volunteer=${volunteer.id}`);

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
                    description: "Upload your resume or share your LinkedIn profile. Our AI will analyze your skills and background.",
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
                  {/* File Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="resume-upload" className="text-base font-medium">Upload Resume</Label>
                    <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT • Maximum 5MB</p>
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleResumeUpload}
                      data-testid="input-resume-upload"
                      className="cursor-pointer"
                    />
                    {uploadedFile && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg"
                      >
                        <FileText className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium flex-1">{uploadedFile.name}</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-4 text-sm text-muted-foreground font-medium">Or paste your resume</span>
                    </div>
                  </div>

                  {/* Resume Textarea */}
                  <div className="space-y-3">
                    <Label htmlFor="resume-text" className="text-base font-medium">Resume Text</Label>
                    <Textarea
                      id="resume-text"
                      placeholder="Paste your resume content here... Include your experience, skills, education, and anything else that showcases your background."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={10}
                      data-testid="textarea-resume"
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {resumeText.length} characters
                    </p>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-4 text-sm text-muted-foreground font-medium">Or share your professional profiles</span>
                    </div>
                  </div>

                  {/* Profile Links */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="linkedin-url" className="text-base font-medium flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        LinkedIn Profile
                      </Label>
                      <Input
                        id="linkedin-url"
                        type="url"
                        placeholder="https://linkedin.com/in/yourname"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        data-testid="input-linkedin"
                        className={linkedinUrl && !validateUrl(linkedinUrl, "linkedin") ? "border-destructive" : ""}
                      />
                      {linkedinUrl && !validateUrl(linkedinUrl, "linkedin") && (
                        <p className="text-sm text-destructive">Please enter a valid LinkedIn profile URL</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="github-url" className="text-base font-medium flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        GitHub Profile
                      </Label>
                      <Input
                        id="github-url"
                        type="url"
                        placeholder="https://github.com/yourname"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        data-testid="input-github"
                        className={githubUrl && !validateUrl(githubUrl, "github") ? "border-destructive" : ""}
                      />
                      {githubUrl && !validateUrl(githubUrl, "github") && (
                        <p className="text-sm text-destructive">Please enter a valid GitHub profile URL</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      onClick={handleStartClarifier}
                      disabled={isSubmitting || authLoading || (!resumeText && !linkedinUrl && !githubUrl)}
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

            {/* Back Link */}
            <div className="text-center mt-12">
              <Link href="/volunteer">
                <a className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2" data-testid="link-back">
                  ← Back to Volunteer Opportunities
                </a>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
