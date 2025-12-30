import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
}

export function ImageLightbox({ open, onOpenChange, imageUrl, alt = "Image" }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setRotation(0);
    }
  }, [open]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onOpenChange(false);
    if (e.key === "+" || e.key === "=") handleZoomIn();
    if (e.key === "-") handleZoomOut();
    if (e.key === "r" || e.key === "R") handleRotate();
  };

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none overflow-hidden"
        data-testid="image-lightbox"
      >
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            className="text-white hover:bg-white/20"
            data-testid="button-zoom-out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <span className="text-white text-sm min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            className="text-white hover:bg-white/20"
            data-testid="button-zoom-in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRotate}
            className="text-white hover:bg-white/20"
            data-testid="button-rotate"
            aria-label="Rotate image"
          >
            <RotateCw className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20"
            data-testid="button-close-lightbox"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center justify-center w-full h-[90vh] overflow-auto">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${imageUrl}-${zoom}-${rotation}`}
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-full object-contain cursor-move"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.3s ease"
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: zoom }}
              exit={{ opacity: 0, scale: 0.9 }}
              drag
              dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
              data-testid="lightbox-image"
            />
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
