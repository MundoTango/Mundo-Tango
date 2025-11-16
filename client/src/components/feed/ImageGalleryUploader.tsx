import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageIcon, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  order: number;
}

interface ImageGalleryUploaderProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageGalleryUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  className = "" 
}: ImageGalleryUploaderProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed per post`,
        variant: "destructive",
      });
      return;
    }

    const newImages: ImageItem[] = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      order: images.length + index,
    }));

    onImagesChange([...images, ...newImages]);
  }, [images, maxImages, onImagesChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: maxImages - images.length,
  });

  const handleRemove = (id: string) => {
    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({ ...img, order: index }));
    onImagesChange(updatedImages);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedImages = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    onImagesChange(updatedImages);
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-md p-8 text-center cursor-pointer
            transition-colors hover-elevate active-elevate-2
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          `}
          data-testid="dropzone-images"
        >
          <input {...getInputProps()} data-testid="input-image-upload" />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse ({images.length}/{maxImages})
            </p>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4"
              >
                {images.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          relative aspect-square overflow-hidden group
                          ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}
                        `}
                        data-testid={`image-preview-${index}`}
                      >
                        <img
                          src={image.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(image.id);
                            }}
                            data-testid={`button-remove-image-${index}`}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
