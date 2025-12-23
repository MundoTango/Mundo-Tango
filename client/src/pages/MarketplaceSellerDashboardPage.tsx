import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["pages", "common"]);
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
      title: t('pages:marketplaceSellerDashboard.totalRevenue', 'Total Revenue'),
      value: "$12,450",
      change: "+12.5%",
      icon: DollarSign,
      color: "from-[#40E0D0] to-[#1E90FF]",
    },
    {
      title: t('pages:marketplaceSellerDashboard.totalSales', 'Total Sales'),
      value: "156",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "from-[#1E90FF] to-[#0047AB]",
    },
    {
      title: t('pages:marketplaceSellerDashboard.activeProducts', 'Active Products'),
      value: products.length.toString(),
      change: "+3",
      icon: Package,
      color: "from-[#40E0D0] to-[#20B2AA]",
    },
    {
      title: t('pages:marketplaceSellerDashboard.commissionEarned', 'Commission Earned'),
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
        title: t('pages:marketplaceSellerDashboard.productCreated', 'Product created'),
        description: t('pages:marketplaceSellerDashboard.productCreatedDesc', 'Your product has been successfully listed'),
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
        title: t('common:error', 'Error'),
        description: t('pages:marketplaceSellerDashboard.failedToCreate', 'Failed to create product'),
        variant: "destructive",
      });
    },
  });

  const handleCreateProduct = () => {
    if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.category) {
      toast({
        title: t('pages:marketplaceSellerDashboard.validationError', 'Validation error'),
        description: t('pages:marketplaceSellerDashboard.fillAllFields', 'Please fill in all required fields'),
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
              {t('pages:marketplaceSellerDashboard.title', 'Seller Dashboard')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('pages:marketplaceSellerDashboard.subtitle', 'Manage your products and track your sales performance')}
            </p>
          </div>
          <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate" data-testid="button-create-product">
                <Plus className="w-4 h-4 mr-2" />
                {t('pages:marketplaceSellerDashboard.createProduct', 'Create Product')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('pages:marketplaceSellerDashboard.createNewProduct', 'Create New Product')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('pages:marketplaceSellerDashboard.titleField', 'Title *')}</Label>
                  <Input
                    id="title"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    data-testid="input-product-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('pages:marketplaceSellerDashboard.descriptionField', 'Description *')}</Label>
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
                    <Label htmlFor="category">{t('pages:marketplaceSellerDashboard.categoryField', 'Category *')}</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('pages:marketplaceSellerDashboard.selectCategory', 'Select category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">{t('pages:marketplaceSellerDashboard.digitalProducts', 'Digital Products')}</SelectItem>
                        <SelectItem value="physical">{t('pages:marketplaceSellerDashboard.physicalGoods', 'Physical Goods')}</SelectItem>
                        <SelectItem value="services">{t('pages:marketplaceSellerDashboard.services', 'Services')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">{t('pages:marketplaceSellerDashboard.conditionField', 'Condition *')}</Label>
                    <Select value={newProduct.condition} onValueChange={(value) => setNewProduct({ ...newProduct, condition: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('pages:marketplaceSellerDashboard.selectCondition', 'Select condition')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">{t('pages:marketplaceSellerDashboard.conditionNew', 'New')}</SelectItem>
                        <SelectItem value="like-new">{t('pages:marketplaceSellerDashboard.conditionLikeNew', 'Like New')}</SelectItem>
                        <SelectItem value="good">{t('pages:marketplaceSellerDashboard.conditionGood', 'Good')}</SelectItem>
                        <SelectItem value="fair">{t('pages:marketplaceSellerDashboard.conditionFair', 'Fair')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">{t('pages:marketplaceSellerDashboard.priceField', 'Price (USD) *')}</Label>
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
                    {t('pages:marketplaceSellerDashboard.cancel', 'Cancel')}
                  </Button>
                  <Button
                    onClick={handleCreateProduct}
                    disabled={createProductMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate"
                    data-testid="button-submit-product"
                  >
                    {createProductMutation.isPending ? t('pages:marketplaceSellerDashboard.creating', 'Creating...') : t('pages:marketplaceSellerDashboard.createProduct', 'Create Product')}
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
                  <p className="text-xs text-[#40E0D0]">{stat.change} {t('pages:marketplaceSellerDashboard.fromLastMonth', 'from last month')}</p>
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
            <CardTitle>{t('pages:marketplaceSellerDashboard.yourProducts', 'Your Products')}</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t('pages:marketplaceSellerDashboard.loadingProducts', 'Loading products...')}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('pages:marketplaceSellerDashboard.noProducts', 'No products yet. Create your first product to get started!')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-testid="table-seller-products">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pages:marketplaceSellerDashboard.productHeader', 'Product')}</TableHead>
                      <TableHead>{t('pages:marketplaceSellerDashboard.categoryHeader', 'Category')}</TableHead>
                      <TableHead>{t('pages:marketplaceSellerDashboard.priceHeader', 'Price')}</TableHead>
                      <TableHead>{t('pages:marketplaceSellerDashboard.statusHeader', 'Status')}</TableHead>
                      <TableHead>{t('pages:marketplaceSellerDashboard.viewsHeader', 'Views')}</TableHead>
                      <TableHead className="text-right">{t('pages:marketplaceSellerDashboard.actionsHeader', 'Actions')}</TableHead>
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
