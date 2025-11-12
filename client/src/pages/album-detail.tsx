import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Lock,
  Users,
  Globe,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Album {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  coverImageId: number | null;
  privacy: string;
  mediaCount: number;
  createdAt: string;
  updatedAt: string;
  coverImage: {
    id: number;
    url: string;
    thumbnail: string | null;
  } | null;
}

interface Media {
  id: number;
  albumId: number;
  mediaId: number;
  order: number;
  addedAt: string;
  media_id: number;
  media_userId: number;
  media_type: string;
  media_url: string;
  media_thumbnail: string | null;
  media_caption: string | null;
  media_createdAt: string;
}

export default function AlbumDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const albumId = params.id ? parseInt(params.id) : null;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAddMediaDialogOpen, setIsAddMediaDialogOpen] = useState(false);
  const [deleteMediaConfirm, setDeleteMediaConfirm] = useState<Media | null>(null);
  const { toast } = useToast();

  const { data: album, isLoading: albumLoading } = useQuery<Album>({
    queryKey: ["/api/media/albums", albumId],
    enabled: !!albumId,
  });

  const { data: albumMedia = [], isLoading: mediaLoading } = useQuery<Media[]>({
    queryKey: ["/api/media/albums", albumId, "media"],
    enabled: !!albumId,
  });

  const { data: userMedia = [] } = useQuery<any[]>({
    queryKey: ["/api/media"],
    enabled: isAddMediaDialogOpen,
  });

  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);

  const addMediaMutation = useMutation({
    mutationFn: async (data: { mediaId: number; order: number }) => {
      return await apiRequest(`/api/media/albums/${albumId}/media`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/albums", albumId, "media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/media/albums", albumId] });
      setIsAddMediaDialogOpen(false);
      setSelectedMediaId(null);
      toast({
        title: "Media added",
        description: "Media has been added to the album.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add media to album.",
        variant: "destructive",
      });
    },
  });

  const removeMediaMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      return await apiRequest(`/api/media/albums/${albumId}/media/${mediaId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/albums", albumId, "media"] });
      queryClient.invalidateQueries({ queryKey: ["/api/media/albums", albumId] });
      setDeleteMediaConfirm(null);
      toast({
        title: "Media removed",
        description: "Media has been removed from the album.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove media from album.",
        variant: "destructive",
      });
    },
  });

  const handleAddMedia = () => {
    if (!selectedMediaId) return;
    addMediaMutation.mutate({
      mediaId: selectedMediaId,
      order: albumMedia.length,
    });
  };

  const handlePrevious = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === 0 ? albumMedia.length - 1 : lightboxIndex - 1);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % albumMedia.length);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setLightboxIndex(null);
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "private":
        return <Lock className="w-4 h-4" />;
      case "friends":
        return <Users className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Add keyboard listener
  useState(() => {
    if (lightboxIndex !== null) {
      window.addEventListener("keydown", handleKeyDown as any);
      return () => window.removeEventListener("keydown", handleKeyDown as any);
    }
  });

  if (!albumId) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Invalid album</h3>
            <p className="text-muted-foreground mb-6">The album ID is invalid</p>
            <Button asChild>
              <Link href="/albums">Back to Albums</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (albumLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-8 bg-muted animate-pulse rounded w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Album not found</h3>
            <p className="text-muted-foreground mb-6">This album doesn't exist or you don't have access to it</p>
            <Button asChild>
              <Link href="/albums">Back to Albums</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const availableMedia = userMedia.filter(
    (media) => !albumMedia.some((am) => am.mediaId === media.id)
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild data-testid="button-back">
          <Link href="/albums">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold" data-testid="text-album-name">{album.name}</h1>
            {getPrivacyIcon(album.privacy)}
          </div>
          {album.description && (
            <p className="text-muted-foreground">{album.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {albumMedia.length} {albumMedia.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Button onClick={() => setIsAddMediaDialogOpen(true)} data-testid="button-add-media">
          <Plus className="w-4 h-4 mr-2" />
          Add Media
        </Button>
      </div>

      {mediaLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : albumMedia.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No media in this album</h3>
            <p className="text-muted-foreground mb-6">
              Add photos or videos to your album
            </p>
            <Button onClick={() => setIsAddMediaDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albumMedia.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden hover-elevate group relative"
              data-testid={`card-media-${item.mediaId}`}
            >
              <div
                className="aspect-square bg-muted relative overflow-hidden cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    className="w-full h-full object-cover"
                    poster={item.media_thumbnail || undefined}
                  />
                ) : (
                  <img
                    src={item.media_thumbnail || item.media_url}
                    alt={item.media_caption || "Media"}
                    className="w-full h-full object-cover"
                  />
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteMediaConfirm(item);
                  }}
                  data-testid={`button-remove-media-${item.mediaId}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Viewer */}
      {lightboxIndex !== null && albumMedia[lightboxIndex] && (
        <Dialog open={true} onOpenChange={() => setLightboxIndex(null)}>
          <DialogContent className="max-w-screen-lg p-0 bg-black" data-testid="lightbox-viewer">
            <div className="relative h-[80vh] flex items-center justify-center">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
                onClick={() => setLightboxIndex(null)}
                data-testid="button-lightbox-close"
              >
                <X className="w-6 h-6" />
              </Button>

              {albumMedia.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute left-4 text-white hover:bg-white/20"
                    onClick={handlePrevious}
                    data-testid="button-lightbox-previous"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-4 text-white hover:bg-white/20"
                    onClick={handleNext}
                    data-testid="button-lightbox-next"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                </>
              )}

              {albumMedia[lightboxIndex].media_type === "video" ? (
                <video
                  src={albumMedia[lightboxIndex].media_url}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                  data-testid="lightbox-video"
                />
              ) : (
                <img
                  src={albumMedia[lightboxIndex].media_url}
                  alt={albumMedia[lightboxIndex].media_caption || "Media"}
                  className="max-w-full max-h-full object-contain"
                  data-testid="lightbox-image"
                />
              )}

              <div className="absolute bottom-4 left-4 right-4 text-white">
                {albumMedia[lightboxIndex].media_caption && (
                  <p className="text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                    {albumMedia[lightboxIndex].media_caption}
                  </p>
                )}
                <p className="text-xs text-white/70 mt-2">
                  {lightboxIndex + 1} / {albumMedia.length}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Media Dialog */}
      <Dialog open={isAddMediaDialogOpen} onOpenChange={setIsAddMediaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Media to Album</DialogTitle>
            <DialogDescription>
              Select media from your gallery to add to this album
            </DialogDescription>
          </DialogHeader>
          
          {availableMedia.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">
                All your media is already in this album or you have no media yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4">
              {availableMedia.map((media: any) => (
                <Card
                  key={media.id}
                  className={`overflow-hidden cursor-pointer hover-elevate ${
                    selectedMediaId === media.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedMediaId(media.id)}
                  data-testid={`card-select-media-${media.id}`}
                >
                  <div className="aspect-square bg-muted">
                    {media.type === "video" ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        poster={media.thumbnail || undefined}
                      />
                    ) : (
                      <img
                        src={media.thumbnail || media.url}
                        alt={media.caption || "Media"}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMediaDialogOpen(false);
                setSelectedMediaId(null);
              }}
              disabled={addMediaMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMedia}
              disabled={!selectedMediaId || addMediaMutation.isPending}
              data-testid="button-add-media-submit"
            >
              {addMediaMutation.isPending ? "Adding..." : "Add to Album"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Media Confirmation Dialog */}
      <Dialog
        open={!!deleteMediaConfirm}
        onOpenChange={(open) => !open && setDeleteMediaConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this media from the album? The media file itself
              will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteMediaConfirm(null)}
              disabled={removeMediaMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => removeMediaMutation.mutate(deleteMediaConfirm!.mediaId)}
              disabled={removeMediaMutation.isPending}
              data-testid="button-confirm-remove"
            >
              {removeMediaMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
