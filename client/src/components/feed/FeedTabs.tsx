import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Compass } from "lucide-react";
import { useTranslation } from "react-i18next";

type FeedType = "following" | "discover";

interface FeedTabsProps {
  value: FeedType;
  onChange: (type: FeedType) => void;
}

export function FeedTabs({ value, onChange }: FeedTabsProps) {
  const { t } = useTranslation("pages");

  return (
    <div className="w-full mb-6" data-testid="feed-tabs">
      <Tabs value={value} onValueChange={(v) => onChange(v as FeedType)}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger
            value="following"
            className="flex items-center gap-2"
            data-testid="tab-following"
          >
            <Users className="h-4 w-4" />
            <span>{t("feed.tabs.following")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="discover"
            className="flex items-center gap-2"
            data-testid="tab-discover"
          >
            <Compass className="h-4 w-4" />
            <span>{t("feed.tabs.discover")}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
