import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: number;
  name: string;
  type: string;
  size?: number;
  uploadDate?: string;
  url?: string;
}

interface TravelDocumentUploadProps {
  documents?: Document[];
  onUpload?: (file: File) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  maxSize?: number; // in MB
}

export function TravelDocumentUpload({
  documents = [],
  onUpload,
  onDelete,
  maxSize = 10,
}: TravelDocumentUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    if (onUpload) {
      setUploading(true);
      try {
        await onUpload(file);
        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded`,
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload document. Please try again.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    }

    // Reset input
    e.target.value = "";
  };

  const handleDelete = async (id: number) => {
    if (onDelete) {
      try {
        await onDelete(id);
        toast({
          title: "Document deleted",
          description: "Document has been removed",
        });
      } catch (error) {
        toast({
          title: "Delete failed",
          description: "Failed to delete document. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      flight: "✈️",
      hotel: "🏨",
      visa: "📋",
      insurance: "🛡️",
      passport: "📘",
      ticket: "🎫",
      other: "📄",
    };
    return iconMap[type] || "📄";
  };

  return (
    <Card data-testid="document-upload">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Travel Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Upload tickets, confirmations, visas, and other documents
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {maxSize}MB
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              disabled={uploading || !onUpload}
              asChild={!uploading}
              data-testid="button-upload-document"
            >
              <label className="cursor-pointer">
                {uploading ? "Uploading..." : "Choose File"}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  disabled={uploading || !onUpload}
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Uploaded Documents ({documents.length})</h4>
            {documents.map((doc) => (
              <Card key={doc.id} className="hover-elevate" data-testid={`document-${doc.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl">{getDocumentIcon(doc.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                          {doc.size && (
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(doc.size)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {doc.url && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                            data-testid={`button-view-document-${doc.id}`}
                          >
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                            data-testid={`button-download-document-${doc.id}`}
                          >
                            <a href={doc.url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      {onDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(doc.id)}
                          data-testid={`button-delete-document-${doc.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
