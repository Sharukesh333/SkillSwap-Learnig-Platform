import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Star, Clock, Coins, CreditCard, User, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const DEMO_SLOTS = [
    { id: "demo-1", date: new Date(Date.now() + 86400000).toLocaleDateString(), time: "10:00 AM" },
    { id: "demo-2", date: new Date(Date.now() + 86400000).toLocaleDateString(), time: "2:00 PM" },
    { id: "demo-3", date: new Date(Date.now() + 172800000).toLocaleDateString(), time: "6:00 PM" },
    { id: "demo-4", date: new Date(Date.now() + 259200000).toLocaleDateString(), time: "10:00 AM" },
    { id: "demo-5", date: new Date(Date.now() + 259200000).toLocaleDateString(), time: "4:00 PM" },
  ];

  async function loadCourse() {
    const data = await base44.entities.Course.get(id);
    if (data) setCourse(data);

    // Use real slots if any, otherwise show demo slots
    const realSlots = await base44.entities.Slot.filter({ course_id: id, is_booked: false });
    setSlots(realSlots.length > 0 ? realSlots : DEMO_SLOTS);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-muted-foreground">Course not found</div>;
  }

  const rating = course.rating || 0;
  const fullStars = Math.floor(rating);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[32px] border border-border/60 p-8 space-y-5"
      >
        <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold ${
          course.session_type === "paid"
            ? "bg-amber-50 text-amber-700 border border-amber-100"
            : "bg-blue-50 text-blue-600 border border-blue-100"
        }`}>
          {course.session_type === "paid" ? (
            <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Paid Session</span>
          ) : (
            <span className="flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> Credit-based</span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{course.title}</h1>

        <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground/80">
          <span className="flex items-center gap-1.5 text-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= fullStars ? "fill-current" : "text-border fill-none"}`} />
            ))}
            <span className="ml-1 text-muted-foreground font-bold">{rating.toFixed(1)}</span>
          </span>
          <span className="text-border">•</span>
          <span>{course.language}</span>
        </div>

        {course.description && (
          <p className="text-muted-foreground leading-relaxed text-base font-medium">{course.description}</p>
        )}

        <div className="pt-2">
          {course.session_type === "credit" ? (
            <p className="text-xl font-bold text-primary">{course.credits_required} credits per session</p>
          ) : (
            <p className="text-xl font-bold text-foreground">₹{course.price_per_session} per session</p>
          )}
        </div>
      </motion.div>

      {/* Teacher Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-[32px] border border-border/60 p-8"
      >
        <h2 className="text-lg font-bold text-foreground mb-6">Instructor</h2>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{course.teacher_name}</p>
            <p className="text-sm font-medium text-muted-foreground">{course.sessions_completed || 0} sessions completed</p>
          </div>
        </div>
      </motion.div>

      {/* Available Slots */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-[32px] border border-border/60 p-8"
      >
        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          Available Time Slots
        </h2>

        {slots.length === 0 ? (
          <p className="text-muted-foreground text-sm font-medium py-4">No slots available right now. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {slots.map(slot => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot)}
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  selectedSlot?.id === slot.id
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                    : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                }`}
              >
                <p className="text-base font-bold text-foreground">{slot.date}</p>
                <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-primary" /> {slot.time}
                </p>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Book Button */}
      {slots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={() => {
              if (!selectedSlot) return;
              navigate(`/book/${course.id}?slot=${selectedSlot.id}`);
            }}
            disabled={!selectedSlot}
            className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg disabled:opacity-40"
          >
            Book Session <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {!selectedSlot && (
            <p className="text-center text-xs text-muted-foreground mt-2">Select a time slot to continue</p>
          )}
        </motion.div>
      )}
    </div>
  );
}