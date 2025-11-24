import { useState } from "react";
import { HelpCircle, X, Type, Trash2, Move, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InlineEditingInstructions() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
        data-testid="button-show-instructions"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-2xl border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Inline Editing Shortcuts</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
            data-testid="button-hide-instructions"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Click elements in the preview to edit directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Type className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">Double-Click to Edit Text</div>
            <div className="text-muted-foreground">Click any text, type your changes, click away to save</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <div className="font-medium">Delete Key to Remove</div>
            <div className="text-muted-foreground">Select element, press Delete or Backspace</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Move className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div className="font-medium">Alt+Drag to Move</div>
            <div className="text-muted-foreground">Hold Alt (⌥) and drag selected element</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Palette className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <div className="font-medium">Cmd+Click to Navigate</div>
            <div className="text-muted-foreground">Hold Cmd (⌘) or Ctrl and click links</div>
          </div>
        </div>

        <div className="pt-2 border-t text-center text-muted-foreground">
          💡 All changes auto-tracked for saving
        </div>
      </CardContent>
    </Card>
  );
}
