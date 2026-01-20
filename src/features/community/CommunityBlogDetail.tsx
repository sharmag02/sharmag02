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
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { useAuth } from "../../shared/context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

/* ---------------- TYPES ---------------- */

interface BlogDetailType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  published_at?: string;
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
// Generate unique IDs for all H1/H2/H3 before rendering
const addHeadingIds = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;

  let count = 0;

  div.querySelectorAll("h1, h2, h3").forEach((el) => {
    const text = el.textContent?.trim() || "section";
    const id =
      text.toLowerCase().replace(/[^\w]+/g, "-") + "-" + count++;

    el.setAttribute("id", id);
  });

  return div.innerHTML;
};

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
const [hasLiked, setHasLiked] = useState(false);

  // ⭐ Coauthors
  const [coauthors, setCoauthors] = useState<any[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ========= ToC ========= */
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<
    { id: string; text: string; level: number; index: string }[]
  >([]);

  /* ---------------- LOAD BLOG + COAUTHORS ---------------- */

 /* ---------------- LOAD COMMUNITY BLOG + COAUTHORS ---------------- */
useEffect(() => {
  if (!slug) return;

  const loadBlog = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("community_blogs")
      .select(`
        *,
        profiles:profiles!community_blogs_author_id_fkey(full_name,email)
      `)
      .eq("slug", slug)
      .eq("status", "approved")   // ✔ correct filter
      .maybeSingle();

    if (error || !data) {
      navigate("/community-blog");  // ✔ correct redirect
      return;
    }

    setBlog({
  ...data,
  content: addHeadingIds(data.content),
});

    setLikes(data.likes ?? 0);

    // Load coauthors
    const { data: coauthorList } = await supabase
      .from("blog_collaborators")
      .select(`profiles(full_name,email)`)
      .eq("blog_id", data.id)
      .eq("blog_type", "community");   // ✔ correct blog type

    setCoauthors(coauthorList || []);
    setLoading(false);
  };

  loadBlog();
}, [slug, navigate]);


/* ---------------- CHECK IF USER ALREADY LIKED ---------------- */
useEffect(() => {
  if (!blog || !user) return;

  const key = `community_like_${blog.id}_${user.id}`;

  if (localStorage.getItem(key)) {
    setHasLiked(true);
  } else {
    setHasLiked(false);
  }
}, [blog, user]);

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
  if (!user || !blog) {
    alert("Please login to like this post");
    return;
  }

  const key = `community_like_${blog.id}_${user.id}`;

  if (localStorage.getItem(key)) {
    alert("Thanks! You already liked this post ❤️");
    return;
  }

  const { error } = await supabase
    .from("community_blogs")
    .update({ likes: likes + 1 })
    .eq("id", blog.id);

  if (error) {
    console.error("Like error:", error);
    alert("Failed to like the post.");
    return;
  }

  localStorage.setItem(key, "true");
  setLikes((prev) => prev + 1);

  alert("Thank you for liking this post ❤️");
};




  /* ---------------- COMMENT ACTIONS ---------------- */

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

  const saveEdit = async () => {
    if (!editId || !editText.trim()) return;

    await supabase.from("comments").update({ content: editText }).eq("id", editId);

    setEditId(null);
    setEditText("");
    loadComments(blog!.id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    await supabase.from("comments").delete().eq("id", deleteId);
    setDeleteId(null);
    loadComments(blog!.id);
  };

  /* ---------------- TOC ---------------- */

 useEffect(() => {
  if (!blog?.content) return;

  const div = document.createElement("div");
  div.innerHTML = blog.content;

  let h1 = 0, h2 = 0, h3 = 0;

  const found = Array.from(div.querySelectorAll("h1, h2, h3")).map((el) => {
    const level = Number(el.tagName.replace("H", ""));
    const text = el.textContent?.trim() || "";
    const id = el.getAttribute("id") || "";

    let index = "";
    if (level === 1) {
      h1++;
      h2 = 0;
      h3 = 0;
      index = `${h1}`;
    } else if (level === 2) {
      h2++;
      h3 = 0;
      index = `${h1}.${h2}`;
    } else {
      h3++;
      index = `${h1}.${h2}.${h3}`;
    }

    return { id, text, level, index };
  });

  setToc(found);
}, [blog]);


  

  /* ---------------- AUTHOR INFO ---------------- */

  const authorName =
    blog?.profiles?.full_name || blog?.profiles?.email || "Author";

  const coauthorNames = coauthors
    .map((c) => c.profiles?.full_name || c.profiles?.email)
    .filter(Boolean);

  /* ---------------- UI ---------------- */

  if (loading) return <p className="text-center mt-16">Loading blog…</p>;
  if (!blog) return null;
  
     const handleShare = async () => {
  const url = window.location.href;

  // Native share (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: blog.title,
        text: "Check out this blog!",
        url,
      });
      return;
    } catch {}
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  } catch {
    alert("Failed to copy. Please manually copy the link.");
  }
};

 return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back */}
      <button
  onClick={() => navigate(-1)}
  className="
    flex items-center gap-2 mb-8
    text-slate-700 hover:text-blue-500
    dark:text-slate-600 dark:hover:text-blue-400
    font-medium
  "
>
  <ArrowLeft size={18} /> Back
</button>

      <article className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-10 leading-relaxed">

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-6 text-slate-900 dark:text-slate-100">
          {blog.title}
        </h1>

        {/* ⭐ AUTHOR + COAUTHORS */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
          {/* Avatars */}
          <div className="flex -space-x-3">
            {/* Main Author */}
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold ring-2 ring-white dark:ring-slate-900">
              {authorName[0]?.toUpperCase()}
            </div>

            {/* Coauthors */}
            {coauthorNames.slice(0, 3).map((name, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full bg-slate-400 text-white flex items-center justify-center text-lg font-semibold ring-2 ring-white dark:ring-slate-900"
              >
                {name[0]?.toUpperCase()}
              </div>
            ))}
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Written by
            </span>

            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {authorName}
              {coauthorNames.length > 0 && (
                <span className="font-normal text-slate-600 dark:text-slate-400">
                  {" "}· with {coauthorNames.join(", ")}
                </span>
              )}
            </span>

            <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              <Calendar size={14} />
              Published on{" "}
              {new Date(blog.published_at || blog.created_at).toLocaleDateString(
                "en-IN",
                { day: "numeric", month: "short", year: "numeric" }
              )}
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-6 mb-10">
          <button onClick={handleLike} className="flex items-center gap-2 text-red-500 hover:scale-105 transition">
            <Heart size={20} /> {likes}
          </button>

          <button
  onClick={handleShare}
  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-400 transition"
>
  <Share2 size={20} /> Share
</button>
        </div>

        {/* TOC */}
        {toc.length > 0 && (
          <div className="mb-10 p-5 rounded-xl bg-slate-100 dark:bg-slate-800 shadow">
            <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">
              Table of Contents
            </h3>

            <ol className="space-y-2 ml-1 text-slate-700 dark:text-slate-300">
              {toc.map((item) => (
                <li
                  key={item.id}
                  className={`cursor-pointer hover:text-blue-400 dark:hover:text-blue-300 transition ${
                    item.level === 2
                      ? "ml-4"
                      : item.level === 3
                      ? "ml-8"
                      : ""
                  }`}
                  onClick={() =>
                    document.getElementById(item.id)?.scrollIntoView({
                      behavior: "smooth",
                    })
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
          <h3 className="text-2xl font-semibold mb-6 dark:text-slate-100">Comments</h3>

          {/* ADD COMMENT */}
          {user && (
            <div className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-4 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              />
              <button
                onClick={handleComment}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl"
              >
                Post Comment
              </button>
            </div>
          )}

          {/* COMMENT LIST */}
          {comments.map((c) => {
            const isOwner = user?.id === c.user_id;
            const isAdmin = profile?.is_admin;

            return (
              <div key={c.id} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4">
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
                      className="w-full mt-2 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
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
