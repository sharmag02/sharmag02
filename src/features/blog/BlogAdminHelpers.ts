import { supabase } from "../../shared/lib/supabase";
import type { Blog } from "../../shared/types/database";

/* ======================================================
   PUBLIC FETCH
====================================================== */

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
      created_at
    `)
    .eq("published", true)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

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
      created_at
    `,
      { count: "exact" }
    )
    .eq("published", true)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    blogs: data || [],
    total: count || 0,
  };
};

/* ======================================================
   ADMIN FETCH
====================================================== */

export const fetchAllBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from("blogs")
    .select(`
      id,
      title,
      excerpt,
      content,
      slug,
      published,
      status,
      is_edited,
      submission_note,
      co_authors,
      created_at,
      updated_at
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const fetchBlogById = async (id: string): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

/* ======================================================
   MUTATIONS (ADMIN-ONLY)
====================================================== */

export const createBlog = async (
  blog: Partial<Blog>
): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from("blogs")
    .insert({
      ...blog,
      status: "published",
      published: true,
      is_edited: false,
      submission_note: null,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

/** Admin updates */
export const updateBlog = async (
  id: string,
  blog: Partial<Blog>
) => {
  const updateData: Partial<Blog> = {
    ...blog,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("blogs")
    .update(updateData)
    .eq("id", id);

  if (error) throw error;
};

/** Admin publishes blog */
export const publishBlog = async (id: string) => {
  const { error } = await supabase
    .from("blogs")
    .update({
      status: "published",
      published: true,
      is_edited: false,
      submission_note: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
};

/** Delete blog */
export const deleteBlog = async (id: string) => {
  const { error } = await supabase.from("blogs").delete().eq("id", id);
  if (error) throw error;
};
