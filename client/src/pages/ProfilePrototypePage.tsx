import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Award, Users, Heart, MessageCircle, Share2, Edit, Settings, Music, GraduationCap, Mic2, UserCircle, Building2, Glasses, Upload, Facebook, Instagram, Youtube, Music2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SiTiktok } from "react-icons/si";

const TANGO_ROLES = [
  { value: "dancer", label: "Dancer", icon: UserCircle },
  { value: "teacher", label: "Teacher", icon: GraduationCap },
  { value: "dj", label: "DJ", icon: Music },
  { value: "organizer", label: "Organizer", icon: Calendar },
  { value: "musician", label: "Musician", icon: Music2 },
  { value: "venue_owner", label: "Venue Owner", icon: Building2 },
  { value: "enthusiast", label: "Enthusiast", icon: Heart },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
];

const PROFILE_DATA = {
  name: "Sofia Rodriguez",
  username: "@sofia_tango",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  coverPhoto: "https://images.unsplash.com/photo-1485872299829-c673f5194813?w=1500&auto=format&fit=crop&q=80",
  bio: "Professional tango instructor & performer from Buenos Aires. Teaching the world to dance, one embrace at a time.",
  aboutMe: "I started dancing tango in 2015 and fell in love with the embrace, the music, and the connection. Now I dedicate my life to sharing this beautiful dance with others through teaching and performing.",
  location: "Buenos Aires, Argentina",
  city: "Buenos Aires",
  country: "Argentina",
  joined: "March 2023",
  roles: ["teacher", "dj", "performer"],
  experienceLevel: "professional",
  socialLinks: {
    facebook: "https://facebook.com/sofia.tango",
    instagram: "@sofia_tango",
    tiktok: "@sofia_tango",
    youtube: "sofia_tango",
  },
  stats: {
    followers: 1243,
    following: 567,
    events: 89,
    posts: 234,
  },
  badges: ["Verified Teacher", "Festival Performer", "Community Leader"],
  closenessScore: 85,
  isOwnProfile: false,
};

const ACTIVITY_FEED = [
  {
    id: 1,
    type: "post",
    content: "Amazing workshop today at Studio Pacifico! Thanks to everyone who joined 💃",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&auto=format&fit=crop&q=80",
    likes: 87,
    comments: 12,
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    type: "event",
    content: "Attended Buenos Aires Tango Festival 2025",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    timestamp: "1 day ago",
  },
  {
    id: 3,
    type: "post",
    content: "New choreography coming soon... 👀",
    likes: 156,
    comments: 23,
    timestamp: "3 days ago",
  },
];

export default function ProfilePrototypePage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    bio: PROFILE_DATA.bio,
    aboutMe: PROFILE_DATA.aboutMe,
    roles: PROFILE_DATA.roles,
    experienceLevel: PROFILE_DATA.experienceLevel,
    city: PROFILE_DATA.city,
    country: PROFILE_DATA.country,
    socialLinks: PROFILE_DATA.socialLinks,
  });
  const { toast } = useToast();

  const getRoleIcon = (role: string) => {
    const roleData = TANGO_ROLES.find(r => r.value === role);
    if (roleData) {
      const Icon = roleData.icon;
      return <Icon className="w-4 h-4" />;
    }
    return null;
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setShowEditDialog(false);
  };

  const handlePhotoUpload = (type: 'avatar' | 'cover') => {
    toast({
      title: "Photo Upload",
      description: `${type === 'avatar' ? 'Profile photo' : 'Cover photo'} upload would integrate with Cloudinary here.`,
    });
  };

  const toggleRole = (role: string) => {
    setEditData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${PROFILE_DATA.name} (@${PROFILE_DATA.username.replace('@', '')}) | Mundo Tango`}
        description={`${PROFILE_DATA.bio} ${PROFILE_DATA.location}. View posts, events, and connect with ${PROFILE_DATA.name} on Mundo Tango.`}
      />
      {/* Cover Photo - 16:9 aspect ratio hero with editorial treatment */}
      <div className="relative w-full aspect-[16/6] overflow-hidden">
        <motion.img
          src={PROFILE_DATA.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-background" />
        
        <Button
          variant="outline"
          className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Cover
        </Button>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-6 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end mb-12">
          {/* Avatar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Avatar className="w-48 h-48 border-8 border-background shadow-2xl">
              <AvatarImage src={PROFILE_DATA.avatar} />
              <AvatarFallback className="text-3xl">SR</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-full border-4 border-background" />
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start justify-between gap-6 flex-wrap"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">{PROFILE_DATA.name}</h1>
                <p className="text-lg text-muted-foreground mb-6">{PROFILE_DATA.username}</p>

                {/* Role Badges - Prominent editorial treatment */}
                <div className="flex gap-2 mb-6">
                  {PROFILE_DATA.roles.map((role) => (
                    <Badge key={role} className="gap-1.5 capitalize px-4 py-1.5 text-sm">
                      {getRoleIcon(role)}
                      {role}
                    </Badge>
                  ))}
                </div>

                <p className="text-base md:text-lg leading-relaxed mb-6 max-w-2xl">{PROFILE_DATA.bio}</p>

                <div className="flex flex-wrap gap-6 text-base text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {PROFILE_DATA.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Joined {PROFILE_DATA.joined}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {PROFILE_DATA.isOwnProfile ? (
                  <Button onClick={() => setShowEditDialog(true)} data-testid="button-edit-profile">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Follow
                    </Button>
                  </>
                )}
                <Button variant="outline" size="icon" data-testid="button-settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Grid - Editorial card treatment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mb-12">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.stats.followers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.stats.following.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.stats.events}</div>
                  <div className="text-sm text-muted-foreground">Events Attended</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold mb-2">{PROFILE_DATA.stats.posts}</div>
                  <div className="text-sm text-muted-foreground">Contributions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-12">
          <TabsList className="mb-8">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-8">
            {ACTIVITY_FEED.map((item, index) => (
              <ActivityCard key={item.id} item={item} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="events">
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-2xl font-serif font-bold mb-3">Events Timeline</h3>
              <p className="text-base text-muted-foreground">
                {PROFILE_DATA.stats.events} events attended
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square bg-muted rounded-xl hover-elevate" 
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="space-y-8">
              {/* Closeness Score - Only shown when viewing another user's profile */}
              {!PROFILE_DATA.isOwnProfile && (
                <Card className="p-8">
                  <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-[#40E0D0]" />
                    Connection Strength
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(PROFILE_DATA.closenessScore / 100) * 351.86} 351.86`}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#40E0D0" />
                            <stop offset="100%" stopColor="#9370DB" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{PROFILE_DATA.closenessScore}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">Strong Connection</p>
                      <p className="text-muted-foreground">
                        You have a high closeness score with {PROFILE_DATA.name.split(' ')[0]} based on shared interests, events attended, and mutual connections.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* About Me */}
              <Card className="p-8">
                <h3 className="text-2xl font-serif font-bold mb-6">About Me</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{PROFILE_DATA.aboutMe}</p>
              </Card>

              {/* Experience & Expertise */}
              <Card className="p-8">
                <h3 className="text-2xl font-serif font-bold mb-6">Experience & Expertise</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground mb-2 block">Experience Level</Label>
                    <Badge className="gap-2 px-4 py-2 text-base capitalize">
                      <Glasses className="w-4 h-4" />
                      {PROFILE_DATA.experienceLevel}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Social Links */}
              {PROFILE_DATA.socialLinks && (
                <Card className="p-8">
                  <h3 className="text-2xl font-serif font-bold mb-6">Connect with Me</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROFILE_DATA.socialLinks.facebook && (
                      <a
                        href={PROFILE_DATA.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                        data-testid="link-facebook"
                      >
                        <Facebook className="w-5 h-5 text-[#1877F2]" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {PROFILE_DATA.socialLinks.instagram && (
                      <a
                        href={`https://instagram.com/${PROFILE_DATA.socialLinks.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                        data-testid="link-instagram"
                      >
                        <Instagram className="w-5 h-5 text-[#E4405F]" />
                        <span>{PROFILE_DATA.socialLinks.instagram}</span>
                      </a>
                    )}
                    {PROFILE_DATA.socialLinks.tiktok && (
                      <a
                        href={`https://tiktok.com/@${PROFILE_DATA.socialLinks.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                        data-testid="link-tiktok"
                      >
                        <SiTiktok className="w-5 h-5" />
                        <span>{PROFILE_DATA.socialLinks.tiktok}</span>
                      </a>
                    )}
                    {PROFILE_DATA.socialLinks.youtube && (
                      <a
                        href={`https://youtube.com/@${PROFILE_DATA.socialLinks.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-lg border hover-elevate"
                        data-testid="link-youtube"
                      >
                        <Youtube className="w-5 h-5 text-[#FF0000]" />
                        <span>{PROFILE_DATA.socialLinks.youtube}</span>
                      </a>
                    )}
                  </div>
                </Card>
              )}

              {/* Achievements */}
              <Card className="p-8">
                <h3 className="text-2xl font-serif font-bold mb-6">Achievements</h3>
                <div className="flex flex-wrap gap-3">
                  {PROFILE_DATA.badges.map((badge) => (
                    <Badge key={badge} variant="outline" className="gap-1.5 px-4 py-2 text-sm">
                      <Award className="w-4 h-4" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and social links
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Profile Photo Upload */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Profile Photo</Label>
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={PROFILE_DATA.avatar} />
                  <AvatarFallback>SR</AvatarFallback>
                </Avatar>
                <Button variant="outline" onClick={() => handlePhotoUpload('avatar')} data-testid="button-upload-avatar">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>

            {/* Cover Photo Upload */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Cover Photo</Label>
              <div className="space-y-3">
                <div className="w-full h-32 rounded-lg overflow-hidden border">
                  <img src={PROFILE_DATA.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <Button variant="outline" onClick={() => handlePhotoUpload('cover')} data-testid="button-upload-cover">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Cover Photo
                </Button>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-base font-semibold">Bio</Label>
              <Textarea
                id="bio"
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                placeholder="Tell the world about yourself..."
                data-testid="input-bio"
              />
            </div>

            {/* About Me */}
            <div className="space-y-2">
              <Label htmlFor="aboutMe" className="text-base font-semibold">About Me</Label>
              <Textarea
                id="aboutMe"
                value={editData.aboutMe}
                onChange={(e) => setEditData(prev => ({ ...prev, aboutMe: e.target.value }))}
                rows={4}
                placeholder="Share your tango journey..."
                data-testid="input-about-me"
              />
            </div>

            {/* Tango Roles */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tango Roles</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TANGO_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = editData.roles.includes(role.value);
                  return (
                    <button
                      key={role.value}
                      onClick={() => toggleRole(role.value)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover-elevate'
                      }`}
                      data-testid={`button-role-${role.value}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-base font-semibold">Experience Level</Label>
              <Select
                value={editData.experienceLevel}
                onValueChange={(value) => setEditData(prev => ({ ...prev, experienceLevel: value }))}
              >
                <SelectTrigger id="experience" data-testid="select-experience-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-base font-semibold">City</Label>
                <Input
                  id="city"
                  value={editData.city}
                  onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Buenos Aires"
                  data-testid="input-city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-base font-semibold">Country</Label>
                <Input
                  id="country"
                  value={editData.country}
                  onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Argentina"
                  data-testid="input-country"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Social Media Links</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-[#1877F2]" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={editData.socialLinks.facebook || ''}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                    }))}
                    placeholder="https://facebook.com/yourprofile"
                    data-testid="input-facebook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-[#E4405F]" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={editData.socialLinks.instagram || ''}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    placeholder="@yourhandle"
                    data-testid="input-instagram"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="flex items-center gap-2">
                    <SiTiktok className="w-4 h-4" />
                    TikTok
                  </Label>
                  <Input
                    id="tiktok"
                    value={editData.socialLinks.tiktok || ''}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, tiktok: e.target.value }
                    }))}
                    placeholder="@yourhandle"
                    data-testid="input-tiktok"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-[#FF0000]" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={editData.socialLinks.youtube || ''}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                    }))}
                    placeholder="@yourchannel"
                    data-testid="input-youtube"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} data-testid="button-save-profile">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActivityCard({ item, index }: { item: typeof ACTIVITY_FEED[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover-elevate">
        {item.image && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <motion.img 
              src={item.image} 
              alt="" 
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}
        <CardContent className="p-8">
          <p className="text-lg leading-relaxed mb-6">{item.content}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{item.timestamp}</span>
            {item.likes !== undefined && (
              <div className="flex gap-6">
                <button className="flex items-center gap-2 hover:text-foreground hover-elevate">
                  <Heart className="w-5 h-5" />
                  {item.likes}
                </button>
                <button className="flex items-center gap-2 hover:text-foreground hover-elevate">
                  <MessageCircle className="w-5 h-5" />
                  {item.comments}
                </button>
                <button className="flex items-center gap-2 hover:text-foreground hover-elevate">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
