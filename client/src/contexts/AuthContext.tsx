import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { SelectUser } from "@shared/client-types";
import i18n from "@/lib/i18n";
import { cacheUserForGodDetection } from "@/lib/godLevelDetection";
import { broadcast, subscribe } from "@/lib/broadcastSync";

const API_BASE_URL = "";

interface ExpressUser {
  id: number;
  email: string;
  username: string;
  name: string;
  isVerified: boolean;
  role: string;
  profileImage?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  isOnboardingComplete?: boolean;
  formStatus?: number;
  tangoRoles?: string[];
  termsAccepted?: boolean;
  waitlist?: boolean;
  primaryLanguage?: string | null;
}

interface Profile {
  id: number;
  username: string;
  name: string;
  email: string;
  profileImage?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  tangoRoles?: string[];
}

interface ProfilePreferences {
  email_notifications?: boolean;
  push_notifications?: boolean;
  profile_visibility?: 'public' | 'friends' | 'private';
  location_sharing?: boolean;
  language?: string;
}

interface Subscription {
  id: number;
  userId: number;
  plan: string;
  status: string;
}

interface AuthContextType {
  user: ExpressUser | null;
  profile: Profile | null;
  session: { accessToken: string } | null;
  isLoading: boolean;
  login: (email: string, password: string, inviteCode?: string) => Promise<{ upgraded?: boolean; requiresVerification?: boolean; verificationEmail?: string }>;
  register: (data: { name: string; username: string; email: string; password: string; inviteCode?: string }) => Promise<{ requiresVerification: boolean; email: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshCurrentUser: () => Promise<boolean>;
  useUpdateAvatar: () => ReturnType<typeof useMutation<string, Error, File, { previousProfile: Profile | null }>>;
  useSubscription: () => ReturnType<typeof useQuery<Subscription | null, Error>>;
  useUpdatePreferences: () => ReturnType<typeof useMutation<void, Error, Partial<ProfilePreferences>>>;
  useFollowUser: () => ReturnType<typeof useMutation<void, Error, number>>;
  useUnfollowUser: () => ReturnType<typeof useMutation<void, Error, number>>;
  useFollowerCount: (userId: number) => ReturnType<typeof useQuery<number, Error>>;
  useFollowingCount: (userId: number) => ReturnType<typeof useQuery<number, Error>>;
  useIsFollowing: (userId: number) => ReturnType<typeof useQuery<boolean, Error>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function refreshAccessToken(): Promise<{ accessToken: string } | null> {
  try {
    // Get CSRF token from cookie
    const csrfMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;
    
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (csrfToken) {
      headers["x-xsrf-token"] = csrfToken;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      localStorage.removeItem("accessToken");
      return null;
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);

    return { accessToken: data.accessToken };
  } catch (error) {
    console.error("Token refresh error:", error);
    localStorage.removeItem("accessToken");
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("No access token");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    const tokens = await refreshAccessToken();
    if (!tokens) {
      throw new Error("Session expired");
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
  }

  return response;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExpressUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<{ accessToken: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  const loadCurrentUser = async (retryCount = 0): Promise<boolean> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/me`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      const userData = data.user;

      setUser(userData);
      setProfile({
        id: userData.id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        profileImage: userData.profileImage,
        bio: userData.bio,
        city: userData.city,
        country: userData.country,
        tangoRoles: userData.tangoRoles || [],
      });

      // Sync site language with user's primary language preference
      if (userData.primaryLanguage) {
        i18n.changeLanguage(userData.primaryLanguage);
        localStorage.setItem('i18nextLng', userData.primaryLanguage);
      }
      
      // MB.MD Pattern 53: Cache user for god-level detection (self-healing)
      cacheUserForGodDetection(userData);

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        setSession({ accessToken });
      }
      
      return true;
    } catch (error: any) {
      // ✅ MB.MD v9.2 Fix: Reduce error spam by only logging once
      if (retryCount === 0) {
        console.warn("[Auth] User not authenticated");
      }
      
      // If 401 and haven't retried yet, attempt token refresh
      if (error.message?.includes("401") || error.message?.includes("Token expired")) {
        if (retryCount === 0) {
          console.log("[Auth] Attempting token refresh...");
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Retry loading user with new token
            return await loadCurrentUser(1);
          }
        }
      }
      
      // Clear auth state only if refresh failed (silently - don't spam errors)
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem("accessToken");
      cacheUserForGodDetection(null); // MB.MD Pattern 53: Clear god-level cache
      return false;
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      setSession({ accessToken });
      loadCurrentUser().finally(() => setIsLoading(false));
    } else {
      const initSession = async () => {
        const tokens = await refreshAccessToken();
        if (tokens) {
          setSession({ accessToken: tokens.accessToken });
          await loadCurrentUser();
        }
        setIsLoading(false);
      };
      initSession();
    }
  }, []);

  // UX-007: Multi-tab state sync - listen for auth events from other tabs
  useEffect(() => {
    const unsubLogin = subscribe('auth:login', () => {
      console.log('[Auth] Cross-tab login detected, refreshing user...');
      loadCurrentUser();
    });

    const unsubLogout = subscribe('auth:logout', () => {
      console.log('[Auth] Cross-tab logout detected, clearing state...');
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem('accessToken');
      navigate('/login');
    });

    return () => {
      unsubLogin();
      unsubLogout();
    };
  }, [navigate]);

  const getCsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };

  const login = async (email: string, password: string, inviteCode?: string): Promise<{ upgraded?: boolean; requiresVerification?: boolean; verificationEmail?: string }> => {
    try {
      console.log("[Auth] Starting login for:", email);
      const csrfToken = getCsrfToken();
      console.log("[Auth] CSRF token present:", !!csrfToken);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) {
        headers["x-xsrf-token"] = csrfToken;
      }
      
      console.log("[Auth] Sending login request...");
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ email, password, inviteCode: inviteCode || undefined }),
      });

      console.log("[Auth] Login response status:", response.status);
      if (!response.ok) {
        const data = await response.json();
        console.error("[Auth] Login failed:", data.message);
        
        // Handle email verification required response
        if (data.requiresVerification) {
          console.log("[Auth] Email verification required for:", data.email);
          return { requiresVerification: true, verificationEmail: data.email };
        }
        
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      console.log("[Auth] Login successful, got accessToken:", !!data.accessToken, "upgraded:", data.upgraded);

      localStorage.setItem("accessToken", data.accessToken);
      console.log("[Auth] Stored accessToken in localStorage");
      setSession({ accessToken: data.accessToken });
      
      // Dispatch auth:login event for WebSocket context to connect
      window.dispatchEvent(new CustomEvent('auth:login'));
      
      // Broadcast to other tabs for multi-tab sync (UX-007)
      broadcast('auth:login', { userId: data.user?.id });

      // Fetch full user data (including city, tangoRoles) from /api/auth/me
      // The login response doesn't include all profile fields
      console.log("[Auth] Loading current user...");
      await loadCurrentUser();
      console.log("[Auth] Login complete!");
      
      // Check for god-level login and dispatch CTO welcome event
      const godLevelRoles = ['super_admin', 'admin', 'god', 'founder'];
      const godLevelEmails = ['admin@mundotango.life', 'founder@mundotango.life'];
      const userRole = data.user?.role || '';
      const userEmail = email.toLowerCase();
      const isGodLevel = godLevelRoles.includes(userRole) || godLevelEmails.includes(userEmail);
      
      if (isGodLevel) {
        console.log("[Auth] God-level user detected, storing CTO welcome for after navigation");
        // Store in localStorage so MrBlueContext can pick it up after page navigation
        localStorage.setItem('mrblue:pending-cto-welcome', JSON.stringify({
          userName: data.user?.name || email.split('@')[0],
          userEmail: userEmail,
          userRole: userRole || 'admin',
          timestamp: Date.now(),
        }));
      }

      // Note: Redirect is handled by the caller (LoginPage) to support redirect query params
      return { upgraded: data.upgraded };
    } catch (error) {
      console.error("[Auth] Login error:", error);
      throw error;
    }
  };

  const register = async (registerData: { name: string; username: string; email: string; password: string; inviteCode?: string }): Promise<{ requiresVerification: boolean; email: string }> => {
    try {
      console.log("[Auth] Starting registration for:", registerData.email);
      
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) {
        headers["x-xsrf-token"] = csrfToken;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }

      const data = await response.json();
      console.log("[Auth] Registration response:", data);
      
      // New flow: registration requires email verification before login
      if (data.requiresVerification) {
        console.log("[Auth] Email verification required, redirecting to verification page");
        return { requiresVerification: true, email: data.email };
      }
      
      // Legacy flow (if verification not required for some reason)
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        setSession({ accessToken: data.accessToken });
        setUser(data.user);
        setProfile({
          id: data.user.id,
          username: data.user.username,
          name: data.user.name,
          email: data.user.email,
          profileImage: data.user.profileImage,
          bio: data.user.bio,
          city: data.user.city,
          country: data.user.country,
          tangoRoles: data.user.tangoRoles || [],
        });

        if (!data.user.isOnboardingComplete) {
          navigate("/onboarding/welcome");
        } else {
          navigate("/volunteer");
        }
      }
      
      return { requiresVerification: false, email: registerData.email };
    } catch (error) {
      console.error("[Auth] Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) {
        headers["x-xsrf-token"] = csrfToken;
      }
      
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers,
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Dispatch auth:logout event for WebSocket context to disconnect
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Broadcast to other tabs for multi-tab sync (UX-007)
      broadcast('auth:logout');
      
      navigate("/login");
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("No user logged in") };

    try {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      // Refresh user data to sync tangoRoles and other fields that appear in user object
      await loadCurrentUser();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const useUpdateAvatar = () => {
    return useMutation<string, Error, File, { previousProfile: Profile | null }>({
      mutationFn: async (file: File) => {
        if (!user) throw new Error("No user logged in");
        
        console.log("Avatar upload not yet implemented with Express backend");
        
        return "";
      },
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ['profile', user?.id] });
        const previousProfile = profile;
        return { previousProfile };
      },
      onSuccess: (publicUrl) => {
        if (publicUrl) {
          setProfile((prev) => (prev ? { ...prev, profileImage: publicUrl } : null));
        }
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      },
      onError: (_error, _variables, context) => {
        if (context?.previousProfile) {
          setProfile(context.previousProfile);
        }
      },
    });
  };

  const useSubscription = () => {
    return useQuery<Subscription | null, Error>({
      queryKey: ['subscription', user?.id],
      queryFn: async () => {
        if (!user) return null;
        
        console.log("Subscription fetching not yet implemented with Express backend");
        
        return null;
      },
      enabled: !!user,
    });
  };

  const useUpdatePreferences = () => {
    return useMutation<void, Error, Partial<ProfilePreferences>>({
      mutationFn: async (preferences: Partial<ProfilePreferences>) => {
        if (!user) throw new Error("No user logged in");
        
        console.log("Preferences update not yet implemented with Express backend", preferences);
      },
      onSuccess: () => {
        if (user) {
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        }
      },
    });
  };

  const useFollowUser = () => {
    return useMutation<void, Error, number>({
      mutationFn: async (followingId: number) => {
        if (!user) throw new Error("No user logged in");
        
        console.log("Follow user not yet implemented with Express backend", followingId);
      },
      onSuccess: (_data, followingId) => {
        queryClient.invalidateQueries({ queryKey: ['followerCount', followingId] });
        queryClient.invalidateQueries({ queryKey: ['followingCount', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['isFollowing', followingId] });
      },
    });
  };

  const useUnfollowUser = () => {
    return useMutation<void, Error, number>({
      mutationFn: async (followingId: number) => {
        if (!user) throw new Error("No user logged in");
        
        console.log("Unfollow user not yet implemented with Express backend", followingId);
      },
      onSuccess: (_data, followingId) => {
        queryClient.invalidateQueries({ queryKey: ['followerCount', followingId] });
        queryClient.invalidateQueries({ queryKey: ['followingCount', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['isFollowing', followingId] });
      },
    });
  };

  const useFollowerCount = (userId: number) => {
    return useQuery<number, Error>({
      queryKey: ['followerCount', userId],
      queryFn: async () => {
        console.log("Follower count not yet implemented with Express backend", userId);
        return 0;
      },
      enabled: !!userId,
    });
  };

  const useFollowingCount = (userId: number) => {
    return useQuery<number, Error>({
      queryKey: ['followingCount', userId],
      queryFn: async () => {
        console.log("Following count not yet implemented with Express backend", userId);
        return 0;
      },
      enabled: !!userId,
    });
  };

  const useIsFollowing = (userId: number) => {
    return useQuery<boolean, Error>({
      queryKey: ['isFollowing', userId],
      queryFn: async () => {
        if (!user) return false;
        
        console.log("Is following check not yet implemented with Express backend", userId);
        return false;
      },
      enabled: !!user && !!userId && user.id !== userId,
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        session, 
        isLoading, 
        login, 
        register, 
        logout, 
        updateProfile,
        refreshCurrentUser: loadCurrentUser,
        useUpdateAvatar,
        useSubscription,
        useUpdatePreferences,
        useFollowUser,
        useUnfollowUser,
        useFollowerCount,
        useFollowingCount,
        useIsFollowing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
