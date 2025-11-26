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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SimpleMentionsInput, type MentionEntity } from "@/components/input/SimpleMentionsInput";
import { UnifiedLocationPicker } from "@/components/input/UnifiedLocationPicker";
import { 
  MapPin, Hash, Camera, Sparkles, Globe, Users, Lock, 
  Send, Loader2, X, DollarSign, Star, MapPinned,
  Image as ImageIcon, Video as VideoIcon, FileText,
  Plane, Pizza, Drama, Mountain, Moon, Leaf, Palette,
  Music, Dumbbell, Camera as PhotoIcon, HeartHandshake,
  UserPlus, Briefcase, Target, PartyPopper,
  UtensilsCrossed, Coffee, Hotel, User, Wine, Clock,
  Share2, ExternalLink, CheckCircle, AlertCircle
} from "lucide-react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";

// 15 predefined tags with Lucide icons
const MEMORY_TAGS = [
  { id: "travel", label: "Travel", icon: Plane, gradient: "from-cyan-500 to-blue-500" },
  { id: "food", label: "Food", icon: Pizza, gradient: "from-orange-500 to-red-500" },
  { id: "culture", label: "Culture", icon: Drama, gradient: "from-purple-500 to-pink-500" },
  { id: "adventure", label: "Adventure", icon: Mountain, gradient: "from-green-500 to-teal-500" },
  { id: "nightlife", label: "Nightlife", icon: Moon, gradient: "from-indigo-500 to-purple-500" },
  { id: "nature", label: "Nature", icon: Leaf, gradient: "from-emerald-500 to-green-500" },
  { id: "art", label: "Art", icon: Palette, gradient: "from-pink-500 to-rose-500" },
  { id: "music", label: "Music", icon: Music, gradient: "from-violet-500 to-purple-500" },
  { id: "sports", label: "Sports", icon: Dumbbell, gradient: "from-blue-500 to-cyan-500" },
  { id: "photography", label: "Photography", icon: PhotoIcon, gradient: "from-gray-500 to-slate-500" },
  { id: "family", label: "Family", icon: HeartHandshake, gradient: "from-rose-500 to-pink-500" },
  { id: "friends", label: "Friends", icon: UserPlus, gradient: "from-yellow-500 to-orange-500" },
  { id: "work", label: "Work", icon: Briefcase, gradient: "from-slate-500 to-gray-500" },
  { id: "milestone", label: "Milestone", icon: Target, gradient: "from-red-500 to-orange-500" },
  { id: "celebration", label: "Celebration", icon: PartyPopper, gradient: "from-fuchsia-500 to-pink-500" },
];

// Recommendation categories with Lucide icons
const RECOMMENDATION_CATEGORIES = [
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "cafe", label: "Café", icon: Coffee },
  { id: "hotel", label: "Hotel", icon: Hotel },
  { id: "venue", label: "Tango Venue", icon: User },
  { id: "activity", label: "Activity", icon: Target },
  { id: "bar", label: "Bar", icon: Wine },
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
  showStoryToggle?: boolean;
}

export function PostCreator({ onPostCreated, context = { type: 'feed' }, editMode = false, existingPost, className, showStoryToggle = false }: PostCreatorProps) {
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
  const [isStory, setIsStory] = useState(existingPost?.type === 'story' || false);
  
  // AI Enhancement
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState("");
  const [showEnhancement, setShowEnhancement] = useState(false);

  // Cross-posting state
  const [showCrossPost, setShowCrossPost] = useState(false);
  const [crossPostFacebook, setCrossPostFacebook] = useState(false);
  const [crossPostInstagram, setCrossPostInstagram] = useState(false);
  const [isCrossPosting, setIsCrossPosting] = useState(false);
  const [crossPostStatus, setCrossPostStatus] = useState<{
    facebook?: 'pending' | 'success' | 'error';
    instagram?: 'pending' | 'success' | 'error';
  }>({});

  // Compress image using canvas (like Facebook/Instagram)
  const compressImage = (file: File, maxWidth: number = 1024, maxHeight: number = 1024, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  // Media upload handler - use URL.createObjectURL for INSTANT previews
  // Base64 conversion happens only on submit (like Facebook/Instagram)
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    
    // Validate total files (max 30)
    if (mediaFiles.length + selectedFiles.length > 30) {
      toast({
        title: "Too many files",
        description: "Maximum 30 files allowed per post",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (max 50MB each for reasonable uploads)
    const invalidFiles = selectedFiles.filter(file => file.size > 50 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each file must be smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    console.log('[PostCreator] Adding', selectedFiles.length, 'files');
    
    // Create blob URLs for INSTANT preview (synchronous, no async needed)
    const blobUrls = selectedFiles.map(file => URL.createObjectURL(file));
    console.log('[PostCreator] Created blob URLs:', blobUrls.length);
    
    // Update state SYNCHRONOUSLY - this guarantees re-render
    setMediaFiles(prev => [...prev, ...selectedFiles]);
    setMediaPreviews(prev => [...prev, ...blobUrls]);
    
    console.log('[PostCreator] State updated with', selectedFiles.length, 'files');
    
    toast({
      title: "Media added!",
      description: `${selectedFiles.length} file(s) ready`,
    });
  };
  
  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      mediaPreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const removeMedia = (index: number) => {
    // Cleanup blob URL to prevent memory leak
    const urlToRemove = mediaPreviews[index];
    if (urlToRemove && urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
    }
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
      const response = await apiRequest('POST', '/api/ai/enhance-content', { 
        content, 
        context: context.type 
      });

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

  // Cross-post handler - triggers Computer Use automation
  const handleCrossPost = async (postId: number, content: string) => {
    if (!crossPostFacebook && !crossPostInstagram) return;
    
    setIsCrossPosting(true);
    const newStatus: typeof crossPostStatus = {};
    
    try {
      if (crossPostFacebook) {
        newStatus.facebook = 'pending';
        setCrossPostStatus({ ...newStatus });
        
        try {
          await apiRequest('POST', '/api/social/cross-post', {
            postId,
            content,
            platform: 'facebook',
            mediaUrls: mediaPreviews.filter(p => !p.startsWith('data:video')),
          });
          newStatus.facebook = 'success';
        } catch (err) {
          newStatus.facebook = 'error';
        }
        setCrossPostStatus({ ...newStatus });
      }
      
      if (crossPostInstagram) {
        newStatus.instagram = 'pending';
        setCrossPostStatus({ ...newStatus });
        
        try {
          await apiRequest('POST', '/api/social/cross-post', {
            postId,
            content,
            platform: 'instagram',
            mediaUrls: mediaPreviews.filter(p => !p.startsWith('data:video')),
          });
          newStatus.instagram = 'success';
        } catch (err) {
          newStatus.instagram = 'error';
        }
        setCrossPostStatus({ ...newStatus });
      }
      
      const hasSuccess = newStatus.facebook === 'success' || newStatus.instagram === 'success';
      const hasError = newStatus.facebook === 'error' || newStatus.instagram === 'error';
      
      if (hasSuccess && !hasError) {
        toast({
          title: "Cross-posted successfully!",
          description: "Your memory is now shared on social media",
        });
      } else if (hasError) {
        toast({
          title: "Partial cross-post",
          description: "Some platforms couldn't be reached. We'll retry automatically.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCrossPosting(false);
    }
  };

  // Helper to convert File to base64 with compression
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // For images, try to compress first
      if (file.type.startsWith('image/')) {
        compressImage(file)
          .then(resolve)
          .catch(() => {
            // If compression fails, read raw file
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
      } else {
        // For non-images, just read as base64
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    });
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
      console.log('[PostCreator] Media files:', mediaFiles.length);
      
      // Build post data object
      const postData: any = {
        content: finalContent,
        visibility,
        tags: selectedTags,
        mentions: mentionIds,
      };
      
      // Convert first image to base64 on submit (not during preview)
      if (mediaFiles.length > 0) {
        const firstImage = mediaFiles.find(f => f.type.startsWith('image'));
        if (firstImage) {
          console.log('[PostCreator] Converting image to base64:', firstImage.name, firstImage.size, 'bytes');
          setUploadProgress(10);
          
          try {
            const base64Data = await fileToBase64(firstImage);
            console.log('[PostCreator] Base64 conversion complete:', base64Data.length, 'chars');
            postData.imageUrl = base64Data;
            setUploadProgress(50);
          } catch (err) {
            console.error('[PostCreator] Base64 conversion failed:', err);
            toast({
              title: "Image processing failed",
              description: "Could not process image. Try a smaller file.",
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }
        }
      }
      
      console.log('[PostCreator] Final post data keys:', Object.keys(postData));
      console.log('[PostCreator] imageUrl included:', !!postData.imageUrl);
      
      // Add story metadata if story mode is active
      if (isStory) {
        postData.type = 'story';
        // Set expiration to 24 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        postData.expiresAt = expiresAt.toISOString();
      }
      
      if (isRecommendation && location) {
        postData.location = location;
        if (recommendationType) postData.postType = recommendationType;
        if (priceRange) postData.richContent = { priceRange };
        if (coordinates) postData.coordinates = coordinates;
      }

      // Send as JSON using apiRequest (auto token refresh)
      const response = await apiRequest(
        editMode ? 'PATCH' : 'POST',
        '/api/posts',
        postData
      );

      // apiRequest throws on error, so if we get here it succeeded
      // Invalidate posts cache to refresh feed
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });

      toast({
        title: "🎉 Memory shared!",
        description: "Your memory has been posted",
      });

      // Cleanup blob URLs before resetting
      mediaPreviews.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
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
      setShowCrossPost(false);
      setCrossPostFacebook(false);
      setCrossPostInstagram(false);
      setCrossPostStatus({});
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card 
        className={`p-8 ${className}`}
        style={{
          background: 'linear-gradient(180deg, rgba(64, 224, 208, 0.08) 0%, rgba(30, 144, 255, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(64, 224, 208, 0.2)',
        }}
        data-testid="post-creator"
      >
        {/* User Profile Header */}
        <div className="flex items-center gap-3 mb-6">
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
        <motion.div 
          key={`media-grid-${mediaPreviews.length}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4"
          data-testid="media-preview-grid"
        >
          {mediaPreviews.map((preview, index) => (
            preview && (
              <motion.div
                key={`${index}-${preview.substring(0, 20)}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-900"
              >
                {mediaFiles[index] && mediaFiles[index].type.startsWith('image') ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    data-testid={`media-preview-${index}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  data-testid={`button-remove-media-${index}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )
          ))}
        </motion.div>
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
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4" style={{ color: '#40E0D0' }} />
              Add Tags - Categorize your memory
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {MEMORY_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                const IconComponent = tag.icon;
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
                    <IconComponent className="w-4 h-4" />
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
            <h3 className="text-lg font-serif font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Hidden Gems - Share your favorite places
            </h3>

            {/* Category Selector */}
            <div>
              <Label className="text-xs mb-1.5 block">Category</Label>
              <Select value={recommendationType} onValueChange={setRecommendationType}>
                <SelectTrigger data-testid="select-recommendation-category">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {RECOMMENDATION_CATEGORIES.map(cat => {
                    const IconComponent = cat.icon;
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
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
            <h3 className="text-lg font-serif font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI Enhanced Version
            </h3>
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
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-500" />
              Who can see this?
            </h3>
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

      {/* Cross-Post Panel */}
      <AnimatePresence>
        {showCrossPost && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
              backdropFilter: 'blur(8px)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}
          >
            <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              Cross-Post to Social Media
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share this memory automatically to your connected social media accounts using AI automation.
            </p>
            
            <div className="space-y-4">
              {/* Facebook Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                    <SiFacebook className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Facebook</p>
                    <p className="text-xs text-muted-foreground">Share to your Facebook profile</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {crossPostStatus.facebook === 'pending' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                  {crossPostStatus.facebook === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {crossPostStatus.facebook === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Switch
                    checked={crossPostFacebook}
                    onCheckedChange={setCrossPostFacebook}
                    data-testid="switch-crosspost-facebook"
                  />
                </div>
              </div>
              
              {/* Instagram Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] flex items-center justify-center">
                    <SiInstagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-xs text-muted-foreground">Share to your Instagram feed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {crossPostStatus.instagram === 'pending' && (
                    <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                  )}
                  {crossPostStatus.instagram === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {crossPostStatus.instagram === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Switch
                    checked={crossPostInstagram}
                    onCheckedChange={setCrossPostInstagram}
                    data-testid="switch-crosspost-instagram"
                  />
                </div>
              </div>
              
              {(crossPostFacebook || crossPostInstagram) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Cross-posting will open in a side panel after sharing your memory
                </p>
              )}
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

          {/* Story Mode Toggle */}
          {showStoryToggle && (
            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={iconButtonVariants}
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setIsStory(!isStory)}
                className={`relative group ${isStory ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white' : ''}`}
                data-testid="button-toggle-story"
                title={isStory ? "Story Mode (24h)" : "Post Mode (permanent)"}
              >
                <Clock className="w-5 h-5 transition-transform group-hover:scale-110" />
                {isStory && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    24h
                  </span>
                )}
              </Button>
            </motion.div>
          )}

          {/* 6. Cross-Post Toggle */}
          <motion.div
            custom={6}
            initial="hidden"
            animate="visible"
            variants={iconButtonVariants}
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setShowCrossPost(!showCrossPost)}
              className={`relative group ${showCrossPost || crossPostFacebook || crossPostInstagram ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : ''}`}
              data-testid="button-toggle-crosspost"
              title="Cross-post to Facebook & Instagram"
            >
              <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
              {(crossPostFacebook || crossPostInstagram) && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {(crossPostFacebook ? 1 : 0) + (crossPostInstagram ? 1 : 0)}
                </span>
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
    </motion.div>
  );
}
