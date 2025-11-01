import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'profile';
  canonicalUrl?: string;
}

export function SEOHead({
  title,
  description,
  keywords = [],
  image = '/og-default.jpg',
  type = 'website',
  canonicalUrl,
}: SEOHeadProps) {
  useEffect(() => {
    // Set page title
    document.title = title;
    
    // Update meta tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords.join(', '));
    
    // Open Graph
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:image', `${window.location.origin}${image}`);
    updateMetaTag('property', 'og:url', canonicalUrl || window.location.href);
    
    // Twitter Card
    updateMetaTag('property', 'twitter:card', 'summary_large_image');
    updateMetaTag('property', 'twitter:title', title);
    updateMetaTag('property', 'twitter:description', description);
    updateMetaTag('property', 'twitter:image', `${window.location.origin}${image}`);
    
    // Canonical URL
    if (canonicalUrl) {
      updateCanonicalLink(canonicalUrl);
    }
  }, [title, description, keywords, image, type, canonicalUrl]);
  
  return null; // This component doesn't render anything
}

function updateMetaTag(attribute: 'name' | 'property', value: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${value}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  
  link.href = url;
}

// Structured Data helper
export function addStructuredData(data: object) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}
