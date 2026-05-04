import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type AuthContextType = {
  user: any | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // 1. Create a single function to handle profile fetching
  const getProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return data;
  };

  // 2. Use the listener as the primary source of truth
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const profile = await getProfile(session.user.id);
      setUser(profile);
    } else {
      setUser(null);
    }
    // Always stop loading after the check is done
    setLoading(false);
  });

  // 3. Fallback: If for some reason the listener doesn't fire (rare), 
  // check session once.
  const checkInitialSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) setLoading(false);
  };
  checkInitialSession();

  return () => subscription.unsubscribe();
}, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) setUser(data);
  };

return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);