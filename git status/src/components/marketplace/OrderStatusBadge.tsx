import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    pending: {
      label: "Pending",
      variant: "outline",
      icon: <Clock className="w-3 h-3" />,
    },
    processing: {
      label: "Processing",
      variant: "secondary",
      icon: <Package className="w-3 h-3" />,
    },
    shipped: {
      label: "Shipped",
      variant: "default",
      icon: <Truck className="w-3 h-3" />,
    },
    delivered: {
      label: "Delivered",
      variant: "default",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    cancelled: {
      label: "Cancelled",
      variant: "destructive",
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className="flex items-center gap-1"
      data-testid={`badge-status-${status}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
