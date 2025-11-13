import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Users } from "lucide-react";

interface TemplateCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  usageCount: number;
  isPremium: boolean;
  price?: number;
  onPreview?: () => void;
  onUse?: () => void;
}

export function TemplateCard({
  id,
  title,
  description,
  category,
  usageCount,
  isPremium,
  price,
  onPreview,
  onUse,
}: TemplateCardProps) {
  return (
    <Card className="hover-elevate transition-all h-full flex flex-col">
      <CardContent className="p-6 flex-1">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            {isPremium && (
              <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                Premium
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Badge variant="secondary">{category}</Badge>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{usageCount} uses</span>
            </div>
          </div>

          {price && price > 0 && (
            <div className="pt-2">
              <span className="text-2xl font-bold">${price}</span>
              <span className="text-sm text-muted-foreground ml-1">one-time</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 gap-2">
        <Button
          variant="outline"
          onClick={onPreview}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          onClick={onUse}
          className="flex-1"
          data-testid="button-create-from-template"
        >
          <Download className="w-4 h-4 mr-2" />
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}
