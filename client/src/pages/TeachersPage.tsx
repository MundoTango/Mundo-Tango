import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { GraduationCap, MapPin, Star, Search, CheckCircle2, Filter, X, Music, Award } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function TeachersPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    experienceLevel: 'all',
    minPrice: 0,
    maxPrice: 200,
    availability: 'all',
    sortBy: 'rating'
  });
  
  const { data: teachers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/teachers"],
  });

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    
    let result = teachers.filter((teacher: any) => {
      const matchesSearch = 
        searchTerm === "" ||
        teacher.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const experienceYears = teacher.yearsOfExperience || 0;
      let matchesExperience = true;
      if (filters.experienceLevel === 'beginner') matchesExperience = experienceYears < 3;
      else if (filters.experienceLevel === 'intermediate') matchesExperience = experienceYears >= 3 && experienceYears < 7;
      else if (filters.experienceLevel === 'advanced') matchesExperience = experienceYears >= 7 && experienceYears < 15;
      else if (filters.experienceLevel === 'professional') matchesExperience = experienceYears >= 15;
      
      const hourlyRate = teacher.hourlyRate || 50;
      const matchesPrice = hourlyRate >= filters.minPrice && hourlyRate <= filters.maxPrice;
      
      const isAvailable = teacher.isAvailable !== false;
      const matchesAvailability = 
        filters.availability === 'all' || 
        (filters.availability === 'available' && isAvailable) ||
        (filters.availability === 'not_available' && !isAvailable);
      
      return matchesSearch && matchesExperience && matchesPrice && matchesAvailability;
    });

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
      <SEO
        title={t('pages:teachers.seoTitle', 'Find Tango Teachers & Instructors | Mundo Tango')}
        description={t('pages:teachers.seoDescription', 'Discover experienced tango teachers worldwide. Browse certified instructors, read reviews, compare rates, and book private or group lessons. Learn from the best.')}
      />
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1600&h=900&fit=crop')`
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
              <Music className="w-3 h-3 mr-1.5" />
              {t('pages:teachers.badge', 'Expert Instructors')}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
              {t('pages:teachers.heroTitle', 'Tango Teachers')}
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
              {t('pages:teachers.heroSubtitle', 'Learn from world-class instructors and master the art of Argentine tango')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-background py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            className="mb-12 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  data-testid="input-search"
                  placeholder={t('pages:teachers.searchPlaceholder', 'Search by name, style, or specialization...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-toggle-filters"
                className="h-12 gap-2"
              >
                <Filter className="h-4 w-4" />
                {t('pages:teachers.filters', 'Filters')}
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-serif font-bold">{t('pages:teachers.advancedFilters', 'Advanced Filters')}</h3>
                      <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label>{t('pages:teachers.experienceLevel', 'Experience Level')}</Label>
                        <Select 
                          value={filters.experienceLevel} 
                          onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                        >
                          <SelectTrigger data-testid="select-experience-level">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('pages:teachers.allLevels', 'All Levels')}</SelectItem>
                            <SelectItem value="beginner">{t('pages:teachers.beginner', 'Beginner (<3 years)')}</SelectItem>
                            <SelectItem value="intermediate">{t('pages:teachers.intermediate', 'Intermediate (3-7 years)')}</SelectItem>
                            <SelectItem value="advanced">{t('pages:teachers.advanced', 'Advanced (7-15 years)')}</SelectItem>
                            <SelectItem value="professional">{t('pages:teachers.professional', 'Professional (15+ years)')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('pages:teachers.availability', 'Availability')}</Label>
                        <Select 
                          value={filters.availability} 
                          onValueChange={(value) => setFilters({ ...filters, availability: value })}
                        >
                          <SelectTrigger data-testid="select-availability">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('pages:teachers.allTeachers', 'All Teachers')}</SelectItem>
                            <SelectItem value="available">{t('pages:teachers.availableNow', 'Available Now')}</SelectItem>
                            <SelectItem value="not_available">{t('pages:teachers.fullyBooked', 'Fully Booked')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('pages:teachers.sortBy', 'Sort By')}</Label>
                        <Select 
                          value={filters.sortBy} 
                          onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                        >
                          <SelectTrigger data-testid="select-sort-by">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rating">{t('pages:teachers.highestRating', 'Highest Rating')}</SelectItem>
                            <SelectItem value="experience">{t('pages:teachers.mostExperience', 'Most Experience')}</SelectItem>
                            <SelectItem value="price_low">{t('pages:teachers.priceLowToHigh', 'Price: Low to High')}</SelectItem>
                            <SelectItem value="price_high">{t('pages:teachers.priceHighToLow', 'Price: High to Low')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base">
                        {t('pages:teachers.hourlyRate', 'Hourly Rate')}: <span className="font-bold">${filters.minPrice} - ${filters.maxPrice}</span>
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
              </motion.div>
            )}
          </motion.div>

          {filteredTeachers && filteredTeachers.length > 0 && (
            <motion.p 
              className="mb-8 text-muted-foreground text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('pages:teachers.showingResults', 'Showing {{count}} {{label}}', { 
                count: filteredTeachers.length, 
                label: filteredTeachers.length === 1 ? t('pages:teachers.teacher', 'teacher') : t('pages:teachers.teachersPlural', 'teachers') 
              })}
            </motion.p>
          )}

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t('pages:teachers.loading', 'Loading teachers...')}</p>
            </div>
          ) : filteredTeachers && filteredTeachers.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher: any, index: number) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover-elevate" data-testid={`teacher-card-${teacher.id}`}>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <motion.img
                        src={`https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=338&fit=crop&q=80`}
                        alt={teacher.user?.name || t('pages:teachers.teacherAlt', 'Teacher')}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      <div className="absolute bottom-4 left-4">
                        <Avatar className="h-16 w-16 border-4 border-white/20">
                          <AvatarImage src={teacher.user?.profileImage} />
                          <AvatarFallback className="text-lg">{teacher.user?.name?.[0] || "T"}</AvatarFallback>
                        </Avatar>
                      </div>

                      {teacher.rating > 0 && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {teacher.rating.toFixed(1)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Link href={`/profile/${teacher.user?.username}`}>
                            <h3 className="text-2xl font-serif font-bold hover:text-primary transition-colors" data-testid={`text-name-${teacher.id}`}>
                              {teacher.user?.name || t('pages:teachers.unknown', 'Unknown')}
                            </h3>
                          </Link>
                          {teacher.verified && (
                            <CheckCircle2 className="h-5 w-5 text-primary" data-testid={`icon-verified-${teacher.id}`} />
                          )}
                        </div>

                        {teacher.user?.city && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            <span data-testid={`text-location-${teacher.id}`}>{teacher.user.city}</span>
                          </div>
                        )}
                      </div>

                      {teacher.hourlyRate && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t('pages:teachers.hourlyRateLabel', 'Hourly Rate')}</span>
                          <span className="text-2xl font-serif font-bold">${teacher.hourlyRate}</span>
                        </div>
                      )}

                      {teacher.yearsOfExperience && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Award className="h-4 w-4" />
                          <span data-testid={`text-experience-${teacher.id}`}>
                            {t('pages:teachers.yearsExperience', '{{years}} years experience', { years: teacher.yearsOfExperience })}
                          </span>
                        </div>
                      )}
                      
                      {teacher.specialties && teacher.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {teacher.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">{specialty}</Badge>
                          ))}
                        </div>
                      )}

                      {teacher.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`text-bio-${teacher.id}`}>
                          {teacher.bio}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link href={`/profile/${teacher.user?.username}`} className="flex-1">
                          <Button className="w-full gap-2" data-testid={`button-view-${teacher.id}`}>
                            <GraduationCap className="h-4 w-4" />
                            {t('pages:teachers.viewProfile', 'View Profile')}
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon" data-testid={`button-message-${teacher.id}`}>
                          <Music className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50" data-testid="empty-state-teachers">
              <CardContent className="py-16 text-center">
                <div className="p-4 rounded-full bg-muted inline-block mb-6">
                  <GraduationCap className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">{t('pages:teachers.noTeachersFound', 'No Teachers Found')}</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || showFilters ? t('pages:teachers.adjustFilters', 'Try adjusting your search or filters') : t('pages:teachers.noTeachersAvailable', 'No teachers are available in your area yet.')}
                </p>
                {(searchTerm || showFilters) && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setShowFilters(false);
                      setFilters({
                        experienceLevel: 'all',
                        minPrice: 0,
                        maxPrice: 200,
                        availability: 'all',
                        sortBy: 'rating'
                      });
                    }}
                    data-testid="button-clear-filters"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('pages:teachers.clearFilters', 'Clear Filters')}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
