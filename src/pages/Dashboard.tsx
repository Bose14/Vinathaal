import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, Brain, BookOpen, ArrowRight,
  FileText, Users, TrendingUp, Clock,
  Coins, Sparkles, ExternalLink, Calendar, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { api, PaperHistory } from "@/lib/apiClient";
import { toast } from "sonner";

const quickActions = [
  {
    icon: Upload,
    label: "Syllabus Generator",
    desc: "Upload syllabus → AI builds your paper",
    path: "/generator",
    gradient: "from-[#3F3D56] to-[#007AFF]",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: Brain,
    label: "MCQ Generator",
    desc: "Create multiple choice question sets",
    path: "/mcq-generator",
    gradient: "from-violet-600 to-purple-600",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: BookOpen,
    label: "Question Bank",
    desc: "Build & manage question repositories",
    path: "/question-bank",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [recentPapers, setRecentPapers] = useState<PaperHistory[]>([]);
  const [stats, setStats] = useState({ totalPapers: 0, activeUsers: 0, avgTime: 3, satisfaction: 98 });
  const [papersLoading, setPapersLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    if (!user?.email) return;
    api.papers.getHistory(user.email)
      .then((res) => setRecentPapers(res.data ?? []))
      .catch(() => {})
      .finally(() => setPapersLoading(false));

    api.stats.get()
      .then((s) => setStats(s))
      .catch(() => {});
  }, [user?.email]);

  const statCards = [
    { icon: FileText,    label: "Papers Created",     value: stats.totalPapers + "+",  color: "text-blue-600",    bg: "bg-blue-50" },
    { icon: Users,       label: "Active Educators",   value: stats.activeUsers + "+",  color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Clock,       label: "Avg. Gen Time",      value: stats.avgTime + " min",   color: "text-orange-600",  bg: "bg-orange-50" },
    { icon: TrendingUp,  label: "Satisfaction Rate",  value: stats.satisfaction + "%", color: "text-purple-600",  bg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-full p-6 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {greeting()}, {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Credits badge */}
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 px-5 py-3 shadow-sm w-fit">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-none">Credits remaining</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
                {creditsLoading ? "—" : credits}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 ml-1 h-7 px-2"
              onClick={() => navigate("/pricing")}
            >
              Get more
            </Button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="animate-fade-in-up delay-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group relative text-left bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{action.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{action.desc}</p>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all mt-3" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent papers */}
      <div className="animate-fade-in-up delay-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Recent Papers</h2>
          {recentPapers.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/history")}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => navigate("/generator")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                Generate new <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {papersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : recentPapers.length === 0 ? (
          <Card className="border-dashed border-gray-200 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">No papers yet</p>
              <p className="text-xs text-gray-400 mb-4">Generate your first question paper to see it here</p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white text-xs h-8 px-4"
                onClick={() => navigate("/generator")}
              >
                Start Generating
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPapers.map((paper, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <button
                    onClick={() => window.open(paper.objectUrl, "_blank")}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-50"
                    title="Open paper"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate mb-1">{paper.subjectName || "Untitled Paper"}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                  <Calendar className="w-3 h-3" />
                  {new Date(paper.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(paper.objectUrl, "_blank")}
                    className="flex-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl py-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> View
                  </button>
                  <a
                    href={paper.objectUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center justify-center gap-1 bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl py-1.5 transition-colors"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform stats */}
      <div className="animate-fade-in-up delay-300">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 hover:shadow-sm transition-shadow">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      {credits === 0 && (
        <div className="animate-fade-in-up delay-400 rounded-2xl bg-gradient-to-r from-[#3F3D56] to-[#007AFF] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-white">
            <p className="font-semibold text-lg">You've used all your credits</p>
            <p className="text-sm text-blue-200 mt-1">Upgrade to continue generating question papers</p>
          </div>
          <Button
            className="bg-white text-[#3F3D56] hover:bg-gray-100 font-semibold shrink-0"
            onClick={() => navigate("/pricing")}
          >
            View Plans
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
