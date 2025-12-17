import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Eye, Download, Share2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: number;
  action: string;
  performedBy: string;
  timestamp: Date;
  ipAddress?: string;
  details?: string;
}

interface AuditLogTableProps {
  logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return FileText;
    if (actionLower.includes('edit') || actionLower.includes('update')) return Edit;
    if (actionLower.includes('view')) return Eye;
    if (actionLower.includes('download')) return Download;
    if (actionLower.includes('share')) return Share2;
    if (actionLower.includes('sign')) return CheckCircle;
    if (actionLower.includes('decline') || actionLower.includes('reject')) return XCircle;
    return FileText;
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "outline" => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('sign') || actionLower.includes('create')) return "default";
    if (actionLower.includes('decline') || actionLower.includes('reject')) return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]" data-testid="table-audit-log">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge
                        variant={getActionBadgeVariant(log.action)}
                        className="flex items-center gap-1.5 w-fit"
                      >
                        <ActionIcon className="w-3 h-3" />
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.performedBy}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(log.timestamp, "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {log.ipAddress || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {log.details || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {logs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No audit logs available</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
