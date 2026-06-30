import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, Clock } from "lucide-react";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalPapers: 0,
    activeUsers: 0,
    avgTime: 0,
    satisfaction: 0,
  });

  // useEffect(() => {
  //   // fetch('https://vinathaal.azhizen.com/api/stats')
  //   fetch('http://localhost:3001/api/stats')
  //     .then(res => res.json())
  //     .then(data => {
  //       const duration = 2000;
  //       const steps = 60;
  //       const interval = duration / steps;
  //       let step = 0;

  //       const timer = setInterval(() => {
  //         step++;
  //         const progress = step / steps;

  //         setStats({
  //           totalPapers: Math.floor(data.totalPapers * progress),
  //           activeUsers: Math.floor(data.activeUsers * progress),
  //           avgTime: Math.floor(data.avgTime * progress),
  //           satisfaction: Math.floor(data.satisfaction * progress),
  //         });

  //         if (step >= steps) {
  //           clearInterval(timer);
  //           setStats(data);
  //         }
  //       }, interval);
  //     })
  //     .catch(err => console.error('Failed to load stats', err));
  // }, []);

  const statCards = [
    {
      title: "Question Papers Generated",
      value: stats.totalPapers.toLocaleString() + "+",
      icon: <FileText className="w-8 h-8 animate-pulse" />,
      description: "Papers created by educators worldwide",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString() + "+",
      icon: <Users className="w-8 h-8 animate-pulse" />,
      description: "Educators trusting our platform",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      title: "Average Generation Time",
      value: stats.avgTime + " min",
      icon: <Clock className="w-8 h-8 animate-pulse" />,
      description: "From upload to ready paper",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Satisfaction Rate",
      value: stats.satisfaction + "%",
      icon: <TrendingUp className="w-8 h-8 animate-pulse" />,
      description: "Users rating us 5 stars",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-foreground mb-4 leading-tight">
            Trusted by Educators{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of educators who have revolutionized their question paper creation process.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-white/10 dark:bg-slate-800/20 backdrop-blur-md border border-accent/10 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] group rounded-2xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              <CardHeader className="pb-4 z-10 relative">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-md ring-4 ring-white/30`}
                >
                  <div className="text-white">{stat.icon}</div>
                </div>
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="text-3xl font-bold text-foreground mb-2 font-mono">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardStats;
