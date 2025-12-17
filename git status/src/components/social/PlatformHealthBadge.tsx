import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformHealthBadgeProps {
  status: "healthy" | "warning" | "error" | "unknown";
  responseTime?: number;
  lastChecked?: Date;
  className?: string;
}

export function PlatformHealthBadge({
  status,
  responseTime,
  lastChecked,
  className,
}: PlatformHealthBadgeProps) {
  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      label: "Healthy",
      className: "bg-green-500/20 text-green-500 border-green-500/50",
    },
    warning: {
      icon: AlertCircle,
      label: "Warning",
      className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    },
    error: {
      icon: XCircle,
      label: "Error",
      className: "bg-red-500/20 text-red-500 border-red-500/50",
    },
    unknown: {
      icon: Clock,
      label: "Unknown",
      className: "bg-gray-500/20 text-gray-500 border-gray-500/50",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("space-y-1", className)}>
      <Badge variant="outline" className={cn("gap-1", config.className)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
      <div className="text-xs text-muted-foreground">
        {responseTime !== undefined && (
          <div>Response: {responseTime}ms</div>
        )}
        {lastChecked && (
          <div>Checked: {new Date(lastChecked).toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  );
}
