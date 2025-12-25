import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Phone, X, ShieldAlert, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// High-risk keywords that trigger urgency alerts
const CRITICAL_KEYWORDS = [
    'ectopic', 'ruptured', 'hemorrhage', 'severe bleeding', 'heavy bleeding',
    'can\'t stop bleeding', 'passing clots', 'soaking pads', 'sepsis', 'fever',
    'unconscious', 'fainted', 'can\'t breathe', 'chest pain', 'seizure',
    'preeclampsia', 'eclampsia', 'placental abruption', 'cord prolapse',
    'shoulder dystocia', 'uterine rupture', 'postpartum hemorrhage'
];

const URGENT_KEYWORDS = [
    'severe pain', 'intense pain', 'worst pain', 'sudden pain',
    'spotting', 'cramping', 'contractions', 'water broke', 'decreased movement',
    'no fetal movement', 'high blood pressure', 'headache', 'vision changes',
    'swelling', 'trauma', 'fall', 'accident', 'assault'
];

export function detectUrgency(text, conditions = []) {
    const lowerText = (text || '').toLowerCase();
    const conditionText = conditions.map(c => (c.name || c).toLowerCase()).join(' ');
    const combined = lowerText + ' ' + conditionText;

    const criticalMatch = CRITICAL_KEYWORDS.find(kw => combined.includes(kw));
    if (criticalMatch) {
        return { level: 'CRITICAL', keyword: criticalMatch };
    }

    const urgentMatch = URGENT_KEYWORDS.find(kw => combined.includes(kw));
    if (urgentMatch) {
        return { level: 'URGENT', keyword: urgentMatch };
    }

    return null;
}

export default function UrgencyAlert({ urgency, onDismiss, onEscalate }) {
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [escalated, setEscalated] = useState(false);

    if (!urgency) return null;

    const isCritical = urgency.level === 'CRITICAL';

    const handleEscalate = () => {
        setEscalated(true);
        setShowEscalateModal(false);
        if (onEscalate) onEscalate(urgency);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6"
            >
                <Card className={`border-3 shadow-xl ${isCritical
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/50'
                        : 'border-amber-500 bg-amber-50 dark:bg-amber-950/50'
                    }`}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-xl ${isCritical
                                        ? 'bg-red-500 animate-pulse'
                                        : 'bg-amber-500'
                                    }`}>
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge className={`${isCritical
                                                ? 'bg-red-600 text-white border-0'
                                                : 'bg-amber-500 text-white border-0'
                                            } font-black text-sm px-3`}>
                                            {urgency.level} ALERT
                                        </Badge>
                                        {escalated && (
                                            <Badge className="bg-green-600 text-white border-0 font-bold">
                                                <Bell className="w-3 h-3 mr-1" />
                                                Escalated
                                            </Badge>
                                        )}
                                    </div>
                                    <p className={`font-bold ${isCritical ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'
                                        }`}>
                                        {isCritical
                                            ? 'High-risk symptom detected - Immediate attention required'
                                            : 'Urgent symptom detected - Consider priority scheduling'}
                                    </p>
                                    <p className={`text-sm font-semibold mt-1 ${isCritical ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
                                        }`}>
                                        Triggered by: <span className="underline">"{urgency.keyword}"</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!escalated && (
                                    <Button
                                        onClick={() => setShowEscalateModal(true)}
                                        className={`${isCritical
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : 'bg-amber-600 hover:bg-amber-700'
                                            } text-white font-bold`}
                                    >
                                        <ShieldAlert className="w-4 h-4 mr-2" />
                                        Escalate
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onDismiss}
                                    className={isCritical ? 'text-red-600 hover:bg-red-100' : 'text-amber-600 hover:bg-amber-100'}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Escalation Modal */}
            <AnimatePresence>
                {showEscalateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                        onClick={() => setShowEscalateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md"
                        >
                            <Card className={`border-4 shadow-2xl ${isCritical
                                    ? 'border-red-500 bg-white dark:bg-slate-900'
                                    : 'border-amber-500 bg-white dark:bg-slate-900'
                                }`}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="text-center">
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isCritical ? 'bg-red-100 dark:bg-red-900' : 'bg-amber-100 dark:bg-amber-900'
                                            }`}>
                                            <ShieldAlert className={`w-8 h-8 ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                                                }`} />
                                        </div>
                                        <h3 className="text-xl font-black text-indigo-900 dark:text-purple-100 mb-2">
                                            Escalate to Supervisor?
                                        </h3>
                                        <p className="text-indigo-700 dark:text-purple-300">
                                            This will notify the on-call supervisor about this {urgency.level.toLowerCase()} case.
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-xl ${isCritical ? 'bg-red-50 dark:bg-red-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
                                        }`}>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <strong>Alert Type:</strong> {urgency.level}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <strong>Keyword:</strong> {urgency.keyword}
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowEscalateModal(false)}
                                            className="flex-1 font-bold"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleEscalate}
                                            className={`flex-1 font-bold text-white ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                                                }`}
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Notify Supervisor
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
