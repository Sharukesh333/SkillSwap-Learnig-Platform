import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Video, Mic, MicOff, VideoOff, Phone, Star, Loader2, Send, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const PHASES = { JOINING: "joining", LIVE: "live", FEEDBACK: "feedback", DONE: "done" };

export default function LiveSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("course");
  const courseTitle = urlParams.get("title") || "Course";

  const [phase, setPhase] = useState(PHASES.JOINING);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase(PHASES.LIVE), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === PHASES.LIVE) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  function endSession() {
    clearInterval(timerRef.current);
    setPhase(PHASES.FEEDBACK);
  }

  async function submitFeedback() {
    if (rating === 0) { toast.error("Please give a rating"); return; }
    setSubmitting(true);

    const me = await base44.auth.me();

    // Complete the session + award teacher double credits
    const sessions = await base44.entities.Session.filter({ id: sessionId });
    if (sessions.length > 0) {
      const s = sessions[0];
      await base44.entities.Session.update(sessionId, { status: "completed", rating_given: rating });

      // Update course rating
      const courses = await base44.entities.Course.filter({ id: s.course_id });
      if (courses.length > 0) {
        const c = courses[0];
        const newTotal = (c.total_ratings || 0) + 1;
        const newRating = (((c.rating || 0) * (c.total_ratings || 0)) + rating) / newTotal;
        await base44.entities.Course.update(c.id, {
          rating: Math.round(newRating * 10) / 10,
          total_ratings: newTotal,
          sessions_completed: (c.sessions_completed || 0) + 1,
        });
      }

      // Teacher gets 2x credits
      if (s.credits_paid > 0) {
        await base44.entities.CreditTransaction.create({
          user_email: s.teacher_email,
          amount: s.credits_paid * 2,
          type: "earned",
          description: `Taught: ${s.course_title}`,
          session_id: sessionId,
        });
      }
    }

    setSubmitting(false);
    setPhase(PHASES.DONE);
  }

  const mins = String(Math.floor(duration / 60)).padStart(2, "0");
  const secs = String(duration % 60).padStart(2, "0");

  if (phase === PHASES.JOINING) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Video className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Joining Session...</h2>
        <p className="text-muted-foreground">Connecting to {courseTitle}</p>
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === PHASES.LIVE) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Live Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-red-600">LIVE</span>
          </div>
          <span className="font-mono text-lg font-bold text-foreground">{mins}:{secs}</span>
        </div>

        {/* Video Area */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden aspect-video flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <Video className="w-10 h-10 text-white/60" />
              </div>
              <p className="text-white/60 text-sm">Live Session in Progress</p>
              <p className="text-white font-semibold">{courseTitle}</p>
            </div>
          </div>
          {/* Self view */}
          <div className="absolute bottom-4 right-4 w-24 h-16 rounded-xl bg-slate-700 border-2 border-white/20 flex items-center justify-center">
            <span className="text-white/50 text-xs">You</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${muted ? "bg-red-100 text-red-600" : "bg-card border border-border text-foreground"}`}
          >
            {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={endSession}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg hover:shadow-red-200"
          >
            <Phone className="w-6 h-6 text-white rotate-[135deg]" />
          </button>
          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!videoOn ? "bg-red-100 text-red-600" : "bg-card border border-border text-foreground"}`}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">Click the red button to end the session</p>
      </div>
    );
  }

  if (phase === PHASES.FEEDBACK) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">How was the session?</h2>
          <p className="text-muted-foreground">Your feedback helps teachers improve</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/60 p-6 space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Rate your experience</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)}>
                  <Star className={`w-9 h-9 transition-all ${s <= rating ? "fill-amber-400 text-amber-400 scale-110" : "text-border hover:text-amber-200"}`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Leave a comment (optional)</p>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What did you like? What could be improved?"
              className="rounded-xl"
              rows={3}
            />
          </div>

          <Button
            onClick={submitFeedback}
            disabled={submitting || rating === 0}
            className="w-full h-12 rounded-xl font-semibold"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit Feedback</>}
          </Button>
        </div>
      </motion.div>
    );
  }

  // DONE phase
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center space-y-6 py-10"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
        <ClipboardCheck className="w-10 h-10 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">Session Complete!</h2>
        <p className="text-muted-foreground mt-2">Great job! Ready to test your knowledge?</p>
      </div>
      <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-3">
        <p className="text-sm text-muted-foreground">Earn a certificate by passing the assessment</p>
        <Button
          onClick={() => navigate(`/assessment/learner/${courseId}?title=${encodeURIComponent(courseTitle)}&session=${sessionId}`)}
          className="w-full h-12 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700"
        >
          <ClipboardCheck className="w-4 h-4 mr-2" /> Start Assessment
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="w-full rounded-xl"
        >
          Skip for now
        </Button>
      </div>
    </motion.div>
  );
}