import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Crown, FileText, Coins, TrendingUp, Plus,
  Mail, MoreHorizontal, Search, Building2, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

// Mock data — replace with real API calls when backend is ready
const MOCK_MEMBERS = [
  { id: 1, name: "Priya Sharma",    email: "priya@school.edu",   role: "Teacher",   papersThisMonth: 14, creditsUsed: 14, lastActive: "Today",      avatar: "PS" },
  { id: 2, name: "Ravi Kumar",      email: "ravi@school.edu",    role: "HOD",       papersThisMonth: 9,  creditsUsed: 9,  lastActive: "Yesterday",   avatar: "RK" },
  { id: 3, name: "Anita Menon",     email: "anita@school.edu",   role: "Teacher",   papersThisMonth: 22, creditsUsed: 22, lastActive: "Today",       avatar: "AM" },
  { id: 4, name: "Suresh Pillai",   email: "suresh@school.edu",  role: "Teacher",   papersThisMonth: 6,  creditsUsed: 6,  lastActive: "3 days ago",  avatar: "SP" },
  { id: 5, name: "Divya Nair",      email: "divya@school.edu",   role: "Teacher",   papersThisMonth: 18, creditsUsed: 18, lastActive: "Today",       avatar: "DN" },
];

const avatarColors = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-cyan-500 to-blue-500",
];

const InstitutionDashboard = () => {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const filtered = MOCK_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPapers = MOCK_MEMBERS.reduce((s, m) => s + m.papersThisMonth, 0);
  const totalCredits = MOCK_MEMBERS.reduce((s, m) => s + m.creditsUsed, 0);
  const topMember = [...MOCK_MEMBERS].sort((a, b) => b.papersThisMonth - a.papersThisMonth)[0];

  return (
    <div className="min-h-full p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Institution Plan</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Community</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Manage members and track usage across your institution</p>
          </div>
          <Button
            onClick={() => setShowInvite(true)}
            className="bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white h-9 text-sm px-4 w-fit"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Invite Member
          </Button>
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Invite a team member</h3>
            <p className="text-xs text-gray-400 mb-4">They'll receive an email to join your institution workspace.</p>
            <Input
              placeholder="colleague@institution.edu"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mb-3 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white"
                onClick={() => { setShowInvite(false); setInviteEmail(""); }}
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" /> Send Invite
              </Button>
              <Button size="sm" variant="outline" className="dark:border-gray-700 dark:text-gray-300" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up delay-100">
        {[
          { icon: Users,      label: "Members",        value: MOCK_MEMBERS.length.toString(), color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { icon: FileText,   label: "Papers This Month", value: totalPapers.toString(),     color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { icon: Coins,      label: "Credits Used",   value: totalCredits.toString(),       color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { icon: TrendingUp, label: "Top Contributor",value: topMember.name.split(" ")[0],  color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Members table */}
      <div className="animate-fade-in-up delay-200 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Members ({filtered.length})</h2>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {filtered.map((member, i) => (
            <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center shrink-0`}>
                <span className="text-white text-xs font-bold">{member.avatar}</span>
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{member.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{member.email}</p>
              </div>

              {/* Role badge */}
              <span className="hidden sm:inline text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full shrink-0">
                {member.role}
              </span>

              {/* Papers */}
              <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 shrink-0 w-24">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>{member.papersThisMonth} papers</span>
              </div>

              {/* Last active */}
              <p className="hidden lg:block text-xs text-gray-400 dark:text-gray-500 shrink-0 w-20 text-right">{member.lastActive}</p>

              {/* Actions */}
              <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UpgradePrompt = ({ navigate }: { navigate: (path: string) => void }) => (
  <div className="min-h-full p-6 md:p-8 max-w-3xl mx-auto flex flex-col items-center justify-center text-center space-y-6 py-20">
    <div className="animate-fade-in-up">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Building2 className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">Community & Institutions</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
        Collaborate with your team, track who generates what, manage member credits, and get institution-wide analytics — all in one place.
      </p>
    </div>

    <div className="animate-fade-in-up delay-100 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
      {[
        { icon: Users,      label: "Team Management",    desc: "Add & manage up to 50 educators" },
        { icon: TrendingUp, label: "Usage Analytics",    desc: "See who's generating what" },
        { icon: Coins,      label: "Shared Credits Pool", desc: "Allocate credits across members" },
      ].map(({ icon: Icon, label, desc }) => (
        <div key={label} className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-left">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2">
            <Icon className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs font-semibold text-gray-800 dark:text-white mb-0.5">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
        </div>
      ))}
    </div>

    <div className="animate-fade-in-up delay-200 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-1">
        <Lock className="w-3.5 h-3.5" />
        Available on the Institution plan (₹999/month)
      </div>
      <Button
        onClick={() => navigate("/pricing")}
        className="bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white px-6"
      >
        <Crown className="w-4 h-4 mr-2" /> Upgrade to Institution
      </Button>
      <button
        onClick={() => navigate("/dashboard")}
        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        Maybe later
      </button>
    </div>
  </div>
);

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isInstitution = (user as { role?: string })?.role === 'institution';

  return isInstitution ? <InstitutionDashboard /> : <UpgradePrompt navigate={navigate} />;
};

export default Community;
