import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { getDisplayName } from "@/lib/getDisplayName";
import { motion } from "framer-motion";
import { Coins, Award, BookCheck, Users, GraduationCap, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ credits: 100, courses: 0, certs: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const me = await base44.auth.me();
    setUser(me);

    const [sessions, assessments, transactions] = await Promise.all([
      base44.entities.Session.filter({ student_email: me.email }),
      base44.entities.Assessment.filter({ user_email: me.email, passed: true }),
      base44.entities.CreditTransaction.filter({ user_email: me.email }),
    ]);

    const completedSessions = sessions.filter(s => s.status === "completed");
    const totalCredits = transactions.reduce((sum, t) => {
      return t.type === "earned" || t.type === "bonus"
        ? sum + t.amount
        : sum - t.amount;
    }, 100); // Start with 100 credits

    setStats({
      credits: Math.max(0, totalCredits),
      courses: completedSessions.length,
      certs: assessments.length,
      sessions: sessions.length,
    });
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-card rounded-3xl border border-border/60 p-8"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-[6rem]" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/3 rounded-tr-[4rem]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Welcome back</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {getDisplayName(user)}
          </h1>
          <p className="text-muted-foreground mt-1">Ready to swap some skills today?</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Coins} label="Credits" value={stats.credits} color="primary" delay={1} />
        <StatCard icon={BookCheck} label="Courses Done" value={stats.courses} color="green" delay={2} />
        <StatCard icon={Award} label="Certificates" value={stats.certs} color="purple" delay={3} />
        <StatCard icon={Users} label="Sessions" value={stats.sessions} color="amber" delay={4} />
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActionCard
          to="/learn"
          icon={GraduationCap}
          title="Learn"
          subtitle="Explore courses and master new skills"
          gradient="from-blue-500 to-indigo-600"
          delay={0.3}
        />
        <ActionCard
          to="/teach"
          icon={BookOpen}
          title="Teach"
          subtitle="Share your expertise and earn credits"
          gradient="from-emerald-500 to-teal-600"
          delay={0.4}
        />
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, subtitle, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link to={to}>
        <div className={`group relative bg-gradient-to-br ${gradient} rounded-3xl p-7 text-white overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[5rem] group-hover:w-40 group-hover:h-40 transition-all duration-500" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-white/80 text-sm">{subtitle}</p>
            <div className="flex items-center gap-1 mt-4 text-sm font-medium text-white/90 group-hover:gap-2 transition-all">
              Get started <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}