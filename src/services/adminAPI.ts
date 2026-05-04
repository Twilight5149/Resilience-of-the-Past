import { supabase } from "../lib/supabaseClient";

// 1. Fetch users who are NOT YET experts but have applied
// (Assuming you have a 'role' column and maybe a 'is_pending_expert' flag)
export async function fetchPendingExperts() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "user") // or use a specific status flag if you have one
    .eq("is_pending_expert", true); 

  if (error) throw error;
  return data;
}

// 2. The "Approve" function
export async function approveExpert(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ 
      role: "expert",
      is_pending_expert: false 
    })
    .eq("id", userId);

  if (error) throw error;
  return data;
}