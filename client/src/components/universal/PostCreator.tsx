import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SimpleMentionsInput, type MentionEntity } from "@/components/input/SimpleMentionsInput";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import { 
  MapPin, Hash, Camera, Sparkles, Globe, Users, Lock, 
  Send, Loader2, X, DollarSign, Star, MapPinned,
  Image as ImageIcon, Video as VideoIcon, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 15 predefined tags with emojis
const MEMORY_TAGS = [
  { id: "travel", label: "Travel", emoji: "✈️", gradient: "from-cyan-500 to-blue-500" },
  { id: "food", label: "Food", emoji: "🍕", gradient: "from-orange-500 to-red-500" },
  { id: "culture", label: "Culture", emoji: "🎭", gradient: "from-purple-500 to-pink-500" },
  { id: "adventure", label: "Adventure", emoji: "🏔️", gradient: "from-green-500 to-teal-500" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃", gradient: "from-indigo-500 to-purple-500" },
  { id: "nature", label: "Nature", emoji: "🌿", gradient: "from-emerald-500 to-green-500" },
  { id: "art", label: "Art", emoji: "🎨", gradient: "from-pink-500 to-rose-500" },
  { id: "music", label: "Music", emoji: "🎵", gradient: "from-violet-500 to-purple-500" },
  { id: "sports", label: "Sports", emoji: "⚽", gradient: "from-blue-500 to-cyan-500" },
  { id: "photography", label: "Photography", emoji: "📸", gradient: "from-gray-500 to-slate-500" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", gradient: "from-rose-500 to-pink-500" },
  { id: "friends", label: "Friends", emoji: "👥", gradient: "from-yellow-500 to-orange-500" },
  { id: "work", label: "Work", emoji: "💼", gradient: "from-slate-500 to-gray-500" },
  { id: "milestone", label: "Milestone", emoji: "🎯", gradient: "from-red-500 to-orange-500" },
  { id: "celebration", label: "Celebration", emoji: "🎉", gradient: "from-fuchsia-500 to-pink-500" },
];

// Recommendation categories
const RECOMMENDATION_CATEGORIES = [
  { id: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { id: "cafe", label: "Café", emoji: "☕" },
  { id: "hotel", label: "Hotel", emoji: "🏨" },
  { id: "venue", label: "Tango Venue", emoji: "💃" },
  { id: "activity", label: "Activity", emoji: "🎯" },
  { id: "bar", label: "Bar", emoji: "🍸" },
];

// Price ranges
const PRICE_RANGES = [
  { id: "$", label: "$", description: "Budget-friendly" },
  { id: "$$", label: "$$", description: "Moderate" },
  { id: "$$$", label: "$$$", description: "Upscale" },
  { id: "$$$$", label: "$$$$", description: "Luxury" },
];

interface PostCreatorProps {
  onPostCreated?: () => void;
  context?: {
    type: 'feed' | 'event' | 'group' | 'memory';
    id?: string;
    name?: string;
  };
  editMode?: boolean;
  existingPost?: any;
  className?: string;
}

export function PostCreator({ onPostCreated, context = { type: 'feed' }, editMode = false, existingPost, className }: PostCreatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content state
  const [content, setContent] = useState(existingPost?.content || "");
  const [richContent, setRichContent] = useState(existingPost?.richContent || "");
  const [mentions, setMentions] = useState<MentionEntity[]>(existingPost?.mentions || []);
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [inputKey, setInputKey] = useState(0); // Force re-render of input on reset
  
  // Media state
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Feature toggles
  const [showTags, setShowTags] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Feature state
  const [selectedTags, setSelectedTags] = useState<string[]>(existingPost?.tags || []);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>(existingPost?.visibility || 'public');
  const [isRecommendation, setIsRecommendation] = useState(existingPost?.isRecommendation || false);
  const [recommendationType, setRecommendationType] = useState(existingPost?.recommendationType || "");
  const [priceRange, setPriceRange] = useState(existingPost?.priceRange || "");
  const [location, setLocation] = useState(existingPost?.location || "");
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | undefined>(existingPost?.coordinates || undefined);
  
  // AI Enhancement
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState("");
  const [showEnhancement, setShowEnhancement] = useState(false);

  // Media upload handler
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total files (max 30)
    if (mediaFiles.length + files.length > 30) {
      toast({
        title: "Too many files",
        description: "Maximum 30 files allowed per post",
        variant: "destructive",
      });
      return;
    }

    // Validate each file (max 500MB)
    const invalidFiles = files.filter(file => file.size > 500 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each file must be smaller than 500MB",
        variant: "destructive",
      });
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setMediaPreviews([...mediaPreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setMediaFiles([...mediaFiles, ...files]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  // AI Enhancement
  const handleAiEnhance = async () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please write something first",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    setShowAiPanel(true);

    try {
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ content, context: context.type }),
      });

      if (!response.ok) throw new Error('Enhancement failed');

      const data = await response.json();
      setEnhancedContent(data.enhancedContent);
      setShowEnhancement(true);

      toast({
        title: "✨ Content enhanced!",
        description: "Review the AI suggestions below",
      });
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: "Could not enhance content. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Post submission
  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or media",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const finalContent = showEnhancement && enhancedContent ? enhancedContent : content;
      console.log('[PostCreator] Submitting post with content:', finalContent);
      console.log('[PostCreator] Mentions:', mentions);
      
      // Build post data object
      const postData: any = {
        content: finalContent, // Canonical format with @user:user_123:maria
        visibility,
        tags: selectedTags,
        mentions: mentionIds, // Array of IDs: ["user_123", "event_456", "group_789"]
      };
      
      if (isRecommendation && location) {
        postData.location = location;
        if (recommendationType) postData.postType = recommendationType;
        if (priceRange) postData.richContent = { priceRange };
        if (coordinates) postData.coordinates = coordinates;
      }

      // Send as JSON (media upload will be handled separately later)
      const response = await fetch('/api/posts', {
        method: editMode ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Post creation failed:', errorData);
        throw new Error('Post failed');
      }

      toast({
        title: "🎉 Memory shared!",
        description: "Your memory has been posted",
      });

      // Reset form
      setContent("");
      setMentions([]);
      setMentionIds([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setSelectedTags([]);
      setIsRecommendation(false);
      setLocation("");
      setCoordinates(undefined);
      setRecommendationType("");
      setPriceRange("");
      setShowTags(false);
      setShowRecommendations(false);
      setShowVisibility(false);
      setShowEnhancement(false);
      setEnhancedContent("");
      setInputKey(prev => prev + 1); // Force SimpleMentionsInput to reset

      if (onPostCreated) onPostCreated();

    } catch (error) {
      toast({
        title: "Post failed",
        description: "Could not create post. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Icon button animation variants
  const iconButtonVariants = {
    hidden: { opacity: 0, scale: 0.3, rotate: -45 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        type: "spring",
        stiffness: 200,
      }
    }),
  };

  const canPost = content.trim().length > 0 || mediaFiles.length > 0;

  return (
    <Card 
      className={`p-6 ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(64, 224, 208, 0.08) 0%, rgba(30, 144, 255, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(64, 224, 208, 0.2)',
      }}
      data-testid="post-creator"
    >
      {/* User Profile Header */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.profileImage || ""} />
          <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0, #1E90FF)' }}>
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold">{user?.name || user?.email}</div>
          <div className="text-sm text-muted-foreground">Share a memory...</div>
        </div>
      </div>

      {/* Main Content Input with @Mentions */}
      <SimpleMentionsInput
        key={inputKey}
        value={content}
        onChange={(newContent, newMentions) => {
          setContent(newContent);
          setMentions(newMentions);
        }}
        onMentionsChange={(ids) => {
          setMentionIds(ids);
        }}
        placeholder="What's on your mind? Try @mentioning someone or adding a recommendation..."
        className="min-h-[120px] mb-4"
        data-testid="input-post-content"
      />

      {/* Media Previews Grid */}
      {mediaPreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
          {mediaPreviews.map((preview, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-lg overflow-hidden aspect-square"
            >
              {mediaFiles[index].type.startsWith('image') ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <VideoIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => removeMedia(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`button-remove-media-${index}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tags Panel */}
      <AnimatePresence>
        {showTags && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(30, 144, 255, 0.1))',
              backdropFilter: 'blur(8px)',
              borderColor: 'rgba(64, 224, 208, 0.3)',
            }}
          >
            <div className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4" style={{ color: '#40E0D0' }} />
              Add Tags - Categorize your memory
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {MEMORY_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <Button
                    key={tag.id}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => {
                      setSelectedTags(
                        isSelected
                          ? selectedTags.filter(t => t !== tag.id)
                          : [...selectedTags, tag.id]
                      );
                    }}
                    className={`justify-start gap-1.5 ${isSelected ? `bg-gradient-to-r ${tag.gradient} text-white border-0` : ''}`}
                    data-testid={`button-tag-${tag.id}`}
                  >
                    <span>{tag.emoji}</span>
                    <span className="text-xs">{tag.label}</span>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations Panel */}
      <AnimatePresence>
        {showRecommendations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl border space-y-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 191, 0, 0.1), rgba(255, 140, 0, 0.1))',
              backdropFilter: 'blur(8px)',
              borderColor: 'rgba(255, 191, 0, 0.3)',
            }}
          >
            <div className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Hidden Gems - Share your favorite places
            </div>

            {/* Category Selector */}
            <div>
              <Label className="text-xs mb-1.5 block">Category</Label>
              <Select value={recommendationType} onValueChange={setRecommendationType}>
                <SelectTrigger data-testid="select-recommendation-category">
                  <SelectValue placeholder="📍 Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {RECOMMENDATION_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-xs mb-1.5 block">Price Range</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRICE_RANGES.map(range => {
                  const isSelected = priceRange === range.id;
                  return (
                    <Button
                      key={range.id}
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setPriceRange(range.id)}
                      className={`${isSelected ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0' : ''}`}
                      data-testid={`button-price-${range.id}`}
                      title={range.description}
                    >
                      {range.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Location Picker with OpenStreetMap */}
            <div>
              <Label className="text-xs mb-1.5 block">Location</Label>
              <UnifiedLocationPicker
                value={location}
                coordinates={coordinates}
                onChange={(newLocation, newCoords) => {
                  setLocation(newLocation);
                  setCoordinates(newCoords);
                }}
                placeholder="Search for a location..."
                data-testid="input-recommendation-location"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Enhancement Panel */}
      <AnimatePresence>
        {showAiPanel && showEnhancement && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
              backdropFilter: 'blur(8px)',
              borderColor: 'rgba(168, 85, 247, 0.3)',
            }}
          >
            <div className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI Enhanced Version
            </div>
            <div className="text-sm bg-white/50 dark:bg-black/20 p-3 rounded-lg">
              {enhancedContent}
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowEnhancement(false)}
              className="mt-2"
            >
              Use original instead
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visibility Panel */}
      <AnimatePresence>
        {showVisibility && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
              backdropFilter: 'blur(8px)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
          >
            <div className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-500" />
              Who can see this?
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                size="sm"
                variant={visibility === 'public' ? "default" : "outline"}
                onClick={() => setVisibility('public')}
                className={`flex items-center gap-2 ${visibility === 'public' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0' : ''}`}
                data-testid="button-visibility-public"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs">Public</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={visibility === 'friends' ? "default" : "outline"}
                onClick={() => setVisibility('friends')}
                className={`flex items-center gap-2 ${visibility === 'friends' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0' : ''}`}
                data-testid="button-visibility-friends"
              >
                <Users className="w-4 h-4" />
                <span className="text-xs">Friends</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant={visibility === 'private' ? "default" : "outline"}
                onClick={() => setVisibility('private')}
                className={`flex items-center gap-2 ${visibility === 'private' ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0' : ''}`}
                data-testid="button-visibility-private"
              >
                <Lock className="w-4 h-4" />
                <span className="text-xs">Private</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6 Animated Icon Buttons */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(64, 224, 208, 0.2)' }}>
        <div className="flex items-center gap-2">
          {/* 1. Hidden Gems (Recommendations) */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={iconButtonVariants}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsRecommendation(!isRecommendation);
                setShowRecommendations(!showRecommendations);
              }}
              className={`relative group ${isRecommendation ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' : ''}`}
              data-testid="button-toggle-recommendations"
              title="Hidden Gems - Share your favorite places"
            >
              <MapPin className={`w-5 h-5 transition-transform group-hover:scale-110 ${isRecommendation ? 'animate-bounce' : ''}`} />
            </Button>
          </motion.div>

          {/* 2. Tags */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={iconButtonVariants}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setShowTags(!showTags)}
              className={`relative group ${showTags ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white' : ''}`}
              data-testid="button-toggle-tags"
              title="Add Tags - Categorize your memory"
            >
              <Hash className={`w-5 h-5 transition-transform group-hover:rotate-180 ${showTags ? 'rotate-180' : ''}`} />
              {selectedTags.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {selectedTags.length}
                </span>
              )}
            </Button>
          </motion.div>

          {/* 3. Camera (Media Upload) */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={iconButtonVariants}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className={`relative group ${mediaFiles.length > 0 ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : ''}`}
              data-testid="button-upload-media"
              title="Upload Media - Share photos & videos"
            >
              <Camera className="w-5 h-5 transition-transform group-hover:scale-110" />
              {mediaFiles.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {mediaFiles.length}
                </span>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
              data-testid="input-media-files"
            />
          </motion.div>

          {/* 4. AI Enhancement */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={iconButtonVariants}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleAiEnhance}
              disabled={isEnhancing || !content.trim()}
              className={`relative group ${showEnhancement ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' : ''}`}
              data-testid="button-ai-enhance"
              title="AI Enhance - Improve your content"
            >
              {isEnhancing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className={`w-5 h-5 transition-transform group-hover:rotate-12 ${isEnhancing ? 'animate-spin' : ''}`} />
              )}
            </Button>
          </motion.div>

          {/* 5. Visibility */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={iconButtonVariants}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setShowVisibility(!showVisibility)}
              className={`relative group ${showVisibility ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' : ''}`}
              data-testid="button-toggle-visibility"
              title={`Visibility - ${visibility}`}
            >
              {visibility === 'public' ? (
                <Globe className="w-5 h-5 transition-transform group-hover:rotate-12" />
              ) : visibility === 'friends' ? (
                <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
              ) : (
                <Lock className="w-5 h-5 transition-transform group-hover:scale-110" />
              )}
            </Button>
          </motion.div>
        </div>

        {/* 6. Share Memory (Large Button) */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={iconButtonVariants}
        >
          <Button
            onClick={handleSubmit}
            disabled={!canPost || isUploading}
            size="lg"
            className={`relative overflow-hidden group ${
              canPost 
                ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white border-0 shadow-lg' 
                : ''
            }`}
            data-testid="button-share-memory"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading {uploadProgress}%
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" />
                Share Memory
              </>
            )}
            {canPost && !isUploading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear",
                }}
              />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && !showTags && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedTags.map(tagId => {
            const tag = MEMORY_TAGS.find(t => t.id === tagId);
            return tag ? (
              <Badge
                key={tagId}
                className={`bg-gradient-to-r ${tag.gradient} text-white text-xs`}
                data-testid={`badge-selected-tag-${tagId}`}
              >
                {tag.emoji} {tag.label}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </Card>
  );
}
