import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { Calendar, User, Pencil, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CommunityBlogList() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------------------------------------------------
     FETCH APPROVED BLOGS + CO-AUTHORS
  --------------------------------------------------- */
  const loadBlogs = async () => {
    setLoading(true);

    // Fetch approved blogs
    const { data: blogData, error } = await supabase
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

    if (error || !blogData) {
      setBlogs([]);
      setLoading(false);
      return;
    }

    // Fetch co-authors for those blogs
    const blogIds = blogData.map((b) => b.id);

    const { data: coauthorData } = await supabase
      .from("blog_collaborators")
      .select(`
        blog_id,
        profiles(full_name,email)
      `)
      .in("blog_id", blogIds)
      .eq("blog_type", "community");

    // Attach co-authors list to blogs
    const blogsWithCoauthors = blogData.map((blog) => {
      const matched = (coauthorData || []).filter(
        (c) => c.blog_id === blog.id
      );

      const coauthors = matched.map(
        (c) => c.profiles?.full_name || c.profiles?.email
      );

      return {
        ...blog,
        coauthors,
      };
    });

    setBlogs(blogsWithCoauthors);
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
            {blogs.map((blog) => {
              const author =
                blog.profiles?.full_name ||
                blog.profiles?.email ||
                "Author";

              const coauthors = blog.coauthors || [];
              const hasCoauthors = coauthors.length > 0;

              return (
                <article
                  key={blog.id}
                  onClick={() =>
                    navigate(`/community-blog/${blog.slug}`)
                  }
                  className="cursor-pointer rounded-2xl p-6 bg-white dark:bg-slate-800 shadow hover:shadow-xl transition flex flex-col"
                >
                  {/* TITLE + EDIT TAG */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-2xl font-bold dark:text-white">
                      {blog.title}
                    </h3>

                    {blog.is_edited && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        <Pencil size={12} /> Edited
                      </span>
                    )}
                  </div>

                  {/* EXCERPT */}
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                    {blog.excerpt}
                  </p>

                  {/* AUTHOR + COAUTHORS */}
                  <div className="mt-auto text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-blue-500" />

                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-slate-200">
                          {author}
                          {hasCoauthors && (
                            <span className="text-slate-500 dark:text-slate-400 font-normal">
                              {" · with "}
                              {coauthors.join(", ")}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* DATE */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar size={14} />
                      Published on{" "}
                      {new Date(blog.published_at).toLocaleDateString(
                        "en-IN"
                      )}
                    </div>

                    {/* Last updated */}
                    {blog.is_edited && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Pencil size={12} />
                        Updated on{" "}
                        {new Date(blog.updated_at).toLocaleDateString(
                          "en-IN"
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-blue-600 dark:text-blue-400 font-medium">
                    Read article →
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
