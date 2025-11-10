import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { GraduationCap, MapPin, Star, Search, CheckCircle2, Filter, X } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { useState, useMemo } from "react";

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    experienceLevel: 'all', // all, beginner, intermediate, advanced, professional
    minPrice: 0,
    maxPrice: 200,
    availability: 'all', // all, available, not_available
    sortBy: 'rating' // rating, experience, price_low, price_high
  });
  
  const { data: teachers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/teachers"],
  });

  // Apply all filters
  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    
    let result = teachers.filter((teacher: any) => {
      // Search filter
      const matchesSearch = 
        searchTerm === "" ||
        teacher.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Experience level filter (mock - would need backend support)
      const experienceYears = teacher.yearsOfExperience || 0;
      let matchesExperience = true;
      if (filters.experienceLevel === 'beginner') matchesExperience = experienceYears < 3;
      else if (filters.experienceLevel === 'intermediate') matchesExperience = experienceYears >= 3 && experienceYears < 7;
      else if (filters.experienceLevel === 'advanced') matchesExperience = experienceYears >= 7 && experienceYears < 15;
      else if (filters.experienceLevel === 'professional') matchesExperience = experienceYears >= 15;
      
      // Price range filter (mock - would need backend support)
      const hourlyRate = teacher.hourlyRate || 50; // default $50/hr
      const matchesPrice = hourlyRate >= filters.minPrice && hourlyRate <= filters.maxPrice;
      
      // Availability filter (mock)
      const isAvailable = teacher.isAvailable !== false; // default to available
      const matchesAvailability = 
        filters.availability === 'all' || 
        (filters.availability === 'available' && isAvailable) ||
        (filters.availability === 'not_available' && !isAvailable);
      
      return matchesSearch && matchesExperience && matchesPrice && matchesAvailability;
    });

    // Sort
    if (filters.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'experience') {
      result.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
    } else if (filters.sortBy === 'price_low') {
      result.sort((a, b) => (a.hourlyRate || 50) - (b.hourlyRate || 50));
    } else if (filters.sortBy === 'price_high') {
      result.sort((a, b) => (b.hourlyRate || 50) - (a.hourlyRate || 50));
    }

    return result;
  }, [teachers, searchTerm, filters]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Tango Teachers</h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Find experienced tango instructors in your area
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  data-testid="input-search"
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Advanced Filters</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Experience Level */}
                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <Select 
                        value={filters.experienceLevel} 
                        onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                      >
                        <SelectTrigger data-testid="select-experience-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner (&lt;3 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (3-7 years)</SelectItem>
                          <SelectItem value="advanced">Advanced (7-15 years)</SelectItem>
                          <SelectItem value="professional">Professional (15+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Availability */}
                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <Select 
                        value={filters.availability} 
                        onValueChange={(value) => setFilters({ ...filters, availability: value })}
                      >
                        <SelectTrigger data-testid="select-availability">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Teachers</SelectItem>
                          <SelectItem value="available">Available Now</SelectItem>
                          <SelectItem value="not_available">Fully Booked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort By */}
                    <div className="space-y-2">
                      <Label>Sort By</Label>
                      <Select 
                        value={filters.sortBy} 
                        onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                      >
                        <SelectTrigger data-testid="select-sort-by">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Highest Rating</SelectItem>
                          <SelectItem value="experience">Most Experience</SelectItem>
                          <SelectItem value="price_low">Price: Low to High</SelectItem>
                          <SelectItem value="price_high">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price Range Slider */}
                  <div className="space-y-2">
                    <Label>
                      Hourly Rate: ${filters.minPrice} - ${filters.maxPrice}
                    </Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">$0</span>
                      <Slider
                        min={0}
                        max={200}
                        step={10}
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={([min, max]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
                        className="flex-1"
                        data-testid="slider-price-range"
                      />
                      <span className="text-sm text-muted-foreground">$200</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Teachers Grid */}
          {isLoading ? (
            <div className="text-center py-12">Loading teachers...</div>
          ) : filteredTeachers && filteredTeachers.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Found {filteredTeachers.length} {filteredTeachers.length === 1 ? 'teacher' : 'teachers'}
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeachers.map((teacher: any) => (
                  <Card key={teacher.id} className="hover-elevate" data-testid={`teacher-card-${teacher.id}`}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={teacher.user?.profileImage} />
                          <AvatarFallback>{teacher.user?.name?.[0] || "T"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/profile/${teacher.user?.username}`}>
                              <CardTitle className="text-lg hover:underline" data-testid={`text-name-${teacher.id}`}>
                                {teacher.user?.name || "Unknown"}
                              </CardTitle>
                            </Link>
                            {teacher.verified && (
                              <CheckCircle2 className="h-4 w-4 text-primary" data-testid={`icon-verified-${teacher.id}`} />
                            )}
                          </div>
                          {teacher.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium" data-testid={`text-rating-${teacher.id}`}>
                                {teacher.rating.toFixed(1)}
                              </span>
                              <span className="text-sm text-muted-foreground">({teacher.reviewCount})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {teacher.user?.city && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4" />
                          <span data-testid={`text-location-${teacher.id}`}>{teacher.user.city}</span>
                        </div>
                      )}

                      {/* Price Badge */}
                      {teacher.hourlyRate && (
                        <div className="mb-3">
                          <Badge variant="secondary" className="text-sm">
                            ${teacher.hourlyRate}/hour
                          </Badge>
                        </div>
                      )}
                      
                      {teacher.specialties && teacher.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {teacher.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                            <Badge key={idx} variant="outline">{specialty}</Badge>
                          ))}
                        </div>
                      )}

                      {teacher.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4" data-testid={`text-bio-${teacher.id}`}>
                          {teacher.bio}
                        </p>
                      )}

                      {teacher.yearsOfExperience && (
                        <p className="text-sm text-muted-foreground mb-4" data-testid={`text-experience-${teacher.id}`}>
                          Experience: {teacher.yearsOfExperience} years
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Link href={`/profile/${teacher.user?.username}`}>
                          <Button variant="default" size="sm" data-testid={`button-view-${teacher.id}`}>
                            View Profile
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" data-testid={`button-message-${teacher.id}`}>
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <GraduationCap className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>{searchTerm || showFilters ? 'No teachers match your criteria' : 'No teachers found'}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
