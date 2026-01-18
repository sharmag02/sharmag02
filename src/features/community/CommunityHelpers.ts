import { supabase } from "../../shared/lib/supabase";

/* ---------------------------------------------------
   FETCH ALL APPROVED COMMUNITY BLOGS (PUBLIC)
--------------------------------------------------- */
export const fetchApprovedCommunityBlogs = async () => {
  const { data, error } = await supabase
    .from("community_blogs")
    .select(
      `
      id,
      title,
      excerpt,
      slug,
      created_at,
      updated_at,
      published_at,
      is_edited,
      profiles:profiles!community_blogs_author_id_fkey(
        full_name,
        email
      )
      `
    )
    .eq("status", "approved")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/* ---------------------------------------------------
   FETCH BLOGS BELONGING TO CURRENT USER
--------------------------------------------------- */
export const fetchUserCommunityBlogs = async (userId: string) => {
  const { data, error } = await supabase
    .from("community_blogs")
    .select(`
      id,
      title,
      excerpt,
      slug,
      status,
      admin_feedback,
      submission_note,
      is_edited,
      created_at,
      updated_at,
      published_at
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/* ---------------------------------------------------
   FETCH SINGLE COMMUNITY BLOG BY SLUG
   ✔ Public → only approved
   ✔ Owner → all statuses
   ✔ Admin → all statuses
--------------------------------------------------- */
export const fetchCommunityBlogBySlug = async (
  slug: string,
  currentUserId?: string,
  isAdmin?: boolean
) => {
  let query = supabase
    .from("community_blogs")
    .select(
      `
      *,
      profiles:profiles!community_blogs_author_id_fkey(
        full_name,
        email
      )
      `
    )
    .eq("slug", slug);

  // PUBLIC USERS → only approved
  if (!currentUserId && !isAdmin) {
    query = query.eq("status", "approved");
  }

  // OWNER → own blogs + approved
  if (currentUserId && !isAdmin) {
    query = query.or(
      `author_id.eq.${currentUserId},status.eq.approved`
    );
  }

  // ADMIN → no filter

  const { data, error } = await query.single();

  if (error) throw error;
  return data;
};
