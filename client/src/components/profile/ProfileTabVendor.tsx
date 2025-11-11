import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Plus, 
  Package, 
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star,
  ShoppingCart,
  Heart,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabVendorProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

const mockProducts = [
  {
    id: 1,
    name: "Professional Tango Shoes - Women's",
    description: "Handcrafted Italian leather tango shoes with suede sole for perfect pivots and slides.",
    category: "Shoes",
    price: 185,
    currency: "USD",
    stockQuantity: 12,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop",
    rating: 4.8,
    reviews: 24,
    sizes: ["35", "36", "37", "38", "39", "40"],
    colors: ["Black", "Nude", "Red"]
  },
  {
    id: 2,
    name: "Men's Classic Tango Shirt",
    description: "Elegant stretch cotton shirt designed for comfort and style on the dance floor.",
    category: "Clothing",
    price: 68,
    currency: "USD",
    stockQuantity: 25,
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop",
    rating: 4.6,
    reviews: 18,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy"]
  },
  {
    id: 3,
    name: "Tango Practice Dress",
    description: "Flowing practice dress with built-in shorts, perfect for classes and practicas.",
    category: "Clothing",
    price: 95,
    currency: "USD",
    stockQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop",
    rating: 4.9,
    reviews: 32,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Burgundy", "Navy"]
  },
  {
    id: 4,
    name: "Leather Shoe Bag",
    description: "Premium leather bag to protect and transport your tango shoes.",
    category: "Accessories",
    price: 35,
    currency: "USD",
    stockQuantity: 45,
    imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop",
    rating: 4.7,
    reviews: 15,
    sizes: null,
    colors: ["Black", "Brown"]
  }
];

const mockStats = {
  totalProducts: 48,
  totalSales: 127,
  totalRevenue: 12450,
  avgRating: 4.8
};

export default function ProfileTabVendor({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabVendorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Shoes', 'Clothing', 'Accessories'];
  
  const filteredProducts = selectedCategory === 'all' 
    ? mockProducts 
    : mockProducts.filter(p => p.category === selectedCategory);

  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-vendor-title">
              Product Management
            </h2>
            <p className="text-muted-foreground">
              Manage your inventory and track sales
            </p>
          </div>
          <Button className="gap-2" data-testid="button-add-product">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-products">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{mockStats.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-sales">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">{mockStats.totalSales}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-revenue">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-rating">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">{mockStats.avgRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Products</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-product-${product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-foreground">{product.category}</Badge>
                    </div>
                    {product.stockQuantity <= 5 && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="destructive">Low Stock</Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                    <h4 className="font-serif font-bold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground flex-1">{product.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <p className="text-2xl font-bold text-primary">${product.price}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stockQuantity} units</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" data-testid={`button-edit-${product.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" data-testid={`button-delete-${product.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-vendor-title">
          Tango Shop
        </h2>
        <p className="text-lg text-muted-foreground">
          Browse premium tango products and accessories
        </p>
      </motion.div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-muted-foreground" />
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            data-testid={`button-filter-${category}`}
          >
            {category === 'all' ? 'All Products' : category}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-product-${product.id}`}>
              <div className="relative aspect-square overflow-hidden">
                <motion.img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                    {product.category}
                  </Badge>
                  {product.stockQuantity <= 5 && (
                    <Badge className="bg-red-500">Only {product.stockQuantity} left</Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-6 space-y-3 flex-1 flex flex-col">
                <h4 className="text-lg font-serif font-bold">{product.name}</h4>
                <p className="text-sm text-muted-foreground flex-1">{product.description}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                {product.sizes && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Sizes:</span>
                    {product.sizes.slice(0, 4).map(size => (
                      <Badge key={size} variant="outline" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-2xl font-bold text-primary">${product.price}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" data-testid={`button-wishlist-${product.id}`}>
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button className="gap-2" data-testid={`button-add-cart-${product.id}`}>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden">
          <div className="relative h-[300px]" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm w-fit mb-4">
                Premium Quality
              </Badge>
              <h3 className="text-4xl font-serif font-bold text-white mb-4">
                Handcrafted Tango Essentials
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                Every product is carefully selected to enhance your tango experience
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button size="lg" className="gap-2" data-testid="button-view-catalog">
                  <ShoppingBag className="w-5 h-5" />
                  View Full Catalog
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                  Contact Vendor
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
