
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, } from "react-router-dom";
import { supabase } from "../../shared/lib/supabase";

import { Calendar, User, BookOpen, PenLine, ArrowLeft } from "lucide-react";

import { NextPageArrow } from "../../shared/components/NextPageArrow";
import { BlogSubscribe } from "../blog/BlogSubscribe";
import { useAuth } from "../../shared/context/AuthContext";


const BLOGS_PER_PAGE = 3;


export default function CategoryBlogs() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
const [searchParams, setSearchParams] =
  useSearchParams();

const currentPage = Number(
  searchParams.get("page") || 1
);



  const { user, profile } = useAuth();

  const [blogs, setBlogs] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  
const totalPages = Math.ceil(
  blogs.length / BLOGS_PER_PAGE
);

const paginatedBlogs = blogs.slice(
  (currentPage - 1) * BLOGS_PER_PAGE,
  currentPage * BLOGS_PER_PAGE
);



  /* ---------- SUBMIT BLOG ---------- */
  const handleSubmitBlog = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile?.is_admin) {
      navigate("/admin");
      return;
    }

    navigate("/community/dashboard");
  };

  /* ---------- LOAD BLOGS ---------- */
  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);

      try {
        /* CATEGORY */
        const { data: category } = await supabase
          .from("blog_categories")
          .select("*")
          .eq("slug", slug)
          .single();

        if (!category) return;

        setCategoryName(category.name);

        /* NORMAL BLOGS */
        const { data: normalBlogs } = await supabase
          .from("blogs")
          .select(`
            *,
            profiles:profiles!blogs_author_id_fkey(
              full_name,
              email
            )
          `)
          .eq("category_id", category.id)
          .eq("published", true);
          const normalIds =
  (normalBlogs || []).map((b) => b.id);

const { data: blogCoauthorData } = await supabase
  .from("blog_collaborators")
  .select(`
    blog_id,
    profiles(full_name,email)
  `)
  .in("blog_id", normalIds)
  .eq("blog_type", "blog");

        /* COMMUNITY BLOGS */
        const { data: communityBlogs } = await supabase
          .from("community_blogs")
          .select(`
            *,
            profiles:profiles!community_blogs_author_id_fkey(
              full_name,
              email
            )
          `)
          .eq("category_id", category.id)
          .eq("status", "approved");

          const communityIds =
  (communityBlogs || []).map((b) => b.id);

const { data: communityCoauthorData } =
  await supabase
    .from("blog_collaborators")
    .select(`
      blog_id,
      profiles(full_name,email)
    `)
    .in("blog_id", communityIds)
    .eq("blog_type", "community");
        /* MERGE */
        const mergedBlogs = [
          ...(normalBlogs || []).map((b) => {

  const coauthors =
    (blogCoauthorData || [])
      .filter((c) => c.blog_id === b.id)
      .map(
        (c) =>
          c.profiles?.full_name ||
          c.profiles?.email
      );

  return {
    ...b,

    url: `/blog/category/${category.slug}/${b.slug}`,

    type: "blog",

    author:
      b.profiles?.full_name ||
      b.profiles?.email,

    coauthors,
  };
}),

         ...(communityBlogs || []).map((b) => {

  const coauthors =
    (communityCoauthorData || [])
      .filter((c) => c.blog_id === b.id)
      .map(
        (c) =>
          c.profiles?.full_name ||
          c.profiles?.email
      );

  return {
    ...b,

    url: `/community-blog/category/${category.slug}/${b.slug}`,

    type: "community",

    author:
      b.profiles?.full_name ||
      b.profiles?.email,

    coauthors,
  };
})
        ].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setBlogs(mergedBlogs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [slug]);

  return (
    <section className="relative py-10 px-6 bg-slate-50 dark:bg-gray-900 min-h-screen">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        
{/* HEADER */}
<div className="mb-14">

  {/* BACK BUTTON */}
 
<div className="mb-8">

  <button
    onClick={() => navigate("/blog")}
    className="
      group inline-flex items-center gap-2

      px-4 py-2 rounded-full

      bg-white dark:bg-gray-800

      border border-gray-200
      dark:border-gray-700

      text-sm font-medium

      text-gray-700
      dark:text-gray-300

      hover:bg-blue-600
      dark:hover:bg-blue-500

      hover:text-white
      dark:hover:text-white

      hover:border-blue-600
      dark:hover:border-blue-400

      hover:scale-105

      hover:shadow-[0_0_20px_#2563eb55]
      dark:hover:shadow-[0_0_25px_#3b82f6aa]

      active:scale-95

      transition-all duration-300
    "
  >

    <ArrowLeft
      size={15}
      className="
        transition-all duration-300

        group-hover:-translate-x-1
      "
    />

    <span>
      Back to Categories
    </span>

  </button>

</div>



  {/* CENTER HEADER */}
  <div className="text-center">

    

    <h1 className="text-4xl md:text-5xl font-bold dark:text-white mb-4">
      {categoryName} 
    </h1>
    

    <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mb-4" />
<div
      className="
        inline-flex items-center
        px-3 py-1
        text-[10px] font-medium
        tracking-wide uppercase
        rounded-full
        bg-blue-100/80 dark:bg-blue-900/30
        text-blue-700 dark:text-blue-300
        border border-blue-200 dark:border-blue-800
        mb-5
      "
    >
      Blog Category
    </div>
    <p className="text-gray-600 dark:text-gray-300">
      Explore all blogs and technical articles related to {categoryName} Blog Category
    </p>

  </div>
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
              No blogs found in this category.
            </p>
          </div>
        )}

        {/* BLOG GRID */}
        {!loading && blogs.length > 0 && (
          <div className="grid md:grid-cols-2 gap-10">

            {paginatedBlogs.map((blog) => (

              <article
                key={blog.id}
                onClick={() => navigate(blog.url)}
                className="
                  group relative p-1 rounded-2xl cursor-pointer
                  transition-all duration-300
                  hover:shadow-[0_0_25px_#3b82f6]
                "
              >

                <div
                  className="
                    rounded-2xl p-6
                    bg-white dark:bg-gray-800
                    transform group-hover:scale-105
                    transition flex flex-col h-full
                  "
                >

                  {/* COMMUNITY TAG */}
                  {blog.type === "community" && (
                    <span
                      className="
                        px-3 py-1 text-xs rounded-full
                        bg-purple-100 text-purple-700
                        mb-3 self-start
                      "
                    >
                      Community Blog
                    </span>
                  )}

                  {/* TITLE */}
                  <h3
                    className="
                      text-xl md:text-2xl font-bold
                      dark:text-white mb-3
                      group-hover:text-blue-600
                    "
                  >
                    {blog.title}
                  </h3>

                  {/* EXCERPT */}
                  <p
                    className="
                      text-gray-600 dark:text-gray-300
                      text-sm mb-6 line-clamp-3
                    "
                  >
                    {blog.excerpt}
                  </p>

                  {/* AUTHOR + DATE */}
                  <div
                    className="
                      mt-auto pt-4
                      border-t border-gray-200 dark:border-gray-700
                      text-sm text-gray-500 dark:text-gray-400
                      space-y-2
                    "
                  >

                    <div className="flex items-center gap-2">
                      <User size={14} />
                     <span>
  {blog.author}

  {blog.coauthors &&
    blog.coauthors.length > 0 && (
      <span className="text-gray-500 dark:text-gray-400">
        {" · with "}
        {blog.coauthors.join(", ")}
      </span>
  )}
</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={14} />

                      {new Date(
                        blog.created_at
                      ).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 text-blue-600 font-medium">
                    Read article →
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}
        
{/* PAGINATION */}
{totalPages > 1 && (
  <div className="flex justify-center gap-3 mt-14">

    {Array.from(
      { length: totalPages },
      (_, i) => i + 1
    ).map((page) => (

      <button
        key={page}
        onClick={() =>
          setSearchParams({
            page: String(page),
          })
        }
        className={`
          px-4 py-2 rounded-xl
          font-semibold
          transition-all duration-300

          ${
            page === currentPage
              ? `
                bg-blue-600 text-white
                shadow-[0_0_20px_#2563eb55]
                scale-105
              `
              : `
                bg-white dark:bg-gray-800
                text-gray-700 dark:text-gray-300

                border border-gray-200
                dark:border-gray-700

                hover:bg-blue-600
                hover:text-white
                hover:border-blue-600

                hover:scale-105
                hover:shadow-[0_0_20px_#2563eb44]
              `
          }
        `}
      >
        {page}
      </button>
    ))}
  </div>
)}


      </div>

      {/* FOOTER */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-20 mb-10">

        <BlogSubscribe />

        <button
          onClick={handleSubmitBlog}
          className="
            px-8 py-3 rounded-xl
            bg-blue-600 text-white
            shadow-lg
            flex items-center gap-2
            hover:bg-blue-700
            hover:scale-105
            hover:shadow-[0_0_20px_#2563eb]
            transition-all duration-300
          "
        >
          <PenLine size={20} />
          Submit your blog
        </button>
      </div>

      <NextPageArrow />
    </section>
  );
}

