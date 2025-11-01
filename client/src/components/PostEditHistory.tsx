import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostEditHistoryProps {
  postId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostEditHistory({ postId, open, onOpenChange }: PostEditHistoryProps) {
  const { data: editHistory = [] } = useQuery({
    queryKey: ["/api/posts", postId, "edits"],
    enabled: open && !!postId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-edit-history">
        <DialogHeader>
          <DialogTitle>Edit History</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {editHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No edit history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {editHistory.map((edit: any, index: number) => (
                <Card key={edit.id} data-testid={`edit-${edit.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-3">
                      <User className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{edit.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(edit.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    
                    {edit.editReason && (
                      <div className="mb-3 p-3 bg-muted/50 rounded-md">
                        <p className="text-sm"><span className="font-medium">Reason:</span> {edit.editReason}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {edit.previousContent && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Previous:</p>
                          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm">{edit.previousContent}</p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">New:</p>
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                          <p className="text-sm">{edit.newContent}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
