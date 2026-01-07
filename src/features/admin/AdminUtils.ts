// src/utils/adminUtils.ts
import { supabase } from "../../shared/lib/supabase";

// Supported content types
export type ContentType = "blogs" | "projects" | "skills" | "experiences";

// Generic content item type
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  excerpt?: string;
  created_at?: string;
  profiles?: { full_name: string | null; email: string } | null;
  [key: string]: any;
}

/**
 * Fetch all items of a given content type from Supabase
 * @param type Content type ("blogs" | "projects" | "skills" | "experiences")
 */
export const fetchItems = async (type: ContentType): Promise<ContentItem[]> => {
  try {
    let query = supabase.from(type).select("*");

    // For blogs, include author profiles
    if (type === "blogs") {
      query = supabase.from(type).select(`
        *,
        profiles (
          full_name,
          email
        )
      `);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error(`Error fetching ${type}:`, err);
    return [];
  }
};

/**
 * Delete an item by ID for a given content type
 * @param type Content type
 * @param id Item ID
 */
export const deleteItem = async (type: ContentType, id: string) => {
  try {
    const { error } = await supabase.from(type).delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Error deleting ${type} item:`, err);
    return false;
  }
};

/**
 * Create or update an item
 * @param type Content type
 * @param item Item data (include id for update)
 */
export const upsertItem = async (type: ContentType, item: Partial<ContentItem>) => {
  try {
    let query;
    if (item.id) {
      // Update existing
      query = supabase.from(type).update(item).eq("id", item.id);
    } else {
      // Insert new
      query = supabase.from(type).insert(item);
    }

    const { data, error } = await query.select();
    if (error) throw error;
    return data ? data[0] : null;
  } catch (err) {
    console.error(`Error upserting ${type} item:`, err);
    return null;
  }
};
