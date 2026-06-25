import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Check, ArrowRight, ArrowLeft, Upload, User, GraduationCap, Briefcase, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";import { useAuth } from "@/lib/AuthContext";
const SKILLS_OPTIONS = [
  "Java", "Python", "C++", "JavaScript", "Web Development",
  "Cloud Computing", "Machine Learning", "Data Science",
  "Mobile Development", "DevOps", "UI/UX Design", "SQL",
];

const LANGUAGE_OPTIONS = ["Tamil", "English", "Malayalam", "Hindi", "Telugu", "Kannada"];

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const EXP_OPTIONS = ["Fresher", "Less than 1 year", "1+ years", "2+ years", "3+ years", "5+ years"];

const STEPS = [
  { id: 1, label: "Basic Info", icon: User },
  { id: 2, label: "Education", icon: GraduationCap },
  { id: 3, label: "Skills", icon: Wrench },
  { id: 4, label: "Resume", icon: Briefcase },
];

const inputCls = "rounded-xl h-11 border-blue-200 focus:ring-2 focus:ring-primary/30 transition-all bg-white";
const textareaCls = "w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(me => {
      setCurrentUser(me);
      if (me) {
        setForm(prev => ({
          ...prev,
          display_name: me.display_name || me.full_name || "",
          email: me.email || "",
          phone: me.phone || "",
          status: me.status || "student",
          course_studying: me.course_studying || "",
          college: me.college || "",
          year_of_study: me.year_of_study || "",
          job_role: me.job_role || "",
          company: me.company || "",
          experience: me.experience || "",
          skills: me.skills || [],
          languages_known: me.languages_known || [],
          projects: me.projects || "",
          teaching_experience: me.teaching_experience || "",
          resume_url: me.resume_url || "",
        }));
      }
    }).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    display_name: "",
    email: "",
    phone: "",
    status: "student",
    course_studying: "",
    college: "",
    year_of_study: "",
    job_role: "",
    company: "",
    experience: "",
    skills: [],
    languages_known: [],
    projects: "",
    teaching_experience: "",
    resume_url: "",
  });

  const set = (key, value) => setForm(p => ({ ...p, [key]: value }));

  function toggleItem(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  }

  function validateStep() {
    if (step === 1) {
      if (!form.display_name.trim()) { toast.error("Enter your full name"); return false; }
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        toast.error("Enter a valid email address"); return false;
      }
      if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
        toast.error("Enter a valid 10-digit phone number"); return false;
      }
    }
    if (step === 2) {
      if (form.status === "student") {
        if (!form.course_studying.trim()) { toast.error("Enter your course"); return false; }
        if (!form.college.trim()) { toast.error("Enter your college name"); return false; }
        if (!form.year_of_study) { toast.error("Select your year of study"); return false; }
      } else {
        if (!form.job_role.trim()) { toast.error("Enter your job role"); return false; }
        if (!form.company.trim()) { toast.error("Enter your company name"); return false; }
        if (!form.experience) { toast.error("Select your experience level"); return false; }
      }
    }
    if (step === 3) {
      if (form.skills.length === 0) { toast.error("Select at least one skill"); return false; }
      if (!form.projects.trim()) { toast.error("Describe your projects"); return false; }
    }
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep(s => s + 1);
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Resume must be under 2MB"); return; }
    if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      toast.error("Only PDF or DOC files accepted"); return;
    }
    setUploadingResume(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("resume_url", file_url);
    setUploadingResume(false);
    toast.success("Resume uploaded!");
  }

  async function handleSubmit() {
    setSaving(true);
    await base44.auth.updateMe({ ...form, profile_complete: true });
    await refreshUser(); // Refresh user data in AuthContext
    toast.success("Profile Updated Successfully! 🎉");
    navigate("/");
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-100 border border-blue-50">
            <img src="/logo.png" alt="" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-1">Step {step} of {STEPS.length} — Tell us about yourself</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          {/* Step Dots */}
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    done ? "bg-primary text-white shadow-md shadow-primary/30"
                    : active ? "bg-white border-2 border-primary text-primary shadow-md"
                    : "bg-blue-100 text-blue-300"
                  }`}>
                    {done ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Bar */}
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-100/50 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-8 space-y-5"
            >
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <>
                  <StepTitle icon={User} title="Basic Details" subtitle="Your contact information" />
                  <Field label="Full Name *">
                    <Input
                      type="text"
                      placeholder="e.g. Vishali G"
                      value={form.display_name}
                      onChange={e => set("display_name", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email Address *">
                    <Input
                      type="email"
                      placeholder="e.g. vishali@example.com"
                      value={form.email || currentUser?.email || ""}
                      onChange={e => set("email", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone Number *">
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      className={inputCls}
                      maxLength={10}
                    />
                  </Field>
                </>
              )}

              {/* STEP 2: Education / Work */}
              {step === 2 && (
                <>
                  <StepTitle icon={GraduationCap} title="Education / Work Status" subtitle="Tell us your current status" />

                  {/* Status Radio */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "student", label: "🎓 Student", sub: "Currently studying" },
                      { value: "professional", label: "💼 Working Professional", sub: "Currently employed" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set("status", opt.value)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                          form.status === opt.value
                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                            : "border-blue-200 hover:border-primary/40 bg-blue-50/50"
                        }`}
                      >
                        <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {form.status === "student" ? (
                      <motion.div key="student" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <Field label="Course Studying *">
                          <Input placeholder="e.g. B.Tech Computer Science, B.Sc IT..." value={form.course_studying} onChange={e => set("course_studying", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="College Name *">
                          <Input placeholder="e.g. Anna University, VIT..." value={form.college} onChange={e => set("college", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Year of Study *">
                          <select
                            value={form.year_of_study}
                            onChange={e => set("year_of_study", e.target.value)}
                            className="w-full rounded-xl h-11 border border-blue-200 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                          >
                            <option value="">Select year...</option>
                            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </Field>
                      </motion.div>
                    ) : (
                      <motion.div key="professional" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <Field label="Job Role *">
                          <Input placeholder="e.g. Software Engineer, Data Analyst..." value={form.job_role} onChange={e => set("job_role", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Company Name *">
                          <Input placeholder="e.g. Infosys, TCS, Startup..." value={form.company} onChange={e => set("company", e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Experience *">
                          <select
                            value={form.experience}
                            onChange={e => set("experience", e.target.value)}
                            className="w-full rounded-xl h-11 border border-blue-200 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                          >
                            <option value="">Select experience...</option>
                            {EXP_OPTIONS.map(x => <option key={x} value={x}>{x}</option>)}
                          </select>
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* STEP 3: Skills */}
              {step === 3 && (
                <>
                  <StepTitle icon={Wrench} title="Skills & Experience" subtitle="What can you teach or learn?" />

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Skills Known * <span className="text-muted-foreground font-normal">(tap to select)</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS_OPTIONS.map(skill => {
                        const sel = form.skills.includes(skill);
                        return (
                          <button key={skill} type="button" onClick={() => toggleItem("skills", skill)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                              sel ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105"
                              : "bg-blue-50 text-foreground border-blue-200 hover:border-primary/50 hover:bg-blue-100"
                            }`}>
                            {sel && <Check className="w-3 h-3 inline mr-1" />}{skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Languages Known <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map(lang => {
                        const sel = form.languages_known.includes(lang);
                        return (
                          <button key={lang} type="button" onClick={() => toggleItem("languages_known", lang)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                              sel ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105"
                              : "bg-indigo-50 text-foreground border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100"
                            }`}>
                            {sel && <Check className="w-3 h-3 inline mr-1" />}{lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Field label="Projects Done *">
                    <textarea rows={3} placeholder="e.g. Portfolio Website, Mini E-commerce, Library App..." value={form.projects} onChange={e => set("projects", e.target.value)} className={textareaCls} />
                  </Field>

                  <Field label="Teaching Experience (Optional)">
                    <textarea rows={2} placeholder="e.g. Tutored juniors in Python, Conducted workshops..." value={form.teaching_experience} onChange={e => set("teaching_experience", e.target.value)} className={textareaCls} />
                  </Field>
                </>
              )}

              {/* STEP 4: Resume */}
              {step === 4 && (
                <>
                  <StepTitle icon={Briefcase} title="Resume Upload" subtitle="Upload your resume (optional)" />

                  <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-200 ${
                    form.resume_url ? "border-emerald-400 bg-emerald-50" : "border-blue-200 bg-blue-50/50 hover:border-primary hover:bg-blue-100/50"
                  }`}>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={uploadingResume} />
                    {uploadingResume ? (
                      <div className="flex flex-col items-center gap-2 text-primary">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-sm font-medium">Uploading...</span>
                      </div>
                    ) : form.resume_url ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-600">
                        <Check className="w-10 h-10" />
                        <span className="text-sm font-semibold">Resume Uploaded Successfully!</span>
                        <span className="text-xs text-muted-foreground">Click to replace</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-blue-500">
                        <Upload className="w-10 h-10" />
                        <span className="text-sm font-semibold text-foreground">Click to upload Resume</span>
                        <span className="text-xs text-muted-foreground">PDF or DOC — Max 2MB</span>
                      </div>
                    )}
                  </label>

                  <div className="bg-blue-50 rounded-xl p-4 space-y-1">
                    <p className="text-sm font-semibold text-blue-800">🎉 Almost done!</p>
                    <p className="text-xs text-blue-600">Click "Create Account" to complete your profile and start swapping skills.</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="px-8 pb-8 flex gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 h-12 rounded-xl border-blue-200 text-foreground hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}

            {step < STEPS.length ? (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full h-12 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 shadow-lg shadow-primary/25 transition-all"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Create Account
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-blue-100">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="font-bold text-foreground text-lg">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  );
}