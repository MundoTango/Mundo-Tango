import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ZoomIn, ZoomOut } from 'lucide-react';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      setSelectedFile(file);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
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

      const scaledWidth = img.width * zoom;
      const scaledHeight = img.height * zoom;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          onUpload(base64);
          setImageSource(null);
          setSelectedFile(null);
          onOpenChange(false);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95);
    };
    img.src = imageSource;
  };

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
                Recommended size: {type === 'profile' ? '400×400px' : '1200×300px'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Crop Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${dimensions.width}/${dimensions.height}` }}>
              <img
                src={imageSource}
                alt="Preview"
                className="absolute w-full h-full object-cover"
                style={{
                  transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                  transformOrigin: '0 0',
                  cursor: 'grab',
                }}
              />
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {/* Zoom Slider */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <Slider
                  value={[zoom]}
                  onValueChange={(val) => setZoom(val[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Pan X */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pan Horizontal</label>
                <Slider
                  value={[offsetX]}
                  onValueChange={(val) => setOffsetX(val[0])}
                  min={-500}
                  max={500}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Pan Y */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pan Vertical</label>
                <Slider
                  value={[offsetY]}
                  onValueChange={(val) => setOffsetY(val[0])}
                  min={-500}
                  max={500}
                  step={5}
                  className="w-full"
                />
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
              setSelectedFile(null);
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
