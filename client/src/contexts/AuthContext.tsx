import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { SelectUser } from "@shared/schema";

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
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
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
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  const loadCurrentUser = async () => {
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
      });

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        setSession({ accessToken });
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem("accessToken");
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

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();

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
      });

      // Redirect to feed after successful login per spec (PART 2, section 2.1, line 556)
      navigate("/feed");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (registerData: { name: string; username: string; email: string; password: string }) => {
    try {
      console.log("Starting registration for:", registerData.email);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }

      const data = await response.json();
      console.log("Registration successful!", data);
      
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
      });

      if (!data.user.isOnboardingComplete) {
        navigate("/onboarding/welcome");
      } else {
        navigate("/feed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setProfile(null);
      setSession(null);
      navigate("/login");
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("No user logged in") };

    try {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
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
