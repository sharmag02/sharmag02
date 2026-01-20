import { useEffect, useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("Validating invitation...");

  useEffect(() => {
    const run = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) return setMessage("Invalid invitation token.");
      if (!user?.id) return setMessage("Please login first.");

      /* 1️⃣ Get invitation */
      const { data: invite, error } = await supabase
        .from("blog_invitations")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (error || !invite) return setMessage("Invitation not found.");

      /* 2️⃣ Accept the invite */
      await supabase
        .from("blog_invitations")
        .update({
          accepted: true,
          invited_user_id: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invite.id);

      /* 3️⃣ Add collaborator */
      await supabase.from("blog_collaborators").insert({
        blog_id: invite.blog_id,
        blog_type: invite.blog_type,
        user_id: user.id,
      });

      /* 4️⃣ Redirect */
      if (invite.blog_type === "blog") {
        navigate(`/blogs/edit/${invite.blog_id}`, { replace: true });
        return;
      }

      if (invite.blog_type === "community") {
        navigate(`/community/edit/${invite.blog_id}`, { replace: true });
        return;
      }

      setMessage("Unknown blog type.");
    };

    run();
  }, [user?.id]);

  return <div className="p-10 text-center text-lg">{message}</div>;
}
