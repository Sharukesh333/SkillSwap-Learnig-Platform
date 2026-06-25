import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Clock, Loader2, Lock, Coins, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TeachSlots() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [sessionType, setSessionType] = useState("credit");

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    const [courses, allSlots] = await Promise.all([
      base44.entities.Course.filter({ id: courseId }),
      base44.entities.Slot.filter({ course_id: courseId }),
    ]);
    if (courses.length > 0) {
      setCourse(courses[0]);
      setSessionType(courses[0].session_type || "credit");
    }
    setSlots(allSlots);
    setLoading(false);
  }

  async function addSlot() {
    if (!newDate || !newTime) {
      toast.error("Please select date and time");
      return;
    }
    setAdding(true);
    const me = await base44.auth.me();
    await base44.entities.Slot.create({
      course_id: courseId,
      teacher_email: me.email,
      date: newDate,
      time: newTime,
      is_booked: false,
    });
    setNewDate("");
    setNewTime("");
    setAdding(false);
    toast.success("Slot added!");
    loadData();
  }

  async function deleteSlot(slotId) {
    await base44.entities.Slot.delete(slotId);
    toast.success("Slot removed");
    loadData();
  }

  async function updateCredits(credits) {
    await base44.entities.Course.update(courseId, { credits_required: Number(credits) });
    setCourse(prev => ({ ...prev, credits_required: Number(credits) }));
    toast.success("Credits updated");
  }

  async function switchSessionType(type) {
    if (type === "paid" && !canOfferPaid) return;
    setSessionType(type);
    await base44.entities.Course.update(courseId, { session_type: type });
    setCourse(prev => ({ ...prev, session_type: type }));
    toast.success(`Switched to ${type === "paid" ? "Paid" : "Credit"} sessions`);
  }

  const canOfferPaid = (course?.sessions_completed || 0) >= 5 && (course?.rating || 0) >= 4;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Slots</h1>
        <p className="text-sm text-muted-foreground">{course?.title}</p>
      </div>

      {/* Session Type Toggle */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-3">
        <h2 className="font-semibold text-foreground">Session Type</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => switchSessionType("credit")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              sessionType === "credit" ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/30"
            }`}
          >
            <Coins className="w-5 h-5 text-primary mb-2" />
            <p className="font-semibold text-foreground text-sm">Credit Session</p>
            <p className="text-xs text-muted-foreground">Students pay with credits</p>
          </button>
          <button
            onClick={() => switchSessionType("paid")}
            disabled={!canOfferPaid}
            className={`p-4 rounded-xl border-2 text-left transition-all relative ${
              sessionType === "paid" ? "border-amber-400 bg-amber-50" :
              canOfferPaid ? "border-border/60 hover:border-amber-300" :
              "border-border/40 opacity-60 cursor-not-allowed"
            }`}
          >
            {!canOfferPaid && (
              <div className="absolute top-2 right-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <CreditCard className="w-5 h-5 text-amber-600 mb-2" />
            <p className="font-semibold text-foreground text-sm">Paid Session</p>
            <p className="text-xs text-muted-foreground">
              {canOfferPaid ? "Students pay in ₹" : "Need 5 sessions & rating ≥4"}
            </p>
          </button>
        </div>
        {!canOfferPaid && (
          <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
            🔒 Complete 5 sessions with a rating of 4+ to unlock paid sessions.
            Currently: {course?.sessions_completed || 0} sessions, {course?.rating || 0}★ rating
          </p>
        )}
      </div>

      {/* Credits Setting */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-3">
        <h2 className="font-semibold text-foreground">Credits per Session</h2>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={course?.credits_required || 10}
            onChange={e => updateCredits(e.target.value)}
            className="w-32 rounded-xl"
            min={1}
          />
          <span className="text-sm text-muted-foreground">credits (students pay this, you earn 2x)</span>
        </div>
      </div>

      {/* Add Slot */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4">
        <h2 className="font-semibold text-foreground">Add New Slot</h2>
        <div className="flex gap-3 flex-wrap">
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <Label>Time</Label>
            <Input
              type="time"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="rounded-xl mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addSlot} disabled={adding} className="rounded-xl">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              Add Slot
            </Button>
          </div>
        </div>
      </div>

      {/* Existing Slots */}
      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Available Slots ({slots.length})</h2>
        {slots.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">No slots yet. Add your first one!</p>
        ) : (
          slots.map((slot, i) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border/60 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{slot.date}</p>
                  <p className="text-sm text-muted-foreground">{slot.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {slot.is_booked ? (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Booked
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSlot(slot.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}