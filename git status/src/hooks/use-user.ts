import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to get the current user
 * This is a wrapper around useAuth() that provides just the user object
 * Compatible with components expecting a { user } return value
 */
export function useUser() {
  const auth = useAuth();
  
  return {
    user: auth.user,
    isLoading: auth.isLoading,
  };
}

export default useUser;
