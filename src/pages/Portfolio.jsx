import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getDisplayName } from "@/lib/getDisplayName";
import { Award, BookCheck, Star, Download, User, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const me = await base44.auth.me();
    setUser(me);
    const [pass, done] = await Promise.all([
      base44.entities.Assessment.filter({ user_email: me.email, passed: true }),
      base44.entities.Session.filter({ student_email: me.email, status: "completed" }),
    ]);
    setAssessments(pass);
    setSessions(done);
    setLoading(false);
  }

  function downloadCert(assessment) {
    const content = `
SkillSwap Certificate of Completion

This is to certify that

${getDisplayName(user)}

has successfully completed the course

"${assessment.course_title}"

with a score of ${assessment.score}%

Date: ${new Date(assessment.created_date).toLocaleDateString()}
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Certificate_${assessment.course_title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded!");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Profile Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-bl-[6rem]" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{getDisplayName(user)}</h1>
            <p className="text-blue-100">{user?.email}</p>
            <div className="flex gap-4 mt-2 text-sm text-blue-100">
              <span>🏆 {assessments.length} Certificates</span>
              <span>📚 {sessions.length} Courses Done</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookCheck, label: "Completed", value: sessions.length, color: "text-emerald-600 bg-emerald-50" },
          { icon: Award, label: "Certificates", value: assessments.length, color: "text-violet-600 bg-violet-50" },
          { icon: Trophy, label: "Avg Score", value: assessments.length > 0 ? Math.round(assessments.reduce((s, a) => s + a.score, 0) / assessments.length) + "%" : "N/A", color: "text-amber-600 bg-amber-50" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl border border-border/60 p-5 text-center"
          >
            <div className={`w-10 h-10 mx-auto rounded-xl ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Certificates */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Certificates
        </h2>
        {assessments.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/60 p-10 text-center text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Complete courses and pass assessments to earn certificates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assessments.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border/60 p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-3xl" />
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{a.course_title}</h3>
                <p className="text-sm text-muted-foreground mb-1">Score: {a.score}%</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {new Date(a.created_date).toLocaleDateString()}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadCert(a)}
                  className="rounded-lg"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Sessions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookCheck className="w-5 h-5 text-primary" /> Courses Completed
        </h2>
        {sessions.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/60 p-10 text-center text-muted-foreground">
            <BookCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Complete your first session to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border/60 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{s.course_title}</p>
                  <p className="text-sm text-muted-foreground">with {s.teacher_name}</p>
                </div>
                <div className="text-right">
                  {s.rating_given > 0 && (
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{s.rating_given}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{s.slot_date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}