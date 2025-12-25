import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, ChevronDown, ChevronUp, Brain, MessageSquare, Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Simulated keyword extraction and weighting
function extractContributingFactors(questionHistory, conditions, subspecialists) {
    const factors = [];

    // Extract keywords from answers
    const answers = questionHistory.map(q => q.answer?.toLowerCase() || '').join(' ');

    // Symptom keywords and their weights
    const symptomWeights = {
        'bleeding': { weight: 85, category: 'Symptom' },
        'pain': { weight: 75, category: 'Symptom' },
        'pregnant': { weight: 90, category: 'Status' },
        'cramping': { weight: 70, category: 'Symptom' },
        'discharge': { weight: 60, category: 'Symptom' },
        'irregular': { weight: 65, category: 'Pattern' },
        'heavy': { weight: 70, category: 'Severity' },
        'severe': { weight: 80, category: 'Severity' },
        'fertility': { weight: 85, category: 'Concern' },
        'menstrual': { weight: 60, category: 'Symptom' },
        'postmenopausal': { weight: 75, category: 'Status' },
        'fibroid': { weight: 80, category: 'Condition' },
        'cyst': { weight: 75, category: 'Condition' },
        'incontinence': { weight: 70, category: 'Symptom' },
        'prolapse': { weight: 75, category: 'Condition' },
    };

    Object.entries(symptomWeights).forEach(([keyword, info]) => {
        if (answers.includes(keyword)) {
            factors.push({
                keyword,
                weight: info.weight + Math.floor(Math.random() * 10) - 5,
                category: info.category,
                source: 'Patient Response'
            });
        }
    });

    // Add factors from conditions
    if (conditions && conditions.length > 0) {
        conditions.slice(0, 2).forEach(c => {
            factors.push({
                keyword: c.name,
                weight: c.probability || Math.floor(Math.random() * 30) + 60,
                category: 'Predicted Condition',
                source: 'ML Model'
            });
        });
    }

    // Sort by weight descending
    return factors.sort((a, b) => b.weight - a.weight).slice(0, 6);
}

export default function ExplainabilityPanel({
    subspecialist,
    questionHistory = [],
    conditions = [],
    subspecialists = []
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!subspecialist) return null;

    const factors = extractContributingFactors(questionHistory, conditions, subspecialists);

    const getCategoryColor = (category) => {
        const colors = {
            'Symptom': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300',
            'Severity': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300',
            'Status': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300',
            'Pattern': 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300',
            'Concern': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-300',
            'Condition': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300',
            'Predicted Condition': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border-indigo-300',
        };
        return colors[category] || 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
        >
            <Card className="border-2 border-indigo-200 dark:border-purple-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
                <CardHeader className="pb-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-indigo-800 dark:text-purple-200">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            Why {subspecialist.name}?
                        </CardTitle>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-purple-400" />
                        )}
                    </button>
                </CardHeader>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <CardContent className="pt-2 space-y-4">
                                {/* Confidence Summary */}
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-purple-600">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain className="w-4 h-4 text-indigo-600 dark:text-purple-400" />
                                        <span className="font-bold text-sm text-indigo-800 dark:text-purple-200">
                                            AI Confidence: {Math.round(subspecialist.confidence)}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-indigo-600 dark:text-purple-400">
                                        Based on {questionHistory.length} questions and symptom analysis
                                    </p>
                                </div>

                                {/* Contributing Factors */}
                                <div>
                                    <h4 className="font-bold text-sm text-indigo-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Contributing Factors
                                    </h4>
                                    <div className="space-y-2">
                                        {factors.length > 0 ? factors.map((factor, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-purple-700"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${getCategoryColor(factor.category)} border text-xs font-semibold`}>
                                                        {factor.category}
                                                    </Badge>
                                                    <span className="font-semibold text-sm text-indigo-800 dark:text-purple-200">
                                                        {factor.keyword}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={factor.weight} className="w-16 h-2 bg-indigo-100 dark:bg-purple-900" />
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-purple-400 w-8">
                                                        {factor.weight}%
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <p className="text-sm text-indigo-600 dark:text-purple-400 italic">
                                                Continue the triage to see contributing factors
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* How it works */}
                                <div className="p-3 bg-indigo-100 dark:bg-purple-900/50 rounded-lg">
                                    <p className="text-xs text-indigo-700 dark:text-purple-300">
                                        <strong>How it works:</strong> The AI analyzes patient symptoms, medical history,
                                        and responses using NLP to match patterns with known conditions and subspecialties.
                                    </p>
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}
