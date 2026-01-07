import { supabase } from "../../shared/lib/supabase";
import type { Blog } from "../../shared/types/database";

/* ======================================================
   PUBLIC FETCH (Homepage / Blog Page)
   ====================================================== */

/**
 * Fetch latest published blogs (Homepage)
 */
export const fetchLatestBlogs = async (
  limit: number = 4
): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from("blogs")
    .select(`
      id,
      title,
      excerpt,
      slug,
      created_at,
      profiles (
        full_name,
        email
      )
    `)
    .eq("published", true) // ✅ REQUIRED FOR RLS
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * Fetch paginated published blogs (Public Blog page)
 */
export const fetchBlogsPaginated = async (
  page: number,
  pageSize: number = 6
): Promise<{ blogs: Blog[]; total: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("blogs")
    .select(
      `
      id,
      title,
      excerpt,
      slug,
      created_at,
      profiles (
        full_name,
        email
      )
    `,
      { count: "exact" }
    )
    .eq("published", true) // ✅ REQUIRED
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    blogs: data || [],
    total: count || 0,
  };
};

/* ======================================================
   ADMIN FETCH (Dashboard)
   ====================================================== */

/**
 * Fetch all blogs (Admin panel – includes drafts)
 */
export const fetchAllBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from("blogs")
    .select(`
      id,
      title,
      excerpt,
      content,
      slug,
      author_id,
      published,
      created_at,
      updated_at,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Fetch single blog by ID (Admin editor)
 */
export const fetchBlogById = async (
  id: string // ✅ UUID FIX
): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

/* ======================================================
   MUTATIONS (ADMIN ONLY)
   ====================================================== */

/**
 * Create new blog
 */
export const createBlog = async (
  blog: Partial<Blog>
): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from("blogs")
    .insert({
      ...blog,
      published: true, // ✅ ensure published
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

/**
 * Update blog
 */
export const updateBlog = async (
  id: string, // ✅ UUID FIX
  blog: Partial<Blog>
) => {
  const { error } = await supabase
    .from("blogs")
    .update({
      ...blog,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
};

/**
 * Delete blog
 */
export const deleteBlog = async (id: string) => {
  const { error } = await supabase
    .from("blogs")
    .delete()
    .eq("id", id);

  if (error) throw error;
};
