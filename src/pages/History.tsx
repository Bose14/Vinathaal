import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Calendar, ExternalLink, Search, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { api, PaperHistory } from "@/lib/apiClient";
import { toast } from "sonner";

const PAGE_SIZE = 12;

function isWithinDays(dateStr: string, days: number) {
  const date = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState<PaperHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    api.papers
      .getAllHistory(user.email)
      .then((res) => setPapers(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const filtered = papers.filter((p) => {
    const matchSearch = (p.subjectName ?? "").toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (dateFilter === "7d")  return isWithinDays(p.created_at, 7);
    if (dateFilter === "30d") return isWithinDays(p.created_at, 30);
    if (dateFilter === "90d") return isWithinDays(p.created_at, 90);
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (val: string) => { setSearch(val); setPage(1); };
  const handleFilterChange  = (val: string) => { setDateFilter(val); setPage(1); };

  const handleDelete = async (paper: PaperHistory) => {
    if (!paper.id) { toast.error("Cannot delete: paper ID missing"); return; }
    setDeletingId(paper.id);
    try {
      await api.papers.deletePaper(paper.id);
      setPapers((prev) => prev.filter((p) => p.id !== paper.id));
      toast.success("Paper deleted");
    } catch {
      toast.error("Failed to delete paper");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">History</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">All question papers you've generated</p>
      </div>

      {/* Filters */}
      <div className="animate-fade-in-up delay-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search by subject…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus-visible:ring-blue-500"
          />
        </div>
        <Select value={dateFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="h-9 w-full sm:w-44 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
            <SelectItem value="all"  className="text-xs">All time</SelectItem>
            <SelectItem value="7d"   className="text-xs">Last 7 days</SelectItem>
            <SelectItem value="30d"  className="text-xs">Last 30 days</SelectItem>
            <SelectItem value="90d"  className="text-xs">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Papers grid */}
      <div className="animate-fade-in-up delay-200">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {papers.length === 0 ? "No papers yet" : "No results found"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
              {papers.length === 0
                ? "Generate your first question paper to see it here"
                : "Try a different search or date filter"}
            </p>
            {papers.length === 0 && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white text-xs h-8 px-4"
                onClick={() => navigate("/generator")}
              >
                Start Generating
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {paginated.map((paper, i) => (
                <div
                  key={paper.id ?? i}
                  className="group bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200"
                >
                  {/* Icon row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => window.open(paper.objectUrl, "_blank")}
                        className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete paper"
                            disabled={deletingId === paper.id}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">Delete paper?</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              "{paper.subjectName || "Untitled"}" will be permanently removed from your history. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(paper)}
                              className="bg-red-600 hover:bg-red-700 text-white border-0"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate mb-1.5">
                    {paper.subjectName || "Untitled Paper"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mb-4">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {new Date(paper.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(paper.objectUrl, "_blank")}
                      className="flex-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl py-2 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </button>
                    <a
                      href={paper.objectUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-700/40 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl py-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-gray-400 dark:text-gray-600">
                {filtered.length} paper{filtered.length !== 1 ? "s" : ""}
                {dateFilter !== "all" || search ? ` (filtered from ${papers.length})` : ""}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px] text-center">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;
