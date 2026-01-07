import { supabase } from "../../shared/lib/supabase";

/* -------------------------------------------------
   Certification type (MATCHES DB + EDITOR)
-------------------------------------------------- */
export interface Certification {
  id?: string;

  title: string;
  issuer: string;

  type: "Workshop" | "Internship" | "Course Completion" | "Extracurricular";

  // IMPORTANT: matches DB column
  issued_date: string; // YYYY-MM-DD

  link?: string;   // optional external credential URL
  image?: string;  // Supabase Storage public URL
}

/* -------------------------------------------------
   ADD
-------------------------------------------------- */
export async function addCertification(cert: Certification) {
  const { error } = await supabase
    .from("certifications")
    .insert([cert]);

  if (error) {
    console.error("Add certification error:", error);
    throw error;
  }
}

/* -------------------------------------------------
   UPDATE
-------------------------------------------------- */
export async function updateCertification(
  id: string,
  cert: Certification
) {
  const { error } = await supabase
    .from("certifications")
    .update(cert)
    .eq("id", id);

  if (error) {
    console.error("Update certification error:", error);
    throw error;
  }
}

/* -------------------------------------------------
   FETCH BY ID
-------------------------------------------------- */
export async function fetchCertificationById(
  id: string
): Promise<Certification | null> {
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Fetch certification error:", error);
    return null;
  }

  return data as Certification;
}
