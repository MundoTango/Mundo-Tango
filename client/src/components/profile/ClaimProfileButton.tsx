import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, Clock } from "lucide-react";
import { ClaimProfileModal } from "./ClaimProfileModal";
import { useAuth } from "@/hooks/useAuth";

interface ClaimProfileButtonProps {
  profileType: "venue" | "teacher" | "dj" | "musician";
  profileId: number;
  profileName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

interface ClaimStatus {
  isClaimed: boolean;
  claimedByUserId: number | null;
  hasPendingClaim: boolean;
}

export function ClaimProfileButton({
  profileType,
  profileId,
  profileName,
  variant = "outline",
  size = "default",
  className,
}: ClaimProfileButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const { data: claimStatus, isLoading } = useQuery<ClaimStatus>({
    queryKey: ["/api/profiles/status", profileType, profileId],
    queryFn: async () => {
      const response = await fetch(`/api/profiles/status/${profileType}/${profileId}`);
      if (!response.ok) throw new Error("Failed to fetch claim status");
      return response.json();
    },
    enabled: !!profileId,
  });

  if (isLoading) {
    return null;
  }

  if (claimStatus?.isClaimed) {
    const isOwner = user?.id === claimStatus.claimedByUserId;
    
    if (isOwner) {
      return (
        <Badge 
          variant="secondary" 
          className="gap-1.5 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
          data-testid="badge-profile-owned"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          You own this profile
        </Badge>
      );
    }

    return (
      <Badge 
        variant="secondary" 
        className="gap-1.5"
        data-testid="badge-profile-claimed"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Verified Owner
      </Badge>
    );
  }

  if (claimStatus?.hasPendingClaim) {
    return (
      <Badge 
        variant="secondary" 
        className="gap-1.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
        data-testid="badge-claim-pending"
      >
        <Clock className="h-3.5 w-3.5" />
        Claim Pending
      </Badge>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        }}
        data-testid="button-claim-login"
      >
        <Shield className="h-4 w-4 mr-2" />
        Claim This Profile
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsModalOpen(true)}
        data-testid="button-claim-profile"
      >
        <Shield className="h-4 w-4 mr-2" />
        Claim This Profile
      </Button>

      <ClaimProfileModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        profileType={profileType}
        profileId={profileId}
        profileName={profileName}
      />
    </>
  );
}
