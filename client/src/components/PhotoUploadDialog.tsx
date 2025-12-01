import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';

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
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Output dimensions (what gets saved)
  // Updated for new hero bounds: h-[50vh] md:h-[60vh] with full width
  const PROFILE_SIZE = 400;
  const COVER_SIZE = { width: 1600, height: 600 }; // 16:9 aspect ratio for hero sections
  const outputDimensions = type === 'profile' ? { width: PROFILE_SIZE, height: PROFILE_SIZE } : COVER_SIZE;
  
  // Crop frame dimensions (the visible boundary box) - updated for new viewport-based hero
  const cropWidth = type === 'profile' ? 300 : 600;
  const cropHeight = type === 'profile' ? 300 : 225; // 16:9 aspect ratio
  
  // Container size (area where image is displayed)
  const containerWidth = 500;
  const containerHeight = 400;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setImageSource(src);
        
        // Calculate initial zoom to fit image nicely in container
        const scaleToFit = Math.min(
          containerWidth / img.width,
          containerHeight / img.height,
          1 // Don't upscale small images
        );
        setZoom(scaleToFit);
        
        // Center the image in the container
        const scaledWidth = img.width * scaleToFit;
        const scaledHeight = img.height * scaleToFit;
        setPosition({
          x: (containerWidth - scaledWidth) / 2,
          y: (containerHeight - scaledHeight) / 2
        });
        
        console.log('[PhotoUpload] Image loaded:', {
          original: `${img.width}×${img.height}`,
          initialZoom: scaleToFit.toFixed(3),
          initialPos: `centered`
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate what part of the original image is inside the crop frame
  const getCropCoordinates = () => {
    if (!imageDimensions) return null;
    
    // Crop frame is centered in the container
    const cropLeft = (containerWidth - cropWidth) / 2;
    const cropTop = (containerHeight - cropHeight) / 2;
    
    // Image position and size after zoom
    const scaledWidth = imageDimensions.width * zoom;
    const scaledHeight = imageDimensions.height * zoom;
    
    // Calculate source coordinates in original image pixels
    const sourceX = (cropLeft - position.x) / zoom;
    const sourceY = (cropTop - position.y) / zoom;
    const sourceWidth = cropWidth / zoom;
    const sourceHeight = cropHeight / zoom;
    
    return { sourceX, sourceY, sourceWidth, sourceHeight };
  };

  const handleCrop = () => {
    if (!imageSource || !canvasRef.current || !imageDimensions) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = outputDimensions.width;
      canvas.height = outputDimensions.height;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const crop = getCropCoordinates();
      if (!crop) return;

      console.log('[PhotoUpload] Cropping:', {
        source: `(${crop.sourceX.toFixed(0)}, ${crop.sourceY.toFixed(0)}) ${crop.sourceWidth.toFixed(0)}×${crop.sourceHeight.toFixed(0)}`,
        output: `${outputDimensions.width}×${outputDimensions.height}`
      });

      ctx.drawImage(
        img,
        crop.sourceX,
        crop.sourceY,
        crop.sourceWidth,
        crop.sourceHeight,
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
            setImageDimensions(null);
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

  // Crop frame position (centered in container)
  const cropLeft = (containerWidth - cropWidth) / 2;
  const cropTop = (containerHeight - cropHeight) / 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
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
                {type === 'profile' ? 'Square crop for 400×400px circle' : 'Hero image (16:9 aspect ratio for full-width hero sections)'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Instructions */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Move className="w-4 h-4" />
              <span>Drag image to position. The highlighted area will be saved.</span>
            </div>

            {/* Image container with crop overlay */}
            <div 
              ref={containerRef}
              className="relative bg-neutral-900 rounded-lg overflow-hidden cursor-move mx-auto"
              style={{ width: containerWidth, height: containerHeight }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* The actual image - displayed at natural proportions */}
              {imageSource && imageDimensions && (
                <img
                  src={imageSource}
                  alt="Preview"
                  className="absolute select-none pointer-events-none"
                  style={{
                    width: imageDimensions.width * zoom,
                    height: imageDimensions.height * zoom,
                    left: position.x,
                    top: position.y,
                  }}
                  draggable={false}
                />
              )}
              
              {/* Dark overlay outside crop area */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, 
                    rgba(0,0,0,0.7) ${cropLeft}px, 
                    transparent ${cropLeft}px, 
                    transparent ${cropLeft + cropWidth}px, 
                    rgba(0,0,0,0.7) ${cropLeft + cropWidth}px
                  )`
                }}
              />
              <div 
                className="absolute pointer-events-none"
                style={{
                  left: cropLeft,
                  width: cropWidth,
                  top: 0,
                  height: cropTop,
                  background: 'rgba(0,0,0,0.7)'
                }}
              />
              <div 
                className="absolute pointer-events-none"
                style={{
                  left: cropLeft,
                  width: cropWidth,
                  top: cropTop + cropHeight,
                  height: containerHeight - cropTop - cropHeight,
                  background: 'rgba(0,0,0,0.7)'
                }}
              />
              
              {/* Crop frame border */}
              <div 
                className={`absolute pointer-events-none border-2 border-primary ${type === 'profile' ? 'rounded-full' : 'rounded-lg'}`}
                style={{
                  left: cropLeft,
                  top: cropTop,
                  width: cropWidth,
                  height: cropHeight,
                  boxShadow: '0 0 0 2px rgba(255,255,255,0.3)'
                }}
              />
              
              {/* Size indicator */}
              <div 
                className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-mono pointer-events-none"
              >
                Output: {outputDimensions.width}×{outputDimensions.height}px
              </div>
            </div>

            {/* Zoom controls */}
            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  Zoom
                </label>
                <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[zoom]}
                  onValueChange={(val) => setZoom(val[0])}
                  min={0.1}
                  max={2}
                  step={0.01}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Debug info */}
            {imageDimensions && (
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded text-xs font-mono space-y-1 border border-amber-400">
                <p className="font-bold text-amber-700 dark:text-amber-300">DEBUG:</p>
                <p>Original: {imageDimensions.width}×{imageDimensions.height} (natural proportions)</p>
                <p>Zoom: {(zoom * 100).toFixed(0)}% → Display: {Math.round(imageDimensions.width * zoom)}×{Math.round(imageDimensions.height * zoom)}</p>
                <p>Position: ({position.x.toFixed(0)}, {position.y.toFixed(0)})</p>
                <p>Crop frame: {cropWidth}×{cropHeight} centered in {containerWidth}×{containerHeight}</p>
              </div>
            )}

            {/* Hidden canvas for cropping */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setImageSource(null);
              setImageDimensions(null);
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
