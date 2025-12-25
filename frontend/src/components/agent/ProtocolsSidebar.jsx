import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { BookOpen, ChevronRight, AlertTriangle, CheckCircle2, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROTOCOLS = [
    {
        id: 'aub', name: 'Abnormal Uterine Bleeding', subspecialty: 'OB/GYN', priority: 'ELEVATED',
        keywords: ['bleeding', 'heavy', 'irregular', 'spotting', 'postmenopausal'],
        redFlags: ['Postmenopausal bleeding', 'Hemodynamic instability', 'Severe anemia', 'Bleeding with pregnancy'],
        quickActions: ['Confirm LMP and pregnancy status', 'Assess hemodynamic stability', 'Quantify bleeding', 'Check anticoagulant use']
    },
    {
        id: 'pelvic-pain', name: 'Acute Pelvic Pain', subspecialty: 'OB/GYN', priority: 'URGENT',
        keywords: ['pain', 'pelvic', 'cramping', 'severe', 'sudden'],
        redFlags: ['Positive pregnancy + pain → Rule out ectopic', 'Fever > 101°F', 'Peritonitis signs', 'Hemodynamic instability'],
        quickActions: ['Obtain pregnancy test STAT', 'Assess pain severity', 'Check for fever', 'Note pain location']
    },
    {
        id: 'pregnancy', name: 'Early Pregnancy Concerns', subspecialty: 'MFM', priority: 'CRITICAL',
        keywords: ['pregnant', 'pregnancy', 'trimester', 'fetal', 'ectopic'],
        redFlags: ['Vaginal bleeding + cramping', 'Severe abdominal pain', 'Dizziness/syncope', 'Shoulder tip pain'],
        quickActions: ['Confirm gestational age', 'Quantify bleeding', 'Ask about prior ultrasound', 'Check for dizziness']
    },
    {
        id: 'gynonc', name: 'Gynecologic Cancer Screening', subspecialty: 'GYNONC', priority: 'ELEVATED',
        keywords: ['cancer', 'mass', 'tumor', 'abnormal pap', 'biopsy'],
        redFlags: ['Rapidly growing mass', 'Unexplained weight loss', 'Persistent bloating', 'Abnormal Pap with HPV+'],
        quickActions: ['Review recent imaging', 'Confirm test results', 'Family history', 'Note symptom duration']
    },
    {
        id: 'urogyn', name: 'Urinary Incontinence', subspecialty: 'UROGYN', priority: 'STANDARD',
        keywords: ['incontinence', 'leaking', 'urinary', 'prolapse', 'bladder'],
        redFlags: ['Hematuria', 'Recurrent UTIs', 'Neurologic symptoms', 'Fecal incontinence'],
        quickActions: ['Classify type', 'Frequency and severity', 'Quality of life impact', 'Prior treatments']
    },
    {
        id: 'rei', name: 'Infertility Evaluation', subspecialty: 'REI', priority: 'STANDARD',
        keywords: ['fertility', 'infertility', 'conceive', 'ivf', 'ovulation'],
        redFlags: ['Age > 35 trying > 6mo', 'Known tubal factor', 'Recurrent loss', 'Severe male factor'],
        quickActions: ['Duration trying', 'Prior testing', 'Cycle regularity', 'Partner evaluation']
    }
];

export default function ProtocolsSidebar({ isOpen, onClose, currentConditions = [], currentSymptoms = '' }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedProtocol, setExpandedProtocol] = useState(null);

    const getRelevantProtocols = () => {
        const symptomsLower = currentSymptoms.toLowerCase();
        const conditionNames = currentConditions.map(c => (c.name || c).toLowerCase());
        return PROTOCOLS.map(p => ({
            ...p,
            relevance: p.keywords.filter(kw => symptomsLower.includes(kw) || conditionNames.some(c => c.includes(kw))).length
        })).sort((a, b) => b.relevance - a.relevance);
    };

    const filteredProtocols = getRelevantProtocols().filter(p =>
        !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityColor = (priority) => ({
        'CRITICAL': 'bg-red-500 text-white', 'URGENT': 'bg-amber-500 text-white',
        'ELEVATED': 'bg-blue-500 text-white', 'STANDARD': 'bg-slate-400 text-white'
    }[priority] || 'bg-slate-400 text-white');

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />
                    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 border-l-4 border-indigo-500">
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-indigo-200 dark:border-purple-700 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-indigo-600 dark:text-purple-400" />
                                        <h2 className="text-xl font-black text-indigo-900 dark:text-purple-100">Clinical Protocols</h2>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                    <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white dark:bg-slate-800" />
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-3">
                                    {filteredProtocols.map((protocol) => (
                                        <Card key={protocol.id}
                                            className={`border-2 cursor-pointer hover:shadow-lg ${protocol.relevance > 0 ? 'border-indigo-400 bg-indigo-50 dark:bg-purple-950/30' : 'border-slate-200 dark:border-slate-700'}`}
                                            onClick={() => setExpandedProtocol(expandedProtocol === protocol.id ? null : protocol.id)}>
                                            <CardHeader className="p-3 pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex gap-2 mb-1">
                                                            <Badge className={`${getPriorityColor(protocol.priority)} text-xs`}>{protocol.priority}</Badge>
                                                            {protocol.relevance > 0 && <Badge className="bg-green-100 text-green-700 text-xs">Relevant</Badge>}
                                                        </div>
                                                        <CardTitle className="text-sm font-bold text-indigo-800 dark:text-purple-200">{protocol.name}</CardTitle>
                                                        <p className="text-xs text-indigo-600 dark:text-purple-400">{protocol.subspecialty}</p>
                                                    </div>
                                                    <ChevronRight className={`w-5 h-5 transition-transform ${expandedProtocol === protocol.id ? 'rotate-90' : ''}`} />
                                                </div>
                                            </CardHeader>
                                            <AnimatePresence>
                                                {expandedProtocol === protocol.id && (
                                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                                                        <CardContent className="p-3 pt-0 space-y-3">
                                                            <div>
                                                                <h4 className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Red Flags</h4>
                                                                <ul className="space-y-1">{protocol.redFlags.map((f, i) => <li key={i} className="text-xs text-red-800">• {f}</li>)}</ul>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Quick Actions</h4>
                                                                <ul className="space-y-1">{protocol.quickActions.map((a, i) => <li key={i} className="text-xs text-green-800">✓ {a}</li>)}</ul>
                                                            </div>
                                                        </CardContent>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
