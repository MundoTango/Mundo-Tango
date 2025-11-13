import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-[#40E0D0]/20 to-[#1E90FF]/20 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4" data-testid="product-gallery">
      {/* Main Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-black/20 group">
        <img
          src={images[selectedIndex]}
          alt={`${productTitle} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
              onClick={handlePrevious}
              data-testid="button-gallery-prev"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
              onClick={handleNext}
              data-testid="button-gallery-next"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "aspect-square rounded overflow-hidden border-2 transition-all hover-elevate",
                selectedIndex === index
                  ? "border-[#40E0D0] ring-2 ring-[#40E0D0]/50"
                  : "border-white/10 hover:border-white/30"
              )}
              data-testid={`thumbnail-${index}`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
