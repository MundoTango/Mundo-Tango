import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Plus, 
  Calendar, 
  Image, 
  Clock, 
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star,
  Download,
  Share2,
  Heart,
  MapPin,
  Folder
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabPhotographerProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockGalleries = [
  {
    id: 1,
    title: "Buenos Aires Tango Week 2024",
    description: "Professional coverage of the international tango festival featuring dancers from 20 countries.",
    category: "Event",
    photoCount: 156,
    coverImage: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop",
    date: "2024-11-15",
    views: 1243,
    likes: 234,
    downloads: 45
  },
  {
    id: 2,
    title: "Milonga Portraits Collection",
    description: "Intimate portraits capturing the emotion and connection of tango dancers in authentic milongas.",
    category: "Portrait",
    photoCount: 42,
    coverImage: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&auto=format&fit=crop",
    date: "2024-12-20",
    views: 876,
    likes: 189,
    downloads: 32
  },
  {
    id: 3,
    title: "Tango Couples Editorial",
    description: "Elegant couples photography showcasing the beauty and drama of tango in professional studio settings.",
    category: "Editorial",
    photoCount: 28,
    coverImage: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    date: "2025-01-05",
    views: 2341,
    likes: 456,
    downloads: 89
  }
];

const mockPhotos = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&auto=format&fit=crop",
    title: "Elegant Embrace",
    galleryId: 1,
    likes: 45,
    downloads: 12
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&auto=format&fit=crop",
    title: "Dance Floor Magic",
    galleryId: 1,
    likes: 67,
    downloads: 18
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=600&auto=format&fit=crop",
    title: "Connection",
    galleryId: 2,
    likes: 89,
    downloads: 23
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=600&auto=format&fit=crop",
    title: "Passion in Motion",
    galleryId: 2,
    likes: 134,
    downloads: 34
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&auto=format&fit=crop",
    title: "Milonga Night",
    galleryId: 3,
    likes: 78,
    downloads: 21
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=600&auto=format&fit=crop",
    title: "Traditional Elegance",
    galleryId: 3,
    likes: 92,
    downloads: 27
  }
];

const mockStats = {
  totalPhotos: 456,
  totalGalleries: 12,
  totalViews: 8924,
  avgRating: 4.9,
  totalBookings: 34,
  upcomingSessions: 3
};

const mockPackages = [
  {
    id: 1,
    name: "Milonga Coverage",
    price: 300,
    duration: "3-4 hours",
    deliverables: "100-150 edited photos",
    turnaround: "7 days",
    includes: ["Full event coverage", "High-res digital files", "Online gallery"]
  },
  {
    id: 2,
    name: "Couples Portrait Session",
    price: 200,
    duration: "1 hour",
    deliverables: "20-30 edited photos",
    turnaround: "5 days",
    includes: ["Studio or outdoor location", "Professional editing", "Print-ready files"]
  },
  {
    id: 3,
    name: "Tango Workshop Package",
    price: 150,
    duration: "2 hours",
    deliverables: "50-75 edited photos",
    turnaround: "3 days",
    includes: ["Action shots", "Group photos", "Quick turnaround"]
  }
];

export default function ProfileTabPhotographer({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabPhotographerProps) {
  const [selectedGallery, setSelectedGallery] = useState<number | null>(null);

  // Dashboard view for photographer (owner)
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-photographer-title">
              Photography Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your portfolio, galleries, and bookings
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2" data-testid="button-upload-photos">
              <Plus className="w-4 h-4" />
              Upload Photos
            </Button>
            <Button variant="outline" className="gap-2" data-testid="button-create-gallery">
              <Folder className="w-4 h-4" />
              New Gallery
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-photos">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Image className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Photos</p>
                    <p className="text-2xl font-bold">{mockStats.totalPhotos}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-galleries">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Folder className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Galleries</p>
                    <p className="text-2xl font-bold">{mockStats.totalGalleries}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-views">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-bookings">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{mockStats.totalBookings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Galleries Management */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Galleries</h3>
          <div className="space-y-6">
            {mockGalleries.map((gallery, index) => (
              <motion.div
                key={gallery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-gallery-${gallery.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={gallery.coverImage}
                        alt={gallery.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground">{gallery.category}</Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="outline" className="text-white border-white/30 bg-black/50 backdrop-blur-sm">
                          {gallery.photoCount} photos
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{gallery.title}</h4>
                          <p className="text-muted-foreground">{gallery.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-gallery-${gallery.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-gallery-${gallery.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{gallery.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{gallery.likes} likes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{gallery.downloads} downloads</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {new Date(gallery.date).toLocaleDateString()}
                        </div>
                        <Button variant="outline" size="sm" className="gap-2" data-testid={`button-manage-gallery-${gallery.id}`}>
                          <Eye className="w-4 h-4" />
                          Manage Photos
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Photography Packages */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Packages</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {mockPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover-elevate h-full" data-testid={`card-package-${pkg.id}`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">${pkg.price}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-muted-foreground" />
                        <span>{pkg.deliverables}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{pkg.turnaround} turnaround</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Includes:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {pkg.includes.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <Button variant="outline" className="w-full" data-testid={`button-edit-package-${pkg.id}`}>
                      Edit Package
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Customer view
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-photographer-title">
          Photography Gallery
        </h2>
        <p className="text-lg text-muted-foreground">
          Explore professional tango photography and book your session
        </p>
      </motion.div>

      {/* Featured Galleries */}
      <div>
        <h3 className="text-2xl font-serif font-bold mb-6">Featured Galleries</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {mockGalleries.map((gallery, index) => (
            <motion.div
              key={gallery.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card 
                className="overflow-hidden hover-elevate h-full flex flex-col cursor-pointer" 
                onClick={() => setSelectedGallery(gallery.id)}
                data-testid={`card-gallery-${gallery.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <motion.img
                    src={gallery.coverImage}
                    alt={gallery.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                      {gallery.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-serif font-bold text-white mb-1">
                      {gallery.title}
                    </h3>
                    <p className="text-sm text-white/80">{gallery.photoCount} photos</p>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                  <p className="text-muted-foreground flex-1">{gallery.description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{gallery.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{gallery.likes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Photo Grid (sample photos) */}
      <div>
        <h3 className="text-2xl font-serif font-bold mb-6">Recent Work</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mockPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer"
              data-testid={`photo-${photo.id}`}
            >
              <motion.img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-medium mb-2">{photo.title}</p>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{photo.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{photo.downloads}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden">
          <div className="relative h-[300px]" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm w-fit mb-4">
                Professional Photography
              </Badge>
              <h3 className="text-4xl font-serif font-bold text-white mb-4">
                Book a Photo Session
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                Capture your tango moments with professional photography
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button size="lg" className="gap-2" data-testid="button-book-session">
                  Book Session
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                  View Packages
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Photography Packages */}
      <div>
        <h3 className="text-2xl font-serif font-bold mb-6">Photography Packages</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {mockPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover-elevate h-full flex flex-col" data-testid={`card-package-${pkg.id}`}>
                <CardHeader>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <p className="text-4xl font-bold text-primary mb-1">${pkg.price}</p>
                    <p className="text-sm text-muted-foreground">{pkg.duration}</p>
                  </div>
                  <div className="space-y-2 text-sm flex-1">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4 text-primary" />
                      <span className="font-medium">{pkg.deliverables}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{pkg.turnaround} turnaround</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">What's included:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {pkg.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full gap-2 mt-auto" data-testid={`button-select-package-${pkg.id}`}>
                    Select Package
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
