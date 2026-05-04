import { supabase } from "../lib/supabaseClient";
import { getPublicImageUrl } from "../utils/supabase";

export interface Church {
  id: string;
  name: string;
  founded: number;
  address: string;
  city: string;
  province: string;
  country: string;
  lat: number;
  lng: number;
  description: string;
  history: string;
  architecturalStyle: string;
  images: string[];
  feast: string;
  diocese: string;
  unrated?: boolean;
  structuralRating?: number;
  expert_ratings?: any[]; 
  user_posts?: any[];
}

// Placeholder image
const PLACEHOLDER = "/placeholder.jpg";

// Expert Ratings
export async function submitExpertRating(
  churchId: string, 
  rating: number, 
  assessment: string, 
  recommendations: string
) {
  // 1. Update the main church record's structural rating
  const { error: churchError } = await supabase
    .from("churches")
    .update({ 
      structuralRating: rating,
      unrated: false 
    })
    .eq("id", churchId);

  if (churchError) throw churchError;

  // 2. Insert into a separate 'ratings' or 'assessments' table for history
  // Replace "expert_ratings" with your actual table name if different
  const { error: ratingError } = await supabase
    .from("expert_ratings")
    .insert([{
      church_id: churchId,
      rating,
      assessment,
      recommendations,
      created_at: new Date().toISOString()
    }]);

  if (ratingError) throw ratingError;
  
  return true;
}

export async function fetchChurchWithCommunityData(id: string) {
  const { data, error } = await supabase
    .from("churches")
    .select(`
      *,
      expert_ratings (*),
      user_posts (*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// ✅ UPLOAD IMAGE
export async function uploadImage(file: File): Promise<string> {
  // 1. Sanitize the name to prevent 404s caused by spaces or special characters
  const cleanName = file.name.replace(/\s+/g, '_').replace(/[()]/g, '');
  const fileName = `${Date.now()}-${cleanName}`;

  // 2. Upload to the bucket
  const { error } = await supabase.storage
    .from("church-images")
    .upload(fileName, file);

  if (error) throw error;

  // 3. Return ONLY the filename
  return fileName; 
}

// ✅ GET ALL CHURCHES
export async function fetchChurches(): Promise<Church[]> {
  const { data, error } = await supabase.from("churches").select("*");
  if (error) throw error;

  return data.map(church => {
    let rawImages = church.images;

    // FIX: If the DB returned a string like '["file.jpg"]', parse it or clean it
    if (typeof rawImages === 'string' && rawImages.startsWith('[')) {
      try {
        rawImages = JSON.parse(rawImages); // Convert '["file.jpg"]' to ["file.jpg"]
      } catch {
        // Fallback: manually strip [" and "] if JSON.parse fails
        rawImages = [rawImages.replace(/[\[\]"]/g, '')];
      }
    }

    const hasImages = Array.isArray(rawImages) && rawImages.length > 0;

    return {
      ...church,
      images: hasImages
        ? rawImages.map((path: string) => 
            path.startsWith("http") ? path : getPublicImageUrl(path)
          )
        : ["/placeholder.jpg"],
    };
  });
}

// ✅ GET ONE CHURCH
export async function fetchChurchById(id: string): Promise<Church> {
  const { data, error } = await supabase
    .from("churches")
    .select("*, expert_ratings(*), user_posts(*)")
    .eq("id", id)
    .single();

  if (error) throw error;

  // --- CLEANING LOGIC START ---
  let rawImages = data.images;

  // If it's a string from a varchar column, check for JSON brackets
  if (typeof rawImages === 'string') {
    if (rawImages.startsWith('[')) {
      try {
        rawImages = JSON.parse(rawImages);
      } catch {
        rawImages = [rawImages.replace(/[\[\]"]/g, '')];
      }
    } else {
      rawImages = [rawImages]; // Wrap single string in array
    }
  }
  
  const hasImages = Array.isArray(rawImages) && rawImages.length > 0;
  // --- CLEANING LOGIC END ---

  return {
    ...data,
    images: hasImages
      ? rawImages.map((imgPath: string) => 
          imgPath.startsWith("http") ? imgPath : getPublicImageUrl(imgPath)
        )
      : [PLACEHOLDER],
  };
}

// ✅ CREATE CHURCH
export async function createChurch(church: Omit<Church, "id">) {
  const { data, error } = await supabase.from("churches").insert([church]).select().single();
  if (error) throw error;
  return data;
}

// ✅ UPDATE CHURCH
export async function updateChurch(id: string, church: Partial<Church>) {
  const { data, error } = await supabase.from("churches").update(church).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ✅ DELETE CHURCH
export async function deleteChurch(id: string) {
  const { error } = await supabase.from("churches").delete().eq("id", id);
  if (error) throw error;
}