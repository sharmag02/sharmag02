import { useEffect, useState } from "react";
import { Edit, PlusCircle, Clock, CheckCircle, XCircle, RefreshCcw } from "lucide-react";
import { supabase } from "../../shared/lib/supabase";
import { useAuth } from "../../shared/context/AuthContext";
import CommunityBlogEditor from "./CommunityBlogEditor";

export default function CommunityDashboard() {
  const { user } = useAuth();

  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  /* ---------------------------------------------------
     LOAD USER BLOGS
  --------------------------------------------------- */
  const loadBlogs = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("community_blogs")
      .select("*")
      .eq("author_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading community blogs:", error);
      setBlogs([]);
    } else {
      setBlogs(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, [user]);

  /* ---------------------------------------------------
     SAVE CALLBACK
  --------------------------------------------------- */
  const handleSaved = () => {
    setEditingId(null);
    setIsCreating(false);
    loadBlogs();
  };

  /* ---------------------------------------------------
     EDITOR VIEW
  --------------------------------------------------- */
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

  /* ---------------------------------------------------
     STATUS BADGE RENDERER
  --------------------------------------------------- */
  const renderStatus = (blog: any) => {
    switch (blog.status) {
      case "approved":
        return (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <CheckCircle size={16} /> Published
          </span>
        );

      case "submitted":
        return (
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            <Clock size={16} /> Under Review
          </span>
        );

      case "resubmitted":
        return (
          <span className="flex items-center gap-1 text-purple-600 font-medium">
            <RefreshCcw size={16} /> Resubmitted
          </span>
        );

      case "rejected":
        return (
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <XCircle size={16} /> Rejected
          </span>
        );

      default:
        return <span className="text-yellow-600">Draft</span>;
    }
  };

  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold dark:text-white">Your Community Blogs</h1>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition"
        >
          <PlusCircle size={20} />
          Write New Blog
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && blogs.length === 0 && (
        <p className="text-center dark:text-gray-400">
          You haven’t written any community blogs yet.
        </p>
      )}

      {/* BLOG LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 shadow flex flex-col"
          >
            {/* TITLE */}
            <h3 className="text-xl font-bold dark:text-white mb-2">{blog.title}</h3>

            {/* EXCERPT */}
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {blog.excerpt}
            </p>

            {/* STATUS + EDITED BADGE */}
            <div className="flex items-center justify-between mb-3 text-sm">
              {renderStatus(blog)}

              {/* Edited badge (after approval) */}
              {blog.is_edited && blog.status === "approved" && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  Edited
                </span>
              )}
            </div>

            {/* ADMIN FEEDBACK (only on rejection) */}
            {blog.status === "rejected" && blog.admin_feedback && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm mb-3">
                <b>Admin feedback:</b>
                <p>{blog.admin_feedback}</p>
              </div>
            )}

            {/* USER RESUBMISSION NOTE (if resubmitted) */}
            {blog.status === "resubmitted" && blog.submission_note && (
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm mb-3">
                <b>Your Resubmission Note:</b>
                <p>{blog.submission_note}</p>
              </div>
            )}

            {/* EDIT BUTTON */}
            <button
              onClick={() => setEditingId(blog.id)}
              className="mt-auto flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-500 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
