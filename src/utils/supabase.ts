import { supabase } from "../lib/supabaseClient";

/**
 * Convert a storage path to a public URL
 */
export function getPublicImageUrl(path?: string | null) {
  if (!path) return "/placeholder.jpg";
  
  const { data } = supabase.storage.from("church-images").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Convert an array of storage paths to public URLs
 */
export function getPublicImageUrls(paths?: string[] | null) {
  if (!paths || paths.length === 0) return ["/placeholder.jpg"];
  return paths.map((p) => getPublicImageUrl(p));
}