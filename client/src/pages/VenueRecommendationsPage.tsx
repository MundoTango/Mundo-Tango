import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, Star, DollarSign, Phone, Globe, Edit2, Trash2, Filter } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface VenueRecommendation {
  id: number;
  userId: number;
  name: string;
  category: string;
  cuisine?: string | null;
  address: string;
  city: string;
  country?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  rating?: number | null;
  priceLevel?: string | null;
  description?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  imageUrl?: string | null;
  isVerified: boolean;
  createdAt: Date;
}

export default function VenueRecommendationsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueRecommendation | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    cuisine: '',
    city: '',
    priceLevel: '',
    minRating: ''
  });
  const [newVenue, setNewVenue] = useState({
    name: '',
    category: 'restaurant',
    cuisine: '',
    address: '',
    city: '',
    country: '',
    rating: '',
    priceLevel: '$$',
    description: '',
    phoneNumber: '',
    website: '',
    imageUrl: ''
  });

  // Build query URL with filters
  const queryParams = new URLSearchParams();
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.cuisine) queryParams.append('cuisine', filters.cuisine);
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.priceLevel) queryParams.append('priceLevel', filters.priceLevel);
  if (filters.minRating) queryParams.append('minRating', filters.minRating);
  
  const queryString = queryParams.toString();
  const queryKey = queryString 
    ? `/api/venue-recommendations?${queryString}`
    : '/api/venue-recommendations';

  const { data: venues = [], isLoading } = useQuery<VenueRecommendation[]>({
    queryKey: [queryKey],
  });

  const createVenueMutation = useMutation({
    mutationFn: async (data: typeof newVenue) => {
      const payload = {
        ...data,
        rating: data.rating ? parseFloat(data.rating) : null
      };
      return await apiRequest("POST", "/api/venue-recommendations", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venue-recommendations"] });
      toast({ title: "Venue recommendation created" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create venue", variant: "destructive" });
    },
  });

  const updateVenueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof newVenue> }) => {
      const payload = {
        ...data,
        rating: data.rating ? parseFloat(data.rating as string) : null
      };
      return await apiRequest("PATCH", `/api/venue-recommendations/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venue-recommendations"] });
      toast({ title: "Venue updated successfully" });
      setIsEditOpen(false);
      setEditingVenue(null);
    },
    onError: () => {
      toast({ title: "Failed to update venue", variant: "destructive" });
    },
  });

  const deleteVenueMutation = useMutation({
    mutationFn: async (venueId: number) => {
      return await apiRequest("DELETE", `/api/venue-recommendations/${venueId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/venue-recommendations"] });
      toast({ title: "Venue deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete venue", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setNewVenue({
      name: '', category: 'restaurant', cuisine: '', address: '', city: '', country: '',
      rating: '', priceLevel: '$$', description: '', phoneNumber: '', website: '', imageUrl: ''
    });
  };

  const handleCreateVenue = () => {
    if (!newVenue.name || !newVenue.address || !newVenue.city) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createVenueMutation.mutate(newVenue);
  };

  const handleEditVenue = () => {
    if (!editingVenue) return;
    updateVenueMutation.mutate({ 
      id: editingVenue.id, 
      data: {
        name: editingVenue.name,
        category: editingVenue.category,
        cuisine: editingVenue.cuisine || '',
        address: editingVenue.address,
        city: editingVenue.city,
        country: editingVenue.country || '',
        rating: editingVenue.rating?.toString() || '',
        priceLevel: editingVenue.priceLevel || '$$',
        description: editingVenue.description || '',
        phoneNumber: editingVenue.phoneNumber || '',
        website: editingVenue.website || '',
        imageUrl: editingVenue.imageUrl || ''
      }
    });
  };

  const openEditDialog = (venue: VenueRecommendation) => {
    setEditingVenue(venue);
    setIsEditOpen(true);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
        <div className="container mx-auto max-w-7xl py-8 px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3" data-testid="text-venues-title">
                <MapPin className="h-10 w-10 text-primary" />
                Venue Recommendations
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover and share great restaurants, cafés, and venues
              </p>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2" data-testid="button-create-venue">
                  <Plus className="h-5 w-5" />
                  Add Venue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Recommend a Venue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="name">Venue Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Café Tortoni"
                        value={newVenue.name}
                        onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                        data-testid="input-venue-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={newVenue.category}
                        onValueChange={(value) => setNewVenue({ ...newVenue, category: value })}
                      >
                        <SelectTrigger data-testid="select-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="cafe">Café</SelectItem>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="milonga">Milonga</SelectItem>
                          <SelectItem value="cultural">Cultural Venue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cuisine">Cuisine</Label>
                      <Input
                        id="cuisine"
                        placeholder="e.g., Argentine, Italian"
                        value={newVenue.cuisine}
                        onChange={(e) => setNewVenue({ ...newVenue, cuisine: e.target.value })}
                        data-testid="input-cuisine"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        placeholder="Full street address"
                        value={newVenue.address}
                        onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                        data-testid="input-address"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="e.g., Buenos Aires"
                        value={newVenue.city}
                        onChange={(e) => setNewVenue({ ...newVenue, city: e.target.value })}
                        data-testid="input-city"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="e.g., Argentina"
                        value={newVenue.country}
                        onChange={(e) => setNewVenue({ ...newVenue, country: e.target.value })}
                        data-testid="input-country"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rating">Rating (0-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="4.5"
                        value={newVenue.rating}
                        onChange={(e) => setNewVenue({ ...newVenue, rating: e.target.value })}
                        data-testid="input-rating"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priceLevel">Price Level</Label>
                      <Select
                        value={newVenue.priceLevel}
                        onValueChange={(value) => setNewVenue({ ...newVenue, priceLevel: value })}
                      >
                        <SelectTrigger data-testid="select-price-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="$">$ - Budget</SelectItem>
                          <SelectItem value="$$">$$ - Moderate</SelectItem>
                          <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                          <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Tell us about this venue..."
                        value={newVenue.description}
                        onChange={(e) => setNewVenue({ ...newVenue, description: e.target.value })}
                        data-testid="input-description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber">Phone</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+54 11 1234-5678"
                        value={newVenue.phoneNumber}
                        onChange={(e) => setNewVenue({ ...newVenue, phoneNumber: e.target.value })}
                        data-testid="input-phone"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://example.com"
                        value={newVenue.website}
                        onChange={(e) => setNewVenue({ ...newVenue, website: e.target.value })}
                        data-testid="input-website"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        placeholder="https://example.com/venue.jpg"
                        value={newVenue.imageUrl}
                        onChange={(e) => setNewVenue({ ...newVenue, imageUrl: e.target.value })}
                        data-testid="input-image-url"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateVenue}
                    disabled={createVenueMutation.isPending}
                    className="w-full"
                    data-testid="button-submit-venue"
                  >
                    {createVenueMutation.isPending ? "Creating..." : "Add Venue Recommendation"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Venues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Select value={filters.category ||"all"} onValueChange={(val) => setFilters({ ...filters, category: val === 'all' ? '' : val })}>
                  <SelectTrigger data-testid="filter-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="milonga">Milonga</SelectItem>
                    <SelectItem value="cultural">Cultural Venue</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Cuisine..."
                  value={filters.cuisine}
                  onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                  data-testid="filter-cuisine"
                />

                <Input
                  placeholder="City..."
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  data-testid="filter-city"
                />

                <Select value={filters.priceLevel || "all"} onValueChange={(val) => setFilters({ ...filters, priceLevel: val === 'all' ? '' : val })}>
                  <SelectTrigger data-testid="filter-price">
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="$">$</SelectItem>
                    <SelectItem value="$$">$$</SelectItem>
                    <SelectItem value="$$$">$$$</SelectItem>
                    <SelectItem value="$$$$">$$$$</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Min Rating (0-5)"
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  data-testid="filter-min-rating"
                />
              </div>
            </CardContent>
          </Card>

          {/* Venues Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Card key={venue.id} className="hover-elevate" data-testid={`venue-${venue.id}`}>
                  {venue.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={venue.imageUrl}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        data-testid={`img-venue-${venue.id}`}
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1" data-testid={`text-venue-name-${venue.id}`}>
                          {venue.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">{venue.category}</Badge>
                            {venue.cuisine && <Badge variant="secondary">{venue.cuisine}</Badge>}
                            {venue.priceLevel && (
                              <Badge variant="outline" className="gap-1">
                                <DollarSign className="h-3 w-3" />
                                {venue.priceLevel}
                              </Badge>
                            )}
                          </div>
                        </CardDescription>
                      </div>
                      {venue.rating && (
                        <Badge className="bg-primary text-primary-foreground gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {venue.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <div>{venue.address}</div>
                        <div>{venue.city}{venue.country ? `, ${venue.country}` : ''}</div>
                      </div>
                    </div>

                    {venue.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {venue.description}
                      </p>
                    )}

                    <div className="flex gap-2 text-sm">
                      {venue.phoneNumber && (
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <a href={`tel:${venue.phoneNumber}`}>
                            <Phone className="h-3 w-3" />
                            Call
                          </a>
                        </Button>
                      )}
                      {venue.website && (
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <a href={venue.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-3 w-3" />
                            Website
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => openEditDialog(venue)}
                        data-testid={`button-edit-venue-${venue.id}`}
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1 text-destructive"
                        onClick={() => deleteVenueMutation.mutate(venue.id)}
                        data-testid={`button-delete-venue-${venue.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <MapPin className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No venue recommendations yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to recommend a great venue in your city
                </p>
                <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-venue">
                  Add Your First Recommendation
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Edit Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Venue Recommendation</DialogTitle>
              </DialogHeader>
              {editingVenue && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Venue Name</Label>
                      <Input
                        value={editingVenue.name}
                        onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Input
                        value={editingVenue.address}
                        onChange={(e) => setEditingVenue({ ...editingVenue, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={editingVenue.city}
                        onChange={(e) => setEditingVenue({ ...editingVenue, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={editingVenue.rating || ''}
                        onChange={(e) => setEditingVenue({ ...editingVenue, rating: parseFloat(e.target.value) || null })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleEditVenue} disabled={updateVenueMutation.isPending} className="w-full">
                    {updateVenueMutation.isPending ? "Updating..." : "Update Venue"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AppLayout>
  );
}
