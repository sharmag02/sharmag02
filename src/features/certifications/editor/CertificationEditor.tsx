// src/features/certifications/CertificationEditor.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import {
  addCertification,
  updateCertification,
  fetchCertificationById,
  Certification,
} from "../CertificationAdminHelpers";
import { X, Save, Upload } from "lucide-react";
import { useTheme } from "../../../shared/context/ThemeContext";

interface Props {
  certId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export function CertificationEditor({ certId, onSave, onCancel }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Certification>({
    title: "",
    issuer: "",
    type: "Workshop",
    issued_date: "",
    link: "",
    image: "",
  });

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    if (!certId) return;

    (async () => {
      setLoading(true);
      const data = await fetchCertificationById(certId);
      if (data) {
        setForm({
          ...data,
          issued_date: data.issued_date?.slice(0, 10),
        });
      }
      setLoading(false);
    })();
  }, [certId]);

  /* ---------------- FILE UPLOAD ---------------- */
  const uploadFile = async (file: File) => {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `certificates/${fileName}`;

    const { error } = await supabase.storage
      .from("certificates")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("certificates")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Only JPG, PNG or PDF files are allowed.");
      return;
    }

    try {
      setError("");
      setUploading(true);
      const url = await uploadFile(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch {
      setError("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- SAVE ---------------- */
  const handleSubmit = async () => {
    const { title, issuer, type, issued_date } = form;
    if (!title || !issuer || !type || !issued_date) {
      alert("Please fill all required fields");
      return;
    }

    certId
      ? await updateCertification(certId, form)
      : await addCertification(form);

    onSave();
  };

  const inputBase = isDark
    ? "bg-white/5 text-white placeholder-white/50 border border-white/10"
    : "bg-white text-gray-900 border border-gray-300";

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl
        ${
          isDark
            ? "bg-gradient-to-b from-[#0f172a] to-[#020617]"
            : "bg-white"
        }`}
      >
        {/* HEADER */}
        <div
          className={`flex justify-between items-center px-6 py-4 border-b
          ${isDark ? "border-white/10 text-white" : "border-gray-200"}`}
        >
          <h2 className="text-xl font-semibold">
            {certId ? "Edit Certification" : "Add Certification"}
          </h2>
          <button
            onClick={onCancel}
            className={isDark ? "text-white/70" : "text-gray-600"}
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-4">
          {loading ? (
            <p className="text-center py-6">Loading...</p>
          ) : (
            <>
              <input
                className={`w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <input
                className={`w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                placeholder="Issuer"
                value={form.issuer}
                onChange={(e) =>
                  setForm({ ...form, issuer: e.target.value })
                }
              />

              <select
                className={`w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              >
                <option>Workshop</option>
                <option>Internship</option>
                <option>Course Completion</option>
                <option>Extracurricular</option>
              </select>

              <input
                type="date"
                className={`w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                value={form.issued_date}
                onChange={(e) =>
                  setForm({ ...form, issued_date: e.target.value })
                }
              />

              <input
                className={`w-full rounded-lg px-4 py-3 outline-none ${inputBase}`}
                placeholder="Credential Link (optional)"
                value={form.link || ""}
                onChange={(e) =>
                  setForm({ ...form, link: e.target.value })
                }
              />

              {/* FILE UPLOAD */}
              <label
                className={`flex items-center gap-3 cursor-pointer text-sm
                ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                <Upload />
                Upload certificate (image / PDF)
                <input type="file" hidden onChange={handleFileChange} />
              </label>

              {uploading && (
                <p className="text-sm text-blue-500">Uploading…</p>
              )}

              {form.image && (
                <p className="text-sm text-green-500">
                  File uploaded successfully
                </p>
              )}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div
          className={`flex justify-end gap-3 px-6 py-4 border-t
          ${isDark ? "border-white/10" : "border-gray-200"}`}
        >
          <button
            onClick={onCancel}
            className={isDark ? "text-white/70" : "text-gray-600"}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            {certId ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
