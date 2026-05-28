import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { Calendar, User, BookOpen, PenLine } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { NextPageArrow } from "../../shared/components/NextPageArrow";
import { BlogSubscribe } from "../blog/BlogSubscribe";
import { useAuth } from "../../shared/context/AuthContext";

// interface BaseBlog {
//   id: string;
//   title: string;
//   content: string;
//   slug: string;
//   created_at: string;
//   excerpt?: string;
//   author_name?: string;
//   type: "blog" | "community";
//   coauthors?: string[];
//   category_id?: string;
// category_name?: string;
// category_slug?: string;
// }

const BLOGS_PER_PAGE = 6;

/* ---------- TEXT PREVIEW ---------- */
const getTextPreview = (html: string, length = 160) => {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, "");
  return text.length > length ? text.slice(0, length) + "…" : text;
};

export function BlogList() {
  const { user, profile } = useAuth();

  
  const [loading, setLoading] = useState(true);
 const [categories, setCategories] = useState<any[]>([]);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);
  
const totalPages = Math.ceil(
  categories.length / BLOGS_PER_PAGE
);

const paginatedCategories = categories.slice(
  (currentPage - 1) * BLOGS_PER_PAGE,
  currentPage * BLOGS_PER_PAGE
);



  /* ---------- FETCH BLOGS ---------- */
//   const loadBlogs = async (page: number) => {
//     setLoading(true);

//     try {
//       const from = (page - 1) * BLOGS_PER_PAGE;
//       const to = from + BLOGS_PER_PAGE - 1;

//       /* --------------------------------------------------------------
//          1️⃣ FETCH NORMAL BLOGS WITH AUTHOR
//       -------------------------------------------------------------- */
//       const { data: normalBlogs } = await supabase
//         .from("blogs")
//         .select(`
//           id,
//           title,
//           content,
//           slug,
//           created_at,
//           excerpt,
//           profiles:profiles!blogs_author_id_fkey(full_name, email)
//           category:blog_categories(id,name,slug)
//         `)
//         .eq("published", true)
//         .order("created_at", { ascending: false });

//       const mappedNormalBlogs: BaseBlog[] =
//         normalBlogs?.map((b) => ({
//           id: b.id,
//           title: b.title,
//           content: b.content,
//           slug: `/blog/${b.slug}`,
//           created_at: b.created_at,
//           excerpt: b.excerpt,
//           category_id: b.category?.id,
// category_name: b.category?.name,
// category_slug: b.category?.slug,
//           author_name: b.profiles?.full_name || b.profiles?.email,
//           type: "blog",
//         })) || [];

//       /* --------------------------------------------------------------
//          2️⃣ FETCH CO-AUTHORS FOR NORMAL BLOGS
//       -------------------------------------------------------------- */
//       const normalIds = mappedNormalBlogs.map((b) => b.id);

//       const { data: blogCoauthorData } = await supabase
//         .from("blog_collaborators")
//         .select(`
//           blog_id,
//           profiles(full_name,email)
//         `)
//         .in("blog_id", normalIds)
//         .eq("blog_type", "blog");

//       const normalBlogsWithCoauthors = mappedNormalBlogs.map((blog) => {
//         const matched = (blogCoauthorData || []).filter(
//           (c) => c.blog_id === blog.id
//         );

//         return {
//           ...blog,
//           coauthors: matched.map(
//             (x) => x.profiles?.full_name || x.profiles?.email
//           ),
//         };
//       });

//       /* --------------------------------------------------------------
//          3️⃣ FETCH COMMUNITY BLOGS WITH AUTHOR
//       -------------------------------------------------------------- */
//       const { data: communityBlogs } = await supabase
//         .from("community_blogs")
//         .select(`
//           id,
//           title,
//           content,
//           slug,
//           excerpt,
//           created_at,
//           profiles:profiles!community_blogs_author_id_fkey(full_name, email)
//           category:blog_categories(id,name,slug)
//         `)
//         .eq("status", "approved")
//         .order("created_at", { ascending: false });

//       const mappedCommunityBlogs: BaseBlog[] =
//         communityBlogs?.map((b) => ({
//           id: b.id,
//           title: b.title,
//           content: b.content,
//           slug: `/community-blog/${b.slug}`,
//           created_at: b.created_at,
//           excerpt: b.excerpt,
//           category_id: b.category?.id,
// category_name: b.category?.name,
// category_slug: b.category?.slug,
//           author_name: b.profiles?.full_name || b.profiles?.email,
//           type: "community",
//         })) || [];

//       /* --------------------------------------------------------------
//          4️⃣ FETCH CO-AUTHORS FOR COMMUNITY BLOGS
//       -------------------------------------------------------------- */
//       const communityIds = mappedCommunityBlogs.map((b) => b.id);

//       const { data: communityCoauthorData } = await supabase
//         .from("blog_collaborators")
//         .select(`
//           blog_id,
//           profiles(full_name,email)
//         `)
//         .in("blog_id", communityIds)
//         .eq("blog_type", "community");

//       const communityBlogsWithCoauthors = mappedCommunityBlogs.map((blog) => {
//         const matched = (communityCoauthorData || []).filter(
//           (c) => c.blog_id === blog.id
//         );

//         return {
//           ...blog,
//           coauthors: matched.map(
//             (x) => x.profiles?.full_name || x.profiles?.email
//           ),
//         };
//       });

//       /* --------------------------------------------------------------
//          5️⃣ MERGE BOTH LISTS AND SORT BY DATE
//       -------------------------------------------------------------- */
//       const allBlogs = [...normalBlogsWithCoauthors, ...communityBlogsWithCoauthors].sort(
//         (a, b) =>
//           new Date(b.created_at).getTime() -
//           new Date(a.created_at).getTime()
//       );

//       setTotalBlogs(allBlogs.length);
//       setBlogs(allBlogs.slice(from, to + 1));
//     } catch (err) {
//       console.error("Error loading blogs:", err);
//     } finally {
//       setLoading(false);
//     }
//   };
const loadCategories = async () => {
  setLoading(true);

  try {
    const { data } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name");

    if (data) {
      setCategories(data);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
  loadCategories();
}, []);

  // const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);

  /* ---------- SUBMIT BLOG BUTTON ---------- */
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

//   const categories = [
//   "All",
//   ...Array.from(
//     new Set(
//       blogs
//         .map((blog) => blog.category_name)
//         .filter(Boolean)
//     )
//   ),
// ];

// const filteredBlogs =
//   selectedCategory === "All"
//     ? blogs
//     : blogs.filter(
//         (blog) =>
//           blog.category_name === selectedCategory
//       );

  /* ---------- UI ---------- */
  return (
    <section className="relative py-10 px-6 bg-slate-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold dark:text-white mb-4">
            Blog Categories
          </h2>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Explore the different blog categories and find out the required blog in their respective category.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
          </div>
        )}

        {/* EMPTY */}
      {/* EMPTY */}
{!loading && categories.length === 0 && (
  <div className="text-center py-20">
    <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <p className="text-gray-600 dark:text-gray-300">
      No categories created yet
    </p>
  </div>
)}
        

{/* CATEGORY GRID */}
{!loading && categories.length > 0 && (
  <>
  
<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">


     
{paginatedCategories.map((category) => (


        <article
          key={category.id}
          onClick={() =>
            navigate(`/blog/category/${category.slug}`)
          }
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
           


            {/* TITLE */}
            <h3
              className="
                text-2xl md:text-3xl font-bold
                dark:text-white mb-3
                group-hover:text-blue-600
              "
            >
              {category.name}
            </h3>

            {/* DESCRIPTION */}
            <p
              className="
                text-gray-600 dark:text-gray-300
                text-sm mb-6 line-clamp-3
              "
            >
              Explore all blogs, tutorials, projects and
              technical articles related to {category.name}.
            </p>

            {/* FOOTER */}
            <div
              className="
                mt-auto pt-4
                border-t border-gray-200 dark:border-gray-700
              "
            >
              <div className="text-blue-600 font-medium">
                Explore category →
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  </>
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

      {/* FOOTER BUTTON */}
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
