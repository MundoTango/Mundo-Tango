import skootImage from "@assets/stock_images/tango_dancers_in_ele_003ee0cf.jpg";
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNavbar } from '@/components/PublicNavbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SiInstagram, SiFacebook, SiYoutube, SiTiktok, SiX, SiLinkedin } from 'react-icons/si';
import { Globe, Mail, Calendar, Star, MessageCircle, ArrowRight, Music, Users, Sparkles, CheckCircle, MapPin, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProPageData {
  id: number;
  name: string;
  bio: string;
  photo: string;
  city?: string;
  country?: string;
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
  // PRO profile fields
  specialties?: string[];
  yearsOfExperience?: number | null;
  founderTitle?: string | null;
}

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

function ScrollRevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

function GlassmorphicContactForm({ proUserId, proName, onSuccess }: { proUserId: number; proName: string; onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest('POST', '/api/pro/contact', { ...data, proUserId });
    },
    onSuccess: () => {
      toast({
        title: 'Message sent!',
        description: `Your message has been delivered to ${proName}.`,
      });
      form.reset();
      onSuccess();
    },
    onError: () => {
      toast({
        title: 'Failed to send message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="contact-form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90">Your Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400" 
                  {...field} 
                  data-testid="input-name" 
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90">Email Address</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="you@example.com" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400" 
                  {...field} 
                  data-testid="input-email" 
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90">Phone (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+1 (555) 123-4567" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400" 
                  {...field} 
                  data-testid="input-phone" 
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90">Your Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="I'd love to connect about..." 
                  className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 resize-none"
                  {...field} 
                  data-testid="input-message" 
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={submitMutation.isPending}
          className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold py-6 text-lg transition-all hover:scale-[1.02]"
          data-testid="button-send"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

function SuccessView({ proName }: { proName: string }) {
  return (
    <div className="text-center py-8" data-testid="success-view">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
      </motion.div>
      <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
      <p className="text-white/70 mb-8">
        {proName} will receive your message and get back to you soon.
      </p>
      
      <div className="space-y-4">
        <p className="text-sm text-white/60 uppercase tracking-wide">While you wait, explore Mundo Tango</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              data-testid="button-explore-platform"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Platform
            </Button>
          </Link>
          <Link href="/events">
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              data-testid="button-explore-events"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Find Events
            </Button>
          </Link>
          <Link href="/register">
            <Button 
              className="bg-white text-blue-600 hover:bg-white/90"
              data-testid="button-join-free"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProPage() {
  const { slug } = useParams<{ slug: string }>();
  const [messageSent, setMessageSent] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600">
        <PublicNavbar />
        <div className="container max-w-4xl mx-auto py-20 px-4" data-testid="loading-pro-page">
          <div className="flex flex-col items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full bg-white/20" />
            <Skeleton className="h-8 w-48 bg-white/20" />
            <Skeleton className="h-4 w-96 bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600">
        <PublicNavbar />
        <div className="container max-w-4xl mx-auto py-20 px-4 text-center" data-testid="error-pro-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-12"
          >
            <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
            <p className="text-white/70 mb-8">This professional page doesn't exist or has been removed.</p>
            <Link href="/">
              <Button className="bg-white text-blue-600 hover:bg-white/90" data-testid="button-go-home">
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Mundo Tango
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { key: 'instagram', icon: SiInstagram, url: data.socialLinks?.instagram, color: 'hover:text-pink-400' },
    { key: 'facebook', icon: SiFacebook, url: data.socialLinks?.facebook, color: 'hover:text-blue-400' },
    { key: 'youtube', icon: SiYoutube, url: data.socialLinks?.youtube, color: 'hover:text-red-400' },
    { key: 'twitter', icon: SiX, url: data.socialLinks?.twitter, color: 'hover:text-white' },
    { key: 'linkedin', icon: SiLinkedin, url: data.socialLinks?.linkedin, color: 'hover:text-blue-300' },
    { key: 'tiktok', icon: SiTiktok, url: data.socialLinks?.tiktok, color: 'hover:text-white' },
    { key: 'website', icon: Globe, url: data.socialLinks?.website, color: 'hover:text-cyan-400' },
  ].filter(link => link.url);

  return (
    <>
      <SEO 
        title={`${data.name} | Mundo Tango`}
        description={data.bio || `Professional profile of ${data.name}`}
      />
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        
        {/* Hero Section with Gradient */}
        <section className="relative overflow-hidden" data-testid="hero-section">
          {/* MT Ocean Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          
          {/* Floating decorative elements */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-10 text-white/10 hidden lg:block"
          >
            <Music size={120} />
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-40 left-10 text-white/10 hidden lg:block"
          >
            <Sparkles size={80} />
          </motion.div>

          <div className="relative z-10 container max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Profile Card */}
              <ScrollRevealSection>
                <motion.div 
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 md:p-10"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  data-testid="profile-card"
                >
                  <div className="flex flex-col items-center text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Avatar className="h-32 w-32 md:h-40 md:w-40 mb-6 ring-4 ring-white/30">
                        <AvatarImage src={data.photo || skootImage} alt={data.name} />
                        <AvatarFallback className="text-5xl bg-gradient-to-br from-cyan-400 to-purple-500 text-white">
                          <img src={skootImage} alt={data.name} className="h-full w-full object-cover" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    
                    <Badge className="mb-4 bg-cyan-500/20 text-cyan-200 border-cyan-400/30" data-testid="badge-pro">
                      <Star className="w-3 h-3 mr-1" /> {data.id === 862 || data.id === 1059 ? 'Founder of Mundo Tango' : (data.founderTitle || 'PRO Member')}
                    </Badge>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" data-testid="text-name">
                      {data.name}
                    </h1>
                    
                    {(data.city || data.country) && (
                      <p className="text-white/70 flex items-center gap-1 mb-4" data-testid="text-location">
                        <MapPin className="w-4 h-4" />
                        {[data.city, data.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    
                    {/* Years of Experience */}
                    {data.yearsOfExperience && data.yearsOfExperience > 0 && (
                      <p className="text-white/70 flex items-center gap-1 mb-3" data-testid="text-experience">
                        <Calendar className="w-4 h-4" />
                        {data.yearsOfExperience}+ years of tango experience
                      </p>
                    )}
                    
                    {/* Specialties */}
                    {data.specialties && data.specialties.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-4" data-testid="specialties-container">
                        {data.specialties.map((specialty, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="bg-white/5 text-white/80 border-white/20"
                            data-testid={`badge-specialty-${index}`}
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {data.bio && (
                      <p className="text-white/80 text-lg leading-relaxed max-w-md" data-testid="text-bio">
                        {data.bio}
                      </p>
                    )}
                  </div>

                  {/* Social Links */}
                  {socialLinks.length > 0 && (
                    <div className="flex justify-center gap-3 flex-wrap">
                      {socialLinks.map(({ key, icon: Icon, url, color }) => (
                        <a 
                          key={key}
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={cn(
                            "p-3 rounded-full bg-white/10 border border-white/20 text-white/70 transition-all hover:bg-white/20",
                            color
                          )}
                          data-testid={`link-${key}`}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              </ScrollRevealSection>

              {/* Contact Form Card */}
              <ScrollRevealSection delay={0.2}>
                <motion.div 
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 md:p-10"
                  data-testid="contact-card"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <MessageCircle className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {messageSent ? 'Thank You!' : `Contact ${data.name.split(' ')[0]}`}
                    </h2>
                  </div>
                  
                  {messageSent ? (
                    <SuccessView proName={data.name} />
                  ) : (
                    <GlassmorphicContactForm 
                      proUserId={data.id} 
                      proName={data.name}
                      onSuccess={() => setMessageSent(true)} 
                    />
                  )}
                </motion.div>
              </ScrollRevealSection>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        {data.galleryEnabled && data.photos?.length > 0 && (
          <ScrollRevealSection delay={0.1}>
            <section className="py-16 px-4" data-testid="gallery-section">
              <div className="container max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
                  <div className="p-2 rounded-lg ocean-gradient">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.photos.map((photo, index) => (
                    <motion.img 
                      key={index}
                      src={photo} 
                      alt={`Gallery ${index + 1}`}
                      className="rounded-xl object-cover aspect-square hover:scale-105 transition-transform duration-300"
                      whileHover={{ scale: 1.02 }}
                      data-testid={`img-gallery-${index}`}
                    />
                  ))}
                </div>
              </div>
            </section>
          </ScrollRevealSection>
        )}

        {/* Testimonials Section */}
        {data.testimonialsEnabled && data.testimonials?.length > 0 && (
          <ScrollRevealSection delay={0.1}>
            <section className="py-16 px-4 bg-muted/30" data-testid="testimonials-section">
              <div className="container max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
                  <div className="p-2 rounded-lg ocean-gradient">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  What People Say
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {data.testimonials.map((testimonial, index) => (
                    <motion.div 
                      key={testimonial.id}
                      className="bg-card border rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      data-testid={`card-testimonial-${testimonial.id}`}
                    >
                      <p className="text-lg italic text-muted-foreground mb-4">"{testimonial.text}"</p>
                      <p className="font-semibold">— {testimonial.author}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </ScrollRevealSection>
        )}

        {/* Explore Mundo Tango CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 relative overflow-hidden" data-testid="section-cta">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 container max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join the Global Tango Community
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Connect with dancers worldwide, discover events, and be part of something extraordinary.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-white/90 text-lg px-8 py-6 shadow-xl transition-all hover:scale-105"
                    data-testid="button-join-community"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Join Free
                  </Button>
                </Link>
                <Link href="/">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 backdrop-blur-sm transition-all hover:scale-105"
                    data-testid="button-learn-more"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t bg-card">
          <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 ocean-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MT</span>
              </div>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Mundo Tango. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Privacy</span>
              </Link>
              <Link href="/terms">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Terms</span>
              </Link>
              <Link href="/support">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Help</span>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
