import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Languages, 
  Search,
  AlertCircle,
  CheckCircle,
  Download,
  Upload
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";

interface Translation {
  key: string;
  english: string;
  translated: string;
  status: 'complete' | 'missing' | 'outdated';
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export default function AdminTranslationsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock translation data
  const mockTranslations: Translation[] = [
    {
      key: 'common.welcome',
      english: 'Welcome to Mundo Tango',
      translated: 'Bienvenido a Mundo Tango',
      status: 'complete'
    },
    {
      key: 'common.dashboard',
      english: 'Dashboard',
      translated: 'Panel de Control',
      status: 'complete'
    },
    {
      key: 'common.profile',
      english: 'Profile',
      translated: 'Perfil',
      status: 'complete'
    },
    {
      key: 'common.settings',
      english: 'Settings',
      translated: '',
      status: 'missing'
    },
    {
      key: 'events.create',
      english: 'Create Event',
      translated: 'Crear Evento',
      status: 'complete'
    },
  ];

  const { data: translations = mockTranslations } = useQuery<Translation[]>({
    queryKey: ["/api/admin/translations", selectedLanguage],
  });

  const filteredTranslations = translations.filter(t => 
    t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.translated.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalKeys: translations.length,
    complete: translations.filter(t => t.status === 'complete').length,
    missing: translations.filter(t => t.status === 'missing').length,
    outdated: translations.filter(t => t.status === 'outdated').length,
    completionRate: Math.round((translations.filter(t => t.status === 'complete').length / translations.length) * 100)
  };

  return (
    <SelfHealingErrorBoundary pageName="Translation Management" fallbackRoute="/admin">
      <SEO 
        title="Translation Management"
        description="Manage i18next translations across 68 languages for Mundo Tango platform"
        ogImage="/og-image.png"
      />
      <PageLayout title="Translation Management" showBreadcrumbs>
        <div className="container mx-auto p-6 space-y-6" data-testid="page-translations">
          
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card data-testid="stat-total-keys">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
                <Languages className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalKeys}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-complete">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Complete</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.complete}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-missing">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missing</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.missing}</div>
              </CardContent>
            </Card>

            <Card data-testid="stat-completion">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion</CardTitle>
                <Languages className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{stats.completionRate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Language Selector & Actions */}
          <Card data-testid="card-language-selector">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>i18next Translation Editor</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" data-testid="button-export">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" data-testid="button-import">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-64" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search translation keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Managing translations for <strong>{LANGUAGES.find(l => l.code === selectedLanguage)?.name}</strong> • 
                68 languages supported via i18next
              </p>
            </CardContent>
          </Card>

          {/* Translations List */}
          <Card data-testid="card-translations-list">
            <CardHeader>
              <CardTitle>Translation Keys</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTranslations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No translations found
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTranslations.map((translation, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 border rounded-lg hover-elevate"
                      data-testid={`translation-${idx}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <code className="text-sm text-blue-600" data-testid={`key-${idx}`}>
                          {translation.key}
                        </code>
                        <Badge 
                          variant={
                            translation.status === 'complete' ? 'default' : 
                            translation.status === 'missing' ? 'destructive' : 
                            'secondary'
                          }
                          data-testid={`status-${idx}`}
                        >
                          {translation.status}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">English</label>
                          <p className="text-sm" data-testid={`english-${idx}`}>{translation.english}</p>
                        </div>
                        
                        <div>
                          <label className="text-xs text-muted-foreground">
                            {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                          </label>
                          {translation.status === 'missing' ? (
                            <Input 
                              placeholder="Enter translation..."
                              className="text-sm"
                              data-testid={`input-translation-${idx}`}
                            />
                          ) : (
                            <p className="text-sm" data-testid={`translation-${idx}`}>
                              {translation.translated}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supported Languages */}
          <Card data-testid="card-supported-languages">
            <CardHeader>
              <CardTitle>Supported Languages (68 total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className="justify-start"
                    data-testid={`lang-${lang.code}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                + 58 more languages available via i18next configuration
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
