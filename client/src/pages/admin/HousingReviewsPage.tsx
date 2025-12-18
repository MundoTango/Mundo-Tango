import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, XCircle, Eye, Home, MapPin, Users, DollarSign, Search, Filter, Shield, Bed, Bath, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HousingListing {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  currency: string;
  address: string;
  city: string;
  country: string;
  amenities: string[];
  houseRules: string;
  images: string[];
  status: string;
  verificationStatus: string;
  verifiedBy: number | null;
  verifiedAt: string | null;
  safetyNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  host: {
    id: number;
    name: string;
    username: string;
    email: string;
    profileImage: string | null;
  };
}

export default function HousingReviewsPage() {
  const { toast } = useToast();
  const [verificationFilter, setVerificationFilter] = useState<string>("pending");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedListing, setSelectedListing] = useState<HousingListing | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [safetyNotes, setSafetyNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch housing listings for safety review
  const { data: listingsData, isLoading } = useQuery<HousingListing[]>({
    queryKey: ["/api/admin/housing-reviews", verificationFilter, propertyTypeFilter],
  });

  const listings = listingsData || [];

  // Filter listings
  const filteredListings = listings.filter((listing) => {
    const matchesVerification = verificationFilter === "all" || listing.verificationStatus === verificationFilter;
    const matchesPropertyType = propertyTypeFilter === "all" || listing.propertyType === propertyTypeFilter;
    const matchesSearch =
      !searchQuery ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.host.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVerification && matchesPropertyType && matchesSearch;
  });

  // Verify listing mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: { listingId: number; safetyNotes: string }) => {
      const response = await apiRequest("POST", `/api/admin/housing-reviews/${data.listingId}/verify`, {
        safetyNotes: data.safetyNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing verified",
        description: "The housing listing has been verified for safety.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/housing-reviews"] });
      setIsDetailDialogOpen(false);
      setSelectedListing(null);
      setSafetyNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify listing",
        variant: "destructive",
      });
    },
  });

  // Reject listing mutation
  const rejectMutation = useMutation({
    mutationFn: async (data: { listingId: number; safetyNotes: string; rejectionReason: string }) => {
      const response = await apiRequest("POST", `/api/admin/housing-reviews/${data.listingId}/reject`, {
        safetyNotes: data.safetyNotes,
        rejectionReason: data.rejectionReason,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing rejected",
        description: "The housing listing has been flagged for safety concerns.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/housing-reviews"] });
      setIsDetailDialogOpen(false);
      setSelectedListing(null);
      setSafetyNotes("");
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject listing",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (listing: HousingListing) => {
    setSelectedListing(listing);
    setSafetyNotes(listing.safetyNotes || "");
    setRejectionReason(listing.rejectionReason || "");
    setIsDetailDialogOpen(true);
  };

  const handleVerify = () => {
    if (!selectedListing) return;
    verifyMutation.mutate({
      listingId: selectedListing.id,
      safetyNotes,
    });
  };

  const handleReject = () => {
    if (!selectedListing || !rejectionReason) return;
    rejectMutation.mutate({
      listingId: selectedListing.id,
      safetyNotes,
      rejectionReason,
    });
  };

  const getVerificationBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      pending: { variant: "default", icon: AlertCircle, color: "text-orange-500" },
      verified: { variant: "default", icon: CheckCircle, color: "text-green-500" },
      rejected: { variant: "outline", icon: XCircle, color: "text-red-500" },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const getPropertyTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      apartment: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      house: "bg-green-500/10 text-green-500 border-green-500/20",
      room: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      studio: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    };
    const color = colors[type.toLowerCase()] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
    return (
      <Badge variant="outline" className={`gap-1 ${color}`}>
        <Home className="h-3 w-3" />
        {type}
      </Badge>
    );
  };

  const pendingCount = listings.filter((l) => l.verificationStatus === "pending").length;
  const verifiedCount = listings.filter((l) => l.verificationStatus === "verified").length;
  const rejectedCount = listings.filter((l) => l.verificationStatus === "rejected").length;

  return (
    <PageLayout title="Housing Safety Reviews" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="Housing Safety Reviews" fallbackRoute="/admin">
        <>
          <SEO
            title="Housing Safety Reviews - Admin"
            description="Review and verify housing listings for community safety and trust."
          />

          <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
            <div className="container mx-auto max-w-7xl space-y-6">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl font-bold">Housing Safety Reviews</h1>
                </div>
                <p className="text-muted-foreground">
                  Verify housing listings for safety, accuracy, and community trust
                </p>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pending Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-500">{pendingCount}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Verified
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">{verifiedCount}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Rejected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-500">{rejectedCount}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by title, city, or host..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-listings"
                      />
                    </div>

                    <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                      <SelectTrigger data-testid="select-verification-filter">
                        <SelectValue placeholder="Filter by verification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                      <SelectTrigger data-testid="select-property-type-filter">
                        <SelectValue placeholder="Filter by property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="room">Room</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Housing Listings Table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Housing Listings ({filteredListings.length})</CardTitle>
                  <CardDescription>
                    Click on any listing to review safety and verify
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Loading listings...
                    </div>
                  ) : filteredListings.length === 0 ? (
                    <div className="text-center py-12">
                      <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No housing listings found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Property</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Host</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredListings.map((listing) => (
                            <TableRow key={listing.id} className="hover-elevate cursor-pointer">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {listing.images && listing.images.length > 0 && (
                                    <img
                                      src={listing.images[0]}
                                      alt={listing.title}
                                      className="w-16 h-16 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium line-clamp-1">{listing.title}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                      {listing.description.substring(0, 40)}...
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getPropertyTypeBadge(listing.propertyType)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={listing.host.profileImage || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {listing.host.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{listing.host.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>
                                    {listing.city}, {listing.country}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Bed className="h-3 w-3" />
                                    {listing.bedrooms} bed
                                    <Bath className="h-3 w-3 ml-2" />
                                    {listing.bathrooms} bath
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    {listing.maxGuests} guests max
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {listing.pricePerNight} {listing.currency}/night
                                </div>
                              </TableCell>
                              <TableCell>{getVerificationBadge(listing.verificationStatus)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(listing)}
                                  data-testid={`button-view-listing-${listing.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detail Dialog */}
              <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Housing Safety Review</DialogTitle>
                    <DialogDescription>
                      Review property details and verify for community safety
                    </DialogDescription>
                  </DialogHeader>

                  {selectedListing && (
                    <div className="space-y-6">
                      {/* Property Images */}
                      {selectedListing.images && selectedListing.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                          {selectedListing.images.slice(0, 4).map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`${selectedListing.title} - ${idx + 1}`}
                              className="w-full h-48 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}

                      {/* Basic Info */}
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{selectedListing.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {getPropertyTypeBadge(selectedListing.propertyType)}
                          {getVerificationBadge(selectedListing.verificationStatus)}
                          <Badge variant="outline" className="gap-1">
                            <DollarSign className="h-3 w-3" />
                            {selectedListing.pricePerNight} {selectedListing.currency}/night
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{selectedListing.description}</p>
                      </div>

                      {/* Host Info */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Host</label>
                        <div className="flex items-center gap-3 mt-2">
                          <Avatar>
                            <AvatarImage src={selectedListing.host.profileImage || undefined} />
                            <AvatarFallback>
                              {selectedListing.host.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{selectedListing.host.name}</div>
                            <div className="text-sm text-muted-foreground">
                              @{selectedListing.host.username}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Property Details Grid */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Address
                          </label>
                          <div className="mt-1 text-sm">
                            <div>{selectedListing.address}</div>
                            <div className="text-muted-foreground">
                              {selectedListing.city}, {selectedListing.country}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            Property Details
                          </label>
                          <div className="mt-1 text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <Bed className="h-3 w-3" />
                              {selectedListing.bedrooms} bedrooms
                            </div>
                            <div className="flex items-center gap-2">
                              <Bath className="h-3 w-3" />
                              {selectedListing.bathrooms} bathrooms
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              Max {selectedListing.maxGuests} guests
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      {selectedListing.amenities && selectedListing.amenities.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Amenities
                          </label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedListing.amenities.map((amenity, idx) => (
                              <Badge key={idx} variant="secondary">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* House Rules */}
                      {selectedListing.houseRules && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            House Rules
                          </label>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            <p className="text-sm whitespace-pre-wrap">
                              {selectedListing.houseRules}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Admin Actions for Pending */}
                      {selectedListing.verificationStatus === "pending" && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Safety Notes
                            </label>
                            <Textarea
                              value={safetyNotes}
                              onChange={(e) => setSafetyNotes(e.target.value)}
                              placeholder="Add safety verification notes..."
                              rows={3}
                              className="mt-2"
                              data-testid="textarea-safety-notes"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Rejection Reason (if rejecting)
                            </label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Provide detailed safety concerns..."
                              rows={3}
                              className="mt-2"
                              data-testid="textarea-rejection-reason"
                            />
                          </div>
                        </>
                      )}

                      {/* Existing Safety Notes/Rejection */}
                      {selectedListing.safetyNotes && selectedListing.verificationStatus !== "pending" && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Safety Notes
                          </label>
                          <div className="mt-2 p-4 bg-muted rounded-md">
                            <p className="text-sm whitespace-pre-wrap">
                              {selectedListing.safetyNotes}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedListing.rejectionReason && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Rejection Reason
                          </label>
                          <div className="mt-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm whitespace-pre-wrap text-destructive">
                              {selectedListing.rejectionReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    {selectedListing?.verificationStatus === "pending" && (
                      <>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={!rejectionReason || rejectMutation.isPending}
                          data-testid="button-reject-listing"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {rejectMutation.isPending ? "Rejecting..." : "Reject Listing"}
                        </Button>
                        <Button
                          onClick={handleVerify}
                          disabled={verifyMutation.isPending}
                          data-testid="button-verify-listing"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {verifyMutation.isPending ? "Verifying..." : "Verify & Approve"}
                        </Button>
                      </>
                    )}
                    {selectedListing?.verificationStatus !== "pending" && (
                      <Button
                        variant="outline"
                        onClick={() => setIsDetailDialogOpen(false)}
                        data-testid="button-close-dialog"
                      >
                        Close
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      </SelfHealingErrorBoundary>
    </PageLayout>
  );
}
