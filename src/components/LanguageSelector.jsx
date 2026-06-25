import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const languages = [
  { code: "Tamil", emoji: "🇮🇳", color: "from-orange-400 to-red-500" },
  { code: "English", emoji: "🇬🇧", color: "from-blue-400 to-indigo-500" },
  { code: "Hindi", emoji: "🇮🇳", color: "from-green-400 to-emerald-500" },
  { code: "Telugu", emoji: "🇮🇳", color: "from-purple-400 to-violet-500" },
  { code: "Kannada", emoji: "🇮🇳", color: "from-pink-400 to-rose-500" },
  { code: "Malayalam", emoji: "🇮🇳", color: "from-teal-400 to-cyan-500" },
];

export default function LanguageSelector({ onSelect }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Globe className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Choose Your Language</h2>
        <p className="text-muted-foreground">Which language do you prefer for learning?</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {languages.map((lang, i) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(lang.code)}
            className="group relative bg-card border border-border/60 rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${lang.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <span className="text-xl">{lang.emoji}</span>
            </div>
            <p className="font-semibold text-foreground">{lang.code}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}