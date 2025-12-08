import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Store, CreditCard, Package, ExternalLink, Download, Star } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Vendor {
  id: number;
  userId: number;
  businessName: string;
  bio: string | null;
  productCategories: string[];
  servicesOffered: string[];
  products: Array<{ name: string; price: number; category: string }>;
  priceRange: string | null;
  websiteUrl: string | null;
  shopUrl: string | null;
  email: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  averageRating: number | null;
  totalReviews: number | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  userUsername: string;
  userProfileImage: string | null;
  userIsActive: boolean;
  userJoinedAt: string;
  hasStripeConnected: boolean;
  stripeStatus: string;
  serviceCount: number;
  productCount: number;
  categoryCount: number;
}

interface VendorResponse {
  vendors: Vendor[];
  total: number;
  stats: {
    total: number;
    active: number;
    stripeConnected: number;
  };
}

export default function VendorManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useQuery<VendorResponse>({
    queryKey: ['/api/admin/vendors', { search, status: statusFilter }],
  });

  const vendors = data?.vendors || [];
  const stats = data?.stats;

  const getStripeStatusBadge = (vendor: Vendor) => {
    if (vendor.hasStripeConnected) {
      return (
        <Badge variant="default" data-testid={`badge-stripe-${vendor.id}`}>
          <CreditCard className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" data-testid={`badge-stripe-${vendor.id}`}>
        Not Connected
      </Badge>
    );
  };

  const getStatusBadge = (vendor: Vendor) => {
    if (vendor.isActive) {
      return <Badge variant="default" data-testid={`badge-status-${vendor.id}`}>Active</Badge>;
    }
    return <Badge variant="outline" data-testid={`badge-status-${vendor.id}`}>Inactive</Badge>;
  };

  const exportToCSV = () => {
    if (!vendors.length) return;
    
    const csv = [
      ['ID', 'Business Name', 'Owner', 'Email', 'Services', 'Products', 'Stripe Connected', 'Status', 'Rating', 'Join Date'].join(','),
      ...vendors.map(v => [
        v.id,
        `"${v.businessName}"`,
        `"${v.userName}"`,
        v.userEmail,
        v.serviceCount,
        v.productCount,
        v.hasStripeConnected ? 'Yes' : 'No',
        v.isActive ? 'Active' : 'Inactive',
        v.averageRating || 'N/A',
        format(new Date(v.userJoinedAt), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8" data-testid="page-vendor-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage platform vendors and their services
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" data-testid="button-export-csv">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-vendors">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-vendors">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-stripe-connected">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stripe Connected</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.stripeConnected || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-vendors"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="stripe_connected">Stripe Connected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-vendors-table">
        <CardHeader>
          <CardTitle>Vendors ({vendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mb-4 opacity-50" />
              <p>No vendors found</p>
              <p className="text-sm">Vendors will appear here once registered</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Stripe</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id} data-testid={`row-vendor-${vendor.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={vendor.userProfileImage || undefined} />
                          <AvatarFallback>{vendor.businessName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{vendor.businessName}</div>
                          {vendor.productCategories.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {vendor.productCategories.slice(0, 2).join(', ')}
                              {vendor.productCategories.length > 2 && ` +${vendor.productCategories.length - 2}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{vendor.userName}</div>
                      <div className="text-xs text-muted-foreground">{vendor.userEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" data-testid={`badge-services-${vendor.id}`}>
                        {vendor.serviceCount} services
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" data-testid={`badge-products-${vendor.id}`}>
                        {vendor.productCount} products
                      </Badge>
                    </TableCell>
                    <TableCell>{getStripeStatusBadge(vendor)}</TableCell>
                    <TableCell>
                      {vendor.averageRating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{Number(vendor.averageRating).toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({vendor.totalReviews || 0})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No ratings</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(vendor)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(vendor.userJoinedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {vendor.websiteUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            data-testid={`button-website-${vendor.id}`}
                          >
                            <a href={vendor.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {vendor.shopUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            data-testid={`button-shop-${vendor.id}`}
                          >
                            <a href={vendor.shopUrl} target="_blank" rel="noopener noreferrer">
                              <Store className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
