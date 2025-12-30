import { FC } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileWebsiteFieldProps {
  website: string;
  onWebsiteChange: (url: string) => void;
  onAnalyze: () => void;
}

const ProfileWebsiteField: FC<ProfileWebsiteFieldProps> = ({ website, onWebsiteChange, onAnalyze }) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="url"
        value={website}
        onChange={(e) => onWebsiteChange(e.target.value)}
        placeholder="https://yourwebsite.com"
      />
      <Button onClick={onAnalyze}>Analyze</Button>
    </div>
  );
};

export default ProfileWebsiteField;