import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RevenueChart } from "@/components/marketplace/RevenueChart";
import { OrderStatusBadge } from "@/components/marketplace/OrderStatusBadge";
import { DollarSign, Package, ShoppingCart, TrendingUp, Plus, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

export default function MarketplaceSellerDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    category: "",
    condition: "new",
    price: "",
    images: [] as string[],
  });

  // Fetch seller products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/marketplace/my-items"],
  });

  const products = productsData || [];

  // Mock analytics data
  const revenueData = [
    { date: "Jan", revenue: 1200 },
    { date: "Feb", revenue: 1800 },
    { date: "Mar", revenue: 2400 },
    { date: "Apr", revenue: 2100 },
    { date: "May", revenue: 2800 },
    { date: "Jun", revenue: 3200 },
  ];

  const stats = [
    {
      title: "Total Revenue",
      value: "$12,450",
      change: "+12.5%",
      icon: DollarSign,
      color: "from-[#40E0D0] to-[#1E90FF]",
    },
    {
      title: "Total Sales",
      value: "156",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "from-[#1E90FF] to-[#0047AB]",
    },
    {
      title: "Active Products",
      value: products.length.toString(),
      change: "+3",
      icon: Package,
      color: "from-[#40E0D0] to-[#20B2AA]",
    },
    {
      title: "Commission Earned",
      value: "$1,245",
      change: "+15.3%",
      icon: TrendingUp,
      color: "from-[#0047AB] to-[#002366]",
    },
  ];

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/marketplace/items", {
        method: "POST",
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "Your product has been successfully listed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/my-items"] });
      setIsCreateProductOpen(false);
      setNewProduct({
        title: "",
        description: "",
        category: "",
        condition: "new",
        price: "",
        images: [],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const handleCreateProduct = () => {
    if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.category) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate();
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] bg-clip-text text-transparent">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your products and track your sales performance
            </p>
          </div>
          <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate" data-testid="button-create-product">
                <Plus className="w-4 h-4 mr-2" />
                Create Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    data-testid="input-product-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    rows={4}
                    data-testid="input-product-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital Products</SelectItem>
                        <SelectItem value="physical">Physical Goods</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select value={newProduct.condition} onValueChange={(value) => setNewProduct({ ...newProduct, condition: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    data-testid="input-product-price"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateProductOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProduct}
                    disabled={createProductMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate"
                    data-testid="button-submit-product"
                  >
                    {createProductMutation.isPending ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                style={{
                  background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-[#40E0D0]">{stat.change} from last month</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Revenue Chart */}
        <RevenueChart data={revenueData} currency="USD" />

        {/* Products Table */}
        <Card
          style={{
            background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
            backdropFilter: "blur(16px)",
          }}
        >
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No products yet. Create your first product to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-testid="table-seller-products">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={product.status === "available" ? "delivered" : "cancelled"} />
                        </TableCell>
                        <TableCell>{product.views || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
