import { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Upload, Brain, BookOpen, Clock,
  HelpCircle, Coins, Settings, LogOut, ChevronLeft,
  ChevronRight, X, Bell, Search, Moon, Sun, LayoutTemplate,
  Users, Check, User,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useAppTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import {
  CommandDialog, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",          path: "/dashboard" },
  { icon: Upload,          label: "Syllabus Generator", path: "/generator" },
  { icon: Brain,           label: "MCQ Generator",      path: "/mcq-generator" },
  { icon: BookOpen,        label: "Question Bank",      path: "/question-bank" },
  { icon: LayoutTemplate,  label: "Templates",          path: "/templates" },
  { icon: Clock,           label: "History",            path: "/history" },
  { icon: Users,           label: "Community",          path: "/community" },
  { icon: HelpCircle,      label: "Support",            path: "/support" },
  { icon: Coins,           label: "Get Credits",         path: "/pricing" },
  { icon: Settings,        label: "Settings",           path: "/settings" },
];

interface Notif { id: string; title: string; body: string; read: boolean; icon: string; }

function buildNotifications(credits: number): Notif[] {
  const seen = localStorage.getItem("notif_welcome_read") === "1";
  return [
    { id: "welcome", title: "Welcome to Vinathaal!", body: "Generate your first AI question paper in seconds.", read: seen, icon: "🎉" },
    ...(credits < 3
      ? [{ id: "low_credits", title: "Credits running low", body: `You have ${credits} credit${credits === 1 ? "" : "s"} left. Top up to keep generating.`, read: false, icon: "⚠️" }]
      : []),
  ];
}

interface SidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar = ({ mobileOpen, collapsed, onMobileClose, onToggleCollapse }: SidebarProps) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { credits } = useCredits();
  const { dark, toggleTheme } = useAppTheme();

  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifs, setNotifs]           = useState<Notif[]>([]);
  const [profilePic, setProfilePic]   = useState<string | null>(null);

  /* ── Load profile picture; re-load when Profile page updates it ── */
  useEffect(() => {
    const load = () => {
      const pic = user?.email ? localStorage.getItem(`profilePicture_${user.email}`) : null;
      setProfilePic(pic);
    };
    load();
    window.addEventListener("profilePicUpdated", load);
    return () => window.removeEventListener("profilePicUpdated", load);
  }, [user?.email]);

  useEffect(() => { setNotifs(buildNotifications(credits)); }, [credits]);

  const unread      = notifs.filter((n) => !n.read).length;
  const userInitial = user?.name?.trim() ? user.name.trim()[0].toUpperCase() : "U";
  const isActive    = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const markAllRead = () => {
    localStorage.setItem("notif_welcome_read", "1");
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  /* Shared avatar element */
  const Avatar = () => (
    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
      {profilePic
        ? <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-gradient-to-br from-[#3F3D56] to-[#007AFF] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold leading-none">{userInitial}</span>
          </div>
      }
    </div>
  );

  /* Notification popover content (shared between collapsed / expanded) */
  const NotifContent = () => (
    <PopoverContent className="w-80 p-0 dark:bg-gray-900 dark:border-gray-700" align="start" side="right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-800 dark:text-white">Notifications</p>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-[11px] text-blue-600 flex items-center gap-1 hover:underline">
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-64 overflow-y-auto">
        {notifs.length === 0 && <p className="text-xs text-gray-400 text-center py-6">All caught up!</p>}
        {notifs.map((n) => (
          <div key={n.id} className={["flex gap-3 px-4 py-3", n.read ? "opacity-50" : "bg-blue-50/40 dark:bg-blue-900/10"].join(" ")}>
            <span className="text-base shrink-0">{n.icon}</span>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-white">{n.title}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </PopoverContent>
  );

  return (
    <TooltipProvider delayDuration={200}>
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onMobileClose} />
      )}

      {/* Command palette */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search pages…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.path} onSelect={() => { setSearchOpen(false); navigate(item.path); }}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* ── Sidebar panel ─────────────────────────────────────────── */}
      <aside className={[
        /* Mobile: fixed overlay. Desktop: sticky in flex flow — pushes content naturally */
        "fixed md:sticky md:top-0 left-0 top-0 h-screen z-50 shrink-0 flex flex-col relative",
        "bg-white dark:bg-[#111827] border-r border-gray-100 dark:border-gray-800/80",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        "md:translate-x-0",
      ].join(" ")}>

        {/* ── Logo row ──────────────────────────────────────────── */}
        <div className={[
          "flex items-center border-b border-gray-100 dark:border-gray-800/80 shrink-0 h-14",
          collapsed ? "justify-center px-0" : "gap-2 px-4",
        ].join(" ")}>
          <img src="/vinathaal_icon.png" alt="Logo" className="w-7 h-7 object-contain shrink-0" />
          {!collapsed && (
            <>
              <img src="/vinathaal-heading-black.png" alt="Vinathaal" className="h-5 object-contain dark:invert" />
              <div className="ml-auto flex items-center gap-0.5">
                <Popover open={notifOpen} onOpenChange={setNotifOpen}>
                  <PopoverTrigger asChild>
                    <button className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" aria-label="Notifications">
                      <Bell className="w-[15px] h-[15px]" />
                      {unread > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
                    </button>
                  </PopoverTrigger>
                  <NotifContent />
                </Popover>
                <button onClick={onMobileClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors md:hidden">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Search ────────────────────────────────────────────── */}
        <div className={["px-2 pt-3 pb-1 shrink-0", collapsed ? "flex flex-col items-center gap-1" : ""].join(" ")}>
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => setSearchOpen(true)}
                    className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Search className="w-[16px] h-[16px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right"><p className="text-xs">Search (Ctrl+K)</p></TooltipContent>
              </Tooltip>
              <Popover open={notifOpen} onOpenChange={setNotifOpen}>
                <PopoverTrigger asChild>
                  <button
                    title="Notifications"
                    className="relative p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Bell className="w-[16px] h-[16px]" />
                    {unread > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </button>
                </PopoverTrigger>
                <NotifContent />
              </Popover>
            </>
          ) : (
            <button onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/60 border border-gray-100 dark:border-gray-700/60 text-gray-400 dark:text-gray-500 transition-colors">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left text-xs">Search…</span>
            </button>
          )}
        </div>

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav className="flex-1 py-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const linkEl = (
              <Link key={item.label} to={item.path} onClick={onMobileClose}
                className={[
                  "flex items-center rounded-lg transition-all duration-150 group select-none",
                  collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
                  active
                    ? "bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white",
                ].join(" ")}>
                <Icon className={["w-[16px] h-[16px] shrink-0",
                  active ? "text-white" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300",
                ].join(" ")} />
                {!collapsed && <span className="text-xs font-medium truncate leading-none">{item.label}</span>}
              </Link>
            );
            if (collapsed) {
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                  <TooltipContent side="right"><p className="text-xs">{item.label}</p></TooltipContent>
                </Tooltip>
              );
            }
            return linkEl;
          })}
        </nav>

        {/* ── Bottom ────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 dark:border-gray-800/80 p-2 space-y-1 shrink-0">
          {/* Credits chip */}
          {!collapsed
            ? <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 truncate flex-1">{credits} credits left</p>
              </div>
            : <div className="flex justify-center p-2" title={`${credits} credits`}>
                <Coins className="w-[16px] h-[16px] text-amber-500" />
              </div>
          }

          {/* Profile link row */}
          <Link to="/profile" onClick={onMobileClose} title={collapsed ? "Profile" : undefined}
            className={[
              "w-full flex items-center rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/70 group",
              collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
            ].join(" ")}>
            <Avatar />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">{user?.name || user?.email}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight">{user?.email}</p>
                </div>
                <User className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors shrink-0" />
              </>
            )}
          </Link>

          {/* Controls row: dark mode + logout */}
          <div className={["flex items-center gap-1", collapsed ? "flex-col" : ""].join(" ")}>
            {/* Dark mode */}
            <button onClick={toggleTheme} title={dark ? "Light mode" : "Dark mode"}
              className="flex items-center justify-center flex-1 w-full py-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors">
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Logout with confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button title="Log out"
                  className="flex items-center justify-center flex-1 w-full py-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="dark:text-white">Log out?</AlertDialogTitle>
                  <AlertDialogDescription className="dark:text-gray-400">
                    You'll be returned to the home page. Your data is saved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white border-0">
                    Log out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* ── Collapse tab — floats on the right edge, vertically centred, desktop only ── */}
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={[
            "hidden md:flex items-center justify-center",
            "absolute top-1/2 -translate-y-1/2 -right-3",
            "w-6 h-10 rounded-r-lg",
            "bg-white dark:bg-[#111827]",
            "border border-l-0 border-gray-100 dark:border-gray-800/80",
            "text-gray-400 dark:text-gray-500",
            "hover:text-gray-600 dark:hover:text-gray-300",
            "hover:bg-gray-50 dark:hover:bg-gray-800",
            "transition-colors shadow-sm",
            "z-10",
          ].join(" ")}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
    </TooltipProvider>
  );
};

export default Sidebar;
