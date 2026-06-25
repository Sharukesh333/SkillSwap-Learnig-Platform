import { Star, Coins, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CourseCard({ course, index = 0 }) {
  const rating = course.rating || 0;
  const fullStars = Math.floor(rating);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/course/${course.id}`}>
        <div className="group aspect-square bg-card rounded-2xl border border-border/60 p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] transition-all duration-300 group-hover:w-32 group-hover:h-32 group-hover:bg-primary/10" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                course.session_type === "paid"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-primary/10 text-primary"
              }`}>
                {course.session_type === "paid" ? (
                  <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Paid</span>
                ) : (
                  <span className="flex items-center gap-1"><Coins className="w-3 h-3" /> Credits</span>
                )}
              </div>
            </div>
            <h3 className="font-bold text-foreground text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
              {course.language}
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${s <= fullStars ? "fill-amber-400 text-amber-400" : "text-border"}`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {course.teacher_name}
            </p>
            {course.session_type === "credit" ? (
              <p className="text-xs text-muted-foreground">{course.credits_required} credits/session</p>
            ) : (
              <p className="text-xs text-muted-foreground">₹{course.price_per_session}/session</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}