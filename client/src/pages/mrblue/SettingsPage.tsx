import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Save, Settings, Volume2, Globe, Lock, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface AISettings {
  personality: 'casual' | 'formal' | 'technical';
  voiceId: string;
  language: string;
  contextMemory: boolean;
  maxContextLength: number;
  privacyMode: boolean;
  trainingOptIn: boolean;
  autoSave: boolean;
  temperature: number;
}

export default function SettingsPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<AISettings>({
    queryKey: ['/api/mrblue/settings'],
  });

  const [formData, setFormData] = useState<Partial<AISettings>>({});

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<AISettings>) => {
      const response = await apiRequest('PUT', '/api/mrblue/settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/settings'] });
      toast({
        title: 'Settings Saved',
        description: 'Your AI assistant settings have been updated.',
      });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="page-ai-settings">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('pages:mrblue.settings.title', 'AI Assistant Settings')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('pages:mrblue.settings.subtitle', "Customize Mr Blue's personality and behavior")}
          </p>
        </div>
        <Button onClick={handleSave} data-testid="button-save-settings">
          <Save className="h-4 w-4 mr-2" />
          {t('pages:mrblue.settings.saveChanges', 'Save Changes')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-personality">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('pages:mrblue.settings.personality', 'Personality')}
            </CardTitle>
            <CardDescription>{t('pages:mrblue.settings.personalityDesc', 'How Mr Blue communicates with you')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pages:mrblue.settings.communicationStyle', 'Communication Style')}</Label>
              <Select
                value={formData.personality ?? settings?.personality}
                onValueChange={(value: any) => setFormData({ ...formData, personality: value })}
              >
                <SelectTrigger data-testid="select-personality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">{t('pages:mrblue.settings.casual', 'Casual & Friendly')}</SelectItem>
                  <SelectItem value="formal">{t('pages:mrblue.settings.formal', 'Formal & Professional')}</SelectItem>
                  <SelectItem value="technical">{t('pages:mrblue.settings.technical', 'Technical & Precise')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('pages:mrblue.settings.responseTemperature', 'Response Temperature')}: {formData.temperature ?? settings?.temperature ?? 0.7}</Label>
              <Slider
                value={[formData.temperature ?? settings?.temperature ?? 0.7]}
                onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
                min={0}
                max={1}
                step={0.1}
                data-testid="slider-temperature"
              />
              <p className="text-xs text-muted-foreground">
                {t('pages:mrblue.settings.temperatureDesc', 'Lower = more focused, Higher = more creative')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-voice">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              {t('pages:mrblue.settings.voice', 'Voice')}
            </CardTitle>
            <CardDescription>{t('pages:mrblue.settings.voiceDesc', 'Voice settings for audio interactions')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pages:mrblue.settings.voiceSelection', 'Voice Selection')}</Label>
              <Select
                value={formData.voiceId ?? settings?.voiceId}
                onValueChange={(value) => setFormData({ ...formData, voiceId: value })}
              >
                <SelectTrigger data-testid="select-voice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US-male-1">English (US) - Male 1</SelectItem>
                  <SelectItem value="en-US-female-1">English (US) - Female 1</SelectItem>
                  <SelectItem value="en-GB-male-1">English (UK) - Male 1</SelectItem>
                  <SelectItem value="en-GB-female-1">English (UK) - Female 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-language">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('pages:mrblue.settings.language', 'Language')}
            </CardTitle>
            <CardDescription>{t('pages:mrblue.settings.languageDesc', 'Preferred language for responses')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('pages:mrblue.settings.languagePreference', 'Language Preference')}</Label>
              <Select
                value={formData.language ?? settings?.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-context-memory">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t('pages:mrblue.settings.contextMemory', 'Context Memory')}
            </CardTitle>
            <CardDescription>{t('pages:mrblue.settings.contextMemoryDesc', 'How Mr Blue remembers your conversations')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('pages:mrblue.settings.enableContextMemory', 'Enable Context Memory')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('pages:mrblue.settings.rememberConversations', 'Remember past conversations')}
                </p>
              </div>
              <Switch
                checked={formData.contextMemory ?? settings?.contextMemory}
                onCheckedChange={(checked) => setFormData({ ...formData, contextMemory: checked })}
                data-testid="switch-context-memory"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('pages:mrblue.settings.maxContextLength', 'Max Context Length')}</Label>
              <Select
                value={String(formData.maxContextLength ?? settings?.maxContextLength)}
                onValueChange={(value) => setFormData({ ...formData, maxContextLength: parseInt(value) })}
              >
                <SelectTrigger data-testid="select-context-length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 messages</SelectItem>
                  <SelectItem value="10">10 messages</SelectItem>
                  <SelectItem value="20">20 messages</SelectItem>
                  <SelectItem value="50">50 messages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('pages:mrblue.settings.autoSaveConversations', 'Auto-save Conversations')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('pages:mrblue.settings.autoSaveDesc', 'Automatically save chat history')}
                </p>
              </div>
              <Switch
                checked={formData.autoSave ?? settings?.autoSave}
                onCheckedChange={(checked) => setFormData({ ...formData, autoSave: checked })}
                data-testid="switch-auto-save"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2" data-testid="card-privacy">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t('pages:mrblue.settings.privacyData', 'Privacy & Data')}
            </CardTitle>
            <CardDescription>{t('pages:mrblue.settings.privacyDataDesc', 'Control your data and privacy preferences')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('pages:mrblue.settings.privacyMode', 'Privacy Mode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('pages:mrblue.settings.privacyModeDesc', "Don't store any conversation data")}
                </p>
              </div>
              <Switch
                checked={formData.privacyMode ?? settings?.privacyMode}
                onCheckedChange={(checked) => setFormData({ ...formData, privacyMode: checked })}
                data-testid="switch-privacy-mode"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('pages:mrblue.settings.trainingOptIn', 'Training Data Opt-in')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('pages:mrblue.settings.trainingOptInDesc', 'Allow anonymized data to improve Mr Blue')}
                </p>
              </div>
              <Switch
                checked={formData.trainingOptIn ?? settings?.trainingOptIn}
                onCheckedChange={(checked) => setFormData({ ...formData, trainingOptIn: checked })}
                data-testid="switch-training-opt-in"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
