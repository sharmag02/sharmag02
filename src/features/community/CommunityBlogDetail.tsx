import {
  Calendar,
  User,
  Heart,
  Share2,
  ArrowLeft,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

export default function CommunityBlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [blog, setBlog] = useState<any>(null);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);

  // COMMENTS
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // TOC
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<
    { id: string; text: string; level: number; index: string }[]
  >([]);

  /* ---------------------------------------------------
     LOAD BLOG (APPROVED ONLY)
  --------------------------------------------------- */
  useEffect(() => {
    if (!slug) return;

    const loadBlog = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("community_blogs")
        .select(
          `
          *,
          profiles:profiles!community_blogs_author_id_fkey(full_name,email)
        `
        )
        .eq("slug", slug)
        .eq("status", "approved")
        .single();

      if (error || !data) {
        console.error("Error loading blog:", error);
        navigate("/community-blog");
        return;
      }

      setBlog(data);
      setLikes(data.likes ?? 0);
      setLoading(false);
    };

    loadBlog();
  }, [slug, navigate]);

  /* ---------------------------------------------------
     LOAD COMMENTS
  --------------------------------------------------- */
  const loadComments = async (blogId: string) => {
    const { data, error } = await supabase
      .from("community_comments")
      .select("*, profiles(full_name,email,is_admin)")
      .eq("community_blog_id", blogId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load community comments:", error);
      return;
    }

    setComments(data || []);
  };

  useEffect(() => {
    if (blog?.id) loadComments(blog.id);
  }, [blog]);

  /* ---------------------------------------------------
     ADD COMMENT
  --------------------------------------------------- */
  const handleComment = async () => {
    if (!user || !newComment.trim() || !blog) return;

    const { error } = await supabase.from("community_comments").insert({
      community_blog_id: blog.id,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      console.error("Failed to insert community comment:", error);
      return;
    }

    setNewComment("");
    loadComments(blog.id);
  };

  /* ---------------------------------------------------
     EDIT COMMENT
  --------------------------------------------------- */
  const saveEdit = async () => {
    if (!editId || !editText.trim()) return;

    const { error } = await supabase
      .from("community_comments")
      .update({ content: editText })
      .eq("id", editId);

    if (error) {
      console.error("Failed to edit comment:", error);
      return;
    }

    setEditId(null);
    setEditText("");
    loadComments(blog.id);
  };

  /* ---------------------------------------------------
     DELETE COMMENT
  --------------------------------------------------- */
  const confirmDelete = async () => {
    if (!deleteId || !blog) return;

    const { error } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", deleteId);

    if (error) {
      console.error("Failed to delete comment:", error);
      return;
    }

    setDeleteId(null);
    loadComments(blog.id);
  };

  /* ---------------------------------------------------
     LIKE
  --------------------------------------------------- */
  const handleLike = async () => {
    if (!user) return alert("Login first");

    if (sessionStorage.getItem(`community_like_${blog.id}`)) return;

    await supabase
      .from("community_blogs")
      .update({ likes: likes + 1 })
      .eq("id", blog.id);

    sessionStorage.setItem(`community_like_${blog.id}`, "true");
    setLikes((l) => l + 1);
  };

  /* ---------------------------------------------------
     TOC GENERATION
  --------------------------------------------------- */
  useEffect(() => {
    if (!blog?.content) return;

    const div = document.createElement("div");
    div.innerHTML = blog.content;

    let h1 = 0,
      h2 = 0,
      h3 = 0;

    const headings = Array.from(div.querySelectorAll("h1, h2, h3")).map(
      (el) => {
        const level = Number(el.tagName.replace("H", ""));
        const text = el.textContent || "";
        const id = text.toLowerCase().replace(/\s+/g, "-");

        let index = "";
        if (level === 1) {
          h1++;
          h2 = 0;
          h3 = 0;
          index = `${h1}`;
        } else if (level === 2) {
          h2++;
          index = `${h1}.${h2}`;
        } else {
          h3++;
          index = `${h1}.${h2}.${h3}`;
        }

        return { id, text, level, index };
      }
    );

    setToc(headings);
  }, [blog]);

  /* ---------------------------------------------------
     ASSIGN IDs TO REAL DOM
  --------------------------------------------------- */
  useEffect(() => {
    if (!contentRef.current) return;

    toc.forEach((item) => {
      const els = contentRef.current.querySelectorAll(`h${item.level}`);
      els.forEach((el) => {
        if (el.textContent?.trim() === item.text.trim()) {
          el.setAttribute("id", item.id);
        }
      });
    });
  }, [toc]);

  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */

  if (loading) return <p className="text-center mt-20">Loading…</p>;
  if (!blog) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-slate-600 dark:text-slate-300"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <article className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-10 leading-relaxed">
        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          {blog.title}
        </h1>

        {/* META */}
        <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400 mb-8">
          <span className="flex items-center gap-1">
            <User size={16} />
            {blog.profiles?.full_name || blog.profiles?.email}
          </span>

          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {new Date(blog.published_at).toLocaleDateString("en-IN")}
          </span>
        </div>

        {/* LIKE + SHARE */}
        <div className="flex gap-6 mb-10">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-red-500 hover:scale-105 transition"
          >
            <Heart size={20} /> {likes}
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-400 transition"
          >
            <Share2 size={20} /> Share
          </button>
        </div>

        {/* TOC */}
        {toc.length > 0 && (
          <div className="mb-10 p-5 rounded-xl bg-slate-100 dark:bg-slate-800 shadow">
            <h3 className="text-xl font-semibold mb-3 dark:text-white">
              Table of Contents
            </h3>

            <ol className="space-y-2 ml-1">
              {toc.map((item) => (
                <li
                  key={item.id}
                  className={`cursor-pointer hover:text-blue-500 transition ${
                    item.level === 2
                      ? "ml-4"
                      : item.level === 3
                      ? "ml-8"
                      : ""
                  }`}
                  onClick={() =>
                    document
                      .getElementById(item.id)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <span className="font-semibold mr-2">{item.index}</span>
                  {item.text}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* CONTENT */}
        <div
          ref={contentRef}
          className="prose prose-slate dark:prose-invert max-w-none blog-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* COMMENTS */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6 dark:text-slate-100">
            Comments
          </h3>

          {/* ADD COMMENT */}
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

          {/* COMMENTS LIST */}
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

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-700 p-6 rounded-2xl">
            <p className="mb-4 dark:text-slate-200">Delete this comment?</p>
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
