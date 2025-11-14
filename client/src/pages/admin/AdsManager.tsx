import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Eye, TrendingUp, DollarSign, MousePointerClick, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import type { PlatformAd } from "@shared/adSchemas";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from "recharts";

export default function AdsManager() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState<number | null>(null);
  const [selectedAd, setSelectedAd] = useState<PlatformAd | null>(null);
  const [performanceAdId, setPerformanceAdId] = useState<number | null>(null);

  // Fetch all ads
  const { data: ads = [], isLoading: isLoadingAds } = useQuery<PlatformAd[]>({
    queryKey: ["/api/admin/ads"],
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/ads/analytics"],
  });

  // Fetch performance for selected ad
  const { data: performance } = useQuery({
    queryKey: ["/api/admin/ads", performanceAdId, "performance"],
    enabled: !!performanceAdId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (adId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/ads/${adId}`);
      if (!response.ok) throw new Error("Failed to delete ad");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
      toast({
        title: "Success",
        description: "Ad deleted successfully",
      });
      setDeletingAdId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete ad",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (adId: number) => {
    setDeletingAdId(adId);
  };

  const confirmDelete = () => {
    if (deletingAdId) {
      deleteMutation.mutate(deletingAdId);
    }
  };

  const handleEdit = (ad: PlatformAd) => {
    setSelectedAd(ad);
    setIsEditDialogOpen(true);
  };

  const handleViewPerformance = (adId: number) => {
    setPerformanceAdId(adId);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <>
      <SEO
        title="Ads Manager - Admin"
        description="Manage platform advertisements and revenue"
      />

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ads Manager</h1>
            <p className="text-muted-foreground mt-1">
              Manage platform advertisements and track revenue
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-create-ad">
                <Plus className="h-4 w-4" />
                Create Ad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <AdForm
                onClose={() => setIsCreateDialogOpen(false)}
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ads" data-testid="tab-ads">Ads</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-ads">
                    {ads.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-ads">
                    {ads.filter(ad => ad.isActive).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-impressions">
                    {analytics?.totals?.impressions?.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-revenue">
                    {formatCurrency(analytics?.totals?.revenue || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ads Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Advertisements</CardTitle>
                <CardDescription>Manage your platform advertisements</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Placement</TableHead>
                      <TableHead>CPM Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad) => (
                      <TableRow key={ad.id} data-testid={`row-ad-${ad.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {ad.imageUrl && (
                              <img
                                src={ad.imageUrl}
                                alt={ad.title || "Ad"}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{ad.title || ad.advertiser}</div>
                              <div className="text-sm text-muted-foreground">{ad.advertiser}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ad.adType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ad.placement}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(ad.cpmRate)}</TableCell>
                        <TableCell>
                          <Badge variant={ad.isActive ? "default" : "secondary"}>
                            {ad.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewPerformance(ad.id)}
                              data-testid={`button-view-performance-${ad.id}`}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(ad)}
                              data-testid={`button-edit-ad-${ad.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(ad.id)}
                              data-testid={`button-delete-ad-${ad.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {ads.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No ads found. Create your first ad to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Daily revenue from ad impressions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.daily || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="totalRevenue" stroke="hsl(var(--primary))" name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Impressions & Clicks Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Impressions & Clicks</CardTitle>
                <CardDescription>Daily ad performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.daily || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalImpressions" fill="hsl(var(--primary))" name="Impressions" />
                    <Bar dataKey="totalClicks" fill="hsl(var(--accent))" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Impressions</div>
                    <div className="text-2xl font-bold">
                      {analytics?.totals?.impressions?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Clicks</div>
                    <div className="text-2xl font-bold">
                      {analytics?.totals?.clicks?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Click-Through Rate</div>
                    <div className="text-2xl font-bold">
                      {analytics?.ctr || 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedAd && (
              <AdForm
                ad={selectedAd}
                onClose={() => setIsEditDialogOpen(false)}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingAdId} onOpenChange={() => setDeletingAdId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this ad? This action cannot be undone and all related impression data will be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Performance Dialog */}
        <Dialog open={!!performanceAdId} onOpenChange={() => setPerformanceAdId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ad Performance</DialogTitle>
              <DialogDescription>
                Detailed performance metrics for this advertisement
              </DialogDescription>
            </DialogHeader>
            {performance && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {performance.performance.totals.impressions.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {performance.performance.totals.clicks.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">CTR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {performance.performance.ctr}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(performance.performance.totals.revenue)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={performance.performance.daily}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" name="Impressions" />
                        <Line type="monotone" dataKey="clicks" stroke="hsl(var(--accent))" name="Clicks" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

// Ad Form Component
function AdForm({ ad, onClose, onSuccess }: { ad?: PlatformAd; onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    advertiser: ad?.advertiser || "",
    adType: ad?.adType || "native",
    placement: ad?.placement || "feed",
    imageUrl: ad?.imageUrl || "",
    title: ad?.title || "",
    description: ad?.description || "",
    ctaText: ad?.ctaText || "Learn More",
    targetUrl: ad?.targetUrl || "",
    cpmRate: ad?.cpmRate ? (ad.cpmRate / 100).toString() : "10",
    dailyBudget: ad?.dailyBudget ? (ad.dailyBudget / 100).toString() : "",
    isActive: ad?.isActive ?? true,
    targetRoles: ad?.targeting?.roles || [],
    targetCities: ad?.targeting?.cities?.join(", ") || "",
    targetCountries: ad?.targeting?.countries?.join(", ") || "",
    targetTiers: ad?.targeting?.tiers || [],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = ad ? `/api/admin/ads/${ad.id}` : "/api/admin/ads";
      const method = ad ? "PATCH" : "POST";
      
      const response = await apiRequest(method, endpoint, data);
      if (!response.ok) throw new Error("Failed to save ad");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: ad ? "Ad updated successfully" : "Ad created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save ad",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      advertiser: formData.advertiser,
      adType: formData.adType,
      placement: formData.placement,
      imageUrl: formData.imageUrl || null,
      title: formData.title || null,
      description: formData.description || null,
      ctaText: formData.ctaText || null,
      targetUrl: formData.targetUrl,
      cpmRate: Math.round(parseFloat(formData.cpmRate) * 100),
      dailyBudget: formData.dailyBudget ? Math.round(parseFloat(formData.dailyBudget) * 100) : null,
      isActive: formData.isActive,
      targeting: {
        roles: formData.targetRoles.length > 0 ? formData.targetRoles : undefined,
        cities: formData.targetCities ? formData.targetCities.split(",").map(c => c.trim()).filter(Boolean) : undefined,
        countries: formData.targetCountries ? formData.targetCountries.split(",").map(c => c.trim()).filter(Boolean) : undefined,
        tiers: formData.targetTiers.length > 0 ? formData.targetTiers : undefined,
      },
    };

    saveMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>{ad ? "Edit" : "Create"} Advertisement</DialogTitle>
        <DialogDescription>
          {ad ? "Update advertisement details" : "Create a new advertisement"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="advertiser">Advertiser Name*</Label>
          <Input
            id="advertiser"
            value={formData.advertiser}
            onChange={(e) => setFormData({ ...formData, advertiser: e.target.value })}
            required
            data-testid="input-advertiser"
          />
        </div>

        <div className="grid gap-4 grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="adType">Ad Type*</Label>
            <Select
              value={formData.adType}
              onValueChange={(value) => setFormData({ ...formData, adType: value })}
            >
              <SelectTrigger id="adType" data-testid="select-ad-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banner">Banner</SelectItem>
                <SelectItem value="native">Native</SelectItem>
                <SelectItem value="sponsored">Sponsored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placement">Placement*</Label>
            <Select
              value={formData.placement}
              onValueChange={(value) => setFormData({ ...formData, placement: value })}
            >
              <SelectTrigger id="placement" data-testid="select-placement">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feed">Feed</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="map">Map</SelectItem>
                <SelectItem value="messages">Messages</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            data-testid="input-image-url"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            data-testid="input-title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            data-testid="textarea-description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ctaText">CTA Text</Label>
          <Input
            id="ctaText"
            value={formData.ctaText}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            placeholder="Learn More"
            data-testid="input-cta-text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetUrl">Target URL*</Label>
          <Input
            id="targetUrl"
            type="url"
            value={formData.targetUrl}
            onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
            required
            placeholder="https://example.com"
            data-testid="input-target-url"
          />
        </div>

        {/* Pricing */}
        <div className="grid gap-4 grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cpmRate">CPM Rate (USD)*</Label>
            <Input
              id="cpmRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.cpmRate}
              onChange={(e) => setFormData({ ...formData, cpmRate: e.target.value })}
              required
              data-testid="input-cpm-rate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dailyBudget">Daily Budget (USD)</Label>
            <Input
              id="dailyBudget"
              type="number"
              step="0.01"
              min="0"
              value={formData.dailyBudget}
              onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
              data-testid="input-daily-budget"
            />
          </div>
        </div>

        {/* Targeting */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Targeting (Optional)</h3>

          <div className="space-y-2">
            <Label htmlFor="targetCities">Target Cities (comma-separated)</Label>
            <Input
              id="targetCities"
              value={formData.targetCities}
              onChange={(e) => setFormData({ ...formData, targetCities: e.target.value })}
              placeholder="Buenos Aires, Berlin, Paris"
              data-testid="input-target-cities"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetCountries">Target Countries (comma-separated)</Label>
            <Input
              id="targetCountries"
              value={formData.targetCountries}
              onChange={(e) => setFormData({ ...formData, targetCountries: e.target.value })}
              placeholder="Argentina, Germany, France"
              data-testid="input-target-countries"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              data-testid="switch-is-active"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-ad">
          {saveMutation.isPending ? "Saving..." : ad ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
