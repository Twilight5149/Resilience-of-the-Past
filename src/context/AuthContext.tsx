import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type AuthContextType = {
  user: any | null;
  loading: boolean;
  refreshUser: () => Promise<any | null>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async (userId: string, email?: string | null) => {
    const { data: profileById } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileById || !email) return profileById;

    const { data: profileByEmail } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", email)
      .maybeSingle();

    return profileByEmail;
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      setUser(null);
      return null;
    }

    const profile = await getProfile(session.user.id, session.user.email);
    setUser(profile);
    return profile;
  };

useEffect(() => {
  let mounted = true;

  const loadInitialSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        const profile = await getProfile(session.user.id, session.user.email);
        if (!mounted) return;
        setUser(profile ?? { id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load auth session:", error);
      if (mounted) setUser(null);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  loadInitialSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(async () => {
      try {
        if (session?.user) {
          const profile = await getProfile(session.user.id, session.user.email);
          if (mounted) setUser(profile ?? { id: session.user.id, email: session.user.email });
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to refresh auth profile:", error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 0);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);