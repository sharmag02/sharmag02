import { useEffect, useState } from "react";
import {
  Edit,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Users,
} from "lucide-react";
import { supabase } from "../../shared/lib/supabase";
import { useAuth } from "../../shared/context/AuthContext";
import CommunityBlogEditor from "./CommunityBlogEditor";
import { useTheme } from "../../shared/context/ThemeContext";

export default function CommunityDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  /* ---------------- LOAD BLOGS ---------------- */
  const loadBlogs = async () => {
    if (!user) return;

    setLoading(true);

    const { data: authorBlogs } = await supabase
      .from("community_blogs")
      .select("*")
      .eq("author_id", user.id)
      .order("updated_at", { ascending: false });

    const { data: collabRows } = await supabase
      .from("blog_collaborators")
      .select("blog_id")
      .eq("user_id", user.id)
      .eq("blog_type", "community");

    let collaboratorBlogs: any[] = [];

    if (collabRows?.length > 0) {
      const blogIds = collabRows.map((c) => c.blog_id);

      const { data: collabBlogData } = await supabase
        .from("community_blogs")
        .select("*")
        .in("id", blogIds);

      collaboratorBlogs = collabBlogData || [];
    }

    const combined = [
      ...(authorBlogs || []),
      ...collaboratorBlogs.map((b) => ({
        ...b,
        isCollaborator: true,
      })),
    ];

    const uniqueBlogs = Array.from(
      new Map(combined.map((b) => [b.id, b])).values()
    );

    setBlogs(uniqueBlogs);
    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, [user]);

  /* ---------------- SAVE CALLBACK ---------------- */
  const handleSaved = () => {
    setEditingId(null);
    setIsCreating(false);
    loadBlogs();
  };

  /* ---------------- EDITOR VIEW ---------------- */
  if ((isCreating || editingId) && user) {
    return (
      <CommunityBlogEditor
        blogId={editingId}
        onSave={handleSaved}
        onCancel={() => {
          setEditingId(null);
          setIsCreating(false);
        }}
      />
    );
  }

  /* ---------------- STATUS BADGES ---------------- */
  const renderStatus = (blog: any) => {
    switch (blog.status) {
      case "approved":
        return (
          <span className="flex items-center gap-1 text-green-500 font-medium">
            <CheckCircle size={16} /> Published
          </span>
        );
      case "submitted":
        return (
          <span className="flex items-center gap-1 text-blue-500 font-medium">
            <Clock size={16} /> Under Review
          </span>
        );
      case "resubmitted":
        return (
          <span className="flex items-center gap-1 text-purple-500 font-medium">
            <RefreshCcw size={16} /> Resubmitted
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-red-500 font-medium">
            <XCircle size={16} /> Rejected
          </span>
        );
      default:
        return <span className="text-yellow-600">Draft</span>;
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div
      className={`min-h-screen p-6 transition ${
        theme === "light"
          ? "bg-gray-100"
          : "bg-gradient-to-br from-[#0f172a] to-[#020617]"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1
          className={`text-3xl font-bold ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          Your Community Blogs
        </h1>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl
            bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg transition"
        >
          <PlusCircle size={20} />
          Write New Blog
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && blogs.length === 0 && (
        <p
          className={`text-center ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          You haven't authored or collaborated on any community blogs yet.
        </p>
      )}

      {/* BLOG LIST */}
      <div className="grid md:grid-cols-2 gap-8 w-full">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className={`rounded-xl p-6 transition-all duration-200 flex flex-col
              ${
                theme === "light"
                  ? "bg-white border border-gray-300 shadow-md hover:shadow-xl hover:border-gray-400 hover:scale-[1.01]"
                  : "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 shadow-lg hover:border-slate-500 hover:shadow-2xl hover:scale-[1.02]"
              }`}
          >
            {/* TITLE */}
            <h3
              className={`text-xl font-bold mb-2 ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              {blog.title}
            </h3>

            {/* EXCERPT */}
            <p
              className={`text-sm mb-4 line-clamp-2 ${
                theme === "light" ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {blog.excerpt}
            </p>

            {/* STATUS */}
            <div className="flex items-center justify-between mb-3 text-sm">
              {renderStatus(blog)}

              {blog.isCollaborator && (
                <span
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    theme === "light"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  <Users size={12} />
                  Collaborator
                </span>
              )}
            </div>

            {/* ADMIN FEEDBACK */}
            {blog.status === "rejected" && blog.admin_feedback && (
              <div
                className={`p-3 rounded-lg text-sm mb-3 ${
                  theme === "light"
                    ? "bg-red-100 text-red-700"
                    : "bg-red-500/10 text-red-300"
                }`}
              >
                <b>Admin feedback:</b>
                <p>{blog.admin_feedback}</p>
              </div>
            )}

            {/* USER NOTE */}
            {blog.status === "resubmitted" && blog.submission_note && (
              <div
                className={`p-3 rounded-lg text-sm mb-3 ${
                  theme === "light"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-purple-500/10 text-purple-300"
                }`}
              >
                <b>Your Resubmission Note:</b>
                <p>{blog.submission_note}</p>
              </div>
            )}

            {/* EDIT BUTTON */}
            <button
              onClick={() => setEditingId(blog.id)}
              className={`mt-auto flex items-center gap-2 px-4 py-2 rounded-lg transition border ${
                theme === "light"
                  ? "text-blue-600 border-blue-600 hover:bg-blue-50"
                  : "text-blue-400 border-blue-400 hover:bg-blue-500/10"
              }`}
            >
              <Edit size={16} />
              {blog.status === "approved"
                ? "Edit & Resubmit"
                : blog.status === "rejected"
                ? "Fix & Resubmit"
                : "Edit"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
