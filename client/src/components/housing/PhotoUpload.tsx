import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  url: string;
  publicId: string;
  caption?: string;
  order: number;
  isCover: boolean;
}

interface PhotoUploadProps {
  listingId: number;
  initialPhotos?: Photo[];
  onPhotosChange?: (photos: Photo[]) => void;
}

export function PhotoUpload({ listingId, initialPhotos = [], onPhotosChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const updatePhotos = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    onPhotosChange?.(newPhotos);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 20,
    disabled: uploading || photos.length >= 20,
    onDrop: async (acceptedFiles) => {
      if (photos.length + acceptedFiles.length > 20) {
        toast({
          title: "Too many photos",
          description: "Maximum 20 photos allowed per listing",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);

      try {
        const uploadedPhotos: Photo[] = [];

        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append("file", file);
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
        }

        updatePhotos([...photos, ...uploadedPhotos]);
        toast({
          title: "Photos uploaded",
          description: `${uploadedPhotos.length} photo(s) added successfully`,
        });
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload failed",
          description: "Failed to upload photos. Please try again.",
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

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        } ${uploading || photos.length >= 20 ? "opacity-50 cursor-not-allowed" : ""}`}
        data-testid="dropzone-photo-upload"
      >
        <input {...getInputProps()} data-testid="input-photo-upload" />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-muted-foreground">Uploading photos...</p>
          </div>
        ) : photos.length >= 20 ? (
          <p className="text-muted-foreground">Maximum 20 photos reached</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">
              {isDragActive ? "Drop photos here" : "Drag photos here or click to upload"}
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum 20 photos ({photos.length}/20 uploaded)
            </p>
          </>
        )}
      </div>

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
