import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, Star, ClipboardCheck, Video, Calendar, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MySessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [ratingSession, setRatingSession] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const me = await base44.auth.me();
    setUser(me);
    
    // Fetch both student and teacher sessions
    const [asStudent, asTeacher] = await Promise.all([
      base44.entities.Session.filter({ student_email: me.email }),
      base44.entities.Session.filter({ teacher_email: me.email })
    ]);
    
    // Combine and mark role
    const combined = [
      ...asStudent.map(s => ({ ...s, role: 'student' })),
      ...asTeacher.map(s => ({ ...s, role: 'teacher' }))
    ].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));

    setSessions(combined);
    setLoading(false);
  }

  async function completeSession(session) {
    await base44.entities.Session.update(session.id, { status: "completed" });

    // Teacher gets 2x credits
    if (session.credits_paid > 0) {
      await base44.entities.CreditTransaction.create({
        user_email: session.teacher_email,
        amount: session.credits_paid * 2,
        type: "earned",
        description: `Earned from teaching: ${session.course_title}`,
        session_id: session.id,
      });
    }

    toast.success("Session marked as completed!");
    navigate(`/session-complete/${session.course_id}?session=${session.id}&title=${encodeURIComponent(session.course_title)}`);
  }

  async function submitRating(session) {
    if (rating === 0) return;
    await base44.entities.Session.update(session.id, { rating_given: rating });

    // Update course rating
    const course = await base44.entities.Course.get(session.course_id);
    if (course) {
      const newTotal = (course.total_ratings || 0) + 1;
      const newRating = (((course.rating || 0) * (course.total_ratings || 0)) + rating) / newTotal;
      await base44.entities.Course.update(course.id, {
        rating: Math.round(newRating * 10) / 10,
        total_ratings: newTotal,
        sessions_completed: (course.sessions_completed || 0) + 1,
      });
    }

    setRatingSession(null);
    setRating(0);
    toast.success("Rating submitted!");
    loadSessions();
  }

  const upcoming = sessions.filter(s => s.status === "booked" || s.status === "scheduled");
  const completed = sessions.filter(s => s.status === "completed");

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Sessions</h1>
        <p className="text-muted-foreground">Manage your learning and teaching schedule</p>
      </div>

      {/* Upcoming */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Upcoming Sessions
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-muted/30 rounded-2xl p-8 text-center border border-dashed border-border">
            <p className="text-muted-foreground">No upcoming sessions</p>
            <Button onClick={() => navigate("/learn")} variant="link">Browse courses</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.map(session => (
              <SessionCard key={session.id} session={session} onComplete={() => completeSession(session)} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" /> Past Sessions
        </h2>
        {completed.length === 0 ? (
          <p className="text-muted-foreground text-sm pl-7">No completed sessions yet</p>
        ) : (
          <div className="grid gap-3 opacity-80 hover:opacity-100 transition-opacity">
            {completed.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                ratingSession={ratingSession}
                setRatingSession={setRatingSession}
                rating={rating}
                setRating={setRating}
                onSubmitRating={() => submitRating(session)}
                navigate={navigate} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ session, onComplete, ratingSession, setRatingSession, rating, setRating, onSubmitRating, navigate }) {
  const isTeacher = session.role === 'teacher';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/60 p-6 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">{session.course_title}</h3>
          <p className="text-sm text-muted-foreground font-medium">
            with {isTeacher ? `Student: ${session.student_email}` : session.teacher_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentBadge type={session.payment_method === 'credit' ? 'credit' : 'paid'} amount={session.payment_method === 'credit' ? session.credits_paid : session.amount_paid} />
          <StatusBadge status={session.status} />
        </div>
      </div>

      <div className="flex gap-4 text-sm font-medium text-muted-foreground/80">
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> {session.slot_date}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> {session.slot_time}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        {(session.status === "booked" || session.status === "scheduled") && (
          <>
            <Button
              onClick={() => navigate(`/live/${session.id}?course=${session.course_id}&title=${encodeURIComponent(session.course_title)}`)}
              className="rounded-xl h-11 px-6 bg-[#00966d] hover:bg-[#007a58] text-white flex items-center gap-2"
            >
              <Video className="w-4 h-4" /> Join Session
            </Button>
            {!isTeacher && (
              <Button
                onClick={onComplete}
                variant="outline"
                className="rounded-xl h-11 px-6 border-border/60 hover:bg-accent/50"
              >
                Mark Done
              </Button>
            )}
          </>
        )}

        {session.status === "completed" && !isTeacher && !session.rating_given && (
          <div className="w-full">
            {ratingSession === session.id ? (
              <div className="flex items-center gap-3 bg-accent/30 p-3 rounded-xl">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star className={`w-5 h-5 transition-colors ${s <= rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                    </button>
                  ))}
                </div>
                <Button size="sm" onClick={onSubmitRating} className="rounded-lg h-8">
                  Submit
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRatingSession(session.id)}
                className="text-primary hover:text-primary hover:bg-primary/5 p-0 h-auto font-bold"
              >
                <Star className="w-4 h-4 mr-1" /> Rate your experience
              </Button>
            )}
          </div>
        )}

        {session.status === "completed" && !isTeacher && !session.assessment_passed && (
          <Button
            onClick={() => navigate(`/assessment/learner/${session.course_id}?session=${session.id}&title=${encodeURIComponent(session.course_title)}`)}
            className="rounded-xl h-11 px-6 bg-primary/10 text-primary hover:bg-primary/20"
          >
            <ClipboardCheck className="w-4 h-4 mr-2" /> Take Final Assessment
          </Button>
        )}

        {session.assessment_passed && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" /> Assessment Passed
            <Button variant="link" size="sm" className="h-auto p-0 text-emerald-600 underline font-bold" onClick={() => navigate(`/certificate/${session.id}`)}>
              View Certificate
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const config = {
    booked: { icon: Clock, label: "Booked", cls: "bg-blue-50 text-blue-600 border-blue-100" },
    completed: { icon: CheckCircle, label: "Completed", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    cancelled: { icon: XCircle, label: "Cancelled", cls: "bg-red-50 text-red-600 border-red-100" },
  };
  const { icon: Icon, label, cls } = config[status] || config.booked;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

function PaymentBadge({ type, amount }) {
  if (type === 'credit') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tighter">
        <Coins className="w-3 h-3" /> {amount} Credits
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
       ₹{amount} Paid
    </span>
  );
}