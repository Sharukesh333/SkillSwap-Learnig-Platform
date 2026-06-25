import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CreditCard, Upload, Loader2, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TeachSettings() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canGoPaid, setCanGoPaid] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [price, setPrice] = useState(0);

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    const courses = await base44.entities.Course.filter({ id: courseId });
    if (courses.length > 0) {
      const c = courses[0];
      setCourse(c);
      setUpiId(c.teacher_upi_id || "");
      setPrice(c.price_per_session || 0);

      // Check eligibility: >=10 sessions AND >=4.0 rating
      const eligible = (c.sessions_completed || 0) >= 10 && (c.rating || 0) >= 4.0;
      setCanGoPaid(eligible);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const updates = {
      teacher_upi_id: upiId,
      price_per_session: Number(price),
    };
    if (canGoPaid && upiId && price > 0) {
      updates.session_type = "paid";
    }
    await base44.entities.Course.update(courseId, updates);
    setSaving(false);
    toast.success("Settings saved!");
    navigate("/teach");
  }

  async function handleQRUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Course.update(courseId, { teacher_qr_code: file_url });
    setCourse(prev => ({ ...prev, teacher_qr_code: file_url }));
    toast.success("QR code uploaded!");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Settings</h1>
        <p className="text-sm text-muted-foreground">{course?.title}</p>
      </div>

      {/* Paid Session Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-5 ${
          canGoPaid
            ? "bg-emerald-50/50 border-emerald-200"
            : "bg-card border-border/60"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          {canGoPaid ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
          <h2 className="font-semibold text-foreground">Paid Sessions</h2>
        </div>
        {canGoPaid ? (
          <p className="text-sm text-emerald-700">
            You're eligible for paid sessions! Set your price and payment details below.
          </p>
        ) : (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>To enable paid sessions, you need:</p>
            <p>• ≥10 completed sessions ({course?.sessions_completed || 0}/10)</p>
            <p>• ≥4.0 rating ({(course?.rating || 0).toFixed(1)}/4.0)</p>
          </div>
        )}
      </motion.div>

      {/* Payment Settings */}
      {canGoPaid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border/60 p-5 space-y-4"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Payment Setup
          </h2>

          <div>
            <Label>Price per Session (₹)</Label>
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 200"
              className="rounded-xl mt-1"
              min={0}
            />
          </div>

          <div>
            <Label>UPI ID</Label>
            <Input
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="e.g. teacher@paytm"
              className="rounded-xl mt-1"
            />
          </div>

          <div>
            <Label>QR Code</Label>
            <div className="mt-1">
              {course?.teacher_qr_code ? (
                <div className="space-y-2">
                  <img src={course.teacher_qr_code} alt="QR" className="w-32 h-32 rounded-xl border" />
                  <label className="cursor-pointer text-sm text-primary font-medium hover:underline">
                    Change QR Code
                    <input type="file" accept="image/*" onChange={handleQRUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex items-center gap-2 p-4 rounded-xl border border-dashed border-border cursor-pointer hover:bg-accent/50 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload QR Code image</span>
                  <input type="file" accept="image/*" onChange={handleQRUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 rounded-2xl text-base font-semibold"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Settings"}
      </Button>
    </div>
  );
}