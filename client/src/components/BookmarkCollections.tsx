import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, FolderPlus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookmarkCollectionsProps {
  postId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookmarkCollections({ postId, open, onOpenChange }: BookmarkCollectionsProps) {
  const [collection, setCollection] = useState("");
  const [notes, setNotes] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const { toast } = useToast();

  const { data: collections = [] } = useQuery({
    queryKey: ["/api/bookmarks/collections"],
    enabled: open,
  });

  const saveBookmark = useMutation({
    mutationFn: async () => {
      const finalCollection = creatingNew ? newCollectionName : collection;
      
      return apiRequest("POST", `/api/posts/${postId}/bookmark`, {
        collectionName: finalCollection || "Saved Posts",
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      
      toast({
        title: "Post saved",
        description: `Added to ${creatingNew ? newCollectionName : collection || "Saved Posts"}`,
      });
      
      onOpenChange(false);
      setCollection("");
      setNotes("");
      setCreatingNew(false);
      setNewCollectionName("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-bookmark-collections">
        <DialogHeader>
          <DialogTitle>Save to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Collection</Label>
            {!creatingNew ? (
              <div className="flex gap-2">
                <Select value={collection} onValueChange={setCollection}>
                  <SelectTrigger data-testid="select-collection">
                    <SelectValue placeholder="Choose a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Saved Posts">Saved Posts (Default)</SelectItem>
                    {collections.map((col: string) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCreatingNew(true)}
                  data-testid="button-new-collection"
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="New collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  data-testid="input-new-collection"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatingNew(false);
                    setNewCollectionName("");
                  }}
                  data-testid="button-cancel-new-collection"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about why you saved this..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="textarea-notes"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveBookmark.mutate()}
              disabled={saveBookmark.isPending || (creatingNew && !newCollectionName)}
              data-testid="button-save-bookmark"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
