import { supabase } from "./supabase";

export async function uploadToSupabase(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `blogs/${fileName}`;

  const { error } = await supabase.storage
    .from("blog_images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error(error);
    throw error;
  }

  const { data } = supabase.storage
    .from("blog_images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
