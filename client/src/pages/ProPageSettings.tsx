import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link } from 'wouter';
import { Save, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const proPageSettingsSchema = z.object({
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  galleryEnabled: z.boolean(),
  eventsEnabled: z.boolean(),
  testimonialsEnabled: z.boolean(),
});

type ProPageSettingsData = z.infer<typeof proPageSettingsSchema>;

interface SlugAvailability {
  available: boolean;
  checking: boolean;
}

export default function ProPageSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [slugAvailability, setSlugAvailability] = useState<SlugAvailability>({ available: true, checking: false });

  const { data: settings, isLoading } = useQuery<ProPageSettingsData>({
    queryKey: ['/api/pro/settings'],
  });

  const form = useForm<ProPageSettingsData>({
    resolver: zodResolver(proPageSettingsSchema),
    defaultValues: {
      slug: '',
      contactEmail: '',
      galleryEnabled: true,
      eventsEnabled: true,
      testimonialsEnabled: false,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const slug = form.watch('slug');

  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailability({ available: true, checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setSlugAvailability({ available: false, checking: true });
      try {
        const response = await fetch(`/api/pro/check-slug/${slug}`);
        const data = await response.json();
        setSlugAvailability({ available: data.available, checking: false });
      } catch {
        setSlugAvailability({ available: false, checking: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const saveMutation = useMutation({
    mutationFn: async (data: ProPageSettingsData) => {
      return apiRequest('PUT', '/api/pro/settings', data);
    },
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'Your pro page settings have been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pro/settings'] });
    },
    onError: () => {
      toast({
        title: 'Failed to save settings',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProPageSettingsData) => {
    if (!slugAvailability.available && data.slug !== settings?.slug) {
      toast({
        title: 'Slug unavailable',
        description: 'Please choose a different URL slug.',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <PageLayout title="Pro Page Settings" showBreadcrumbs>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Pro Page Settings" showBreadcrumbs>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Professional Page Settings</CardTitle>
            <CardDescription>
              Configure your public professional page that showcases your profile to the world.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page URL</FormLabel>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">mundotango.life/</span>
                        <FormControl>
                          <Input 
                            placeholder="your-name" 
                            {...field} 
                            data-testid="input-slug"
                            className="flex-1"
                          />
                        </FormControl>
                        {slug && slug.length >= 3 && (
                          slugAvailability.checking ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          ) : slugAvailability.available ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )
                        )}
                      </div>
                      <FormDescription>
                        This will be your public page URL. Only lowercase letters, numbers, and hyphens allowed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="contact@example.com" 
                          {...field} 
                          data-testid="input-contact-email"
                        />
                      </FormControl>
                      <FormDescription>
                        When visitors contact you through your pro page, you'll receive their message. 
                        Your replies will be sent from this email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Section Visibility</h3>
                  
                  <FormField
                    control={form.control}
                    name="galleryEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Photo Gallery</FormLabel>
                          <FormDescription>
                            Display your photos on your pro page
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="toggle-gallery"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Upcoming Events</FormLabel>
                          <FormDescription>
                            Show events you're hosting or participating in
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="toggle-events"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testimonialsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Testimonials</FormLabel>
                          <FormDescription>
                            Display reviews and testimonials from others
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="toggle-testimonials"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  {slug && slug.length >= 3 && slugAvailability.available && (
                    <Link href={`/${slug}`} target="_blank">
                      <Button variant="outline" type="button" data-testid="button-preview">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Preview Page
                      </Button>
                    </Link>
                  )}
                  <Button 
                    type="submit" 
                    disabled={saveMutation.isPending}
                    data-testid="button-save"
                    className="ml-auto"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
