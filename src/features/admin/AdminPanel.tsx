import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { supabase } from "../../shared/lib/supabase";

// Editors
import BlogEditor from "../blog/editor/BlogEditor";
import ProjectEditor from "../projects/editor/ProjectEditor";
import SkillEditor from "../skills/editor/SkillEditor";
import ExperienceEditor from "../experience/editor/ExperienceEditor";
import { CertificationEditor } from "../certifications/editor/CertificationEditor";
import CommunityBlogReview from "../community/CommunityBlogReview";

// Theme
import { useTheme } from "../../shared/context/ThemeContext";

type ContentType =
  | "blogs"
  | "community_blogs"
  | "projects"
  | "skills"
  | "experiences"
  | "certifications"
  | "contact_messages";

export default function AdminPanel() {
  const { theme } = useTheme();

  const [activeType, setActiveType] = useState<ContentType>("blogs");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const [showDropdown, setShowDropdown] = useState(false);

  // Reply Modal States
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const editorMap = {
    blogs: BlogEditor,
    community_blogs: CommunityBlogReview,
    projects: ProjectEditor,
    skills: SkillEditor,
    experiences: ExperienceEditor,
    certifications: CertificationEditor,
  } as const;

  const EditorComponent = editorMap[activeType];

  /* ------------------ TABS ------------------ */
  const tabs = [
    { key: "blogs", label: "MY BLOGS" },
    { key: "community_blogs", label: "COMMUNITY BLOGS" },
    { key: "projects", label: "PROJECTS" },
    { key: "skills", label: "SKILLS" },
    { key: "experiences", label: "EXPERIENCES" },
    { key: "certifications", label: "CERTIFICATIONS" },
    { key: "contact_messages", label: "CONTACT MESSAGES" },
  ] as const;

  /* ------------------ FETCH ITEMS ------------------ */
  const loadItems = async () => {
    setLoading(true);
    setOpenNoteId(null);

    try {
      let query;

      if (activeType === "blogs") {
        query = supabase.from("blogs").select(`
          id,
          title,
          status,
          published,
          is_edited,
          submission_note,
          co_authors,
          created_at,
          updated_at
        `);
      } else if (activeType === "community_blogs") {
        query = supabase.from("community_blogs").select(`
          id,
          title,
          status,
          submission_note,
          admin_feedback,
          is_edited,
          updated_at
        `);
      } else if (activeType === "contact_messages") {
        query = supabase.from("contact_messages").select(`
          id,
          name,
          email,
          telegram,
          subject,
          message,
          admin_reply,
          reply_sent,
          reply_at,
          created_at
        `);
      } else {
        query = supabase.from(activeType).select("*");
      }

      const orderColumn =
        activeType === "community_blogs"
          ? "updated_at"
          : "created_at";

      const { data, error } = await query.order(orderColumn, {
        ascending: false,
      });

      if (error) throw error;

      if (activeType === "blogs" && data?.length) {
        const blogIds = data.map((b) => b.id);

        const { data: collabs } = await supabase
          .from("blog_collaborators")
          .select("blog_id,user_id")
          .eq("blog_type", "blog")
          .in("blog_id", blogIds);

        const withCoAuthors = data.map((blog) => ({
          ...blog,
          coauthors:
            collabs
              ?.filter((c) => c.blog_id === blog.id)
              .map((c) => c.user_id) || [],
        }));

        setItems(withCoAuthors);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Error loading items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [activeType]);

  /* ------------------ DELETE ------------------ */
  const handleDelete = async (id: string) => {
    if (activeType === "community_blogs") return;
    if (!confirm("Are you sure?")) return;

    await supabase.from(activeType).delete().eq("id", id);
    loadItems();
  };

  /* ------------------ APPROVE BLOG ------------------ */
  const approveBlog = async (id: string) => {
    await supabase
      .from("blogs")
      .update({
        status: "published",
        published: true,
        is_edited: false,
        submission_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    loadItems();
  };

  /* ------------------ SEND REPLY ------------------ */
  const sendReply = async () => {
    if (!replyText.trim() || !replyTarget) return;

    setSendingReply(true);

    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        type: "contact-reply",
        id: replyTarget.id,
        email: replyTarget.email,
        replyMessage: replyText,
      },
    });

    setSendingReply(false);

    if (!error) {
      await supabase
        .from("contact_messages")
        .update({
          admin_reply: replyText,
          reply_sent: true,
          reply_at: new Date().toISOString(),
        })
        .eq("id", replyTarget.id);

      setReplyModalOpen(false);
      setReplyText("");
      loadItems();
    }
  };

  /* ------------------ SAVE CALLBACK ------------------ */
  const handleSave = () => {
    setEditingId(null);
    setIsCreating(false);
    loadItems();
  };

  /* ------------------ EDITOR UI ------------------ */
  if ((isCreating || editingId) && EditorComponent) {
    return (
      <div
        className={`min-h-screen p-6 ${
          theme === "light"
            ? "bg-gray-100"
            : "bg-gradient-to-br from-[#0f172a] to-[#020617]"
        }`}
      >
        <EditorComponent
          key={editingId ?? "new"}
          {...(activeType === "blogs" ? { blogId: editingId } : {})}
          {...(activeType === "community_blogs" ? { blogId: editingId } : {})}
          {...(activeType === "projects" ? { projectId: editingId } : {})}
          {...(activeType === "skills" ? { skillId: editingId } : {})}
          {...(activeType === "experiences" ? { experienceId: editingId } : {})}
          {...(activeType === "certifications" ? { certId: editingId } : {})}
          onSave={handleSave}
          onCancel={() => {
            setEditingId(null);
            setIsCreating(false);
          }}
        />
      </div>
    );
  }



  /* ------------------ MAIN UI ------------------ */
  return (
    <>
      {replyModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div
      className={`w-full max-w-lg p-6 rounded-xl shadow-xl ${
        theme === "light"
          ? "bg-white text-gray-900"
          : "bg-slate-800 text-slate-100"
      }`}
    >
      <h2 className="text-xl font-bold mb-4">
        Reply to {replyTarget?.name}
      </h2>

      <p className="text-sm opacity-80 mb-1">
        <b>Email:</b> {replyTarget?.email}
      </p>

      <p className="text-sm opacity-80 mb-4">
        <b>Subject:</b> {replyTarget?.subject}
      </p>

      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        rows={6}
        className={`w-full p-3 rounded-md border focus:outline-none ${
          theme === "light"
            ? "bg-gray-100 border-gray-300 text-gray-800"
            : "bg-slate-700 border-slate-600 text-slate-100"
        }`}
        placeholder="Type your reply..."
      ></textarea>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setReplyModalOpen(false)}
          className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white"
        >
          Cancel
        </button>

        <button
          onClick={sendReply}
          disabled={sendingReply}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
        >
          {sendingReply ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </div>
  </div>
)}


      <div
        className={`min-h-screen p-6 ${
          theme === "light"
            ? "bg-gray-100"
            : "bg-gradient-to-br from-[#0f172a] to-[#020617]"
        }`}
      >
        {/* MOBILE DROPDOWN */}
        <div className="md:hidden mb-6 relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-fit min-w-[200px] flex justify-between items-center px-4 py-3 bg-blue-600 text-white rounded-lg shadow"
          >
            {tabs.find((t) => t.key === activeType)?.label}
            <ChevronDown className="w-5 h-5" />
          </button>

          {showDropdown && (
            <div className="absolute w-fit min-w-[200px] mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-300 dark:border-slate-700 z-20">
              {tabs.map(({ key, label }) => (
                <div
                  key={key}
                  onClick={() => {
                    setActiveType(key as ContentType);
                    setShowDropdown(false);
                  }}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-500 hover:text-white ${
                    activeType === key
                      ? "bg-blue-600 text-white"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LAPTOP TABS */}
        <div className="hidden md:flex flex-wrap gap-3 mb-6">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setActiveType(key as ContentType);
                setEditingId(null);
                setIsCreating(false);
              }}
              className={`px-5 py-2 rounded-full font-semibold transition ${
                activeType === key
                  ? "bg-blue-600 text-white shadow-lg"
                  : theme === "dark"
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CREATE BUTTON */}
        <div className="flex justify-start md:justify-end mb-6">
          <button
            disabled={
              activeType === "contact_messages" ||
              activeType === "community_blogs"
            }
            onClick={() => {
              if (
                activeType === "contact_messages" ||
                activeType === "community_blogs"
              )
                return;
              setEditingId(null);
              setIsCreating(true);
            }}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition ${
              activeType === "contact_messages" ||
              activeType === "community_blogs"
                ? "bg-gray-400 cursor-not-allowed text-gray-700"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            {activeType === "contact_messages"
              ? "Contact Message"
              : `New ${activeType.replace("_", " ").slice(0, -1)}`}
          </button>
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl p-6 flex flex-col md:flex-row transition-all ${

                  theme === "light"
                    ? "bg-white border border-gray-300 shadow-md hover:shadow-xl hover:border-gray-400 hover:scale-[1.01]"
                    : "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:border-slate-500 hover:shadow-2xl hover:scale-[1.02]"
                }`}
              >
                {/* LEFT CONTENT */}
                <div className="flex-1 w-full">

                  {activeType === "contact_messages" ? (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {item.email}
                      </p>

                      {item.reply_sent ? (
                        <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-200 text-green-800 font-semibold">
                          REPLIED
                        </span>
                      ) : (
                        <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800 font-semibold">
                          PENDING
                        </span>
                      )}

                      {openNoteId === item.id && (
                        <div
                          className={`mt-4 p-4 rounded-lg border text-sm ${
                            theme === "light"
                              ? "bg-gray-100 border-gray-300 text-gray-800"
                              : "bg-slate-900/60 border-slate-700 text-slate-200"
                          }`}
                        >
                          <p>
                            <b>Telegram:</b> {item.telegram}
                          </p>
                          <p>
                            <b>Subject:</b> {item.subject}
                          </p>

                          <p className="mt-2">
                            <b>Message:</b>
                          </p>

                          <div
                            className={`mt-1 p-3 rounded-md whitespace-pre-wrap w-full text-sm md:text-base ${
                              theme === "light"
                                ? "bg-gray-200 text-gray-800"
                                : "bg-slate-800 text-slate-200"
                            }`}
                          >
                            {item.message}
                          </div>

                          {item.admin_reply && (
                            <div className="mt-4">
                              <p className="font-semibold text-blue-600 dark:text-blue-300">
                                Admin Reply:
                              </p>
                              <div
                                className={`mt-1 p-3 rounded-md whitespace-pre-wrap w-full text-sm md:text-base ${
                                  theme === "light"
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-blue-900/40 text-blue-200"
                                }`}
                              >
                                {item.admin_reply}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>

                      {item.status && (
                        <span
                          className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold ${
                            item.status === "draft"
                              ? theme === "light"
                                ? "bg-yellow-300 text-yellow-800"
                                : "bg-yellow-500/20 text-yellow-300"
                              : item.status === "submitted"
                              ? theme === "light"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-blue-500/20 text-blue-300"
                              : item.status === "resubmitted"
                              ? theme === "light"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-purple-500/20 text-purple-300"
                              : item.status === "rejected"
                              ? theme === "light"
                                ? "bg-red-100 text-red-800"
                                : "bg-red-500/20 text-red-300"
                              : theme === "light"
                              ? "bg-green-300 text-green-700"
                              : "bg-green-600/20 text-green-400"
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      )}

                      {item.submission_note && (
                        <div className="mt-3">
                          <button
                            onClick={() =>
                              setOpenNoteId(
                                openNoteId === item.id ? null : item.id
                              )
                            }
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                          >
                            {openNoteId === item.id ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                            View Submission Note
                          </button>

                          {openNoteId === item.id && (
                            <div
                              className={`mt-2 p-3 rounded-lg whitespace-pre-wrap border text-sm ${
                                theme === "light"
                                  ? "bg-gray-100 border-gray-300 text-gray-800"
                                  : "bg-slate-900/60 border-slate-700 text-slate-200"
                              }`}
                            >
                              {item.submission_note}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-start gap-3 ml-3">
                  {activeType === "contact_messages" ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenNoteId(
                            openNoteId === item.id ? null : item.id
                          )
                        }
                        className="text-blue-500 hover:text-blue-600"
                      >
                        {openNoteId === item.id ? <EyeOff /> : <Eye />}
                      </button>

                      <button
                        onClick={() => {
                          setReplyTarget(item);
                          setReplyText(item.admin_reply || "");
                          setReplyModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-700 font-semibold"
                      >
                        Reply
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit />
                      </button>

                      {activeType === "blogs" && item.status === "draft" && (
                        <button
                          onClick={() => approveBlog(item.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle />
                        </button>
                      )}

                      {activeType !== "community_blogs" && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
