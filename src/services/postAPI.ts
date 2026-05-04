import { supabase } from "../lib/supabaseClient";

export async function createPost(churchId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth required");

  const { data, error } = await supabase
    .from("posts")
    .insert([{ 
      church_id: churchId, 
      profile_id: user.id, 
      content 
    }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function fetchPostsByChurch(churchId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles ( name, avatar_url )
    `)
    .eq("church_id", churchId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}