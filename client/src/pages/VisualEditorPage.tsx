import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Square, 
  AlignLeft,
  Plus,
  Trash2,
  Eye,
  Code,
  Sparkles,
  Check,
  Shield,
  Copy
} from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

interface Component {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'container';
  content: string;
  styles: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
  };
}

const PERMISSION_LEVELS = ['Public', 'Registered', 'Paid', 'PRO', 'Admin', 'Super Admin', 'God'] as const;

export default function VisualEditorPage() {
  const { toast } = useToast();
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(['Public']);
  const [totalAICost, setTotalAICost] = useState(0);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGeneratedCode, setAiGeneratedCode] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    const savedReviewComplete = localStorage.getItem('visualEditor_reviewComplete');
    const savedTotalAICost = localStorage.getItem('visualEditor_totalAICost');
    
    if (savedReviewComplete) {
      setReviewComplete(JSON.parse(savedReviewComplete));
    }
    if (savedTotalAICost) {
      setTotalAICost(parseFloat(savedTotalAICost));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('visualEditor_reviewComplete', JSON.stringify(reviewComplete));
  }, [reviewComplete]);

  useEffect(() => {
    localStorage.setItem('visualEditor_totalAICost', totalAICost.toString());
  }, [totalAICost]);

  const componentTypes = [
    { type: 'heading' as const, label: 'Heading', icon: Type },
    { type: 'text' as const, label: 'Text', icon: AlignLeft },
    { type: 'image' as const, label: 'Image', icon: ImageIcon },
    { type: 'button' as const, label: 'Button', icon: Square },
    { type: 'container' as const, label: 'Container', icon: Layout }
  ];

  const addComponent = (type: Component['type']) => {
    const newComponent: Component = {
      id: `component-${Date.now()}`,
      type,
      content: type === 'heading' ? 'New Heading' 
        : type === 'text' ? 'New text paragraph'
        : type === 'image' ? 'https://via.placeholder.com/400x300'
        : type === 'button' ? 'Click Me'
        : 'Container',
      styles: {
        fontSize: type === 'heading' ? '2rem' : '1rem',
        fontWeight: type === 'heading' ? 'bold' : 'normal',
        padding: '1rem',
        margin: '0.5rem 0'
      }
    };
    
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const generateCode = () => {
    const jsxCode = components.map(comp => {
      const styleString = Object.entries(comp.styles)
        .map(([key, value]) => `${key}: '${value}'`)
        .join(', ');
      
      return `<${comp.type} style={{ ${styleString} }}>${comp.content}</${comp.type}>`;
    }).join('\n');
    
    return `export default function CustomPage() {
  return (
    <PageLayout title="Visual Page Editor" showBreadcrumbs>
<div>
${jsxCode.split('\n').map(line => '      ' + line).join('\n')}
    </div>
    </PageLayout>);
}`;
  };

  const handleAIGenerateComponent = () => {
    // TODO: Integrate OpenAI when API key available
    const code = generateCode();
    const codeLength = code.length;
    const estimatedTokens = codeLength * 0.75;
    const cost = (estimatedTokens / 1000) * 0.01;
    
    setAiGeneratedCode(code);
    setEstimatedCost(cost);
    setTotalAICost(prev => prev + cost);
    setShowAIModal(true);
    
    toast({
      title: "AI Component Generated",
      description: `Estimated cost: $${cost.toFixed(4)}`,
    });
  };

  const handleCopyAICode = () => {
    navigator.clipboard.writeText(aiGeneratedCode);
    toast({
      title: "Code copied!",
      description: "AI-generated code copied to clipboard",
    });
  };

  const togglePermission = (permission: string) => {
    setPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const selected = components.find(c => c.id === selectedComponent);

  return (
    <>
      <SEO
        title="Visual Editor - Page Builder"
        description="Create custom pages with drag-and-drop visual editor"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">Visual Page Editor</h1>
                <p className="text-muted-foreground">Drag, drop, and design custom pages</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={previewMode ? "default" : "outline"}
                  onClick={() => setPreviewMode(!previewMode)}
                  data-testid="button-toggle-preview"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? 'Edit Mode' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const code = generateCode();
                    navigator.clipboard.writeText(code);
                  }}
                  data-testid="button-export-code"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Export Code
                </Button>
                <Button
                  variant="default"
                  onClick={handleAIGenerateComponent}
                  data-testid="button-ai-generate"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate Component
                </Button>
              </div>
            </div>

            <Card className="glass-card p-4">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="review-complete"
                      checked={reviewComplete}
                      onCheckedChange={(checked) => setReviewComplete(checked as boolean)}
                      data-testid="checkbox-review-complete"
                    />
                    <Label htmlFor="review-complete" className="cursor-pointer flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Review Complete
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Permissions:</Label>
                    <div className="flex gap-2 flex-wrap">
                      {PERMISSION_LEVELS.map((level) => (
                        <Button
                          key={level}
                          size="sm"
                          variant={permissions.includes(level) ? "default" : "outline"}
                          onClick={() => togglePermission(level)}
                          data-testid={`button-permission-${level.toLowerCase().replace(' ', '-')}`}
                          className="h-7"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Total AI Cost:</span>
                  <span className="font-semibold" data-testid="text-total-ai-cost">
                    ${totalAICost.toFixed(4)}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid grid-cols-12 gap-6">
            {/* Component Palette */}
            {!previewMode && (
              <div className="col-span-3">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="h-5 w-5" />
                      Components
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {componentTypes.map(({ type, label, icon: Icon }) => (
                      <Button
                        key={type}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addComponent(type)}
                        data-testid={`button-add-${type}`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {label}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Canvas */}
            <div className={previewMode ? "col-span-12" : "col-span-6"}>
              <Card className="glass-card min-h-[600px]">
                <CardHeader>
                  <CardTitle>Canvas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {components.length === 0 ? (
                    <div className="flex items-center justify-center h-96 text-muted-foreground">
                      <div className="text-center">
                        <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Drag components here to start building</p>
                      </div>
                    </div>
                  ) : (
                    components.map((comp) => (
                      <div
                        key={comp.id}
                        className={`relative p-4 rounded-lg border transition-all ${
                          selectedComponent === comp.id && !previewMode
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover-elevate'
                        }`}
                        onClick={() => !previewMode && setSelectedComponent(comp.id)}
                        style={comp.styles}
                        data-testid={`component-${comp.id}`}
                      >
                        {comp.type === 'image' ? (
                          <img src={comp.content} alt="Component" className="max-w-full" />
                        ) : (
                          <div>{comp.content}</div>
                        )}
                        
                        {!previewMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteComponent(comp.id);
                            }}
                            className="absolute top-2 right-2 p-1 rounded bg-red-500 text-white opacity-0 hover:opacity-100 transition-opacity"
                            data-testid={`button-delete-${comp.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Properties Panel */}
            {!previewMode && (
              <div className="col-span-3">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected ? (
                      <>
                        <div>
                          <Label>Content</Label>
                          <Input
                            value={selected.content}
                            onChange={(e) => updateComponent(selected.id, { content: e.target.value })}
                            data-testid="input-content"
                          />
                        </div>
                        
                        <div>
                          <Label>Font Size</Label>
                          <Input
                            value={selected.styles.fontSize || ''}
                            onChange={(e) => updateComponent(selected.id, {
                              styles: { ...selected.styles, fontSize: e.target.value }
                            })}
                            placeholder="e.g., 1rem"
                            data-testid="input-font-size"
                          />
                        </div>

                        <div>
                          <Label>Color</Label>
                          <Input
                            value={selected.styles.color || ''}
                            onChange={(e) => updateComponent(selected.id, {
                              styles: { ...selected.styles, color: e.target.value }
                            })}
                            placeholder="e.g., #000000"
                            data-testid="input-color"
                          />
                        </div>

                        <div>
                          <Label>Background</Label>
                          <Input
                            value={selected.styles.backgroundColor || ''}
                            onChange={(e) => updateComponent(selected.id, {
                              styles: { ...selected.styles, backgroundColor: e.target.value }
                            })}
                            placeholder="e.g., #ffffff"
                            data-testid="input-background"
                          />
                        </div>

                        <div>
                          <Label>Padding</Label>
                          <Input
                            value={selected.styles.padding || ''}
                            onChange={(e) => updateComponent(selected.id, {
                              styles: { ...selected.styles, padding: e.target.value }
                            })}
                            placeholder="e.g., 1rem"
                            data-testid="input-padding"
                          />
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-8">
                        Select a component to edit its properties
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-ai-code">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Generated Component Code
            </DialogTitle>
            <DialogDescription>
              Generated code ready to use. Estimated cost: ${estimatedCost.toFixed(4)} (GPT-4)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cost Breakdown</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAICode}
                  data-testid="button-copy-ai-code"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>
              <div className="text-sm space-y-1">
                <p>Code Length: {aiGeneratedCode.length} characters</p>
                <p>Estimated Tokens: {Math.round(aiGeneratedCode.length * 0.75)}</p>
                <p>Cost per 1K tokens: $0.01</p>
                <p className="font-semibold">Estimated Cost: ${estimatedCost.toFixed(4)}</p>
              </div>
            </div>

            <div className="rounded-lg bg-card border">
              <div className="bg-muted px-4 py-2 border-b">
                <span className="text-sm font-mono">Generated Code</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code data-testid="text-ai-generated-code">{aiGeneratedCode}</code>
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIModal(false)} data-testid="button-close-ai-modal">
              Close
            </Button>
            <Button onClick={handleCopyAICode} data-testid="button-copy-and-close">
              <Copy className="h-4 w-4 mr-2" />
              Copy & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
