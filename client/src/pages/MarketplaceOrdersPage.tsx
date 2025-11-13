import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/marketplace/OrderStatusBadge";
import { Package, Download, Star, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MarketplaceOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch orders - using mock data for now
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["/api/marketplace/orders"],
  });

  // Mock orders for demonstration
  const mockOrders = [
    {
      id: "ORD-001",
      date: new Date(Date.now() - 86400000 * 2),
      items: [
        { title: "Premium Tango Shoes", quantity: 1, price: 129.99 },
      ],
      total: 139.98,
      status: "delivered" as const,
      trackingNumber: "1Z999AA1012345678",
    },
    {
      id: "ORD-002",
      date: new Date(Date.now() - 86400000 * 5),
      items: [
        { title: "Tango Music Collection", quantity: 2, price: 29.99 },
        { title: "Tango Accessories Set", quantity: 1, price: 49.99 },
      ],
      total: 119.97,
      status: "shipped" as const,
      trackingNumber: "1Z999AA1087654321",
    },
    {
      id: "ORD-003",
      date: new Date(Date.now() - 86400000 * 10),
      items: [
        { title: "Online Tango Course", quantity: 1, price: 99.99 },
      ],
      total: 99.99,
      status: "delivered" as const,
      trackingNumber: null,
    },
  ];

  const orders = ordersData || mockOrders;

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((order: any) => order.status === statusFilter);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] bg-clip-text text-transparent">
              My Orders
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your marketplace orders
            </p>
          </div>
        </div>

        {/* Filter */}
        <div
          className="p-4 rounded-lg border border-white/10 flex items-center gap-4"
          style={{
            background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
            backdropFilter: "blur(16px)",
          }}
        >
          <span className="text-sm font-medium">Filter by status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredOrders.length} orders
          </span>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <Card
            style={{
              background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
              backdropFilter: "blur(16px)",
            }}
          >
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No orders found</p>
              <Button variant="outline">Browse Marketplace</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => (
              <Card
                key={order.id}
                className="hover-elevate"
                style={{
                  background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Order {order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed {formatDistanceToNow(new Date(order.date), { addSuffix: true })}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-muted-foreground"> × {item.quantity}</span>
                        </div>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Order Summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      {order.trackingNumber && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">Tracking: {order.trackingNumber}</span>
                        </>
                      )}
                    </div>
                    <div className="text-lg font-bold">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm">
                        <Star className="w-3 h-3 mr-1" />
                        Leave Review
                      </Button>
                    )}
                    {order.status === "shipped" || order.status === "delivered" ? (
                      <Button variant="outline" size="sm">
                        <Package className="w-3 h-3 mr-1" />
                        Track Package
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Download Invoice
                    </Button>
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm" className="ml-auto">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reorder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
