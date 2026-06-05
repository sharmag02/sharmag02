import { useEffect, useState } from "react";
import { motion,  AnimatePresence } from "framer-motion";
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

  if (loading) {
  return (
    <section
      id="blog"
      className="
        py-16
        px-6
        bg-slate-50
        dark:bg-gray-900
        overflow-hidden
      "
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Space */}
        <div className="h-[120px]" />

        {/* Blog Cards Space */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="h-[250px]" />
          <div className="h-[250px]" />
          <div className="h-[250px]" />
          <div className="h-[250px]" />
        </div>
      </div>
    </section>
  );
}
  return (
    <section
      id="blog"
      className="py-16 px-6 bg-slate-50 dark:bg-gray-900 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
             <motion.div
  className="text-center mb-12"
  initial={{ opacity: 0, y: -40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{amount: 0.3}}
  transition={{ duration: 0.8 }}
>
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Latest Blogs
          </h2>
          <div className="w-32 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
        </div>
        </motion.div>

        {/* LOADING */}
       { blogs.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            No blogs found.
          </p>
        ) : (
          <>
            {/* BLOG CARDS */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {blogs.map((blog, index) => (
  <motion.div
    key={blog.id}
    initial={{
      opacity: 0,
      y: 30,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    viewport={{
      amount: 0.35,
      once: false,
    }}
    transition={{
      duration: 0.7,
      delay: index * 0.08,
      ease: "easeOut",
    }}
    whileHover={{
      y: -4,
    }}
                className="
group
bg-white
dark:bg-gray-800
rounded-2xl
shadow-md
p-6
flex
flex-col
transition-all
duration-500
group-hover:scale-[1.03]
group-hover:shadow-[0_0_25px_#3b82f6]
"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {blog.excerpt || "Read more to explore this article."}
                  </p>

                  <motion.div
  className="mt-auto"
  whileHover={{
    x: 4,
  }}
>
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Read article →
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* VIEW ALL */}
            <motion.div
  className="text-center mt-12"
  whileHover={{
    y: -2,
  }}
>
              <Link
                to="/blogs"
                className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                View all blogs →
              </Link>
            </motion.div>
          </>
        )}
      </div>

    </section>
  );
}
