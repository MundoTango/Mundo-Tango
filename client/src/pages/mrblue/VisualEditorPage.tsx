import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MousePointer2, Undo2, Redo2, Save, GitBranch, Eye, Settings } from 'lucide-react';

interface SelectedElement {
  id: string;
  type: string;
  className: string;
  textContent: string;
}

interface Change {
  id: string;
  element: string;
  property: string;
  oldValue: string;
  newValue: string;
  timestamp: Date;
}

export default function VisualEditorPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [undoStack, setUndoStack] = useState<Change[]>([]);
  const [redoStack, setRedoStack] = useState<Change[]>([]);

  const handlePropertyChange = (property: string, value: string) => {
    if (!selectedElement) return;

    const change: Change = {
      id: Date.now().toString(),
      element: selectedElement.id,
      property,
      oldValue: selectedElement[property as keyof SelectedElement] as string || '',
      newValue: value,
      timestamp: new Date(),
    };

    setChanges(prev => [...prev, change]);
    setUndoStack(prev => [...prev, change]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastChange = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastChange]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const change = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, change]);
  };

  return (
    <div className="h-screen flex flex-col" data-testid="page-visual-editor">
      <div className="border-b p-4 flex items-center justify-between bg-background">
        <div>
          <h1 className="text-2xl font-bold">Mr Blue Visual Editor</h1>
          <p className="text-sm text-muted-foreground">
            Point, click, and edit your UI visually
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectionMode ? 'default' : 'outline'}
            onClick={() => setSelectionMode(!selectionMode)}
            data-testid="button-selection-mode"
          >
            <MousePointer2 className="h-4 w-4 mr-2" />
            {selectionMode ? 'Exit Selection' : 'Select Element'}
          </Button>
          <Button
            variant="outline"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            data-testid="button-undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            data-testid="button-redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" data-testid="button-preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button data-testid="button-save-changes">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto bg-muted/30">
          <Card className="max-w-4xl mx-auto" data-testid="card-preview">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border ${selectionMode ? 'cursor-crosshair' : ''}`}
                  onClick={() => selectionMode && setSelectedElement({
                    id: 'card-1',
                    type: 'div',
                    className: 'p-4 rounded-lg border',
                    textContent: 'Sample Card Content'
                  })}
                  data-testid="preview-card-1"
                >
                  <h3 className="font-semibold mb-2">Sample Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Click to select this element when in selection mode
                  </p>
                </div>

                {selectedElement && (
                  <Badge variant="default" data-testid="badge-selected">
                    Selected: {selectedElement.type}#{selectedElement.id}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-80 border-l bg-background overflow-auto">
          <Tabs defaultValue="properties" className="h-full">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="properties" data-testid="tab-properties">
                <Settings className="h-4 w-4 mr-2" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="changes" data-testid="tab-changes">
                <GitBranch className="h-4 w-4 mr-2" />
                Changes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="p-4 space-y-4">
              {selectedElement ? (
                <>
                  <div className="space-y-2">
                    <Label>Element Type</Label>
                    <Input value={selectedElement.type} disabled data-testid="input-element-type" />
                  </div>

                  <div className="space-y-2">
                    <Label>Element ID</Label>
                    <Input value={selectedElement.id} disabled data-testid="input-element-id" />
                  </div>

                  <div className="space-y-2">
                    <Label>Class Name</Label>
                    <Input
                      value={selectedElement.className}
                      onChange={(e) => handlePropertyChange('className', e.target.value)}
                      data-testid="input-class-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Text Content</Label>
                    <Input
                      value={selectedElement.textContent}
                      onChange={(e) => handlePropertyChange('textContent', e.target.value)}
                      data-testid="input-text-content"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MousePointer2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an element to view and edit its properties</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="changes" className="p-4">
              <div className="space-y-2">
                {changes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No changes yet</p>
                  </div>
                ) : (
                  changes.reverse().map((change) => (
                    <div
                      key={change.id}
                      className="p-3 rounded-lg border text-sm space-y-1"
                      data-testid={`change-${change.id}`}
                    >
                      <div className="font-medium">{change.element}</div>
                      <div className="text-muted-foreground">
                        {change.property}: <span className="line-through">{change.oldValue}</span> → {change.newValue}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(change.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
