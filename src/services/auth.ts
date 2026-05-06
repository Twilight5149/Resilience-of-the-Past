import { supabase } from '../lib/supabaseClient'

export const login = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error };

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id, 
        email: email,
        role: "user",
        is_pending_expert: true,
      },
    ]);

    if (profileError) console.error("Error creating profile:", profileError);
  }

  return { data };
};