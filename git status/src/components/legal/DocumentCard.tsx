import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Eye, MoreVertical } from "lucide-react";
import { SignatureStatusBadge } from "./SignatureStatusBadge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  id: number;
  title: string;
  type: string;
  status: string;
  lastModified: Date;
  participants?: number;
  signedCount?: number;
  totalSignatures?: number;
  onView?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function DocumentCard({
  id,
  title,
  type,
  status,
  lastModified,
  participants = 0,
  signedCount = 0,
  totalSignatures = 0,
  onView,
  onDownload,
  onShare,
}: DocumentCardProps) {
  const getDocumentIcon = () => {
    switch (type.toLowerCase()) {
      case 'contract':
        return FileText;
      case 'waiver':
        return FileText;
      case 'agreement':
        return FileText;
      default:
        return FileText;
    }
  };

  const Icon = getDocumentIcon();

  return (
    <Card 
      className="hover-elevate transition-all cursor-pointer group"
      data-testid={`card-document-${id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="font-normal">
                  {type}
                </Badge>
                <SignatureStatusBadge status={status} />
                {totalSignatures > 0 && (
                  <Badge variant="outline" className="font-normal">
                    {signedCount}/{totalSignatures} signed
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Modified {format(lastModified, 'MMM d, yyyy')}</span>
                {participants > 0 && (
                  <span>{participants} participant{participants !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onView?.();
              }}
              data-testid={`button-view-document-${id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
