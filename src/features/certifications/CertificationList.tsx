import { useEffect, useState } from "react";
import { supabase } from "../../shared/lib/supabase";
import { ExternalLink, FileText } from "lucide-react";

interface Certification {
  id: string;
  title: string;
  issuer: string;
  type: string;
  issued_date: string | null;
  link?: string;
  image?: string;
}

export default function CertificateList() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("issued_date", { ascending: false });

    if (error) {
      console.error("Error loading certifications:", error);
      setCertifications([]);
    } else {
      setCertifications(data ?? []);
    }
    setLoading(false);
  };

  /* ---------- SAFE DATE FORMAT ---------- */
  const formatDate = (date: string | null) => {
    if (!date) return "Date not available";

    const parsed = new Date(`${date}T00:00:00`);
    if (isNaN(parsed.getTime())) return "Date not available";

    return parsed.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-black rounded-full" />
      </div>
    );
  }

  if (!certifications.length) {
    return (
      <p className="text-center text-gray-500">
        No certifications yet
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certifications.map((cert) => {
        const isPdf = cert.image?.endsWith(".pdf");

        return (
          <div
            key={cert.id}
            className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            {/* Preview */}
            {cert.image && (
              <div className="h-40 w-full rounded-lg mb-3 flex items-center justify-center bg-gray-100 overflow-hidden">
                {isPdf ? (
                  <FileText className="w-12 h-12 text-gray-500" />
                ) : (
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}

            <h3 className="font-bold text-slate-900">
              {cert.title}
            </h3>

            <p className="text-blue-600 text-sm font-medium">
              {cert.issuer}
            </p>

            <p className="text-xs text-gray-500">
              {cert.type}
            </p>

            <p className="text-xs text-gray-600 mt-1">
              {formatDate(cert.issued_date)}
            </p>

            <div className="flex gap-3 mt-3">
              {cert.image && (
                <a
                  href={cert.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  View Certificate <ExternalLink size={14} />
                </a>
              )}

              {cert.link && (
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline"
                >
                  Credential <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
