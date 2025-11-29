import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ZoomIn } from 'lucide-react';

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (croppedBase64: string) => void;
  type: 'profile' | 'cover';
  isUploading?: boolean;
}

export function PhotoUploadDialog({
  open,
  onOpenChange,
  onUpload,
  type,
  isUploading = false,
}: PhotoUploadDialogProps) {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const PROFILE_SIZE = 400;
  const COVER_SIZE = { width: 1200, height: 300 };
  const dimensions = type === 'profile' ? { width: PROFILE_SIZE, height: PROFILE_SIZE } : COVER_SIZE;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSource(event.target?.result as string);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!imageSource || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Fill background with black first
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate source region to crop from image
      const sourceCropWidth = img.width / zoom;
      const sourceCropHeight = img.height / zoom;
      const sourceX = -offsetX / zoom;
      const sourceY = -offsetY / zoom;

      // Draw the cropped region
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceCropWidth,
        sourceCropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            onUpload(base64);
            setImageSource(null);
            onOpenChange(false);
          };
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.9
      );
    };
    img.src = imageSource;
  };

  const aspectRatio = dimensions.width / dimensions.height;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {type === 'profile' ? 'Upload Profile Photo' : 'Upload Cover Photo'}
          </DialogTitle>
        </DialogHeader>

        {!imageSource ? (
          <div className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm font-medium mb-2">Click to select an image</p>
              <p className="text-xs text-muted-foreground">
                {type === 'profile' ? '400×400px square' : '1200×300px landscape'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Boundary Box with Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">
                  Preview ({dimensions.width}×{dimensions.height}px)
                </label>
                <span className="text-xs text-muted-foreground">
                  Zoom: {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Visible Boundary Box - Click and drag to move image */}
              <div
                ref={previewRef}
                className="relative bg-black border-4 border-primary rounded-lg overflow-hidden mx-auto cursor-move"
                style={{
                  width: `${300 * aspectRatio}px`,
                  height: '300px',
                  aspectRatio: `${dimensions.width}/${dimensions.height}`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {imageSource && (
                  <img
                    src={imageSource}
                    alt="Preview"
                    className="absolute select-none pointer-events-none"
                    style={{
                      transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                      transformOrigin: '0 0',
                    }}
                    draggable={false}
                  />
                )}
                {/* Dimension indicator inside box */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="bg-black/60 px-3 py-1 rounded text-xs text-white font-mono opacity-0 hover:opacity-100 transition-opacity">
                    {dimensions.width}×{dimensions.height}
                  </div>
                </div>
              </div>

              {/* Helpful text */}
              <p className="text-xs text-muted-foreground text-center">
                Click and drag the image to position it
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              {/* Zoom Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Zoom
                  </label>
                  <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={(val) => setZoom(val[0])}
                  min={0.5}
                  max={3}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">Drag image in preview box to position</p>
              </div>
            </div>

            {/* Hidden canvas for cropping */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setImageSource(null);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          {imageSource && (
            <Button onClick={handleCrop} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
