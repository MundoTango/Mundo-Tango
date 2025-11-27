import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

/**
 * ProfileTabPhotos - Photo Gallery Upload Component
 * 
 * Following Media Handling Architecture (see PRD/media-handling.md):
 * - Client-side image compression
 * - Base64 transmission
 * - Unified mutation pattern for 6 SIMULTANEOUS uploads
 * - Cache invalidation via queryKey hierarchy
 */

interface ProfilePhoto {
  id: number;
  url: string;
  caption?: string;
  order: number;
}

export default function ProfileTabPhotos() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set());
  const [photos, setPhotos] = useState<(ProfilePhoto | null)[]>(Array(6).fill(null));

  // Compress image (matching PostCreator pattern - see media-handling.md)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
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

  // Upload mutation (unified pattern - see media-handling.md)
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ base64Data, index }: { base64Data: string; index: number }) => {
      const res = await fetch('/api/profile/photos', {
        method: 'POST',
        body: JSON.stringify({ photoData: base64Data, order: index }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
      
      if (!res.ok) throw new Error('Failed to upload photo');
      return res.json();
    },
    onSuccess: (data, variables) => {
      setPhotos(prev => {
        const updated = [...prev];
        updated[variables.index] = data;
        return updated;
      });
      toast({ title: "Success", description: "Photo uploaded!" });
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id, 'photos'] });
      
      setUploadingIndices(prev => {
        const next = new Set(prev);
        next.delete(variables.index);
        return next;
      });
    },
    onError: (err, variables) => {
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
      setUploadingIndices(prev => {
        const next = new Set(prev);
        next.delete(variables.index);
        return next;
      });
    }
  });

  // Handle multiple photo uploads (6 files at once)
  const handleMultiplePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files).slice(0, 6);
    const newUploading = new Set(uploadingIndices);
    
    // Start all uploads immediately (in parallel)
    fileArray.forEach((file, arrayIndex) => {
      // Find first empty slot starting from arrayIndex
      let targetSlot = arrayIndex;
      while (targetSlot < 6 && photos[targetSlot]) {
        targetSlot++;
      }
      
      if (targetSlot < 6) {
        newUploading.add(targetSlot);
        
        compressImage(file)
          .then(compressedBase64 => {
            uploadPhotoMutation.mutate({ base64Data: compressedBase64, index: targetSlot });
          })
          .catch(err => {
            console.error(`Failed to compress image ${arrayIndex}:`, err);
            newUploading.delete(targetSlot);
            setUploadingIndices(new Set(newUploading));
            toast({ title: "Error", description: `Failed to process image ${arrayIndex + 1}`, variant: "destructive" });
          });
      }
    });
    
    setUploadingIndices(newUploading);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    toast({ title: "Success", description: "Photo removed" });
  };

  const uploadedCount = photos.filter(p => p !== null).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Face Photos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Photo Grid - 6 Slots */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="relative aspect-square bg-muted rounded-lg border-2 border-dashed border-border/50 overflow-hidden group hover:bg-muted/60 transition-colors"
              >
                {photos[index] ? (
                  <>
                    <img 
                      src={photos[index]!.url} 
                      alt={`Photo ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-remove-photo-${index}`}
                    >
                      <div className="p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </div>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex items-center justify-center hover-elevate cursor-pointer"
                    disabled={uploadingIndices.has(index)}
                    data-testid={`button-upload-photo-slot-${index}`}
                  >
                    {uploadingIndices.has(index) ? (
                      <div className="text-xs text-muted-foreground">Uploading...</div>
                    ) : (
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Multi-file input - accepts up to 6 files */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleMultiplePhotoUpload}
            multiple
            className="hidden"
            data-testid="input-multi-photo"
          />

          {/* Info */}
          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <p>Add up to 6 photos to your profile. Click any empty slot or the button below to upload multiple photos at once. Face photos help dancers recognize you better on the dance floor!</p>
          </div>

          {/* Stats & Upload Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {uploadedCount} of 6 photos uploaded
            </div>
            <Button 
              variant="default"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadedCount === 6 || uploadingIndices.size > 0}
              data-testid="button-upload-photos-bulk"
            >
              {uploadingIndices.size > 0 ? `Uploading ${uploadingIndices.size}...` : uploadedCount === 6 ? 'Gallery Full' : 'Upload Photos'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
