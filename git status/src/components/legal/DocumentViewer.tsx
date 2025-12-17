import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentViewerProps {
  content: string;
  title: string;
  isPdf?: boolean;
  pdfUrl?: string;
  onDownload?: () => void;
}

export function DocumentViewer({
  content,
  title,
  isPdf = false,
  pdfUrl,
  onDownload,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleFullscreen = () => {
    // Implement fullscreen logic
  };

  return (
    <Card>
      <div className="border-b p-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">Document Preview</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[4rem] text-center">
            {zoom}%
          </span>
          <Button size="icon" variant="outline" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={handleFullscreen}>
            <Maximize className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="default"
            onClick={onDownload}
            data-testid="button-download-pdf"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {isPdf && pdfUrl ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0 rounded"
                title={title}
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none p-8"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
