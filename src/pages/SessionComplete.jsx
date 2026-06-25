import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ClipboardCheck, CheckCircle } from "lucide-react";

export default function SessionComplete() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");
  const courseTitle = urlParams.get("title") || "Course";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-8 border border-emerald-100"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white">
          <CheckCircle className="w-10 h-10" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-3 mb-10"
      >
        <h1 className="text-4xl font-extrabold text-[#0F172A] tracking-tight">Session Complete!</h1>
        <p className="text-xl font-bold text-[#64748B]">Great job! Ready to test your knowledge?</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm bg-card rounded-[32px] border border-border/60 p-8 shadow-2xl shadow-slate-200/50 space-y-8"
      >
        <p className="text-center text-[#64748B] font-bold text-base">Earn a certificate by passing the assessment</p>
        <div className="space-y-4">
          <Button
            onClick={() => navigate(`/assessment/learner/${courseId}?session=${sessionId}&title=${encodeURIComponent(courseTitle)}`)}
            className="w-full h-14 rounded-2xl text-lg font-bold bg-[#00966d] hover:bg-[#007a58] text-white transition-all duration-300 shadow-lg shadow-emerald-200 flex items-center justify-center gap-3"
          >
            <ClipboardCheck className="w-6 h-6" /> Start Assessment
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/my-sessions")} 
            className="w-full h-12 rounded-2xl text-base font-bold text-[#64748B] hover:text-[#0F172A]"
          >
            Skip for now
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
