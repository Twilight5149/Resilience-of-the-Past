import { supabase } from "../lib/supabaseClient";
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'expert' | 'user';
  is_pending_expert?: boolean; 
  expertise?: string;          
}

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return data;
}