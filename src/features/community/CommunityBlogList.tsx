import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { Calendar, User, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CommunityBlogList() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------------------------------------------------
     FETCH ONLY APPROVED BLOGS (PUBLIC VIEW)
  --------------------------------------------------- */
  const loadBlogs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("community_blogs")
      .select(`
        id,
        title,
        excerpt,
        slug,
        published_at,
        updated_at,
        is_edited,
        profiles:profiles!community_blogs_author_id_fkey(
          full_name,
          email
        )
      `)
      .eq("status", "approved")
      .order("published_at", { ascending: false })
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
  }, []);

  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */
  return (
    <section className="py-12 px-6 bg-slate-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-center font-bold dark:text-white mb-10">
          Community Blogs
        </h2>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
          </div>
        )}

        {/* EMPTY */}
        {!loading && blogs.length === 0 && (
          <p className="text-center dark:text-gray-400">
            No community blogs published yet.
          </p>
        )}

        {/* BLOG GRID */}
        {!loading && blogs.length > 0 && (
          <div className="grid md:grid-cols-2 gap-10">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                onClick={() => navigate(`/community-blog/${blog.slug}`)}
                className="cursor-pointer rounded-2xl p-6 bg-white dark:bg-slate-800 shadow hover:shadow-xl transition flex flex-col"
              >
                {/* TITLE */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-2xl font-bold dark:text-white">
                    {blog.title}
                  </h3>

                  {blog.is_edited && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      <Pencil size={12} />
                      Edited
                    </span>
                  )}
                </div>

                {/* EXCERPT */}
                <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                  {blog.excerpt}
                </p>

                {/* META DETAILS */}
                <div className="mt-auto text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    {blog.profiles?.full_name ||
                      blog.profiles?.email ||
                      "Community Member"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    Published on{" "}
                    {new Date(blog.published_at).toLocaleDateString("en-IN")}
                  </div>

                  {blog.is_edited && (
                    <div className="flex items-center gap-2 text-xs">
                      <Pencil size={12} />
                      Updated on{" "}
                      {new Date(blog.updated_at).toLocaleDateString("en-IN")}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-blue-600 font-medium">
                  Read article →
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
