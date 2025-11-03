import { useState, useEffect } from "react";
import { X, Save, Code, Eye, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface VisualEditorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisualEditorOverlay({ isOpen, onClose }: VisualEditorOverlayProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const currentPagePath = window.location.pathname;

  // Get current page code
  const { data: pageInfo } = useQuery<{ code?: string }>({
    queryKey: ['/api/visual-editor/page-info', currentPagePath],
    enabled: isOpen
  });

  useEffect(() => {
    if (!isOpen) {
      setPrompt("");
      setGeneratedCode("");
      setPreviewMode(false);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/visual-editor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          pagePath: currentPagePath,
          currentCode: pageInfo?.code
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data.code);
        toast({
          title: "Success",
          description: "Code generated successfully"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to generate code"
        });
      }
    } catch (error) {
      console.error('[VisualEditor] Generation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate code"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No code to save"
      });
      return;
    }

    try {
      const response = await fetch('/api/visual-editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: currentPagePath,
          code: generatedCode,
          commitMessage: `Visual Editor: ${prompt.substring(0, 50)}`
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Changes saved and committed to Git"
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to save changes"
        });
      }
    } catch (error) {
      console.error('[VisualEditor] Save error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-card border rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Visual Editor</h2>
            <span className="text-sm text-muted-foreground">
              {currentPagePath}
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-visual-editor"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Describe what you want to change:
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Add a hero section with a gradient background..."
              className="min-h-[100px]"
              data-testid="input-visual-editor-prompt"
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              data-testid="button-generate-code"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Code"}
            </Button>
          </div>

          {/* Generated Code / Preview */}
          {generatedCode && (
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Generated Code:</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={previewMode ? "outline" : "default"}
                    onClick={() => setPreviewMode(false)}
                    data-testid="button-code-view"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode ? "default" : "outline"}
                    onClick={() => setPreviewMode(true)}
                    data-testid="button-preview-view"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto border rounded-lg bg-muted/50">
                {previewMode ? (
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Preview mode - Code will be applied when saved
                    </p>
                  </div>
                ) : (
                  <pre className="p-4 text-sm">
                    <code>{generatedCode}</code>
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {generatedCode && (
          <div className="flex items-center justify-end gap-2 p-4 border-t">
            <Button
              variant="outline"
              onClick={() => setGeneratedCode("")}
              data-testid="button-discard"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
              data-testid="button-save-changes"
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Commit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
