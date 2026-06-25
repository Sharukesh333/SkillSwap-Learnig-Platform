import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, X, Coins, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import LanguageSelector from "../components/LanguageSelector";
import CourseCard from "../components/CourseCard";
import { motion } from "framer-motion";

const ALL_CATEGORIES = [
  "Java", "Python", "C++", "JavaScript", "Web Development", "Cloud Computing",
  "Data Science", "AI", "Machine Learning", "React", "Node.js", "SQL",
  "Cybersecurity", "DevOps", "Mobile Development", "Blockchain", "IoT",
  "Game Development", "UI/UX Design", "Data Structures"
];

export default function Learn() {
  const [selectedLang, setSelectedLang] = useState(null);
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (selectedLang) {
      loadCourses();
    }
  }, [selectedLang]);

  async function loadCourses() {
    setLoading(true);
    const [langCourses, all] = await Promise.all([
      base44.entities.Course.filter({ language: selectedLang, is_approved: true }),
      base44.entities.Course.filter({ is_approved: true }),
    ]);
    setCourses(langCourses);
    setAllCourses(all);
    setLoading(false);
  }

  const displayCourses = showAll ? allCourses : courses;
  const filtered = search
    ? displayCourses.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase()) ||
        c.teacher_name?.toLowerCase().includes(search.toLowerCase())
      )
    : displayCourses;

  if (!selectedLang) {
    return <LanguageSelector onSelect={setSelectedLang} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {showAll ? "All Courses" : `Courses in ${selectedLang}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} course{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showAll
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-accent"
            }`}
          >
            {showAll ? "Show Language" : "Browse All A–Z"}
          </button>
          <button
            onClick={() => { setSelectedLang(null); setShowAll(false); }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-card border border-border text-foreground hover:bg-accent transition-all"
          >
            Change Language
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search courses, teachers, topics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-11 h-12 rounded-xl bg-card border-border/60"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSearch(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              search === cat
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sections */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-muted-foreground text-lg">No courses found</p>
          <p className="text-sm text-muted-foreground mt-1">Try browsing all courses or changing your search</p>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {/* Credit Sessions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" /> Credit-based Sessions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.filter(c => c.session_type === "credit").map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </div>

          {/* Paid Sessions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" /> Paid Sessions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.filter(c => c.session_type === "paid").map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}