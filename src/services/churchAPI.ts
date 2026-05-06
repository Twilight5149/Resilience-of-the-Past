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
  structuralRating?: number;
  expert_ratings?: ExpertRating[]; 
  user_posts?: any[];
}

export interface ExpertRating {
  id?: string;
  church_id?: string;
  condition_score?: number;
  priority_score?: number;
  rating?: number | null;
  assessment?: string;
  recommendations?: string;
  created_at?: string;
}

const sortExpertRatings = (ratings?: ExpertRating[]) =>
  [...(ratings ?? [])].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime;
  });

export const getLatestExpertRating = (church?: Pick<Church, "expert_ratings"> | null) =>
  sortExpertRatings(church?.expert_ratings).find((rating) => typeof rating.rating === "number") ?? null;

export const getChurchRatingValue = (church?: Pick<Church, "expert_ratings"> | null) =>
  getLatestExpertRating(church)?.rating ?? null;

export const isChurchUnrated = (church?: Pick<Church, "expert_ratings"> | null) =>
  getChurchRatingValue(church) === null;

const sanitizeChurchPayload = (church: Partial<Church>) => {
  const {
    id,
    created_at,
    updated_at,
    expert_ratings,
    user_posts,
    ...payload
  } = church as Partial<Church> & {
    id?: string | number;
    created_at?: string;
    updated_at?: string;
    architectural_style?: string;
    structural_rating?: number;
  };

  const dbPayload = { ...payload } as any;

  if ("architectural_style" in dbPayload && !("architecturalStyle" in dbPayload)) {
    dbPayload.architecturalStyle = dbPayload.architectural_style;
  }
  delete dbPayload.architectural_style;

  if ("structural_rating" in dbPayload && !("structuralRating" in dbPayload)) {
    dbPayload.structuralRating = dbPayload.structural_rating;
  }
  delete dbPayload.structural_rating;

  if (Array.isArray(dbPayload.images)) {
    dbPayload.images = JSON.stringify(dbPayload.images);
  }

  return dbPayload;
};

const normalizeChurch = (church: any): Church => {
  const rawImages = church.images;

  let images = rawImages;
  if (typeof images === 'string') {
    if (images.startsWith('[')) {
      try {
        images = JSON.parse(images);
      } catch {
        images = [images.replace(/[\[\]"]/g, '')];
      }
    } else {
      images = [images];
    }
  }

  const hasImages = Array.isArray(images) && images.length > 0;

  return {
    ...church,
    architecturalStyle: church.architecturalStyle ?? church.architectural_style ?? "",
    structuralRating: church.structuralRating ?? church.structural_rating,
    expert_ratings: sortExpertRatings(church.expert_ratings),
    images: hasImages
      ? images.map((path: string) =>
          path.startsWith("http") ? path : getPublicImageUrl(path)
        )
      : [PLACEHOLDER],
  };
};

// Placeholder image
const PLACEHOLDER = "/placeholder.jpg";

// Expert Ratings
// services/churchAPI.ts

export const submitExpertRating = async (
  churchId: string,
  conditionScore: number,
  priorityScore: number,
  assessment: string,
  recommendations: string
) => {
  // Calculate the final rating for the main 'rating' column
  const finalRating = conditionScore * priorityScore;

  const { data, error } = await supabase
    .from('expert_ratings')
    .insert([
      {
        church_id: churchId,
        condition_score: conditionScore, // New column
        priority_score: priorityScore,   // New column
        rating: finalRating,             // The 1-20 result
        assessment: assessment,
        recommendations: recommendations,
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) throw error;
  return data;
};

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
  return normalizeChurch(data);
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
  const { data, error } = await supabase
    .from("churches")
    .select("*, expert_ratings(*)");
  if (error) throw error;

  return data.map(normalizeChurch);
}

// ✅ GET ONE CHURCH
export async function fetchChurchById(id: string): Promise<Church> {
  const { data, error } = await supabase
    .from("churches")
    .select("*, expert_ratings(*)")
    .eq("id", id)
    .single();

  if (error) throw error;

  const { data: posts, error: postsError } = await supabase
    .from("user_posts")
    .select("*")
    .eq("church_id", id)
    .order("created_at", { ascending: false });

  if (postsError) throw postsError;
  const enrichedPosts = await enrichPostsWithProfiles((posts ?? []) as Post[]);

  return normalizeChurch({
    ...data,
    user_posts: enrichedPosts,
  });
}

// ✅ CREATE CHURCH
export async function createChurch(church: Omit<Church, "id">) {
  const { data, error } = await supabase
    .from("churches")
    .insert([sanitizeChurchPayload(church)])
    .select("*, expert_ratings(*)")
    .single();
  if (error) throw error;
  return normalizeChurch(data);
}

// ✅ UPDATE CHURCH
export async function updateChurch(id: string, church: Partial<Church>) {
  const { data, error } = await supabase
    .from("churches")
    .update(sanitizeChurchPayload(church))
    .eq("id", id)
    .select("*, expert_ratings(*)")
    .single();
  if (error) throw error;
  return normalizeChurch(data);
}

// ✅ DELETE CHURCH
export async function deleteChurch(id: string) {
  const { error } = await supabase.from("churches").delete().eq("id", id);
  if (error) throw error;
}

export interface Post {
  id: string;    
  church_id: string; 
  church_name: string;
  content: string;
  created_at: string;
  profile_id?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  userName?: string | null;
  profiles?: { name?: string | null; email?: string | null } | null;
  profile?: { name?: string | null; email?: string | null } | null;
}

type PostUploader = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
};

const resolveUploaderName = (uploader?: PostUploader | null) => {
  const name = uploader?.name?.trim();
  const email = uploader?.email?.trim();

  if (name) return name;
  if (email) return email;
  return null;
};

const getCurrentProfile = async (): Promise<PostUploader> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in before posting a community story.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,name,email")
    .eq("id", user.id)
    .maybeSingle();

  return profile ?? {
    id: user.id,
    name: user.user_metadata?.name || null,
    email: user.email,
  };
};

const enrichPostsWithProfiles = async (posts: Post[] = []) => {
  const profileIds = Array.from(
    new Set(
      posts
        .map((post) => post.profile_id || post.user_id)
        .filter(Boolean)
    )
  ) as string[];

  if (profileIds.length === 0) return posts;

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id,name,email")
    .in("id", profileIds);

  if (error) return posts;

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return posts.map((post) => {
    const profile = profileById.get(post.profile_id || post.user_id || "");
    return {
      ...post,
      user_name: post.user_name || profile?.name || profile?.email || null,
    };
  });
};

export const createPost = async (
  postData: { church_id: string; church_name: string; content: string },
  uploader?: PostUploader | null
) => {
  const profile = uploader?.id ? uploader : await getCurrentProfile();
  const uploaderName = resolveUploaderName(profile);

  if (!uploaderName) {
    throw new Error("Your profile needs a name or email before posting.");
  }

  const postWithUploader = {
    ...postData,
    profile_id: profile?.id,
    user_id: profile?.id,
    user_name: uploaderName,
  };

  const { data, error } = await supabase
    .from('user_posts') 
    .insert([postWithUploader])
    .select()
    .single();

  if (error && /user_id|profile_id|user_name|column/i.test(error.message)) {
    const { data: nameOnlyData, error: nameOnlyError } = await supabase
      .from('user_posts')
      .insert([{ ...postData, user_name: uploaderName }])
      .select()
      .single();

    if (!nameOnlyError) return nameOnlyData as Post;
    throw new Error("Your user_posts table needs a user_name column before uploader names can be saved.");
  }

  if (error) throw error;
  return data as Post;
};

export const fetchUserPosts = async () => {
  const { data, error } = await supabase
    .from('user_posts') 
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return enrichPostsWithProfiles((data ?? []) as Post[]);
};
