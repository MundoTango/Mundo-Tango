import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, X, GripVertical, Check, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd";

/**
 * ProfileTabPhotos - Enhanced Photo Gallery with:
 * - Multi-file selection (up to 6 photos)
 * - Immediate thumbnail preview before upload
 * - Circular progress indicators during upload
 * - Drag-and-drop reordering after upload
 * - Database persistence
 * 
 * Following Media Handling Architecture (see PRD/media-handling.md)
 */

interface PhotoSlot {
  id: number;
  url: string;
  caption?: string | null;
  order: number;
  status: 'uploaded' | 'uploading' | 'preview' | 'empty';
  progress: number;
  previewUrl?: string;
}

interface FetchedPhoto {
  id: number;
  url: string;
  order: number;
  caption?: string | null;
}

interface GalleryItem {
  id: number;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string | null;
  caption?: string | null;
  category: string;
  createdAt: string;
}

export default function ProfileTabPhotos() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State: 6 photo slots with status tracking
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(
    Array.from({ length: 6 }, (_, i) => ({
      id: 0,
      url: '',
      order: i,
      status: 'empty' as const,
      progress: 0,
    }))
  );

  // Fetch existing photos from database
  const { data: existingPhotos, isLoading } = useQuery<FetchedPhoto[]>({
    queryKey: ['/api/profile/photos', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  // Fetch all gallery items (photos and videos from memories feed)
  const { data: galleryItems = [], isLoading: galleryLoading } = useQuery<GalleryItem[]>({
    queryKey: ['/api/profile/media', currentUser?.id],
    queryFn: async () => {
      const res = await fetch(`/api/profile/media/${currentUser?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentUser?.id,
  });

  // Load existing photos into slots when data arrives
  useEffect(() => {
    if (existingPhotos && existingPhotos.length > 0) {
      setPhotoSlots(prev => {
        const newSlots = Array.from({ length: 6 }, (_, i) => ({
          id: 0,
          url: '',
          order: i,
          status: 'empty' as const,
          progress: 0,
        }));
        
        existingPhotos.forEach(photo => {
          const slotIndex = photo.order;
          if (slotIndex >= 0 && slotIndex < 6) {
            newSlots[slotIndex] = {
              id: photo.id,
              url: photo.url,
              caption: photo.caption,
              order: photo.order,
              status: 'uploaded',
              progress: 100,
            };
          }
        });
        
        return newSlots;
      });
    }
  }, [existingPhotos]);

  // Compress image (matching PostCreator pattern)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth;
          let height = img.naturalHeight;
          
          const fileSizeMB = file.size / (1024 * 1024);
          let maxDimension: number;
          let quality: number;
          
          if (fileSizeMB > 10) {
            maxDimension = 800;
            quality = 0.7;
          } else if (fileSizeMB > 5) {
            maxDimension = 1024;
            quality = 0.75;
          } else if (fileSizeMB > 2) {
            maxDimension = 1280;
            quality = 0.8;
          } else {
            maxDimension = 1600;
            quality = 0.85;
          }
          
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
          
          const result = canvas.toDataURL('image/jpeg', quality);
          resolve(result);
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  // Upload mutation with progress simulation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ base64Data, slotIndex }: { base64Data: string; slotIndex: number }) => {
      // Simulate upload progress
      for (let progress = 0; progress <= 80; progress += 20) {
        await new Promise(r => setTimeout(r, 100));
        setPhotoSlots(prev => prev.map((slot, i) => 
          i === slotIndex ? { ...slot, progress } : slot
        ));
      }

      const res = await fetch('/api/profile/photos', {
        method: 'POST',
        body: JSON.stringify({ photoData: base64Data, order: slotIndex }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
      
      if (!res.ok) throw new Error('Failed to upload photo');
      return res.json();
    },
    onSuccess: (data, variables) => {
      setPhotoSlots(prev => prev.map((slot, i) => 
        i === variables.slotIndex 
          ? { 
              ...slot, 
              id: data.id, 
              url: data.url, 
              status: 'uploaded' as const, 
              progress: 100,
              previewUrl: undefined 
            } 
          : slot
      ));
      queryClient.invalidateQueries({ queryKey: ['/api/profile/photos', currentUser?.id] });
    },
    onError: (err, variables) => {
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
      setPhotoSlots(prev => prev.map((slot, i) => 
        i === variables.slotIndex 
          ? { ...slot, status: 'empty' as const, progress: 0, previewUrl: undefined } 
          : slot
      ));
    }
  });

  // Delete mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const res = await fetch(`/api/profile/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete photo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/photos', currentUser?.id] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete photo", variant: "destructive" });
    }
  });

  // Handle file selection - show previews immediately
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const emptySlots = photoSlots
      .map((slot, idx) => ({ slot, idx }))
      .filter(({ slot }) => slot.status === 'empty')
      .slice(0, fileArray.length);

    if (emptySlots.length === 0) {
      toast({ title: "Gallery Full", description: "All 6 slots are filled. Remove photos to add new ones.", variant: "destructive" });
      return;
    }

    // Show preview thumbnails immediately
    const previews: { slotIndex: number; previewUrl: string; file: File }[] = [];
    
    for (let i = 0; i < Math.min(fileArray.length, emptySlots.length); i++) {
      const file = fileArray[i];
      const slotIndex = emptySlots[i].idx;
      const previewUrl = URL.createObjectURL(file);
      previews.push({ slotIndex, previewUrl, file });
    }

    // Update state to show previews with "uploading" status
    setPhotoSlots(prev => {
      const updated = [...prev];
      previews.forEach(({ slotIndex, previewUrl }) => {
        updated[slotIndex] = {
          ...updated[slotIndex],
          status: 'uploading',
          progress: 0,
          previewUrl,
        };
      });
      return updated;
    });

    // Start uploads in parallel
    previews.forEach(async ({ slotIndex, previewUrl, file }) => {
      try {
        const compressedBase64 = await compressImage(file);
        uploadPhotoMutation.mutate({ base64Data: compressedBase64, slotIndex });
      } catch (err) {
        console.error(`Failed to compress image:`, err);
        toast({ title: "Error", description: `Failed to process image`, variant: "destructive" });
        setPhotoSlots(prev => prev.map((slot, i) => 
          i === slotIndex ? { ...slot, status: 'empty' as const, progress: 0, previewUrl: undefined } : slot
        ));
        URL.revokeObjectURL(previewUrl);
      }
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    const photo = photoSlots[index];
    
    if (photo.status === 'uploaded' && photo.id > 0) {
      // Delete from database
      deletePhotoMutation.mutate(photo.id);
    }
    
    // Update local state immediately
    setPhotoSlots(prev => prev.map((slot, i) => 
      i === index 
        ? { id: 0, url: '', order: i, status: 'empty' as const, progress: 0, previewUrl: undefined }
        : slot
    ));
    toast({ title: "Photo removed" });
  };

  // Drag and drop reorder
  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;

    // Swap the two slots
    setPhotoSlots(prev => {
      const newSlots = [...prev];
      const sourceSlot = { ...newSlots[sourceIndex] };
      const destSlot = { ...newSlots[destIndex] };
      
      // Swap positions but keep order values matching indices
      newSlots[sourceIndex] = { ...destSlot, order: sourceIndex };
      newSlots[destIndex] = { ...sourceSlot, order: destIndex };
      
      return newSlots;
    });

    // Get the photos that need reordering (both swapped items)
    const sourcePhoto = photoSlots[sourceIndex];
    const destPhoto = photoSlots[destIndex];
    
    const photosToReorder = [];
    if (sourcePhoto.status === 'uploaded' && sourcePhoto.id > 0) {
      photosToReorder.push({ id: sourcePhoto.id, order: destIndex });
    }
    if (destPhoto.status === 'uploaded' && destPhoto.id > 0) {
      photosToReorder.push({ id: destPhoto.id, order: sourceIndex });
    }

    if (photosToReorder.length > 0) {
      try {
        await fetch('/api/profile/photos/reorder', {
          method: 'PUT',
          body: JSON.stringify({ photos: photosToReorder }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          }
        });
        toast({ title: "Photos reordered" });
        queryClient.invalidateQueries({ queryKey: ['/api/profile/photos', currentUser?.id] });
      } catch (err) {
        toast({ title: "Failed to save order", variant: "destructive" });
      }
    }
  }, [photoSlots, toast, currentUser?.id]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      photoSlots.forEach(slot => {
        if (slot.previewUrl) {
          URL.revokeObjectURL(slot.previewUrl);
        }
      });
    };
  }, []);

  const uploadedCount = photoSlots.filter(s => s.status === 'uploaded').length;
  const uploadingCount = photoSlots.filter(s => s.status === 'uploading').length;

  // Circular progress component
  const CircularProgress = ({ progress, size = 40 }: { progress: number; size?: number }) => {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-muted-foreground/20"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-primary transition-all duration-300"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {progress === 100 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-500" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{progress}%</span>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Face Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Face Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-6">
          {/* Photo Grid - Drag and Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="photo-gallery" direction="horizontal">
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`grid grid-cols-2 md:grid-cols-3 gap-4 p-2 rounded-lg transition-colors ${
                    snapshot.isDraggingOver ? 'bg-primary/5' : ''
                  }`}
                >
                  {photoSlots.map((slot, index) => (
                    <Draggable 
                      key={`slot-${index}`} 
                      draggableId={`slot-${index}`} 
                      index={index}
                      isDragDisabled={slot.status !== 'uploaded'}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative aspect-square bg-muted rounded-lg border-2 overflow-hidden group transition-all ${
                            snapshot.isDragging 
                              ? 'border-primary shadow-lg scale-105 z-50' 
                              : slot.status === 'uploaded'
                                ? 'border-border hover:border-primary/50 cursor-grab'
                                : 'border-dashed border-border/50'
                          }`}
                        >
                          {/* Uploaded Photo */}
                          {slot.status === 'uploaded' && (
                            <>
                              <img 
                                src={slot.url} 
                                alt={`Photo ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              
                              {/* Drag handle */}
                              <div 
                                {...provided.dragHandleProps}
                                className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <div className="p-1.5 rounded-md bg-black/60 text-white cursor-grab">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                              </div>
                              
                              {/* Remove button */}
                              <button
                                onClick={() => handleRemovePhoto(index)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`button-remove-photo-${index}`}
                              >
                                <div className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600">
                                  <X className="w-4 h-4" />
                                </div>
                              </button>
                              
                              {/* Order badge */}
                              <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded-md">
                                #{index + 1}
                              </div>
                            </>
                          )}

                          {/* Uploading with Preview */}
                          {slot.status === 'uploading' && (
                            <>
                              <img 
                                src={slot.previewUrl || ''} 
                                alt={`Uploading ${index + 1}`} 
                                className="w-full h-full object-cover opacity-50"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <CircularProgress progress={slot.progress} size={48} />
                              </div>
                            </>
                          )}

                          {/* Empty Slot */}
                          {slot.status === 'empty' && (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-full flex flex-col items-center justify-center gap-2 hover-elevate cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                              data-testid={`button-upload-photo-slot-${index}`}
                            >
                              <Upload className="w-6 h-6" />
                              <span className="text-xs">Add Photo</span>
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Multi-file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            multiple
            className="hidden"
            data-testid="input-multi-photo"
          />

          {/* Info */}
          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground space-y-1">
            <p>Add up to 6 face photos. Drag to reorder after uploading.</p>
            <p className="text-xs">Tip: Photo #1 appears as your main profile thumbnail.</p>
          </div>

          {/* Stats & Upload Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {uploadedCount} of 6 photos {uploadingCount > 0 && `(${uploadingCount} uploading...)`}
            </div>
            <Button 
              variant="default"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadedCount === 6 || uploadingCount > 0}
              data-testid="button-upload-photos-bulk"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadingCount > 0 
                ? `Uploading ${uploadingCount}...` 
                : uploadedCount === 6 
                  ? 'Gallery Full' 
                  : 'Upload Photos'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Gallery Section - All Photos and Videos from Memories Feed */}
      {galleryItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Gallery
              <span className="text-sm font-normal text-muted-foreground ml-auto">
                {galleryItems.length} item{galleryItems.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {galleryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array(8).fill(null).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border hover-elevate group cursor-pointer transition-all"
                    data-testid={`gallery-item-${item.id}`}
                  >
                    <img 
                      src={item.thumbnail || item.url} 
                      alt={item.caption || 'Gallery item'}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Video badge */}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    {/* Caption on hover */}
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs line-clamp-2">{item.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
