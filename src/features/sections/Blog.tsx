import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { Blog as BlogType } from "../../shared/types/database";
import { Link } from "react-router-dom";


const HOME_BLOG_LIMIT = 4;

export function Blog() {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH LATEST 4 BLOGS ---------------- */
  const fetchBlogs = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          id,
          title,
          excerpt,
          slug,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(HOME_BLOG_LIMIT);

      if (error) throw error;
      setBlogs(data ?? []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <section
      id="blog"
      className="py-16 px-6 bg-slate-50 dark:bg-gray-900 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Latest Blogs
          </h2>
          <div className="w-32 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No blogs found.
          </p>
        ) : (
          <>
            {/* BLOG CARDS */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex flex-col hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {blog.excerpt || "Read more to explore this article."}
                  </p>

                  <div className="mt-auto">
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Read article →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* VIEW ALL */}
            <div className="text-center mt-12">
              <Link
                to="/blogs"
                className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                View all blogs →
              </Link>
            </div>
          </>
        )}
      </div>

    </section>
  );
}
