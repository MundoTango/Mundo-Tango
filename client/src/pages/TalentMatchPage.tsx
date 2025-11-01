import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Upload, Link as LinkIcon, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function TalentMatchPage() {
  const [step, setStep] = useState<"upload" | "clarifier" | "results">("upload");
  const [resumeText, setResumeText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Parse resume file
    toast({
      title: "Resume uploaded",
      description: `Processing ${file.name}...`
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

    setIsLoading(true);
    
    try {
      // TODO: Create volunteer + start clarifier session
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep("clarifier");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          {step === "upload" && (
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Share Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="resume-upload">Upload Resume (PDF, DOCX)</Label>
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      data-testid="input-resume-upload"
                    />
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
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or share your profiles</span>
                    </div>
                  </div>

                  {/* Links */}
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
                      />
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
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleStartClarifier}
                    disabled={isLoading}
                    size="lg"
                    className="w-full gap-2"
                    data-testid="button-start-clarifier"
                  >
                    {isLoading ? "Processing..." : "Start AI Interview"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: AI Clarifier (TODO: Build interactive chat) */}
          {step === "clarifier" && (
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Clarifier Interview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Interactive AI interview system will be built here in Wave 3
                  </p>
                  <Button onClick={() => setStep("results")} data-testid="button-view-results">
                    View Recommendations
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Task Recommendations (TODO: Build results view) */}
          {step === "results" && (
            <motion.div {...fadeInUp}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Your Matched Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Task recommendation results will be shown here in Wave 3
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

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
