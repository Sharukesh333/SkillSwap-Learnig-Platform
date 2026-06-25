import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useState, useEffect } from "react";
import { Home, BookOpen, GraduationCap, User, ArrowLeft, LogOut, Briefcase, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(me => {
      setUser(me);
      // Redirect new users to profile setup if profile is incomplete
      if (!me.profile_complete && location.pathname !== "/profile-setup") {
        navigate("/profile-setup");
      }
    }).catch(() => {});
  }, []);

  function handleLogout() {
    base44.auth.logout();
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Global Background Logo */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0 overflow-hidden">
        <img 
          src="/logo.png" 
          alt="" 
          className="w-[800px] h-[800px] object-contain rotate-12 scale-150" 
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isHome && (
              <Link to="/" className="p-2 rounded-lg hover:bg-accent transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
            )}
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="SkillSwap" className="w-9 h-9 object-contain" />
              <span className="text-lg font-bold text-foreground tracking-tight">SkillSwap</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <NavLink to="/" icon={Home} label="Home" active={location.pathname === "/"} />
            <NavLink to="/learn" icon={GraduationCap} label="Learn" active={location.pathname.startsWith("/learn")} />
            <NavLink to="/teach" icon={BookOpen} label="Teach" active={location.pathname.startsWith("/teach")} />
            <NavLink to="/my-sessions" icon={CalendarCheck} label="Sessions" active={location.pathname === "/my-sessions"} />
            <NavLink to="/portfolio" icon={Briefcase} label="Portfolio" active={location.pathname === "/portfolio"} />
            <NavLink to="/profile" icon={User} label="Profile" active={location.pathname === "/profile"} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 pb-24">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

function NavLink({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
        active
          ? "text-primary bg-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}