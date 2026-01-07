import {
  Calendar,
  User,
  Heart,
  Share2,
  ArrowLeft,
  Trash2,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { useAuth } from "../../shared/context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

/* ---------------- TYPES ---------------- */

interface BlogDetailType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface CommentType {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
    is_admin?: boolean;
  } | null;
}

/* ---------------- COMPONENT ---------------- */

export default function BlogDetail() {
  const { user, profile } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<BlogDetailType | null>(null);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ---------------- LOAD BLOG ---------------- */

  useEffect(() => {
    if (!slug) return;

    const loadBlog = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("blogs")
        .select("id,title,content,created_at,likes,profiles(full_name,email)")
        .eq("slug", slug)
        .eq("published", true) // ✅ IMPORTANT
        .maybeSingle();

      if (error || !data) {
        navigate("/blog");
        return;
      }

      setBlog(data);
      setLikes(data.likes || 0);
      setLoading(false);
    };

    loadBlog();
  }, [slug, navigate]);

  /* ---------------- LOAD COMMENTS ---------------- */

  const loadComments = async (blogId: string) => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(full_name,email,is_admin)")
      .eq("blog_id", blogId)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  useEffect(() => {
    if (blog) loadComments(blog.id);
  }, [blog]);

  /* ---------------- LIKE ---------------- */

  const handleLike = async () => {
    if (!blog || !user) return alert("Login to like the post");

    const liked = sessionStorage.getItem(`liked_${blog.id}`);
    if (liked) return;

    await supabase
      .from("blogs")
      .update({ likes: likes + 1 })
      .eq("id", blog.id);

    sessionStorage.setItem(`liked_${blog.id}`, "true");
    setLikes((l) => l + 1);
  };

  /* ---------------- ADD COMMENT ---------------- */

  const handleComment = async () => {
    if (!user || !newComment.trim() || !blog) return;

    await supabase.from("comments").insert({
      blog_id: blog.id,
      user_id: user.id,
      content: newComment.trim(),
    });

    setNewComment("");
    loadComments(blog.id);
  };

  /* ---------------- EDIT COMMENT ---------------- */

  const saveEdit = async () => {
    if (!editId || !editText.trim()) return;

    await supabase
      .from("comments")
      .update({ content: editText })
      .eq("id", editId);

    setEditId(null);
    setEditText("");
    loadComments(blog!.id);
  };

  /* ---------------- DELETE COMMENT ---------------- */

  const confirmDelete = async () => {
    if (!deleteId) return;

    await supabase.from("comments").delete().eq("id", deleteId);
    setDeleteId(null);
    loadComments(blog!.id);
  };

  if (loading) {
    return <p className="text-center mt-16">Loading blog…</p>;
  }

  if (!blog) return null;

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-slate-600 dark:text-slate-900 hover:text-blue-500"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <article className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          {blog.title}
        </h1>

        {/* META */}
        <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
          <span className="flex items-center gap-1">
            <User size={16} />
            {blog.profiles?.full_name || "Anonymous"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {new Date(blog.created_at).toLocaleDateString("en-IN")}
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-6 mb-10">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-red-500 hover:scale-105 transition"
          >
            <Heart size={20} /> {likes}
          </button>

          <button
            onClick={() =>
              navigator.clipboard.writeText(window.location.href)
            }
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-400 transition"
          >
            <Share2 size={20} /> Share
          </button>
        </div>

        {/* CONTENT */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* COMMENTS */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6 dark:text-slate-100">
            Comments
          </h3>

          {user && (
            <div className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-4 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleComment}
                className="mt-4 bg-blue-600 hover:bg-blue-500 transition text-white px-5 py-2 rounded-xl"
              >
                Post Comment
              </button>
            </div>
          )}

          {comments.map((c) => {
            const isOwner = user?.id === c.user_id;
            const isAdmin = profile?.is_admin;

            return (
              <div
                key={c.id}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium dark:text-slate-200">
                      {c.profiles?.full_name || "User"}
                    </p>

                    {c.profiles?.is_admin && (
                      <span className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                        <ShieldCheck size={12} /> Admin
                      </span>
                    )}
                  </div>

                  {(isOwner || isAdmin) && (
                    <div className="flex gap-2">
                      {isOwner && (
                        <Pencil
                          size={16}
                          className="cursor-pointer text-blue-400"
                          onClick={() => {
                            setEditId(c.id);
                            setEditText(c.content);
                          }}
                        />
                      )}
                      <Trash2
                        size={16}
                        className="cursor-pointer text-red-500"
                        onClick={() => setDeleteId(c.id)}
                      />
                    </div>
                  )}
                </div>

                {editId === c.id ? (
                  <>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      onClick={saveEdit}
                      className="mt-2 text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 mt-1">
                    {c.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </article>

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-700 p-6 rounded-2xl">
            <p className="mb-4 dark:text-slate-200">
              Delete this comment?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-1.5 rounded-lg border dark:border-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-1.5 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
