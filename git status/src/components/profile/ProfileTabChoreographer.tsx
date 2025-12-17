import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Star,
  Play,
  MessageCircle,
  Award,
  Video
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabChoreographerProps {
  isOwnProfile: boolean;
  viewMode?: 'dashboard' | 'customer';
}

const mockChoreographies = [
  {
    id: 1,
    title: "Passion & Fire - Solo Showcase",
    description: "Dramatic solo choreography exploring the intensity and emotion of tango through modern movement vocabulary.",
    choreographyType: "Solo",
    numberOfDancers: 1,
    duration: 5,
    musicTitle: "Oblivion - Piazzolla",
    purpose: "Competition Performance",
    thumbnailUrl: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&auto=format&fit=crop",
    videoUrl: "https://youtube.com/example",
    views: 2134,
    likes: 312,
    status: "completed",
    price: 800
  },
  {
    id: 2,
    title: "Eternal Embrace - Couple Dance",
    description: "Romantic couple choreography blending traditional tango with contemporary partnering techniques.",
    choreographyType: "Couple",
    numberOfDancers: 2,
    duration: 7,
    musicTitle: "Por Una Cabeza - Gardel",
    purpose: "Wedding Performance",
    thumbnailUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop",
    videoUrl: "https://youtube.com/example2",
    views: 3421,
    likes: 487,
    status: "completed",
    price: 1200
  },
  {
    id: 3,
    title: "Urban Tango - Group Ensemble",
    description: "Dynamic group piece incorporating street dance elements with classic tango foundation.",
    choreographyType: "Group",
    numberOfDancers: 8,
    duration: 10,
    musicTitle: "Libertango - Piazzolla",
    purpose: "Theater Production",
    thumbnailUrl: "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800&auto=format&fit=crop",
    videoUrl: "https://youtube.com/example3",
    views: 5234,
    likes: 621,
    status: "completed",
    price: 3500
  }
];

const mockStats = {
  totalChoreographies: 42,
  totalClients: 28,
  avgRating: 4.9,
  activeProjects: 4
};

const mockServicePackages = [
  {
    type: "Solo Choreography",
    description: "Custom solo tango piece for performances",
    duration: "3-5 minutes",
    sessions: "4-6 sessions",
    price: 800,
    includes: ["Personalized choreography", "Music selection", "Video recording", "Performance coaching"]
  },
  {
    type: "Couple Choreography",
    description: "Personalized couple routine",
    duration: "5-7 minutes",
    sessions: "6-8 sessions",
    price: 1200,
    includes: ["Custom choreography", "Music editing", "Video documentation", "Rehearsal support"]
  },
  {
    type: "Group Choreography",
    description: "Ensemble pieces for shows/competitions",
    duration: "8-12 minutes",
    sessions: "Custom",
    price: null,
    includes: ["Formation design", "Music arrangement", "Staging", "Multiple rehearsals"]
  }
];

export default function ProfileTabChoreographer({ isOwnProfile, viewMode = 'dashboard' }: ProfileTabChoreographerProps) {
  const [playingId, setPlayingId] = useState<number | null>(null);

  if (isOwnProfile && viewMode === 'dashboard') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-choreographer-title">
              Choreography Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your choreographies and client projects
            </p>
          </div>
          <Button className="gap-2" data-testid="button-add-choreography">
            <Plus className="w-4 h-4" />
            Add Choreography
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-choreographies">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Works</p>
                    <p className="text-2xl font-bold">{mockStats.totalChoreographies}</p>
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
            <Card className="hover-elevate" data-testid="card-stat-clients">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-bold">{mockStats.totalClients}</p>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="hover-elevate" data-testid="card-stat-active">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold">{mockStats.activeProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div>
          <h3 className="text-2xl font-serif font-bold mb-6">Your Portfolio</h3>
          <div className="space-y-6">
            {mockChoreographies.map((choreo, index) => (
              <motion.div
                key={choreo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate" data-testid={`card-choreography-${choreo.id}`}>
                  <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={choreo.thumbnailUrl}
                        alt={choreo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-foreground">{choreo.choreographyType}</Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500">{choreo.status}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-serif font-bold mb-2">{choreo.title}</h4>
                          <p className="text-muted-foreground mb-2">{choreo.description}</p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Purpose:</span> {choreo.purpose}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" data-testid={`button-edit-${choreo.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-delete-${choreo.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{choreo.numberOfDancers} dancer{choreo.numberOfDancers > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{choreo.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span>{choreo.views} views</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>${choreo.price}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Music:</span> {choreo.musicTitle}
                        </p>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Service Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {mockServicePackages.map((pkg, index) => (
                <div key={index} className="p-6 rounded-lg bg-primary/5 space-y-3">
                  <h4 className="font-semibold text-lg">{pkg.type}</h4>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Duration:</span> {pkg.duration}</p>
                    <p><span className="font-medium">Sessions:</span> {pkg.sessions}</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {pkg.price ? `$${pkg.price}` : 'Custom Pricing'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2" data-testid="text-choreographer-title">
          Commission Choreography
        </h2>
        <p className="text-lg text-muted-foreground">
          Create unique tango choreography for performances, competitions, and special events
        </p>
      </motion.div>

      <div>
        <h3 className="text-2xl font-serif font-bold mb-6">Portfolio Showcase</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {mockChoreographies.map((choreo, index) => (
            <motion.div
              key={choreo.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover-elevate h-full flex flex-col" data-testid={`card-choreography-${choreo.id}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <motion.img
                    src={choreo.thumbnailUrl}
                    alt={choreo.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                        {choreo.choreographyType}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                        {choreo.duration} min
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white">
                      {choreo.title}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                  <p className="text-muted-foreground flex-1">{choreo.description}</p>

                  <div className="space-y-2 text-sm pt-4 border-t">
                    <p><span className="font-medium">Music:</span> {choreo.musicTitle}</p>
                    <p><span className="font-medium">Purpose:</span> {choreo.purpose}</p>
                    <p><span className="font-medium">Dancers:</span> {choreo.numberOfDancers} {choreo.choreographyType.toLowerCase()}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{choreo.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{choreo.likes}</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => setPlayingId(playingId === choreo.id ? null : choreo.id)}
                    data-testid={`button-watch-${choreo.id}`}
                  >
                    <Video className="w-4 h-4" />
                    Watch Video
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Services Offered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            {mockServicePackages.map((pkg, index) => (
              <div key={index} className="p-6 rounded-lg bg-primary/5 space-y-4">
                <Award className="w-12 h-12 text-primary" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">{pkg.type}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                  <div className="space-y-1 text-sm mb-4">
                    <p className="text-muted-foreground"><span className="font-medium">Duration:</span> {pkg.duration}</p>
                    <p className="text-muted-foreground"><span className="font-medium">Sessions:</span> {pkg.sessions}</p>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-4">
                    {pkg.price ? `$${pkg.price}` : 'Custom Pricing'}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">✓</Badge>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" data-testid={`button-commission-${index}`}>
                    Request Commission
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="overflow-hidden">
          <div className="relative h-[300px]" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm w-fit mb-4">
                Professional Choreographer
              </Badge>
              <h3 className="text-4xl font-serif font-bold text-white mb-4">
                Create Something Unique
              </h3>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                Work with an experienced choreographer to bring your artistic vision to life
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button size="lg" className="gap-2" data-testid="button-start-commission">
                  <MessageCircle className="w-5 h-5" />
                  Start Commission
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                  View Process
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
