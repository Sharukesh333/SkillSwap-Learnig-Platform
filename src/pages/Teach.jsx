import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BookOpen, Plus, Settings, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

const LANGUAGES = ["Tamil", "English", "Hindi", "Telugu", "Kannada", "Malayalam"];

export default function Teach() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", language: "", category: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const me = await base44.auth.me();
    setUser(me);
    const courses = await base44.entities.Course.filter({ teacher_email: me.email });
    setMyCourses(courses);
    setLoading(false);
  }

  async function handleCreateCourse() {
    if (!form.title || !form.language) {
      toast.error("Please fill in course name and language");
      return;
    }
    setCreating(true);

    const newCourse = await base44.entities.Course.create({
      title: form.title,
      description: form.description,
      language: form.language,
      category: form.category || form.title,
      teacher_name: user.full_name || "Teacher",
      teacher_email: user.email,
      session_type: "credit",
      credits_required: 10,
      is_approved: false,
    });

    setCreating(false);
    toast.success("Course created! Now complete the assessment.");
    navigate(`/assessment/teacher/${newCourse.id}?title=${encodeURIComponent(form.title)}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teach</h1>
          <p className="text-sm text-muted-foreground">Share your skills and earn credits</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> New Course
        </Button>
      </div>

      {/* Create Course Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-card rounded-2xl border border-border/60 p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-foreground">What course do you want to teach?</h2>

          <div className="space-y-3">
            <div>
              <Label>Course Name</Label>
              <Input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Python for Beginners"
                className="rounded-xl mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What will students learn?"
                className="rounded-xl mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Language</Label>
              <Select value={form.language} onValueChange={v => setForm(prev => ({ ...prev, language: v }))}>
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Category (optional)</Label>
              <Input
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Programming, Data Science"
                className="rounded-xl mt-1"
              />
            </div>
          </div>

          <Button onClick={handleCreateCourse} disabled={creating} className="w-full rounded-xl h-12">
            {creating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              "Create & Take Assessment"
            )}
          </Button>
        </motion.div>
      )}

      {/* My Courses */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">My Courses</h2>
        {myCourses.length === 0 ? (
          <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-border">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">You haven't created any courses yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {myCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-3xl border border-border/60 p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                      {course.language} • {course.category}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    course.is_approved
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    {course.is_approved ? (
                      <><CheckCircle className="w-3.5 h-3.5" /> Approved</>
                    ) : (
                      <><Clock className="w-3.5 h-3.5" /> Pending Assessment</>
                    )}
                  </span>
                </div>

                <div className="flex gap-3 mt-5">
                  {course.is_approved ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/teach/slots/${course.id}`)}
                        className="rounded-xl h-10 px-4 border-border/60 hover:bg-accent/50 text-sm font-semibold"
                      >
                        <Clock className="w-4 h-4 mr-2" /> Manage Slots
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/teach/settings/${course.id}`)}
                        className="rounded-xl h-10 px-4 border-border/60 hover:bg-accent/50 text-sm font-semibold"
                      >
                        <Settings className="w-4 h-4 mr-2" /> Settings
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => navigate(`/assessment/teacher/${course.id}?title=${encodeURIComponent(course.title)}`)}
                      className="rounded-xl h-10 px-6 font-semibold"
                    >
                      Take Assessment
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}