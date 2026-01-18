import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "../shared/components/Sidebar";
import MobileNav from "../shared/components/MobileNav";
import { LoadingScreen } from "../shared/components/Loader";
import { ThemePopup } from "../shared/components/ThemePopup";

import { Hero } from "../features/sections/Home";
import { About } from "../features/sections/About";
import Experience from "../features/sections/Experience";
import { Projects } from "../features/sections/Projects";
import Skills from "../features/sections/Skills";
import { Certifications } from "../features/sections/Certifications";
import { Contact } from "../features/sections/Contact";

import { BlogList } from "../features/blog/BlogList";
import BlogDetail from "../features/blog/BlogDetail";
import  AdminPanel  from "../features/admin/AdminPanel";

import AuthTabs from "../features/auth/AuthTabs";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from "../features/auth/ResetPassword";

import ProtectedRoute from "../app/ProtectedRoute";
import { useAuth } from "../shared/context/AuthContext";

import CommunityDashboard from "../features/community/CommunityDashboard";

/* ❗ FIXED IMPORT — default export */
import CommunityBlogDetail from "../features/community/CommunityBlogDetail";

export default function App() {
  const { profile, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route path="/auth" element={<AuthTabs />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* MAIN APP */}
      <Route
        path="/*"
        element={
          <>
            {isMobile ? <MobileNav /> : <Sidebar />}

            <main className={isMobile ? "pt-16" : "ml-72"}>
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/about" element={<About />} />
                <Route path="/experience" element={<Experience />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/certifications" element={<Certifications />} />

                {/* PUBLIC BLOGS */}
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />

                {/* COMMUNITY BLOG DETAIL — FIXED */}
                <Route path="/community-blog/:slug" element={<CommunityBlogDetail />} />

                <Route path="/contact" element={<Contact />} />

                {/* COMMUNITY DASHBOARD (PROTECTED) */}
                <Route
                  path="/community/dashboard"
                  element={
                    <ProtectedRoute>
                      <CommunityDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ADMIN */}
                {profile?.is_admin && (
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminPanel />
                      </ProtectedRoute>
                    }
                  />
                )}

                {/* FALLBACK */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <ThemePopup />
            </main>
          </>
        }
      />
    </Routes>
  );
}
