import { supabase } from "../../shared/lib/supabase";

export interface Skill {
  id?: number;
  title: string;
  category: "skill" | "tool";
  items: string[];
}

/* ---------- FETCH ALL ---------- */
export async function fetchSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch skills error:", error);
    return [];
  }

  return data ?? [];
}

/* ---------- FETCH BY ID ---------- */
export async function fetchSkillById(id: string): Promise<Skill | null> {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Fetch skill error:", error);
    return null;
  }

  return data;
}

/* ---------- ADD ---------- */
export async function addSkill(skill: Skill) {
  const { error } = await supabase.from("skills").insert(skill);
  if (error) throw error;
}

/* ---------- UPDATE ---------- */
export async function updateSkill(id: string, skill: Skill) {
  const { error } = await supabase
    .from("skills")
    .update({
      ...skill,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

/* ---------- DELETE ---------- */
export async function deleteSkill(id: string) {
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw error;
}
