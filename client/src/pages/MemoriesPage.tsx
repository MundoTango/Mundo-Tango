import { Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import PostCreator from "@/components/universal/PostCreator";
import SmartPostFeed from "@/components/moments/SmartPostFeed";
import UpcomingEventsSidebar from "@/components/esa/UpcomingEventsSidebar";

export default function MemoriesPage() {
  return (
    <SelfHealingErrorBoundary pageName="Memories" fallbackRoute="/feed">
      <>
        <SEO
          title="Memories - Share Your Tango Journey"
          description="Share your tango moments, connect with dancers worldwide, and create lasting memories together."
        />
        
        <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, rgba(64, 224, 208, 0.03) 0%, rgba(30, 144, 255, 0.03) 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div 
              className="rounded-xl border p-6 mb-6"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(16px)',
                borderColor: 'rgba(64, 224, 208, 0.2)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 
                    className="text-4xl font-bold mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    data-testid="text-page-title"
                  >
                    Memories
                  </h1>
                  <p className="text-muted-foreground">
                    Share your tango journey with the global community
                  </p>
                </div>
                
                <div 
                  className="px-4 py-2 rounded-full flex items-center gap-2 animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1) 0%, rgba(30, 144, 255, 0.1) 100%)',
                    border: '1px solid rgba(64, 224, 208, 0.3)',
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: '#10B981' }}
                  />
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar - Hidden on mobile */}
              <div className="hidden lg:block lg:col-span-3">
                <div 
                  className="rounded-xl border p-6 sticky top-20"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(64, 224, 208, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5" style={{ color: '#A855F7' }} />
                    <h3 className="font-semibold">Quick Tips</h3>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-lg" style={{ color: '#40E0D0' }}>🗺️</span>
                      <div>
                        <strong>Hidden Gems</strong> - Share your favorite tango spots
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-lg" style={{ color: '#40E0D0' }}>#</span>
                      <div>
                        <strong>Tags</strong> - Categorize your memories
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-lg">📷</span>
                      <div>
                        <strong>Media</strong> - Upload up to 30 files
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-lg">✨</span>
                      <div>
                        <strong>AI Enhance</strong> - Improve your posts
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Feed */}
              <div className="lg:col-span-6 space-y-6">
                {/* Post Creator */}
                <PostCreator 
                  context={{ type: 'memory' }}
                  onPostCreated={() => {
                    // Refresh feed on new post
                  }}
                />

                {/* Smart Feed */}
                <SmartPostFeed 
                  context={{ type: 'feed' }}
                  showSearch={true}
                  showFilters={true}
                />
              </div>

              {/* Right Sidebar - Hidden on mobile */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-20">
                  <UpcomingEventsSidebar />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating AI Assistant Button (Future: MrBlue) */}
        <button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
          style={{
            background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
          }}
          title="AI Assistant"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
      </>
    </SelfHealingErrorBoundary>
  );
}
