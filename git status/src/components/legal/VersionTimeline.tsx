import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Version {
  id: number;
  version: number;
  createdAt: Date;
  createdBy: string;
  changes: string;
  isCurrent: boolean;
}

interface VersionTimelineProps {
  versions: Version[];
  onViewVersion?: (versionId: number) => void;
  onDownloadVersion?: (versionId: number) => void;
}

export function VersionTimeline({
  versions,
  onViewVersion,
  onDownloadVersion,
}: VersionTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-background bg-primary" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">Version {version.version}</span>
                    {version.isCurrent && (
                      <Badge variant="default">Current</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {format(version.createdAt, "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    By <span className="font-medium">{version.createdBy}</span>
                  </p>

                  <p className="text-sm">{version.changes}</p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewVersion?.(version.id)}
                    >
                      <Eye className="w-3 h-3 mr-1.5" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadVersion?.(version.id)}
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {versions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No version history available</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
