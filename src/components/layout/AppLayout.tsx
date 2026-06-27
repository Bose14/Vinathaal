import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeProvider, useAppTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";

interface AppLayoutProps { children: React.ReactNode; }

const AppInner = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, user } = useAuth();
  const { dark } = useAppTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      const pic = user?.email ? localStorage.getItem(`profilePicture_${user.email}`) : null;
      setProfilePic(pic);
    };
    load();
    window.addEventListener("profilePicUpdated", load);
    return () => window.removeEventListener("profilePicUpdated", load);
  }, [user?.email]);

  const userInitial = user?.name?.trim() ? user.name.trim()[0].toUpperCase() : "U";

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen overflow-hidden bg-[#F8F9FC] dark:bg-[#0d0e18]">
        {/* Fixed sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          collapsed={collapsed}
          onMobileClose={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((p) => !p)}
        />

        {/* Main content area — fills all space left after the sticky sidebar */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          <header className="md:hidden flex items-center justify-between px-4 h-12 bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-gray-800/80 sticky top-0 z-30 shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/vinathaal_icon.png" alt="Logo" className="w-5 h-5 object-contain" />
              <span className="font-semibold text-gray-800 dark:text-white text-sm">Vinathaal</span>
            </div>
            <Link to="/profile" className="shrink-0">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                {profilePic
                  ? <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-[#3F3D56] to-[#007AFF] flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold leading-none">{userInitial}</span>
                    </div>
                }
              </div>
            </Link>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const AppLayout = ({ children }: AppLayoutProps) => (
  <ThemeProvider>
    <AppInner>{children}</AppInner>
  </ThemeProvider>
);

export default AppLayout;
