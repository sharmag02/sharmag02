import { supabase } from "../../shared/lib/supabase";

export type ProjectCategory = "web" | "core" ;

export interface Project {
  id?: number;
  title: string;
  description: string;
  category: ProjectCategory;
  tags: string[];
  github?: string;
  live?: string;
  thumbnail?: string;
}

/* ---------------- FETCH ---------------- */

export async function fetchAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

/* ---------------- ADD / UPDATE ---------------- */

export async function addProject(project: Project) {
  const { error } = await supabase.from("projects").insert(project);
  if (error) throw error;
}

export async function updateProject(id: string, project: Project) {
  const { error } = await supabase
    .from("projects")
    .update({ ...project, updated_at: new Date() })
    .eq("id", id);

  if (error) throw error;
}
