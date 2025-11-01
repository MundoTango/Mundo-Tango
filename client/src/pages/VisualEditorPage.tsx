import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Square, 
  AlignLeft,
  Plus,
  Trash2,
  Eye,
  Code
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

export default function VisualEditorPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

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
            <div className="flex items-center justify-between">
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
              </div>
            </div>
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
    </>
  );
}
