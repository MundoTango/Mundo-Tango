import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiX, SiLinkedin } from 'react-icons/si';
import { Globe, Mail, Calendar, Star, MessageCircle } from 'lucide-react';
import ContactForm from '@/components/pro/ContactForm';

interface ProPageData {
  id: number;
  name: string;
  bio: string;
  photo: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    website?: string;
  };
  galleryEnabled: boolean;
  photos: string[];
  testimonialsEnabled: boolean;
  testimonials: { id: number; text: string; author: string }[];
  proPageContactEmail?: string;
}

export default function ProPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery<ProPageData>({
    queryKey: ['/api/pro/page', slug],
    queryFn: async () => {
      const response = await fetch(`/api/pro/page/${slug}`);
      if (!response.ok) throw new Error('Pro page not found');
      return response.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4" data-testid="loading-pro-page">
        <div className="flex flex-col items-center gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center" data-testid="error-pro-page">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">This professional page doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${data.name} | Mundo Tango`}
        description={data.bio || `Professional profile of ${data.name}`}
      />
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <section className="flex flex-col items-center text-center mb-12" data-testid="profile-section">
          <Avatar className="h-32 w-32 mb-6">
            <AvatarImage src={data.photo} alt={data.name} />
            <AvatarFallback className="text-4xl">
              {data.name?.charAt(0)?.toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold mb-3" data-testid="text-name">{data.name}</h1>
          {data.bio && (
            <p className="text-muted-foreground max-w-2xl" data-testid="text-bio">{data.bio}</p>
          )}

          <div className="flex gap-3 mt-6">
            {data.socialLinks?.instagram && (
              <a href={data.socialLinks.instagram} target="_blank" rel="noopener noreferrer" 
                 className="p-2 rounded-full hover-elevate" data-testid="link-instagram">
                <SiInstagram className="w-5 h-5" />
              </a>
            )}
            {data.socialLinks?.facebook && (
              <a href={data.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                 className="p-2 rounded-full hover-elevate" data-testid="link-facebook">
                <SiFacebook className="w-5 h-5" />
              </a>
            )}
            {data.socialLinks?.youtube && (
              <a href={data.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                 className="p-2 rounded-full hover-elevate" data-testid="link-youtube">
                <SiYoutube className="w-5 h-5" />
              </a>
            )}
            {data.socialLinks?.twitter && (
              <a href={data.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                 className="p-2 rounded-full hover-elevate" data-testid="link-twitter">
                <SiX className="w-5 h-5" />
              </a>
            )}
            {data.socialLinks?.linkedin && (
              <a href={data.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                 className="p-2 rounded-full hover-elevate" data-testid="link-linkedin">
                <SiLinkedin className="w-5 h-5" />
              </a>
            )}
            {data.socialLinks?.tiktok && (
              <a href={data.socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                 className="p-2 rounded-full hover-elevate" data-testid="link-tiktok">
                <SiTiktok className="w-5 h-5" />
              </a>
            )}
            {data.socialLinks?.website && (
              <a href={data.socialLinks.website} target="_blank" rel="noopener noreferrer"
                 className="p-2 rounded-full hover-elevate" data-testid="link-website">
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        </section>

        <Separator className="my-8" />

        {data.galleryEnabled && data.photos?.length > 0 && (
          <section className="mb-12" data-testid="gallery-section">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.photos.map((photo, index) => (
                <img 
                  key={index}
                  src={photo} 
                  alt={`Gallery ${index + 1}`}
                  className="rounded-lg object-cover aspect-square"
                  data-testid={`img-gallery-${index}`}
                />
              ))}
            </div>
          </section>
        )}

        {data.testimonialsEnabled && data.testimonials?.length > 0 && (
          <section className="mb-12" data-testid="testimonials-section">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-5 h-5" /> Testimonials
            </h2>
            <div className="space-y-4">
              {data.testimonials.map((testimonial) => (
                <Card key={testimonial.id} data-testid={`card-testimonial-${testimonial.id}`}>
                  <CardContent className="pt-6">
                    <p className="italic mb-2">"{testimonial.text}"</p>
                    <p className="text-sm text-muted-foreground">— {testimonial.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section data-testid="contact-section">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Contact {data.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm proUserId={data.id} onSuccess={() => {}} />
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
