// src/pages/ModelValidation.jsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, BarChart3, Award, LineChart } from "lucide-react";

// JS props (no TS). You can pass different URLs via props where you render this.
export default function ModelValidation({
  trainingPlotUrl = "/repr_training.png",
  mcptPlotUrl = "/MCPT_val_1.png",
  accuracy = "94%",
  incorrectRate = "~25%",
  sampleCount = "1,000 (synthetic)",
} = {}) {
  // grid layout that's easy to reshape
  const layout = [
    { key: "stats", span: 6 },
    { key: "plot-training", span: 3 },
    { key: "plot-mcpt", span: 3 },
    { key: "method", span: 3 },
    { key: "results", span: 3 },
    { key: "notes", span: 6 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-950 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 bg-white/70 dark:bg-white/5 dark:border-violet-900">
            <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-violet-300" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-violet-200">
              Model Performance & Validation
            </span>
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 dark:from-indigo-300 dark:via-violet-300 dark:to-pink-300 bg-clip-text text-transparent">
            Subspecialty Recommendation — Validation Dashboard
          </h1>
          <p className="mt-2 text-base md:text-lg text-indigo-800/80 dark:text-violet-200">
            TF-IDF (1–2 gram) + One-vs-Rest Logistic Regression (probabilistic) for women’s health subspecialty routing.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {layout.map((cell, i) => (
            <div key={cell.key} style={{ gridColumn: `span ${cell.span} / span ${cell.span}` }}>
              {cell.key === "stats" && (
                <StatsRow accuracy={accuracy} incorrectRate={incorrectRate} sampleCount={sampleCount} index={i} />
              )}
              {cell.key === "plot-training" && (
                <ImageCard
                  title="Training Trajectories (Per-Class Recall & Precision)"
                  subtitle="6 classes • 25 epochs • prevalence-aware initialization"
                  img={trainingPlotUrl}
                  Icon={LineChart}
                  delay={0.1}
                />
              )}
              {cell.key === "plot-mcpt" && (
                <ImageCard
                  title="MCPT Null Distribution (Chance Performance)"
                  subtitle="Permutation test — well beyond chance"
                  img={mcptPlotUrl}
                  Icon={BarChart3}
                  delay={0.15}
                />
              )}
              {cell.key === "method" && <MethodCard incorrectRate={incorrectRate} />}
              {cell.key === "results" && (
                <ResultsCard accuracy={accuracy} incorrectRate={incorrectRate} sampleCount={sampleCount} />
              )}
              {cell.key === "notes" && <NotesCard />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Sections ---------------------------- */

function StatsRow({ accuracy, incorrectRate, sampleCount, index = 0 }) {
  const stats = [
    { label: "Overall Accuracy", value: accuracy, Icon: Award, color: "from-indigo-500 to-violet-500" },
    { label: "Incorrect Subspecialty Directions", value: incorrectRate, Icon: CheckCircle2, color: "from-pink-500 to-rose-500" },
    { label: "Validation / Synthesis Size", value: sampleCount, Icon: BarChart3, color: "from-emerald-500 to-teal-500" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s, k) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: index * 0.04 + k * 0.06 }}>
          <Card className="bg-white/90 dark:bg-slate-900/60 border-2 border-white/60 dark:border-violet-900 shadow-xl">
            <CardContent className="p-6">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                <s.Icon className="h-5 w-5 text-white" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-violet-100">{s.value}</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-violet-300/90">{s.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ImageCard({ title, subtitle, img, Icon, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay }}>
      <Card className="bg-white/90 dark:bg-slate-900/60 border-2 border-white/60 dark:border-violet-900 shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-violet-100">{title}</CardTitle>
          </div>
          {subtitle && <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-violet-300/90">{subtitle}</p>}
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-hidden rounded-b-xl bg-slate-50 dark:bg-slate-950 border-t dark:border-violet-900">
            <img src={img} alt={title} className="w-full h-full object-contain aspect-[16/9]" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MethodCard({ incorrectRate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}>
      <Card className="bg-white/90 dark:bg-slate-900/60 border-2 border-white/60 dark:border-violet-900 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-violet-100">Modeling Approach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm md:text-[15px] text-slate-700 dark:text-violet-200">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Features:</strong> TF-IDF with 1–2-gram word features to capture symptom phrases.</li>
            <li><strong>Classifier:</strong> One-vs-Rest logistic regression with probabilistic outputs.</li>
            <li><strong>Objective:</strong> Recommend the best women’s health subspecialty.</li>
            <li><strong>Error profile:</strong> about {incorrectRate} of “send-to-subspecialist” directions are incorrect; mitigated with thresholds & guardrails.</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ResultsCard({ accuracy, incorrectRate, sampleCount }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.16 }}>
      <Card className="bg-white/90 dark:bg-slate-900/60 border-2 border-white/60 dark:border-violet-900 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-violet-100">Results Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="text-sm md:text-[15px] text-slate-700 dark:text-violet-200 space-y-3">
          <p>
            Average accuracy of <strong>{accuracy}</strong> across six subspecialties. Validation via <strong>Monte Carlo Permutation Test</strong> shows performance far beyond chance on <strong>{sampleCount}</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Incorrect routing:</strong> {incorrectRate}</li>
            <li><strong>Per-class curves:</strong> stable convergence of recall/precision.</li>
            <li><strong>Confidence:</strong> calibrated probabilities enable safer recommendations.</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NotesCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
      <Card className="bg-white/90 dark:bg-slate-900/60 border-2 border-white/60 dark:border-violet-900 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-violet-100">Interpretation & Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="text-sm md:text-[15px] text-slate-700 dark:text-violet-200 space-y-3">
          <p>Curves begin near class balance and improve quickly; minority classes converge more slowly (expected with imbalance).</p>
          <p>MCPT histogram sits well outside chance, reinforcing real signal capture.</p>
          <p>Next: per-class threshold tuning, risk-aware rule-outs, and monthly re-validation.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
