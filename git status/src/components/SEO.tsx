import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
}

const DEFAULT_TITLE = "Mundo Tango";
const DEFAULT_DESCRIPTION = "Connect with the global tango community. Discover events, join groups, and share your passion for Argentine tango.";
const DEFAULT_OG_IMAGE = "/favicon.png";

export function SEO({ 
  title, 
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl
}: SEOProps) {
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;

  useEffect(() => {
    document.title = fullTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    const setOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute("content", content);
      } else {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    };

    setOrCreateMeta("og:title", fullTitle);
    setOrCreateMeta("og:description", description);
    setOrCreateMeta("og:image", ogImage);
    setOrCreateMeta("og:url", ogUrl || window.location.href);
    setOrCreateMeta("og:type", "website");

    setOrCreateMeta("twitter:card", "summary_large_image");
    setOrCreateMeta("twitter:title", fullTitle);
    setOrCreateMeta("twitter:description", description);
    setOrCreateMeta("twitter:image", ogImage);
  }, [fullTitle, description, ogImage, ogUrl]);

  return null;
}
