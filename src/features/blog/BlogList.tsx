import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { Calendar, User, BookOpen } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { NextPageArrow } from "../../shared/components/NextPageArrow";
import { BlogSubscribe } from "../blog/BlogSubscribe";

interface BlogWithAuthor {
  id: string; // ✅ UUID FIX
  title: string;
  content: string;
  slug: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

const BLOGS_PER_PAGE = 4;

/* ---------- TEXT PREVIEW ---------- */
const getTextPreview = (html: string, length = 160) => {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, "");
  return text.length > length ? text.slice(0, length) + "…" : text;
};

export function BlogList() {
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);

  /* ---------- FETCH BLOGS ---------- */
  const loadBlogs = async (page: number) => {
    setLoading(true);

    const from = (page - 1) * BLOGS_PER_PAGE;
    const to = from + BLOGS_PER_PAGE - 1;

    try {
      // ✅ COUNT (RLS SAFE)
      const { count } = await supabase
        .from("blogs")
        .select("*", { count: "exact", head: true })
        .eq("published", true);

      setTotalBlogs(count ?? 0);

      // ✅ PAGINATED FETCH
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          id,
          title,
          content,
          slug,
          created_at,
          profiles (
            full_name,
            email
          )
        `)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setBlogs(data || []);
    } catch (err) {
      console.error("Error loading blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);

  /* ---------- UI ---------- */
  return (
    <section
      id="blog"
      className="relative py-10 px-6 bg-slate-50 dark:bg-gray-900 min-h-screen"
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Latest Blogs
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Thoughts, tutorials & experiences I love to share ✨
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
          </div>
        )}

        {/* EMPTY */}
        {!loading && blogs.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No blogs published yet
            </p>
          </div>
        )}

        {/* BLOG GRID */}
        {!loading && blogs.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 gap-10">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="group relative p-1 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_#3b82f6]"
                >
                  <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 transform group-hover:scale-105 transition flex flex-col h-full">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600">
                      {blog.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3">
                      {getTextPreview(blog.content)}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        {blog.profiles?.full_name ||
                          blog.profiles?.email ||
                          "Anonymous"}
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(blog.created_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>

                    <div className="mt-4 text-blue-600 font-medium">
                      Read article →
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setSearchParams({ page: String(page) })}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-blue-500 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BlogSubscribe />
      <NextPageArrow />
    </section>
  );
}
