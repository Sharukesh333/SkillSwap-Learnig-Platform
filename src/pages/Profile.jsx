import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getDisplayName } from "@/lib/getDisplayName";
import { User, Coins, Award, BookCheck, LogOut, Edit, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ credits: 100, taught: 0, learned: 0, certs: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const me = await base44.auth.me();
    setUser(me);

    const [sessions, teachSessions, assessments, transactions] = await Promise.all([
      base44.entities.Session.filter({ student_email: me.email, status: "completed" }),
      base44.entities.Session.filter({ teacher_email: me.email, status: "completed" }),
      base44.entities.Assessment.filter({ user_email: me.email, passed: true }),
      base44.entities.CreditTransaction.filter({ user_email: me.email }),
    ]);

    const totalCredits = transactions.reduce((sum, t) => {
      return t.type === "earned" || t.type === "bonus" ? sum + t.amount : sum - t.amount;
    }, 100);

    setStats({
      credits: Math.max(0, totalCredits),
      learned: sessions.length,
      taught: teachSessions.length,
      certs: assessments.length,
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border/60 p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{getDisplayName(user)}</h1>
        <p className="text-muted-foreground">{user?.email}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Coins} label="Credits" value={stats.credits} color="primary" delay={1} />
        <StatCard icon={BookCheck} label="Learned" value={stats.learned} color="green" delay={2} />
        <StatCard icon={BookCheck} label="Taught" value={stats.taught} color="amber" delay={3} />
        <StatCard icon={Award} label="Certificates" value={stats.certs} color="purple" delay={4} />
      </div>

      <Button
        variant="outline"
        onClick={() => navigate("/profile-setup")}
        className="w-full rounded-xl h-12 mb-3"
      >
        <Edit className="w-4 h-4 mr-2" /> Edit Profile
      </Button>

      <Button
        variant="outline"
        onClick={() => navigate("/login-sim")}
        className="w-full rounded-xl h-12 mb-3"
      >
        <UserCheck className="w-4 h-4 mr-2" /> Switch Account
      </Button>

      <Button
        variant="outline"
        onClick={() => base44.auth.logout()}
        className="w-full rounded-xl h-12"
      >
        <LogOut className="w-4 h-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
}