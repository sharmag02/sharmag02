// src/features/experience/ExperienceAdminHelpers.ts
import { supabase } from "../../shared/lib/supabase";

export interface Experience {
  id?: string;

  title: string;
  company: string;
  type: "industry" | "club" | "career_break";

  start_date: string;
  end_date: string | null;
  is_current: boolean;

  description?: string;
  achievements: string[];
  technologies: string[];

  created_at?: string;
}

/* ---------------- FETCH ALL ---------------- */

export async function fetchAllExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("is_current", { ascending: false })
    .order("end_date", { ascending: false, nullsFirst: true })
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

/* ---------------- FETCH BY ID ---------------- */

export async function fetchExperienceById(id: string): Promise<Experience> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/* ---------------- ADD ---------------- */

export async function addExperience(exp: Experience) {
  const { error } = await supabase
    .from("experiences")
    .insert(exp);

  if (error) throw error;
}

/* ---------------- UPDATE ---------------- */

export async function updateExperience(id: string, exp: Experience) {
  const { error } = await supabase
    .from("experiences")
    .update(exp)
    .eq("id", id);

  if (error) throw error;
}

/* ---------------- DELETE ---------------- */

export async function deleteExperience(id: string) {
  const { error } = await supabase
    .from("experiences")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
