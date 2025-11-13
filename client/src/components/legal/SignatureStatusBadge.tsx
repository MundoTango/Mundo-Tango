import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react";

interface SignatureStatusBadgeProps {
  status: string;
  className?: string;
}

export function SignatureStatusBadge({ status, className }: SignatureStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'completed':
      case 'signed':
        return {
          variant: "default" as const,
          icon: CheckCircle2,
          label: "Signed",
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        };
      case 'pending':
      case 'pending_signature':
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: "Pending",
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        };
      case 'declined':
      case 'rejected':
        return {
          variant: "destructive" as const,
          icon: XCircle,
          label: "Declined",
          className: "bg-red-500/10 text-red-600 border-red-500/20",
        };
      case 'draft':
        return {
          variant: "outline" as const,
          icon: FileText,
          label: "Draft",
          className: "bg-muted/50",
        };
      default:
        return {
          variant: "outline" as const,
          icon: FileText,
          label: status,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1.5 font-normal ${config.className} ${className || ''}`}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
