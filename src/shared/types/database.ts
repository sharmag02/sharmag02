// src/shared/types/database.ts

/* =========================
   AUTH / PROFILE
========================= */

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

/* =========================
   BLOG
========================= */

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  cover_image?: string | null;
  author_id: string;
  created_at: string;
  updated_at?: string | null;

  profiles?: Profile | null;
}

/* =========================
   PROJECTS
========================= */

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "core" | "web";
  tags: string[];
  github_url?: string | null;
  live_url?: string | null;
  thumbnail?: string | null;
  created_at: string;
  updated_at?: string | null;
}

/* =========================
   SKILLS
========================= */

export interface SkillCategory {
  id: string;
  title: string;
  type: "skills" | "tools";
  icon: string; // lucide icon name (Code, Globe, Hammer etc.)
  skills: string[];
  created_at: string;
  updated_at?: string | null;
}

/* =========================
   EXPERIENCE
========================= */

export interface Experience {
  id: string;
  role: string;
  company: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  created_at: string;
}

/* =========================
   CERTIFICATIONS
========================= */

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url?: string | null;
  created_at: string;
}

/* =========================
   GENERIC ADMIN CONTENT
========================= */

export type ContentType =
  | "blogs"
  | "projects"
  | "skills"
  | "experiences"
  | "certifications";

export type AdminContent =
  | Blog
  | Project
  | SkillCategory
  | Experience
  | Certification;
