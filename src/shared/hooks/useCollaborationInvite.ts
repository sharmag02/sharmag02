import { useLocation, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useCollaborationInvite() {
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { id: targetBlogId } = useParams();

  // Determine table_name
  const tableName: "blogs" | "community_blogs" =
    location.pathname.startsWith("/community")
      ? "community_blogs"
      : "blogs";

  // Fetch blog title for email
  async function getBlogTitle() {
    const { data } = await supabase
      .from(tableName)
      .select("title")
      .eq("id", targetBlogId)
      .single();

    return data?.title ?? "Blog";
  }

  // Main function to send invite
  async function sendInvite(email: string) {
    if (!email) return alert("Email is required");
    if (!currentUser?.id) return alert("Not logged in");

    // Check if invited user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (!profile) {
      alert("This user must have an account first.");
      return;
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const blogTitle = await getBlogTitle();

    // Insert invitation
    await supabase.from("blog_invitations").insert({
      table_name: tableName,
      target_blog_id: targetBlogId,
      invited_user_id: profile.id,
      invited_email: email,
      invited_by: currentUser.id,
      token,
      expires_at: expiresAt,
    });

    // Email via Edge Function
    await fetch("https://YOUR_SUPABASE_URL/functions/v1/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "collaboration-invite",
        email,
        token,
        blogTitle,
        inviterName: currentUser.email,
      }),
    });

    alert("Invitation sent successfully!");
  }

  return { sendInvite };
}
