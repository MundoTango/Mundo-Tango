import { useTranslation } from "react-i18next";
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
import { Search, Send, Sparkles, MessageSquare, Star, MapPin, Briefcase, Languages, Globe } from 'lucide-react';
import { UnifiedLanguagePicker, getLanguageByCode, TOP_10_LANGUAGES } from '@/components/input/UnifiedLanguagePicker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function EnhancedTalentMatch() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [opportunityDesc, setOpportunityDesc] = useState('');
  const [outreachMessage, setOutreachMessage] = useState<any>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [requireAllLanguages, setRequireAllLanguages] = useState(false);
  const [showLanguageFilters, setShowLanguageFilters] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest('/api/talent-match/search', 'POST', { 
        query: searchQuery, 
        limit: 20,
        languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
        languageMatchMode: requireAllLanguages ? 'all' : 'any'
      });
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

              {/* Language Filter Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLanguageFilters(!showLanguageFilters)}
                  className="gap-2"
                  data-testid="button-toggle-language-filters"
                >
                  <Languages className="h-4 w-4" />
                  {showLanguageFilters ? 'Hide' : 'Show'} Language Filters
                  {selectedLanguages.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedLanguages.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Language Filters */}
              {showLanguageFilters && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Filter by Languages Spoken
                    </Label>
                    <UnifiedLanguagePicker
                      mode="additional"
                      value={selectedLanguages}
                      onChange={(value) => setSelectedLanguages(value as string[])}
                      placeholder="Select languages..."
                      data-testid="select-languages"
                    />
                  </div>
                  
                  {selectedLanguages.length > 1 && (
                    <div className="flex items-center gap-3">
                      <Switch
                        id="require-all-languages"
                        checked={requireAllLanguages}
                        onCheckedChange={setRequireAllLanguages}
                        data-testid="switch-require-all-languages"
                      />
                      <Label htmlFor="require-all-languages" className="text-sm cursor-pointer">
                        Must speak ALL selected languages
                      </Label>
                    </div>
                  )}
                  
                  {selectedLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedLanguages.map((code) => {
                        const lang = getLanguageByCode(code);
                        return (
                          <Badge key={code} variant="secondary" className="gap-1">
                            {lang?.flag} {lang?.name || code}
                            <button
                              onClick={() => setSelectedLanguages(prev => prev.filter(l => l !== code))}
                              className="ml-1 hover:text-destructive"
                              data-testid={`button-remove-language-${code}`}
                            >
                              x
                            </button>
                          </Badge>
                        );
                      })}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLanguages([])}
                        data-testid="button-clear-languages"
                      >
                        Clear all
                      </Button>
                    </div>
                  )}
                  
                  {/* Quick Language Select */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Quick select:</Label>
                    <div className="flex flex-wrap gap-1">
                      {TOP_10_LANGUAGES.map((lang) => (
                        <Button
                          key={lang.code}
                          variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (selectedLanguages.includes(lang.code)) {
                              setSelectedLanguages(prev => prev.filter(l => l !== lang.code));
                            } else {
                              setSelectedLanguages(prev => [...prev, lang.code]);
                            }
                          }}
                          data-testid={`button-quick-language-${lang.code}`}
                        >
                          {lang.flag} {lang.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Example Searches */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {[
                  'DJ with 5+ years experience',
                  'Spanish-speaking dance instructor',
                  'Teacher who speaks Portuguese',
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
                              {(candidate.city || candidate.country) && (
                                <Badge variant="outline">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {candidate.city}{candidate.city && candidate.country ? ', ' : ''}{candidate.country}
                                </Badge>
                              )}
                              {candidate.specialties?.length > 0 && (
                                <Badge variant="outline">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {candidate.specialties[0]}
                                </Badge>
                              )}
                              <Badge variant="default">
                                <Star className="h-3 w-3 mr-1" />
                                {(candidate.semanticScore || 0.85).toFixed(2)} match
                              </Badge>
                              {candidate.languageMatchScore > 0.5 && (
                                <Badge variant="secondary" className="gap-1">
                                  <Languages className="h-3 w-3" />
                                  {Math.round(candidate.languageMatchScore * 100)}% language match
                                </Badge>
                              )}
                            </div>

                            {/* Language display */}
                            {candidate.languages && candidate.languages.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                {candidate.languages.slice(0, 4).map((langCode: string) => {
                                  const lang = getLanguageByCode(langCode);
                                  return (
                                    <span key={langCode} className="text-xs text-muted-foreground">
                                      {lang?.flag} {lang?.name || langCode}
                                    </span>
                                  );
                                })}
                                {candidate.languages.length > 4 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{candidate.languages.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Match Reasons */}
                            {candidate.matchReasons && candidate.matchReasons.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {candidate.matchReasons.slice(0, 3).map((reason: string, idx: number) => (
                                  <span key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            )}

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
