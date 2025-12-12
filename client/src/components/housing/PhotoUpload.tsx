import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, X, Star, CheckCircle2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  url: string;
  publicId: string;
  caption?: string;
  order: number;
  isCover: boolean;
}

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error';
  progress: number;
}

interface PhotoUploadProps {
  listingId: number;
  initialPhotos?: Photo[];
  onPhotosChange?: (photos: Photo[]) => void;
}

export function PhotoUpload({ listingId, initialPhotos = [], onPhotosChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const updatePhotos = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    onPhotosChange?.(newPhotos);
  };

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      pendingPhotos.forEach(p => {
        if (p.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
    };
  }, []);

  // Smart compression: automatically adjusts quality/size based on file size
  // Same algorithm as PostCreator - targets ~500KB-1MB output
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Auto-adjust compression based on file size
          const fileSizeMB = file.size / (1024 * 1024);
          let maxDimension: number;
          let quality: number;
          
          if (fileSizeMB > 20) {
            maxDimension = 1200;
            quality = 0.65;
          } else if (fileSizeMB > 10) {
            maxDimension = 1400;
            quality = 0.7;
          } else if (fileSizeMB > 5) {
            maxDimension = 1600;
            quality = 0.75;
          } else if (fileSizeMB > 2) {
            maxDimension = 1800;
            quality = 0.8;
          } else {
            maxDimension = 2000;
            quality = 0.85;
          }
          
          console.log(`[PhotoUpload] Compressing ${fileSizeMB.toFixed(1)}MB image: ${maxDimension}px, quality ${quality}`);
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob for upload
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resultSizeKB = Math.round(blob.size / 1024);
                console.log(`[PhotoUpload] Compressed to ${resultSizeKB}KB (${width}x${height})`);
                resolve(blob);
              } else {
                reject(new Error('Could not create blob'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 20,
    disabled: uploading || photos.length + pendingPhotos.length >= 20,
    onDrop: async (acceptedFiles) => {
      const totalPhotos = photos.length + pendingPhotos.length + acceptedFiles.length;
      if (totalPhotos > 20) {
        toast({
          title: "Too many photos",
          description: "Maximum 20 photos allowed per listing",
          variant: "destructive",
        });
        return;
      }

      // Create instant previews with blob URLs (like PostCreator)
      const newPending: PendingPhoto[] = acceptedFiles.map((file, index) => ({
        id: `pending-${Date.now()}-${index}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0,
      }));

      setPendingPhotos(prev => [...prev, ...newPending]);
      setUploading(true);

      toast({
        title: "Processing photos",
        description: `Compressing ${acceptedFiles.length} photo(s)...`,
      });

      try {
        const uploadedPhotos: Photo[] = [];

        for (let i = 0; i < newPending.length; i++) {
          const pending = newPending[i];
          
          // Update status to compressing
          setPendingPhotos(prev => 
            prev.map(p => p.id === pending.id ? { ...p, status: 'compressing' as const, progress: 20 } : p)
          );

          // Compress the image
          let imageBlob: Blob;
          try {
            imageBlob = await compressImage(pending.file);
          } catch (err) {
            console.warn('[PhotoUpload] Compression failed, using original:', err);
            imageBlob = pending.file;
          }

          // Update status to uploading
          setPendingPhotos(prev => 
            prev.map(p => p.id === pending.id ? { ...p, status: 'uploading' as const, progress: 50 } : p)
          );

          // Upload to server
          const formData = new FormData();
          formData.append("file", imageBlob, pending.file.name);
          formData.append("listingId", listingId.toString());

          const token = localStorage.getItem("accessToken");
          const response = await fetch("/api/housing/photos", {
            method: "POST",
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const photo = await response.json();
          uploadedPhotos.push(photo);

          // Update status to done
          setPendingPhotos(prev => 
            prev.map(p => p.id === pending.id ? { ...p, status: 'done' as const, progress: 100 } : p)
          );

          // Cleanup blob URL
          URL.revokeObjectURL(pending.previewUrl);
        }

        // Remove pending and add uploaded
        setPendingPhotos(prev => prev.filter(p => !newPending.find(np => np.id === p.id)));
        updatePhotos([...photos, ...uploadedPhotos]);
        
        toast({
          title: "Photos uploaded",
          description: `${uploadedPhotos.length} photo(s) compressed and added successfully`,
        });
      } catch (error) {
        console.error("Upload error:", error);
        
        // Mark failed uploads
        setPendingPhotos(prev => 
          prev.map(p => newPending.find(np => np.id === p.id) && p.status !== 'done' 
            ? { ...p, status: 'error' as const } 
            : p
          )
        );
        
        toast({
          title: "Upload failed",
          description: "Some photos failed to upload. Please try again.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
  });

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(photos);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    const updated = reordered.map((photo, index) => ({
      ...photo,
      order: index,
    }));

    updatePhotos(updated);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/housing/${listingId}/photos/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ photos: updated }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to reorder photos");
      }

      toast({
        title: "Photos reordered",
        description: "Photo order updated successfully",
      });
    } catch (error) {
      console.error("Reorder error:", error);
      toast({
        title: "Reorder failed",
        description: "Failed to save photo order. Please try again.",
        variant: "destructive",
      });
      updatePhotos(photos);
    }
  };

  const setCover = async (photoId: string) => {
    const previousPhotos = [...photos];
    const updated = photos.map((p) => ({
      ...p,
      isCover: p.id === photoId,
    }));
    updatePhotos(updated);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/housing/${listingId}/photos/${photoId}/cover`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to set cover photo");
      }

      toast({
        title: "Cover photo updated",
        description: "Cover photo set successfully",
      });
    } catch (error) {
      console.error("Set cover error:", error);
      toast({
        title: "Update failed",
        description: "Failed to set cover photo. Please try again.",
        variant: "destructive",
      });
      updatePhotos(previousPhotos);
    }
  };

  const deletePhoto = async (photoId: string) => {
    const previousPhotos = [...photos];
    const updated = photos.filter((p) => p.id !== photoId);
    updatePhotos(updated);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/housing/${listingId}/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete photo");
      }

      toast({
        title: "Photo deleted",
        description: "Photo removed successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
      updatePhotos(previousPhotos);
    }
  };

  const updateCaption = async (photoId: string, caption: string) => {
    const previousPhotos = [...photos];
    const updated = photos.map((p) =>
      p.id === photoId ? { ...p, caption } : p
    );
    updatePhotos(updated);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/housing/${listingId}/photos/${photoId}/caption`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ caption }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update caption");
      }
    } catch (error) {
      console.error("Update caption error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update caption. Please try again.",
        variant: "destructive",
      });
      updatePhotos(previousPhotos);
    }
  };

  const removePendingPhoto = (id: string) => {
    setPendingPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload dropzone with gradient border animation */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        } ${uploading || photos.length + pendingPhotos.length >= 20 ? "opacity-50 cursor-not-allowed" : ""}`}
        data-testid="dropzone-photo-upload"
      >
        <input {...getInputProps()} data-testid="input-photo-upload" />
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full transition-colors ${isDragActive ? "bg-primary/20" : "bg-muted"}`}>
            <ImageIcon className={`h-10 w-10 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="font-medium">Compressing & uploading...</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {pendingPhotos.filter(p => p.status === 'done').length} of {pendingPhotos.length} complete
              </p>
            </div>
          ) : photos.length + pendingPhotos.length >= 20 ? (
            <p className="text-muted-foreground">Maximum 20 photos reached</p>
          ) : (
            <>
              <p className="text-lg font-semibold">
                {isDragActive ? "Drop photos here" : "Drag photos here or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WebP - Auto-compressed for fast loading
              </p>
              <p className="text-xs text-muted-foreground">
                {photos.length + pendingPhotos.length}/20 photos
              </p>
            </>
          )}
        </div>
      </div>

      {/* Pending photos with progress */}
      {pendingPhotos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Processing...</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pendingPhotos.map((pending) => (
              <Card key={pending.id} className="relative overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={pending.previewUrl}
                    alt=""
                    className={`w-full h-full object-cover transition-opacity ${
                      pending.status === 'done' ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                  {/* Overlay with status */}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                    {pending.status === 'compressing' && (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                        <span className="text-xs text-white font-medium">Compressing...</span>
                      </>
                    )}
                    {pending.status === 'uploading' && (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                        <span className="text-xs text-white font-medium">Uploading...</span>
                      </>
                    )}
                    {pending.status === 'done' && (
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    )}
                    {pending.status === 'error' && (
                      <>
                        <X className="h-8 w-8 text-red-400" />
                        <span className="text-xs text-white font-medium">Failed</span>
                      </>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={pending.progress} className="h-1 rounded-none" />
                  </div>
                </div>
                {pending.status === 'error' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removePendingPhoto(pending.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded photos grid */}
      {photos.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="photos" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {photos.map((photo, index) => (
                  <Draggable key={photo.id} draggableId={photo.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`relative overflow-hidden ${
                          snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""
                        }`}
                        data-testid={`photo-item-${index}`}
                      >
                        <div className="aspect-video relative">
                          <img
                            src={photo.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {photo.isCover && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Cover
                            </div>
                          )}
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => deletePhoto(photo.id)}
                            data-testid={`button-delete-photo-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="p-3 space-y-2">
                          <Input
                            placeholder="Add a caption..."
                            value={photo.caption || ''}
                            onChange={(e) => updateCaption(photo.id, e.target.value)}
                            data-testid={`input-caption-${index}`}
                          />
                          <Button
                            size="sm"
                            variant={photo.isCover ? "default" : "outline"}
                            className="w-full"
                            onClick={() => setCover(photo.id)}
                            disabled={photo.isCover}
                            data-testid={`button-set-cover-${index}`}
                          >
                            {photo.isCover ? "Cover Photo" : "Set as Cover"}
                          </Button>
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
