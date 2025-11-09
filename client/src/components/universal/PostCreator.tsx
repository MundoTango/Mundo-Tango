import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MapPin, Hash, Camera, Sparkles, Globe, Users, Lock, Send, Loader2, X, Image as ImageIcon, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Tag options (15 tags as per spec)
const TAG_OPTIONS = [
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "adventure", label: "Adventure", emoji: "🏔️" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "photography", label: "Photography", emoji: "📸" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { id: "friends", label: "Friends", emoji: "👥" },
  { id: "work", label: "Work", emoji: "💼" },
  { id: "milestone", label: "Milestone", emoji: "🎯" },
  { id: "celebration", label: "Celebration", emoji: "🎉" },
];

// Recommendation categories (Hidden Gems)
const RECOMMENDATION_CATEGORIES = [
  { id: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { id: "cafe", label: "Café", emoji: "☕" },
  { id: "hotel", label: "Hotel", emoji: "🏨" },
  { id: "tango_venue", label: "Tango Venue", emoji: "💃" },
  { id: "activity", label: "Activity", emoji: "🎯" },
];

// Price ranges
const PRICE_RANGES = [
  { id: "$", label: "Budget-friendly" },
  { id: "$$", label: "Moderate" },
  { id: "$$$", label: "Upscale" },
  { id: "$$$$", label: "Luxury" },
];

// Visibility options
const VISIBILITY_OPTIONS = [
  { id: "public", label: "Public", description: "Everyone can see", icon: Globe },
  { id: "friends", label: "Friends", description: "Friends only", icon: Users },
  { id: "private", label: "Private", description: "Only me", icon: Lock },
];

interface PostCreatorProps {
  context?: {
    type: 'feed' | 'event' | 'group' | 'memory';
    id?: string;
    name?: string;
  };
  onPostCreated?: () => void;
}

export default function PostCreator({ context = { type: 'feed' }, onPostCreated }: PostCreatorProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content state
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  
  // Media state
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  
  // UI state
  const [showTags, setShowTags] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Recommendations state
  const [isRecommendation, setIsRecommendation] = useState(false);
  const [recommendationType, setRecommendationType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [location, setLocation] = useState("");

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Memory shared!",
        description: "Your memory has been shared with the community.",
      });
      
      // Reset form
      setContent("");
      setSelectedTags([]);
      setMediaFiles([]);
      setMediaPreviews([]);
      setIsRecommendation(false);
      setRecommendationType("");
      setPriceRange("");
      setLocation("");
      
      onPostCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + mediaFiles.length > 30) {
      toast({
        title: "Too many files",
        description: "Maximum 30 files allowed",
        variant: "destructive",
      });
      return;
    }

    // Check file sizes (500MB max each)
    const oversizedFiles = files.filter(f => f.size > 500 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each file must be under 500MB",
        variant: "destructive",
      });
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setMediaPreviews([...mediaPreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setMediaFiles([...mediaFiles, ...files]);
  };

  // Remove media file
  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  // Toggle tag
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  // Handle post submission
  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or media",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      content,
      visibility,
      tags: selectedTags,
      isRecommendation,
      ...(isRecommendation && {
        recommendationType,
        priceRange,
        location,
      }),
    };

    createPostMutation.mutate(postData);
  };

  const isPosting = createPostMutation.isPending;
  const canPost = (content.trim().length > 0 || mediaFiles.length > 0) && !isPosting;

  return (
    <div 
      className="rounded-xl border p-6 space-y-4"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(64, 224, 208, 0.2)',
      }}
      data-testid="post-creator"
    >
      {/* User Avatar & Input */}
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-offset-2" style={{ ringColor: 'rgba(64, 224, 208, 0.3)' }}>
          <AvatarImage src={profile?.profileImage} />
          <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)', color: 'white' }}>
            {profile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Try @mentioning someone or adding a recommendation..."
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 bg-transparent text-base"
            data-testid="input-post-content"
          />
        </div>
      </div>

      {/* Media Previews */}
      {mediaPreviews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mediaPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img 
                src={preview} 
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeMedia(index)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tags Panel */}
      {showTags && (
        <div 
          className="p-4 rounded-lg space-y-3"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(64, 224, 208, 0.2)',
          }}
        >
          <div className="text-sm font-semibold" style={{ color: '#1E40AF' }}>Select Tags</div>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: selectedTags.includes(tag.id)
                    ? 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)'
                    : 'rgba(255, 255, 255, 0.8)',
                  color: selectedTags.includes(tag.id) ? 'white' : '#64748B',
                  border: `1px solid ${selectedTags.includes(tag.id) ? 'transparent' : 'rgba(64, 224, 208, 0.3)'}`,
                }}
                data-testid={`tag-${tag.id}`}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Panel */}
      {showRecommendations && (
        <div 
          className="p-4 rounded-lg space-y-3"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <div className="text-sm font-semibold" style={{ color: '#F59E0B' }}>Hidden Gems</div>
          <div className="grid grid-cols-5 gap-2">
            {RECOMMENDATION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setIsRecommendation(true);
                  setRecommendationType(cat.id);
                }}
                className="px-3 py-2 rounded-lg text-sm text-center transition-all"
                style={{
                  background: recommendationType === cat.id
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    : 'white',
                  color: recommendationType === cat.id ? 'white' : '#64748B',
                }}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <div className="text-xs">{cat.label}</div>
              </button>
            ))}
          </div>
          
          {recommendationType && (
            <div className="space-y-2">
              <div className="flex gap-2">
                {PRICE_RANGES.map((price) => (
                  <button
                    key={price.id}
                    onClick={() => setPriceRange(price.id)}
                    className="px-3 py-1 rounded-lg text-sm transition-all"
                    style={{
                      background: priceRange === price.id ? '#F59E0B' : 'white',
                      color: priceRange === price.id ? 'white' : '#64748B',
                    }}
                  >
                    {price.id}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g., 'Downtown Buenos Aires')"
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Visibility Panel */}
      {showVisibility && (
        <div 
          className="p-4 rounded-lg space-y-2"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <div className="text-sm font-semibold" style={{ color: '#10B981' }}>Who can see this?</div>
          <div className="grid grid-cols-3 gap-2">
            {VISIBILITY_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setVisibility(option.id as any)}
                  className="p-3 rounded-lg text-center transition-all"
                  style={{
                    background: visibility === option.id
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : 'white',
                    color: visibility === option.id ? 'white' : '#64748B',
                  }}
                >
                  <Icon className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs opacity-75">{option.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(64, 224, 208, 0.15)' }}>
        <div className="flex gap-2">
          {/* Hidden input for file upload */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Hidden Gems Button */}
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="p-2.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: showRecommendations
                ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                : 'rgba(251, 191, 36, 0.1)',
              color: showRecommendations ? 'white' : '#F59E0B',
            }}
            title="Hidden Gems - Share your favorite places"
            data-testid="button-hidden-gems"
          >
            <MapPin className="w-5 h-5" />
          </button>

          {/* Tags Button */}
          <button
            onClick={() => setShowTags(!showTags)}
            className="p-2.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: showTags
                ? 'linear-gradient(135deg, #40E0D0 0%, #06B6D4 100%)'
                : 'rgba(64, 224, 208, 0.1)',
              color: showTags ? 'white' : '#40E0D0',
            }}
            title="Add Tags - Categorize your memory"
            data-testid="button-tags"
          >
            <Hash className="w-5 h-5" />
          </button>

          {/* Camera Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: mediaFiles.length > 0
                ? 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'
                : 'rgba(139, 92, 246, 0.1)',
              color: mediaFiles.length > 0 ? 'white' : '#8B5CF6',
            }}
            title="Upload Media - Share photos & videos"
            data-testid="button-camera"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* AI Enhancement Button (Placeholder) */}
          <button
            className="p-2.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#A855F7',
            }}
            title="AI Enhance - Improve your content"
            data-testid="button-ai-enhance"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Visibility Button */}
          <button
            onClick={() => setShowVisibility(!showVisibility)}
            className="p-2.5 rounded-lg transition-all hover:scale-110"
            style={{
              background: showVisibility
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'rgba(16, 185, 129, 0.1)',
              color: showVisibility ? 'white' : '#10B981',
            }}
            title="Visibility - Who can see this"
            data-testid="button-visibility"
          >
            {visibility === 'public' && <Globe className="w-5 h-5" />}
            {visibility === 'friends' && <Users className="w-5 h-5" />}
            {visibility === 'private' && <Lock className="w-5 h-5" />}
          </button>
        </div>

        {/* Share Memory Button */}
        <Button
          onClick={handleSubmit}
          disabled={!canPost}
          className="px-6 relative overflow-hidden"
          style={{
            background: canPost
              ? 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)'
              : 'rgba(100, 116, 139, 0.3)',
            color: 'white',
          }}
          data-testid="button-share-memory"
        >
          {isPosting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Share Memory
            </>
          )}
        </Button>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && !showTags && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedTags.map((tagId) => {
            const tag = TAG_OPTIONS.find(t => t.id === tagId);
            return tag ? (
              <Badge 
                key={tagId}
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                  color: 'white',
                }}
              >
                {tag.emoji} {tag.label}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
