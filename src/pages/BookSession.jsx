import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Coins, Smartphone, QrCode, CheckCircle, Loader2, Lock, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function BookSession() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const slotId = urlParams.get("slot");

  const [course, setCourse] = useState(null);
  const [slot, setSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upiStep, setUpiStep] = useState("select");
  const [upiPin, setUpiPin] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const courseData = await base44.entities.Course.get(courseId);
    if (courseData) setCourse(courseData);

    // Try real slot, fall back to demo slot data from URL
    if (slotId && !slotId.startsWith("demo-")) {
      const slotData = await base44.entities.Slot.get(slotId);
      if (slotData) setSlot(slotData);
    } else {
      // Demo slot — parse time from slotId
      const demoMap = { "demo-1": "10:00 AM", "demo-2": "2:00 PM", "demo-3": "6:00 PM", "demo-4": "10:00 AM", "demo-5": "4:00 PM" };
      setSlot({ id: slotId, date: new Date(Date.now() + 86400000).toLocaleDateString(), time: demoMap[slotId] || "10:00 AM" });
    }
    setLoading(false);
  }

  async function handleBook() {
    setBooking(true);
    const me = await base44.auth.me();

    const created = await base44.entities.Session.create({
      course_id: courseId,
      course_title: course.title,
      teacher_email: course.teacher_email,
      teacher_name: course.teacher_name,
      student_email: me.email,
      student_name: me.full_name || "Student",
      slot_date: slot.date,
      slot_time: slot.time,
      status: "booked",
      payment_method: course.session_type === "credit" ? "credit" : paymentMethod,
      credits_paid: course.session_type === "credit" ? course.credits_required : 0,
      amount_paid: course.session_type === "paid" ? course.price_per_session : 0,
    });
    setSessionId(created?.id);

    if (slotId && !slotId.startsWith("demo-")) {
      await base44.entities.Slot.update(slotId, { is_booked: true });
    }

    if (course.session_type === "credit") {
      await base44.entities.CreditTransaction.create({
        user_email: me.email,
        amount: course.credits_required,
        type: "spent",
        description: `Booked session: ${course.title}`,
      });
    }

    setBooked(true);
    setBooking(false);
    toast.success("Session booked successfully!");
  }

  async function handleUpiProceed() {
    if (!selectedUpiApp) { toast.error("Select a UPI app"); return; }
    setUpiStep("pin");
  }

  async function handlePinSubmit() {
    if (upiPin.length < 4) { toast.error("Enter valid UPI PIN"); return; }
    setUpiStep("success");
    setBooking(true);
    await new Promise(r => setTimeout(r, 1500));
    await handleBook();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (booked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
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
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Session Confirmed!</h1>
          <div className="space-y-1">
            <p className="text-xl font-bold text-muted-foreground/80">{course?.title}</p>
            <p className="text-lg font-semibold text-muted-foreground/60">
              {slot?.date} at {slot?.time}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm bg-card rounded-[32px] border border-border/60 p-8 shadow-xl shadow-primary/5 space-y-6"
        >
          <p className="text-center text-muted-foreground font-semibold">Ready to start learning?</p>
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/my-sessions")}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-[#00966d] hover:bg-[#007a58] text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              Go to My Sessions
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")} 
              className="w-full h-12 rounded-2xl text-base font-bold text-muted-foreground hover:text-foreground"
            >
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Complete Booking</h1>
        <p className="text-muted-foreground mt-1">Confirm your session details and pay</p>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border/60 p-5 space-y-3"
      >
        <h3 className="font-semibold text-foreground">{course?.title}</h3>
        <p className="text-sm text-muted-foreground">with {course?.teacher_name}</p>
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">📅 {slot?.date}</span>
          <span className="text-muted-foreground">🕐 {slot?.time}</span>
        </div>
        <div className="pt-2 border-t border-border/60">
          {course?.session_type === "credit" ? (
            <p className="font-bold text-primary text-lg">{course.credits_required} Credits</p>
          ) : (
            <p className="font-bold text-foreground text-lg">₹{course?.price_per_session}</p>
          )}
        </div>
      </motion.div>

      {/* Payment Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-bold text-foreground">Payment Method</h2>

        {course?.session_type === "credit" ? (
          <button
            onClick={() => setPaymentMethod("credit")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              paymentMethod === "credit"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border/60 hover:border-primary/30"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Pay with Credits</p>
              <p className="text-sm text-muted-foreground">{course.credits_required} credits will be deducted</p>
            </div>
          </button>
        ) : (
          <>
            <PaymentOption
              icon={Smartphone}
              title="UPI Payment"
              subtitle={course?.teacher_upi_id ? `Pay to: ${course.teacher_upi_id}` : "Pay via UPI"}
              selected={paymentMethod === "upi"}
              onClick={() => setPaymentMethod("upi")}
            />
            <PaymentOption
              icon={QrCode}
              title="QR Code"
              subtitle="Scan QR code to pay"
              selected={paymentMethod === "qr"}
              onClick={() => setPaymentMethod("qr")}
            />

            {paymentMethod === "qr" && (
              <div className="bg-card rounded-2xl border border-border/60 p-4 text-center">
                <img
                  src={course?.teacher_qr_code || `https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=gvishali1708-1@okicici%26am=${course?.price_per_session}&size=220x220`}
                  alt="QR Code"
                  className="mx-auto w-48 h-48 rounded-xl"
                />
                <p className="text-sm text-muted-foreground mt-2">Scan to pay ₹{course?.price_per_session}</p>
                <p className="text-xs text-muted-foreground">UPI: gvishali1708-1@okicici</p>
              </div>
            )}

            {paymentMethod === "upi" && upiStep === "select" && (
              <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Pay ₹{course?.price_per_session} via UPI</p>
                  <p className="text-xs text-muted-foreground">UPI ID: gvishali1708-1@okicici</p>
                </div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Choose UPI App</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "GPay", emoji: "🟢" },
                    { name: "PhonePe", emoji: "🟣" },
                    { name: "Paytm", emoji: "🔵" },
                  ].map(app => (
                    <button
                      key={app.name}
                      onClick={() => setSelectedUpiApp(app.name)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedUpiApp === app.name ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border/60 bg-muted/40 hover:border-primary/40"
                      }`}
                    >
                      <div className="text-2xl mb-1">{app.emoji}</div>
                      <p className="text-xs font-semibold text-foreground">{app.name}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={handleUpiProceed} className="w-full rounded-xl">
                  <ArrowRight className="w-4 h-4 mr-2" /> Proceed to Pay
                </Button>
              </div>
            )}

            {paymentMethod === "upi" && upiStep === "pin" && (
              <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-violet-50 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedUpiApp}</p>
                  <p className="text-sm text-muted-foreground">Enter your UPI PIN to pay ₹{course?.price_per_session}</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg font-bold ${
                      upiPin.length > i ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted"
                    }`}>
                      {upiPin.length > i ? "●" : ""}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                  {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (k === "⌫") setUpiPin(p => p.slice(0,-1));
                        else if (k !== "" && upiPin.length < 6) setUpiPin(p => p + k);
                      }}
                      disabled={k === ""}
                      className="h-12 rounded-xl bg-muted hover:bg-accent font-semibold text-foreground transition-colors disabled:invisible"
                    >{k}</button>
                  ))}
                </div>
                <Button onClick={handlePinSubmit} className="w-full rounded-xl" disabled={upiPin.length < 4}>
                  <Shield className="w-4 h-4 mr-2" /> Confirm Payment
                </Button>
              </div>
            )}

            {paymentMethod === "upi" && upiStep === "success" && (
              <div className="bg-card rounded-2xl border border-border/60 p-6 text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
                </div>
                <p className="font-semibold text-foreground">Processing payment...</p>
                <p className="text-sm text-muted-foreground">Please wait</p>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Confirm */}
      <Button
        onClick={handleBook}
        disabled={!paymentMethod || booking || (paymentMethod === "upi" && upiStep !== "select")}
        className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg disabled:opacity-40"
      >
        {booking ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
        ) : (
          "Confirm & Book"
        )}
      </Button>
    </div>
  );
}

function PaymentOption({ icon: Icon, title, subtitle, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border/60 hover:border-primary/30"
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
}