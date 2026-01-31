import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class ProductionDatabaseService {
  private supabase: SupabaseClient | null = null;
  private isAvailable = false;
  private connectionError: string | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      this.connectionError = "SUPABASE_URL or key not configured";
      console.warn("[ProductionDB] " + this.connectionError + " - production queries disabled");
      this.isAvailable = false;
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.isAvailable = true;
      console.log("[ProductionDB] Supabase client configured (connection tested on first query)");
    } catch (error: any) {
      this.connectionError = error.message || "Unknown error";
      console.error("[ProductionDB] Failed to configure client:", error);
      this.isAvailable = false;
    }
  }

  isConnected(): boolean {
    return this.isAvailable && this.supabase !== null;
  }

  getConnectionError(): string | null {
    return this.connectionError;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.supabase) {
      return { success: false, error: this.connectionError || "Client not configured" };
    }
    try {
      const { data, error } = await this.supabase.from("users").select("id").limit(1);
      if (error) {
        this.connectionError = error.message;
        return { success: false, error: error.message };
      }
      this.connectionError = null;
      return { success: true };
    } catch (error: any) {
      const msg = error.message || "Connection failed";
      this.connectionError = msg;
      if (msg.includes("ENOTFOUND") || msg.includes("fetch failed")) {
        return { 
          success: false, 
          error: "Network unreachable: Replit development cannot reach production Supabase. This feature only works when deployed to production." 
        };
      }
      return { success: false, error: msg };
    }
  }

  async getUserByEmail(email: string) {
    if (!this.supabase) {
      throw new Error("Production database not configured");
    }

    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("id, email, username, name, role, waitlist, is_verified, is_active, suspended, created_at, last_login_at, city, country")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
          throw new Error("Network unreachable: This feature only works when deployed to production.");
        }
        throw error;
      }

      return data || null;
    } catch (error: any) {
      if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
        throw new Error("Network unreachable: This feature only works when deployed to production.");
      }
      throw error;
    }
  }

  async searchUsers(query: string, limit = 20) {
    if (!this.supabase) {
      throw new Error("Production database not configured");
    }

    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("id, email, username, name, role, waitlist, is_verified, is_active, suspended, created_at, last_login_at")
        .or(`email.ilike.%${query}%,name.ilike.%${query}%,username.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
          throw new Error("Network unreachable: This feature only works when deployed to production.");
        }
        throw error;
      }
      return data || [];
    } catch (error: any) {
      if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
        throw new Error("Network unreachable: This feature only works when deployed to production.");
      }
      throw error;
    }
  }

  async getRecentUsers(limit = 50) {
    if (!this.supabase) {
      throw new Error("Production database not configured");
    }

    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("id, email, username, name, role, waitlist, is_verified, is_active, suspended, created_at, last_login_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
          throw new Error("Network unreachable: This feature only works when deployed to production.");
        }
        throw error;
      }
      return data || [];
    } catch (error: any) {
      if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
        throw new Error("Network unreachable: This feature only works when deployed to production.");
      }
      throw error;
    }
  }

  async getProductionStats() {
    if (!this.supabase) {
      throw new Error("Production database not configured");
    }

    try {
      const [totalResult, waitlistResult, activeResult, verifiedResult] = await Promise.all([
        this.supabase.from("users").select("id", { count: "exact", head: true }),
        this.supabase.from("users").select("id", { count: "exact", head: true }).eq("waitlist", true),
        this.supabase.from("users").select("id", { count: "exact", head: true }).eq("is_active", true),
        this.supabase.from("users").select("id", { count: "exact", head: true }).eq("is_verified", true),
      ]);

      return {
        total: totalResult.count || 0,
        waitlist: waitlistResult.count || 0,
        active: activeResult.count || 0,
        verified: verifiedResult.count || 0,
      };
    } catch (error: any) {
      if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
        throw new Error("Network unreachable: This feature only works when deployed to production.");
      }
      throw error;
    }
  }

  async getWaitlistUsers(limit = 100) {
    if (!this.supabase) {
      throw new Error("Production database not configured");
    }

    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("id, email, username, name, waitlist_date, is_verified, created_at")
        .eq("waitlist", true)
        .order("waitlist_date", { ascending: false })
        .limit(limit);

      if (error) {
        if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
          throw new Error("Network unreachable: This feature only works when deployed to production.");
        }
        throw error;
      }
      return data || [];
    } catch (error: any) {
      if (error.message?.includes("ENOTFOUND") || error.message?.includes("fetch failed")) {
        throw new Error("Network unreachable: This feature only works when deployed to production.");
      }
      throw error;
    }
  }

  async getUserLoginHistory(email: string) {
    if (!this.supabase) {
      throw new Error("Production database not configured");
    }

    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    return {
      user,
      loginStatus: {
        canLogin: user.is_active && !user.suspended && user.is_verified,
        issues: [
          !user.is_active && "Account is inactive",
          user.suspended && "Account is suspended",
          !user.is_verified && "Email not verified",
          user.waitlist && "User is on waitlist (can still login)",
        ].filter(Boolean),
      },
    };
  }
}

export const productionDb = new ProductionDatabaseService();
