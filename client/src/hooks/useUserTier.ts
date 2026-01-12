import { useAuth } from "@/contexts/AuthContext";

const GOD_LEVEL_ROLES = ['super_admin', 'admin', 'god', 'founder'];
const GOD_LEVEL_EMAILS = ['admin@mundotango.life', 'founder@mundotango.life'];

export function useUserTier() {
  const { user } = useAuth();
  
  const userRole = user?.role?.toLowerCase() || '';
  const userEmail = user?.email?.toLowerCase() || '';
  
  const isGodLevel = GOD_LEVEL_ROLES.includes(userRole) || GOD_LEVEL_EMAILS.includes(userEmail);
  const isStandard = !isGodLevel;
  
  return {
    isGodLevel,
    isStandard,
    userRole,
    userEmail,
  };
}
