import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Clock, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import CertificateView from "../components/CertificateView";
import { toast } from "sonner";

export default function Assessment() {
  const { type, courseId } = useParams();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");
  const courseTitle = urlParams.get("title") || "Course";

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    generateQuestions();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!generating && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [generating, submitted]);

  async function generateQuestions() {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 15 multiple choice questions for an assessment on "${courseTitle}". 
Each question should have 4 options (a, b, c, d) and one correct answer.
Make questions test practical knowledge, ranging from beginner to intermediate level.`,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: {
                  type: "object",
                  properties: {
                    a: { type: "string" },
                    b: { type: "string" },
                    c: { type: "string" },
                    d: { type: "string" },
                  },
                },
                correct: { type: "string" },
              },
            },
          },
        },
      },
    });
    setQuestions(res.questions?.slice(0, 15) || []);
    setGenerating(false);
  }

  async function handleSubmit() {
    clearInterval(timerRef.current);
    setSubmitting(true);

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    const hasPassed = scorePercent >= 75;

    setScore(scorePercent);
    setPassed(hasPassed);
    setSubmitted(true);

    const me = await base44.auth.me();
    setUserName(me.full_name || me.email || "Learner");

    await base44.entities.Assessment.create({
      user_email: me.email,
      course_id: courseId,
      course_title: courseTitle,
      type: type,
      score: scorePercent,
      total_questions: 15,
      passed: hasPassed,
    });

    // Update session if learner assessment
    if (type === "learner" && sessionId && hasPassed) {
      await base44.entities.Session.update(sessionId, { assessment_passed: true });
    }

    // If teacher passed, approve course and redirect to slot creation
    if (type === "teacher" && hasPassed) {
      const course = await base44.entities.Course.get(courseId);
      if (course) {
        await base44.entities.Course.update(courseId, { is_approved: true });
      }
      setSubmitting(false);
      toast.success("Assessment passed! Now create your teaching slots.");
      navigate(`/teach/slots/${courseId}`);
      return;
    }

    setSubmitting(false);
  }

  function handleRetry() {
    setQuestions([]);
    setAnswers({});
    setTimeLeft(20 * 60);
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    setGenerating(true);
    generateQuestions();
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Generating assessment questions...</p>
      </div>
    );
  }

  if (submitted) {
    if (passed) {
      return (
        <div className="max-w-lg mx-auto py-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">🎉 You Passed!</h1>
            <p className="text-muted-foreground mt-1">Score: {score}% — Certificate earned</p>
          </div>
          <CertificateView
            name={userName || "Learner"}
            courseTitle={courseTitle}
            score={score}
            date={new Date().toLocaleDateString()}
            onSaveToProfile={() => {}}
            onGoHome={() => navigate("/")}
          />
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16 space-y-6"
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Not Quite There</h1>
          <p className="text-muted-foreground mt-2">
            You scored <strong className="text-red-600">{score}%</strong> — Need 75% to pass
          </p>
        </div>
        <Button onClick={handleRetry} className="rounded-xl">
          <RotateCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer */}
      <div className="sticky top-20 z-40 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/60 p-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground">{courseTitle} Assessment</h2>
          <p className="text-sm text-muted-foreground">{Object.keys(answers).length}/15 answered</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
          timeLeft < 300 ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary"
        }`}>
          <Clock className="w-5 h-5" />
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-2xl border border-border/60 p-5"
          >
            <p className="font-medium text-foreground mb-3">
              <span className="text-primary font-bold mr-2">Q{i + 1}.</span>
              {q.question}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(q.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setAnswers(prev => ({ ...prev, [i]: key }))}
                  className={`text-left p-3 rounded-xl border text-sm transition-all ${
                    answers[i] === key
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium"
                      : "border-border/60 hover:border-primary/30 hover:bg-accent/50"
                  }`}
                >
                  <span className="font-semibold text-primary mr-2">{key.toUpperCase()}.</span>
                  {value}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full h-14 rounded-2xl text-base font-semibold"
      >
        {submitting ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
        ) : (
          `Submit Assessment (${Object.keys(answers).length}/15 answered)`
        )}
      </Button>
    </div>
  );
}