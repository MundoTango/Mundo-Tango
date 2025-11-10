import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Video, 
  HelpCircle, 
  Users, 
  Calendar, 
  MapPin,
  Mail,
  FileText,
  Play,
  ExternalLink
} from "lucide-react";

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: any;
  link: string;
  category: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: "1",
    title: "Getting Started Guide",
    description: "Learn the basics of Mundo Tango in 5 minutes",
    icon: Book,
    link: "/help/getting-started",
    category: "Beginner"
  },
  {
    id: "2",
    title: "Finding Events",
    description: "How to discover and RSVP to tango events near you",
    icon: Calendar,
    link: "/help/events",
    category: "Features"
  },
  {
    id: "3",
    title: "Connecting with Dancers",
    description: "Send friend requests, join groups, and build your network",
    icon: Users,
    link: "/help/community",
    category: "Features"
  },
  {
    id: "4",
    title: "Finding Teachers & Venues",
    description: "Browse instructors and milongas in your area",
    icon: MapPin,
    link: "/help/teachers-venues",
    category: "Features"
  },
  {
    id: "5",
    title: "Video Tutorials",
    description: "Watch step-by-step guides for all platform features",
    icon: Video,
    link: "/tutorials",
    category: "Video"
  },
  {
    id: "6",
    title: "Account Settings",
    description: "Manage your profile, privacy, and notification preferences",
    icon: FileText,
    link: "/help/account",
    category: "Account"
  },
  {
    id: "7",
    title: "Subscriptions & Billing",
    description: "Learn about premium features and payment options",
    icon: FileText,
    link: "/help/subscriptions",
    category: "Account"
  },
  {
    id: "8",
    title: "Hosting Your Home",
    description: "List your home for traveling tango dancers",
    icon: MapPin,
    link: "/help/hosting",
    category: "Advanced"
  },
  {
    id: "9",
    title: "Marketplace",
    description: "Buy and sell tango shoes, clothing, and merchandise",
    icon: FileText,
    link: "/help/marketplace",
    category: "Advanced"
  },
  {
    id: "10",
    title: "Safety & Reporting",
    description: "How to report inappropriate content or users",
    icon: HelpCircle,
    link: "/help/safety",
    category: "Safety"
  }
];

const videoTutorials = [
  {
    id: "v1",
    title: "Platform Overview (3:24)",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225",
    duration: "3:24"
  },
  {
    id: "v2",
    title: "Creating Your Profile (2:15)",
    thumbnail: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=225",
    duration: "2:15"
  },
  {
    id: "v3",
    title: "Finding Events Near You (4:10)",
    thumbnail: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=225",
    duration: "4:10"
  },
  {
    id: "v4",
    title: "Joining Groups (1:45)",
    thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=225",
    duration: "1:45"
  }
];

const categories = ["All", "Beginner", "Features", "Account", "Advanced", "Safety", "Video"];

export default function HelpCenterPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-6xl py-8 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3" data-testid="text-help-center-title">
              <HelpCircle className="h-10 w-10 text-primary" />
              Help Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Everything you need to know about Mundo Tango
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="hover-elevate cursor-pointer">
              <CardContent className="p-6 text-center">
                <Book className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Browse Articles</h3>
                <p className="text-sm text-muted-foreground">
                  Read detailed guides and tutorials
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer">
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground">
                  Watch step-by-step video guides
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer">
              <CardContent className="p-6 text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get help from our team
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Help Topics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpTopics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <div
                      key={topic.id}
                      className="flex items-start gap-4 p-4 rounded-lg hover-elevate cursor-pointer"
                      data-testid={`help-topic-${topic.id}`}
                    >
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{topic.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {topic.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {topic.description}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Video Tutorials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {videoTutorials.map((video) => (
                  <div
                    key={video.id}
                    className="group cursor-pointer"
                    data-testid={`video-tutorial-${video.id}`}
                  >
                    <div className="relative rounded-lg overflow-hidden mb-2">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-black/80">
                        {video.duration}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-medium">{video.title}</h4>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" asChild>
                  <a href="/tutorials">
                    View All Tutorials →
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Still need help? */}
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help. Send us a message and we'll get back to you within 24 hours.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild data-testid="button-contact-support">
                  <a href="/contact">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/faq">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    View FAQ
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
