import { FileText, Users, Clock, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: FileText,
    value: "10,000+",
    label: "Papers Generated",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: Users,
    value: "2,500+",
    label: "Active Educators",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: Clock,
    value: "< 3 min",
    label: "Avg. Generation Time",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
  {
    icon: TrendingUp,
    value: "98%",
    label: "Satisfaction Rate",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
];

const DashboardStats = () => {
  return (
    <section className="py-14 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
          Trusted by educators worldwide
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, label, color, bg }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-xs text-muted-foreground text-center">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardStats;
