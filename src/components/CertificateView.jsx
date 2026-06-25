import { Download, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CertificateView({ name, courseTitle, score, date, onSaveToProfile, onGoHome }) {
  function handleDownload() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1200;
    canvas.height = 800;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "#E0E7FF";
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner Border
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Logo and Name
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "/logo.png";
    logo.onload = () => {
      // Draw Logo
      ctx.drawImage(logo, canvas.width / 2 - 40, 100, 80, 80);

      ctx.textAlign = "center";
      
      // SkillSwap Text
      ctx.fillStyle = "#1E40AF";
      ctx.font = "bold 40px Inter, sans-serif";
      ctx.fillText("SkillSwap", canvas.width / 2, 220);

      // Certificate Title
      ctx.fillStyle = "#64748B";
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.fillText("CERTIFICATE OF COMPLETION", canvas.width / 2, 260);

      // Certify text
      ctx.fillStyle = "#94A3B8";
      ctx.font = "italic 20px Inter, sans-serif";
      ctx.fillText("This is to certify that", canvas.width / 2, 340);

      // Name
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 60px Inter, sans-serif";
      ctx.fillText(name, canvas.width / 2, 420);

      // Completed text
      ctx.fillStyle = "#94A3B8";
      ctx.font = "italic 20px Inter, sans-serif";
      ctx.fillText("has successfully completed", canvas.width / 2, 480);

      // Course Title
      ctx.fillStyle = "#2563EB";
      ctx.font = "bold 45px Inter, sans-serif";
      ctx.fillText(`"${courseTitle}"`, canvas.width / 2, 550);

      // Score and Date
      ctx.fillStyle = "#059669";
      ctx.font = "bold 30px Inter, sans-serif";
      ctx.fillText(`${score}%`, canvas.width / 2 - 150, 650);
      
      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillText("SCORE", canvas.width / 2 - 150, 680);

      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 25px Inter, sans-serif";
      ctx.fillText(date, canvas.width / 2 + 150, 650);
      
      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillText("DATE ISSUED", canvas.width / 2 + 150, 680);

      // Footer
      ctx.fillStyle = "#2563EB";
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.fillText("VERIFIED ACHIEVEMENT", canvas.width / 2, 740);

      // Download
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `SkillSwap_Certificate_${courseTitle.replace(/\s+/g, "_")}.png`;
      a.click();
      toast.success("Certificate image downloaded!");
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto space-y-8"
    >
      {/* Certificate Card */}
      <div className="relative overflow-hidden rounded-[40px] border-[16px] border-[#E0E7FF] bg-white p-12 text-center shadow-2xl shadow-blue-100">
        <div className="relative z-10 space-y-6">
          {/* Logo area */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="SkillSwap" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-black text-[#1E40AF] tracking-tighter">SkillSwap</span>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#64748B] font-black">Certificate of Completion</p>
          </div>

          <div className="py-2">
            <p className="text-sm text-[#94A3B8] font-semibold italic">This is to certify that</p>
            <h2 className="text-4xl font-black text-[#0F172A] mt-2 tracking-tight leading-tight">{name}</h2>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-[#94A3B8] font-semibold italic">has successfully completed</p>
            <h3 className="text-2xl font-black text-[#2563EB] mt-1 tracking-tight">"{courseTitle}"</h3>
          </div>

          <div className="flex items-center justify-center gap-10 py-4">
            <div className="text-center">
              <p className="text-3xl font-black text-[#059669]">{score}%</p>
              <p className="text-[10px] uppercase font-black text-[#94A3B8] tracking-widest mt-1">Score</p>
            </div>
            <div className="w-px h-12 bg-[#E2E8F0]" />
            <div className="text-center">
              <p className="text-lg font-black text-[#0F172A]">{date}</p>
              <p className="text-[10px] uppercase font-black text-[#94A3B8] tracking-widest mt-1">Date Issued</p>
            </div>
          </div>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 bg-[#F1F5F9] px-6 py-3 rounded-full border border-[#E2E8F0]">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-black text-[#2563EB] uppercase tracking-wider">Verified Achievement</span>
            </div>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
           <img src="/logo.png" alt="" className="w-[400px] h-[400px] object-contain rotate-12" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 px-4">
        <Button 
          onClick={handleDownload} 
          className="flex-1 h-14 rounded-2xl font-bold bg-[#2563EB] hover:bg-[#1E40AF] text-white shadow-lg shadow-blue-200 text-lg transition-all"
        >
          <Download className="w-5 h-5 mr-3" /> Download
        </Button>
        {onSaveToProfile && (
          <Button
            variant="outline"
            onClick={() => { onSaveToProfile(); toast.success("Saved to Portfolio!"); }}
            className="flex-1 h-14 rounded-2xl font-bold border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-lg transition-all"
          >
            Save to Portfolio
          </Button>
        )}
      </div>
      {onGoHome && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={onGoHome} className="font-bold text-[#64748B] hover:text-[#0F172A]">
            Back to Dashboard
          </Button>
        </div>
      )}
    </motion.div>
  );
}