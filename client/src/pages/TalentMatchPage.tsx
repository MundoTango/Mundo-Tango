import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Upload, Link as LinkIcon, Sparkles, ArrowRight, CheckCircle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";

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
    if (!url) return true; // Empty is valid
    
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
    
    // Parse text from file
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

    // Validate URLs
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

    // Wait for auth to load before checking user
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
      // Create volunteer profile
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

      // Create resume record if we have text
      if (resumeText) {
        await apiRequest("POST", `/api/v1/volunteers/${volunteer.id}/resume`, {
          filename: uploadedFile?.name || "pasted-resume.txt",
          fileUrl: linkedinUrl || githubUrl || "",
          parsedText: resumeText,
          links: [linkedinUrl, githubUrl].filter(Boolean)
        });
      }

      // Start clarifier session
      const sessionResponse = await apiRequest("POST", `/api/v1/volunteers/${volunteer.id}/clarifier`);
      const session = await sessionResponse.json();

      toast({
        title: "Profile created!",
        description: "Starting AI interview...",
      });

      // Navigate to Mr Blue Chat with session context
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

  // Show loading state while auth is being verified
  if (authLoading) {
    return (
    <PageLayout title="AI Talent Match" showBreadcrumbs>
<>
        <SEO
          title="Talent Match - Mundo Tango"
          description="Apply to volunteer with Mundo Tango. Our AI-powered Talent Match system will find the perfect tasks for your skills."
        />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-background">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </>
    </PageLayout>);
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <>
      <SEO
        title="Talent Match - Mundo Tango"
        description="Apply to volunteer with Mundo Tango. Our AI-powered Talent Match system will find the perfect tasks for your skills."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div {...fadeInUp} className="text-center mb-12">
            <div className="inline-block mb-4">
              <Sparkles className="h-16 w-16 text-primary mx-auto" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AI Talent Match</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let our AI analyze your skills and match you with perfect volunteer opportunities
            </p>
          </motion.div>

          {/* Step 1: Upload Information */}
          <motion.div {...fadeInUp}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Share Your Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload with Preview */}
                <div className="space-y-2">
                  <Label htmlFor="resume-upload">Upload Resume (PDF, DOCX, TXT - Max 5MB)</Label>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeUpload}
                    data-testid="input-resume-upload"
                  />
                  {uploadedFile && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste your resume</span>
                  </div>
                </div>

                {/* Resume Text */}
                <div className="space-y-2">
                  <Label htmlFor="resume-text">Resume Text</Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Paste your resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={8}
                    data-testid="textarea-resume"
                  />
                  <p className="text-xs text-muted-foreground">
                    {resumeText.length} characters
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or share your profiles</span>
                  </div>
                </div>

                {/* Links with Validation */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin-url">
                      <LinkIcon className="h-4 w-4 inline mr-1" />
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedin-url"
                      type="url"
                      placeholder="https://linkedin.com/in/yourname"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      data-testid="input-linkedin"
                      className={linkedinUrl && !validateUrl(linkedinUrl, "linkedin") ? "border-red-500" : ""}
                    />
                    {linkedinUrl && !validateUrl(linkedinUrl, "linkedin") && (
                      <p className="text-xs text-red-500">Invalid LinkedIn URL</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github-url">
                      <LinkIcon className="h-4 w-4 inline mr-1" />
                      GitHub URL
                    </Label>
                    <Input
                      id="github-url"
                      type="url"
                      placeholder="https://github.com/yourname"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      data-testid="input-github"
                      className={githubUrl && !validateUrl(githubUrl, "github") ? "border-red-500" : ""}
                    />
                    {githubUrl && !validateUrl(githubUrl, "github") && (
                      <p className="text-xs text-red-500">Invalid GitHub URL</p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleStartClarifier}
                  disabled={isSubmitting || authLoading || (!resumeText && !linkedinUrl && !githubUrl)}
                  size="lg"
                  className="w-full gap-2"
                  data-testid="button-start-clarifier"
                >
                  {isSubmitting ? "Creating Profile..." : authLoading ? "Verifying..." : "Start AI Interview"}
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you'll be redirected to chat with Mr Blue AI for the interview process
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to Volunteer Page */}
          <div className="text-center mt-8">
            <Link href="/volunteer">
              <a className="text-sm text-muted-foreground hover:text-primary" data-testid="link-back">
                ← Back to Volunteer Page
              </a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
