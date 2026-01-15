import { useAuth } from "@/contexts/AuthContext";

const GOD_LEVEL_ROLES = ['super_admin', 'admin', 'god', 'founder'];
const GOD_LEVEL_EMAILS = ['admin@mundotango.life', 'founder@mundotango.life'];
const GOD_LEVEL_THRESHOLD = 8;

export function useUserTier() {
  const { user } = useAuth();
  
  const roleLevel = (user as any)?.roleLevel ?? 0;
  const userRole = user?.role?.toLowerCase() || '';
  const userEmail = user?.email?.toLowerCase() || '';
  
  const isGodLevel = 
    roleLevel >= GOD_LEVEL_THRESHOLD ||
    GOD_LEVEL_ROLES.includes(userRole) ||
    GOD_LEVEL_EMAILS.includes(userEmail);
  
  const isStandard = !isGodLevel;
  
  return {
    isGodLevel,
    isStandard,
    userRole,
    userEmail,
    roleLevel,
  };
}
