import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Edit, Trash2, Lock, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const albumFormSchema = z.object({
  name: z.string().min(1, "Album name is required").max(100),
  description: z.string().max(500).optional(),
  privacy: z.enum(["public", "private", "friends"]),
});

type AlbumFormData = z.infer<typeof albumFormSchema>;

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

export default function Albums() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [deleteConfirmAlbum, setDeleteConfirmAlbum] = useState<Album | null>(null);
  const { toast } = useToast();

  const { data: albums = [], isLoading } = useQuery<Album[]>({
    queryKey: ["/api/media/albums"],
  });

  const createForm = useForm<AlbumFormData>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public",
    },
  });

  const editForm = useForm<AlbumFormData>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "public",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AlbumFormData) => {
      return await apiRequest("/api/media/albums", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/albums"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Album created",
        description: "Your album has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create album. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: AlbumFormData }) => {
      return await apiRequest(`/api/media/albums/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data.updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/albums"] });
      setEditingAlbum(null);
      editForm.reset();
      toast({
        title: "Album updated",
        description: "Your album has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update album. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/media/albums/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media/albums"] });
      setDeleteConfirmAlbum(null);
      toast({
        title: "Album deleted",
        description: "Your album has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete album. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (album: Album) => {
    setEditingAlbum(album);
    editForm.reset({
      name: album.name,
      description: album.description || "",
      privacy: album.privacy as "public" | "private" | "friends",
    });
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Albums</h1>
          <p className="text-muted-foreground mt-1">
            Organize your photos and videos into albums
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-album"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Album
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-5 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : albums.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No albums yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first album to organize your media
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Album
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Card
              key={album.id}
              className="overflow-hidden hover-elevate"
              data-testid={`card-album-${album.id}`}
            >
              <Link href={`/albums/${album.id}`}>
                <div className="aspect-square bg-muted relative overflow-hidden cursor-pointer">
                  {album.coverImage ? (
                    <img
                      src={album.coverImage.thumbnail || album.coverImage.url}
                      alt={album.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Plus className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center gap-1">
                    {getPrivacyIcon(album.privacy)}
                    <span>{album.mediaCount || 0}</span>
                  </div>
                </div>
              </Link>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate" data-testid={`text-album-name-${album.id}`}>
                  {album.name}
                </h3>
                {album.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {album.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(album)}
                  data-testid={`button-edit-album-${album.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteConfirmAlbum(album)}
                  data-testid={`button-delete-album-${album.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Album Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
            <DialogDescription>
              Create a new album to organize your photos and videos
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Buenos Aires 2024"
                        data-testid="input-album-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your album..."
                        rows={3}
                        data-testid="input-album-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-album-privacy">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                  {createMutation.isPending ? "Creating..." : "Create Album"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Album Dialog */}
      <Dialog open={!!editingAlbum} onOpenChange={(open) => !open && setEditingAlbum(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
            <DialogDescription>
              Update your album details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) =>
                updateMutation.mutate({ id: editingAlbum!.id, updates: data })
              )}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-album-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="input-edit-album-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-album-privacy">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAlbum(null)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  {updateMutation.isPending ? "Updating..." : "Update Album"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmAlbum}
        onOpenChange={(open) => !open && setDeleteConfirmAlbum(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Album</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmAlbum?.name}"? This action cannot be
              undone. The media files will not be deleted, only the album.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmAlbum(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteConfirmAlbum!.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Album"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
