import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Eye,
  Clock, 
  TrendingUp,
  Edit,
  Trash2,
  Video,
  FileText,
  Headphones,
  ThumbsUp,
  MessageSquare,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabContentCreatorProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

// Mock data - will be replaced with actual API data
const mockContent = [
  {
    id: 1,
    title: "Essential Tango Techniques for Beginners",
    description: "A comprehensive video series covering fundamental tango techniques, from basic steps to musicality and connection.",
    type: "Video Series",
    duration: "6 episodes, 45 min each",
    published: "2 weeks ago",
    views: 12450,
    likes: 892,
    comments: 156,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop",
    category: "Tutorial",
    isPremium: false
  },
  {
    id: 2,
    title: "The History of Argentine Tango Music",
    description: "Deep dive into the evolution of tango music, exploring orchestras, composers, and the golden age of tango.",
    type: "Blog Series",
    duration: "5 articles",
    published: "1 month ago",
    views: 8230,
    likes: 567,
    comments: 89,
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop",
    category: "Educational",
    isPremium: false
  },
  {
    id: 3,
    title: "Advanced Musicality Masterclass",
    description: "Premium course on developing advanced musicality skills, understanding complex rhythms, and expressing music through movement.",
    type: "Online Course",
    duration: "12 lessons, 90 min each",
    published: "3 months ago",
    views: 4560,
    likes: 423,
    comments: 78,
    imageUrl: "https://images.unsplash.com/photo-1598387846560-3f326e4585b3?w=800&auto=format&fit=crop",
    category: "Course",
    isPremium: true
  },
  {
    id: 4,
    title: "Tango Podcasts: Conversations with Maestros",
    description: "Weekly podcast featuring interviews with renowned tango dancers, musicians, and historians from around the world.",
    type: "Podcast",
    duration: "24 episodes, 60 min each",
    published: "Ongoing",
    views: 15780,
    likes: 1023,
    comments: 234,
    imageUrl: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&auto=format&fit=crop",
    category: "Interview",
    isPremium: false
  }
];

const mockStats = {
  totalContent: 47,
  totalViews: 156000,
  totalSubscribers: 3420,
  avgEngagement: 8.5
};

export default function ProfileTabContentCreator({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabContentCreatorProps) {
  const [selectedContent, setSelectedContent] = useState<number | null>(null);

  // Dashboard view for content creator (owner)
  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-content-title">
              Content Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your content library and track audience engagement
            </p>
          </div>
          <Button className="gap-2" data-testid="button-create-content">
            <Plus className="w-4 h-4" />
            Create New Content
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-content">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Content</p>
                    <p className="text-2xl font-bold">{mockStats.totalContent}</p>
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
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-subscribers">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscribers</p>
                    <p className="text-2xl font-bold">{mockStats.totalSubscribers.toLocaleString()}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-engagement">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <ThumbsUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Engagement</p>
                    <p className="text-2xl font-bold">{mockStats.avgEngagement}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Content Management */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Content</h3>
          <div className="space-y-6">
            {mockContent.map((contentItem, index) => (
              <motion.div
                key={contentItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-content-${contentItem.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    {/* Image */}
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={contentItem.imageUrl}
                        alt={contentItem.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className="bg-white/90 text-foreground">{contentItem.type}</Badge>
                        {contentItem.isPremium && (
                          <Badge className="bg-primary">Premium</Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{contentItem.title}</h4>
                          <p className="text-muted-foreground">{contentItem.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-${contentItem.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-${contentItem.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{contentItem.published}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{contentItem.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{contentItem.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                          <span>{contentItem.likes} likes</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{contentItem.comments} comments</span>
                        </div>
                        <Badge variant="secondary">{contentItem.category}</Badge>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Customer view (public facing)
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4" data-testid="badge-content-category">
            Content Library
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-content-heading">
            Educational Content & Resources
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore a curated collection of tango tutorials, articles, and multimedia content
          </p>
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {mockContent.map((contentItem, index) => (
          <motion.div
            key={contentItem.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover-elevate h-full" data-testid={`card-public-content-${contentItem.id}`}>
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <motion.img
                  src={contentItem.imageUrl}
                  alt={contentItem.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-white/90 text-foreground">{contentItem.type}</Badge>
                  {contentItem.isPremium && (
                    <Badge className="bg-primary">Premium</Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl md:text-2xl font-serif font-bold mb-1">{contentItem.title}</h3>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">{contentItem.description}</p>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{contentItem.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span>{contentItem.views.toLocaleString()} views</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{contentItem.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{contentItem.comments}</span>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2" data-testid={`button-view-${contentItem.id}`}>
                    View Content
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center pt-8"
      >
        <Button size="lg" className="gap-2" data-testid="button-subscribe">
          <BookOpen className="w-5 h-5" />
          Subscribe for Updates
        </Button>
      </motion.div>
    </div>
  );
}
