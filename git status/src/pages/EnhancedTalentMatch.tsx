import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Search, Send, Sparkles, MessageSquare, Star, MapPin, Briefcase } from 'lucide-react';

export default function EnhancedTalentMatch() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [opportunityDesc, setOpportunityDesc] = useState('');
  const [outreachMessage, setOutreachMessage] = useState<any>(null);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest('/api/talent-match/search', 'POST', { query: searchQuery, limit: 20 });
      return response;
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Search Complete! 🎯",
        description: `Found ${data.length} potential matches`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const generateOutreachMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/talent-match/outreach/generate', 'POST', data);
    },
    onSuccess: (data) => {
      setOutreachMessage(data);
      toast({
        title: "Outreach Generated! ✨",
        description: "Your personalized message is ready",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please describe who you're looking for",
        variant: "destructive"
      });
      return;
    }
    searchMutation.mutate(query);
  };

  const handleGenerateOutreach = (candidate: any) => {
    if (!opportunityDesc.trim()) {
      toast({
        title: "Opportunity Description Required",
        description: "Please describe the opportunity",
        variant: "destructive"
      });
      return;
    }

    setSelectedCandidate(candidate);
    generateOutreachMutation.mutate({
      candidateId: candidate.id,
      opportunityDescription: opportunityDesc,
      tone: 'casual',
      channel: 'email'
    });
  };

  return (
    <PageLayout title="Enhanced Talent Match" showBreadcrumbs>
      <>
        <SEO
          title="Enhanced Talent Match - Mundo Tango"
          description="Find and connect with talent using AI-powered semantic search"
        />

        <div className="container mx-auto max-w-6xl space-y-6 p-6" data-testid="page-talent-match">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Enhanced Talent Match</h1>
            <p className="text-muted-foreground">
              Natural language search powered by AI - find exactly who you need
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Natural Language Search
              </CardTitle>
              <CardDescription>
                Describe who you're looking for in plain English
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Experienced tango teacher in Buenos Aires with social media skills"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="input-search-query"
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searchMutation.isPending}
                  data-testid="button-search"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Example Searches */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {[
                  'DJ with 5+ years experience',
                  'Spanish-speaking dance instructor',
                  'Event coordinator in NYC'
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(example);
                      searchMutation.mutate(example);
                    }}
                    data-testid={`button-example-${example.slice(0, 10)}`}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((candidate) => (
                    <Card key={candidate.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={candidate.profileImage} alt={candidate.name} />
                            <AvatarFallback>
                              {candidate.name?.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="font-semibold text-lg">{candidate.name}</h3>
                              <p className="text-sm text-muted-foreground">{candidate.email}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {candidate.location && (
                                <Badge variant="outline">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {candidate.location}
                                </Badge>
                              )}
                              {candidate.role && (
                                <Badge variant="outline">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {candidate.role}
                                </Badge>
                              )}
                              <Badge variant="default">
                                <Star className="h-3 w-3 mr-1" />
                                {candidate.matchScore?.toFixed(2) || '0.85'} match
                              </Badge>
                            </div>

                            {candidate.bio && (
                              <p className="text-sm line-clamp-2">{candidate.bio}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleGenerateOutreach(candidate)}
                              disabled={generateOutreachMutation.isPending}
                              data-testid={`button-generate-outreach-${candidate.id}`}
                            >
                              <Sparkles className="h-4 w-4 mr-1" />
                              Generate Outreach
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opportunity Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                Opportunity Details
              </CardTitle>
              <CardDescription>
                Describe your opportunity to generate personalized outreach messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., We're hosting a tango festival in July and looking for experienced instructors to teach workshops on traditional Argentine tango techniques."
                value={opportunityDesc}
                onChange={(e) => setOpportunityDesc(e.target.value)}
                rows={4}
                data-testid="input-opportunity-desc"
              />
            </CardContent>
          </Card>

          {/* Generated Outreach Message */}
          {outreachMessage && selectedCandidate && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-green-600" />
                  Generated Outreach for {selectedCandidate.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Subject:</div>
                  <div className="p-3 bg-white rounded-md border">
                    {outreachMessage.subject}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Message:</div>
                  <div className="p-4 bg-white rounded-md border whitespace-pre-wrap">
                    {outreachMessage.message}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" data-testid="button-send-outreach">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid="button-edit-outreach">
                    Edit Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {results.length === 0 && !searchMutation.isPending && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Search Results</h3>
                <p className="text-muted-foreground">
                  Enter a search query above to find talent
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </>
    </PageLayout>
  );
}
