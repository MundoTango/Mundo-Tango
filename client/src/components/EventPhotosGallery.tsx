import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Star, MoreVertical, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectEventPhoto } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface EventPhotosGalleryProps {
  photos: SelectEventPhoto[];
  onUpload?: () => void;
  onFeature?: (photoId: number) => void;
  onUnfeature?: (photoId: number) => void;
  onDelete?: (photoId: number) => void;
  canModerate?: boolean;
  eventId: number;
}

export function EventPhotosGallery({ 
  photos, 
  onUpload, 
  onFeature, 
  onUnfeature, 
  onDelete,
  canModerate,
  eventId 
}: EventPhotosGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SelectEventPhoto | null>(null);
  const { toast } = useToast();

  const handleFeature = (photoId: number) => {
    onFeature?.(photoId);
    toast({ title: "Photo featured successfully" });
  };

  const handleUnfeature = (photoId: number) => {
    onUnfeature?.(photoId);
    toast({ title: "Photo unfeatured" });
  };

  const handleDelete = (photoId: number) => {
    onDelete?.(photoId);
    setSelectedPhoto(null);
    toast({ title: "Photo deleted" });
  };

  return (
    <Card data-testid={`card-event-photos-${eventId}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Event Photos ({photos.length})</CardTitle>
        {onUpload && (
          <Button onClick={onUpload} size="sm" className="gap-2" data-testid={`button-upload-photo-${eventId}`}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No photos yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group" data-testid={`photo-item-${photo.id}`}>
                <Dialog>
                  <DialogTrigger asChild>
                    <div 
                      className="relative aspect-square cursor-pointer overflow-hidden rounded-lg hover-elevate"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img 
                        src={photo.photoUrl} 
                        alt={photo.caption || `Event photo ${photo.id}`}
                        className="w-full h-full object-cover"
                        data-testid={`img-event-photo-${photo.id}`}
                      />
                      {photo.isFeatured && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default" className="gap-1" data-testid={`badge-featured-${photo.id}`}>
                            <Star className="h-3 w-3" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Event Photo</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <img 
                        src={photo.photoUrl} 
                        alt={photo.caption || "Event photo"}
                        className="w-full rounded-lg"
                      />
                      
                      {photo.caption && (
                        <p className="text-sm" data-testid={`text-photo-caption-${photo.id}`}>
                          {photo.caption}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={""} />
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="text-muted-foreground">
                              Uploaded {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        {canModerate && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-photo-menu-${photo.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {photo.isFeatured ? (
                                <DropdownMenuItem onClick={() => handleUnfeature(photo.id)} data-testid={`menu-unfeature-${photo.id}`}>
                                  Unfeature Photo
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleFeature(photo.id)} data-testid={`menu-feature-${photo.id}`}>
                                  Feature Photo
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(photo.id)} 
                                className="text-destructive"
                                data-testid={`menu-delete-photo-${photo.id}`}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
