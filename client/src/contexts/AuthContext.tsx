import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { User, Session } from "@supabase/supabase-js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import type { Profile, ProfilePreferences, Subscription } from "@shared/supabase-types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  useUpdateAvatar: () => ReturnType<typeof useMutation<string, Error, File, { previousProfile: Profile | null }>>;
  useSubscription: () => ReturnType<typeof useQuery<Subscription | null, Error>>;
  useUpdatePreferences: () => ReturnType<typeof useMutation<void, Error, Partial<ProfilePreferences>>>;
  useFollowUser: () => ReturnType<typeof useMutation<void, Error, string>>;
  useUnfollowUser: () => ReturnType<typeof useMutation<void, Error, string>>;
  useFollowerCount: (userId: string) => ReturnType<typeof useQuery<number, Error>>;
  useFollowingCount: (userId: string) => ReturnType<typeof useQuery<number, Error>>;
  useIsFollowing: (userId: string) => ReturnType<typeof useQuery<boolean, Error>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || "Login failed");
    }

    navigate("/");
  };

  const register = async (registerData: { name: string; username: string; email: string; password: string }) => {
    try {
      console.log("Starting registration for:", registerData.email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            username: registerData.username,
            full_name: registerData.name,
          },
        },
      });

      console.log("Auth signup response:", { authData, authError });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(authError.message || "Registration failed");
      }

      if (!authData.user) {
        throw new Error("Registration failed - no user created");
      }

      console.log("Registration successful! Profile auto-created by Supabase trigger.");
      console.log("User ID:", authData.user.id);
      
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    navigate("/login");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("No user logged in") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

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
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);
        
        if (error) throw error;
        
        return publicUrl;
      },
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ['profile', user?.id] });
        const previousProfile = profile;
        return { previousProfile };
      },
      onSuccess: (publicUrl) => {
        setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
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
        
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }
        
        return data;
      },
      enabled: !!user,
    });
  };

  const useUpdatePreferences = () => {
    return useMutation<void, Error, Partial<ProfilePreferences>>({
      mutationFn: async (preferences: Partial<ProfilePreferences>) => {
        if (!user) throw new Error("No user logged in");
        
        const { error } = await supabase
          .from('profiles')
          .update(preferences)
          .eq('id', user.id);
        
        if (error) throw error;
      },
      onSuccess: () => {
        if (user) {
          loadProfile(user.id);
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        }
      },
    });
  };

  const useFollowUser = () => {
    return useMutation<void, Error, string>({
      mutationFn: async (followingId: string) => {
        if (!user) throw new Error("No user logged in");
        
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: followingId,
          });
        
        if (error) throw error;
      },
      onSuccess: (_data, followingId) => {
        queryClient.invalidateQueries({ queryKey: ['followerCount', followingId] });
        queryClient.invalidateQueries({ queryKey: ['followingCount', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['isFollowing', followingId] });
      },
    });
  };

  const useUnfollowUser = () => {
    return useMutation<void, Error, string>({
      mutationFn: async (followingId: string) => {
        if (!user) throw new Error("No user logged in");
        
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', followingId);
        
        if (error) throw error;
      },
      onSuccess: (_data, followingId) => {
        queryClient.invalidateQueries({ queryKey: ['followerCount', followingId] });
        queryClient.invalidateQueries({ queryKey: ['followingCount', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['isFollowing', followingId] });
      },
    });
  };

  const useFollowerCount = (userId: string) => {
    return useQuery<number, Error>({
      queryKey: ['followerCount', userId],
      queryFn: async () => {
        const { count, error } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);
        
        if (error) throw error;
        return count || 0;
      },
      enabled: !!userId,
    });
  };

  const useFollowingCount = (userId: string) => {
    return useQuery<number, Error>({
      queryKey: ['followingCount', userId],
      queryFn: async () => {
        const { count, error } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);
        
        if (error) throw error;
        return count || 0;
      },
      enabled: !!userId,
    });
  };

  const useIsFollowing = (userId: string) => {
    return useQuery<boolean, Error>({
      queryKey: ['isFollowing', userId],
      queryFn: async () => {
        if (!user) return false;
        
        const { data, error } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle();
        
        if (error) throw error;
        return !!data;
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
