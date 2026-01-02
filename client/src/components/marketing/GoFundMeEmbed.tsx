import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface GoFundMeEmbedProps {
  showCard?: boolean;
  title?: string;
  description?: string;
}

export function GoFundMeEmbed({ 
  showCard = true, 
  title = "Support Mundo Tango",
  description = "Help us build the platform the tango community deserves"
}: GoFundMeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "https://www.gofundme.com/static/js/embed.js";
      script.defer = true;
      document.body.appendChild(script);
      scriptLoaded.current = true;
    }
  }, []);

  const embedContent = (
    <div 
      ref={containerRef}
      className="gfm-embed" 
      data-url="https://www.gofundme.com/f/join-us-in-bringing-mundo-tango-to-life/widget/medium?sharesheet=undefined&attribution_id=sl:78961690-0cb7-4d9b-8b5a-2188804e707a"
      data-testid="gofundme-embed"
    />
  );

  if (!showCard) {
    return embedContent;
  }

  return (
    <Card className="overflow-hidden" data-testid="gofundme-card">
      <CardHeader className="text-center">
        <div className="w-12 h-12 rounded-full ocean-gradient mx-auto flex items-center justify-center mb-4">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        {embedContent}
      </CardContent>
    </Card>
  );
}
