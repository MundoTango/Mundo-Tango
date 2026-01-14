import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, X, Star, CheckCircle2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface UploadedPhoto {
  id: string;
  url: string;
  isCover: boolean;
  order: number;
}

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error';
  progress: number;
  isCover: boolean;
}

interface EventPhotoUploaderProps {
  coverPhoto: UploadedPhoto | null;
  galleryPhotos: UploadedPhoto[];
  onCoverPhotoChange: (photo: UploadedPhoto | null) => void;
  onGalleryPhotosChange: (photos: UploadedPhoto[]) => void;
  maxGalleryPhotos?: number;
  className?: string;
}

export function EventPhotoUploader({
  coverPhoto,
  galleryPhotos,
  onCoverPhotoChange,
  onGalleryPhotosChange,
  maxGalleryPhotos = 6,
  className = "",
}: EventPhotoUploaderProps) {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  const pendingPhotosRef = useRef<PendingPhoto[]>([]);

  useEffect(() => {
    pendingPhotosRef.current = pendingPhotos;
  }, [pendingPhotos]);

  useEffect(() => {
    return () => {
      pendingPhotosRef.current.forEach(p => {
        if (p.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(p.previewUrl);
        }
      });
    };
  }, []);

  const compressImage = (file: File): Promise<Blob> => {
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

          canvas.toBlob(
            (blob) => {
              if (blob) {
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

  const uploadToStorage = async (blob: Blob, fileName: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", blob, fileName);

    const token = localStorage.getItem("accessToken");
    const response = await fetch("/api/media/upload", {
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

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }
    return data.url;
  };

  const processAndUploadPhoto = async (pending: PendingPhoto): Promise<UploadedPhoto> => {
    setPendingPhotos(prev =>
      prev.map(p => p.id === pending.id ? { ...p, status: 'compressing' as const, progress: 20 } : p)
    );

    let imageBlob: Blob;
    try {
      imageBlob = await compressImage(pending.file);
    } catch (err) {
      console.warn('[EventPhotoUploader] Compression failed, using original:', err);
      imageBlob = pending.file;
    }

    setPendingPhotos(prev =>
      prev.map(p => p.id === pending.id ? { ...p, status: 'uploading' as const, progress: 50 } : p)
    );

    const url = await uploadToStorage(imageBlob, pending.file.name);

    setPendingPhotos(prev =>
      prev.map(p => p.id === pending.id ? { ...p, status: 'done' as const, progress: 100 } : p)
    );

    URL.revokeObjectURL(pending.previewUrl);

    return {
      id: pending.id,
      url,
      isCover: pending.isCover,
      order: pending.isCover ? 0 : galleryPhotos.length,
    };
  };

  const handleCoverDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const pending: PendingPhoto = {
      id: `cover-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      isCover: true,
    };

    setPendingPhotos(prev => [...prev.filter(p => !p.isCover), pending]);
    setUploading(true);

    try {
      const uploaded = await processAndUploadPhoto(pending);
      onCoverPhotoChange(uploaded);
      setPendingPhotos(prev => prev.filter(p => p.id !== pending.id));
      toast({
        title: t('pages:createEvent.photoUploaded', 'Photo uploaded'),
        description: t('pages:createEvent.coverPhotoSet', 'Cover photo set successfully'),
      });
    } catch (error) {
      console.error("Cover upload error:", error);
      setPendingPhotos(prev =>
        prev.map(p => p.id === pending.id ? { ...p, status: 'error' as const } : p)
      );
      toast({
        title: t('pages:createEvent.uploadFailed', 'Upload failed'),
        description: t('pages:createEvent.pleaseTryAgain', 'Please try again'),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [onCoverPhotoChange, toast, t]);

  const handleGalleryDrop = useCallback(async (acceptedFiles: File[]) => {
    const availableSlots = maxGalleryPhotos - galleryPhotos.length;
    if (acceptedFiles.length > availableSlots) {
      toast({
        title: t('pages:createEvent.tooManyPhotos', 'Too many photos'),
        description: t('pages:createEvent.maxPhotosMessage', 'Maximum {{max}} additional photos allowed', { max: maxGalleryPhotos }),
        variant: "destructive",
      });
      acceptedFiles = acceptedFiles.slice(0, availableSlots);
    }

    if (acceptedFiles.length === 0) return;

    const newPending: PendingPhoto[] = acceptedFiles.map((file, index) => ({
      id: `gallery-${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0,
      isCover: false,
    }));

    setPendingPhotos(prev => [...prev, ...newPending]);
    setUploading(true);

    try {
      const uploadedPhotos: UploadedPhoto[] = [];

      for (const pending of newPending) {
        const uploaded = await processAndUploadPhoto(pending);
        uploadedPhotos.push({
          ...uploaded,
          order: galleryPhotos.length + uploadedPhotos.length,
        });
      }

      setPendingPhotos(prev => prev.filter(p => !newPending.find(np => np.id === p.id)));
      onGalleryPhotosChange([...galleryPhotos, ...uploadedPhotos]);
      
      toast({
        title: t('pages:createEvent.photosUploaded', 'Photos uploaded'),
        description: t('pages:createEvent.photosAddedSuccessfully', '{{count}} photo(s) added successfully', { count: uploadedPhotos.length }),
      });
    } catch (error) {
      console.error("Gallery upload error:", error);
      setPendingPhotos(prev =>
        prev.map(p => newPending.find(np => np.id === p.id) && p.status !== 'done'
          ? { ...p, status: 'error' as const }
          : p
        )
      );
      toast({
        title: t('pages:createEvent.uploadFailed', 'Upload failed'),
        description: t('pages:createEvent.somePhotosFailed', 'Some photos failed to upload. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [galleryPhotos, maxGalleryPhotos, onGalleryPhotosChange, toast, t]);

  const coverDropzone = useDropzone({
    accept: { "image/*": ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    disabled: uploading,
    onDrop: handleCoverDrop,
  });

  const galleryDropzone = useDropzone({
    accept: { "image/*": ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: maxGalleryPhotos - galleryPhotos.length,
    disabled: uploading || galleryPhotos.length >= maxGalleryPhotos,
    onDrop: handleGalleryDrop,
  });

  const removeCoverPhoto = () => {
    onCoverPhotoChange(null);
  };

  const removeGalleryPhoto = (id: string) => {
    onGalleryPhotosChange(galleryPhotos.filter(p => p.id !== id));
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

  const pendingCover = pendingPhotos.find(p => p.isCover);
  const pendingGallery = pendingPhotos.filter(p => !p.isCover);

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          {t('pages:createEvent.coverPhoto', 'Cover Photo')}
        </h3>
        
        {coverPhoto ? (
          <Card className="relative overflow-hidden max-w-md">
            <div className="aspect-video relative">
              <img
                src={coverPhoto.url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {t('pages:createEvent.cover', 'Cover')}
              </div>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={removeCoverPhoto}
                data-testid="button-remove-cover"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ) : pendingCover ? (
          <Card className="relative overflow-hidden max-w-md">
            <div className="aspect-video relative">
              <img
                src={pendingCover.previewUrl}
                alt=""
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                {pendingCover.status === 'compressing' && (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                    <span className="text-xs text-white font-medium">
                      {t('pages:createEvent.compressing', 'Compressing...')}
                    </span>
                  </>
                )}
                {pendingCover.status === 'uploading' && (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                    <span className="text-xs text-white font-medium">
                      {t('pages:createEvent.uploading', 'Uploading...')}
                    </span>
                  </>
                )}
                {pendingCover.status === 'done' && (
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                )}
                {pendingCover.status === 'error' && (
                  <>
                    <X className="h-8 w-8 text-red-400" />
                    <span className="text-xs text-white font-medium">
                      {t('pages:createEvent.failed', 'Failed')}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removePendingPhoto(pendingCover.id)}
                    >
                      {t('common:remove', 'Remove')}
                    </Button>
                  </>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0">
                <Progress value={pendingCover.progress} className="h-1 rounded-none" />
              </div>
            </div>
          </Card>
        ) : (
          <div
            {...coverDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all max-w-md ${
              coverDropzone.isDragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            data-testid="dropzone-cover-photo"
          >
            <input {...coverDropzone.getInputProps()} data-testid="input-cover-photo" />
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                {coverDropzone.isDragActive
                  ? t('pages:createEvent.dropCoverHere', 'Drop cover photo here')
                  : t('pages:createEvent.dragCoverPhoto', 'Drag & drop or click to upload cover')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('pages:createEvent.recommendedSize', 'Recommended: 1920x1080 or 16:9 ratio')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Upload className="h-4 w-4" />
          {t('pages:createEvent.additionalPhotos', 'Additional Photos')}
          <span className="text-muted-foreground">({galleryPhotos.length}/{maxGalleryPhotos})</span>
        </h3>

        {galleryPhotos.length < maxGalleryPhotos && (
          <div
            {...galleryDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              galleryDropzone.isDragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            } ${uploading || galleryPhotos.length >= maxGalleryPhotos ? "opacity-50 cursor-not-allowed" : ""}`}
            data-testid="dropzone-gallery-photos"
          >
            <input {...galleryDropzone.getInputProps()} data-testid="input-gallery-photos" />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm">
                {galleryDropzone.isDragActive
                  ? t('pages:createEvent.dropPhotosHere', 'Drop photos here')
                  : t('pages:createEvent.dragPhotos', 'Drag & drop or click to add photos')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('pages:createEvent.uploadLimit', 'Up to {{remaining}} more photos', { remaining: maxGalleryPhotos - galleryPhotos.length })}
              </p>
            </div>
          </div>
        )}

        {(galleryPhotos.length > 0 || pendingGallery.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {galleryPhotos.map((photo, index) => (
              <Card key={photo.id} className="relative overflow-hidden" data-testid={`gallery-photo-${index}`}>
                <div className="aspect-square relative">
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => removeGalleryPhoto(photo.id)}
                    data-testid={`button-remove-gallery-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                </div>
              </Card>
            ))}

            {pendingGallery.map((pending, index) => (
              <Card key={pending.id} className="relative overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={pending.previewUrl}
                    alt=""
                    className={`w-full h-full object-cover transition-opacity ${
                      pending.status === 'done' ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                    {pending.status === 'compressing' && (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                        <span className="text-xs text-white font-medium">
                          {t('pages:createEvent.compressing', 'Compressing...')}
                        </span>
                      </>
                    )}
                    {pending.status === 'uploading' && (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                        <span className="text-xs text-white font-medium">
                          {t('pages:createEvent.uploading', 'Uploading...')}
                        </span>
                      </>
                    )}
                    {pending.status === 'done' && (
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    )}
                    {pending.status === 'error' && (
                      <>
                        <X className="h-6 w-6 text-red-400" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removePendingPhoto(pending.id)}
                          className="mt-1"
                        >
                          {t('common:remove', 'Remove')}
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={pending.progress} className="h-1 rounded-none" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
