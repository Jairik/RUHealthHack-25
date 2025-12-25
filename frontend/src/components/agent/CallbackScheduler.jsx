import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Phone, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CallbackScheduler({ isOpen, onClose, patient, onSchedule }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [phone, setPhone] = useState('');
    const [scheduled, setScheduled] = useState(false);

    const handleSchedule = () => {
        if (!date || !time) {
            alert('Please select date and time');
            return;
        }
        setScheduled(true);
        if (onSchedule) {
            onSchedule({ date, time, reason, phone, patient });
        }
        setTimeout(() => {
            onClose();
            setScheduled(false);
            setDate(''); setTime(''); setReason(''); setPhone('');
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                    onClick={onClose}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
                        <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-xl font-black text-indigo-900 dark:text-purple-100">
                                        <Calendar className="w-6 h-6" />Schedule Callback
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {scheduled ? (
                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-8">
                                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <p className="text-xl font-bold text-green-700 dark:text-green-400">Callback Scheduled!</p>
                                        <p className="text-indigo-600 dark:text-purple-400">{date} at {time}</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        {patient && (
                                            <div className="p-3 bg-indigo-50 dark:bg-purple-900/30 rounded-lg">
                                                <p className="font-bold text-indigo-800 dark:text-purple-200">
                                                    {patient.firstName} {patient.lastName}
                                                </p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-bold text-indigo-800 dark:text-purple-200 mb-1 block">Date</label>
                                                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                                    className="bg-white dark:bg-slate-800" min={new Date().toISOString().split('T')[0]} />
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-indigo-800 dark:text-purple-200 mb-1 block">Time</label>
                                                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                                                    className="bg-white dark:bg-slate-800" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-indigo-800 dark:text-purple-200 mb-1 flex items-center gap-1">
                                                <Phone className="w-4 h-4" />Phone Number
                                            </label>
                                            <Input type="tel" placeholder="(555) 123-4567" value={phone}
                                                onChange={(e) => setPhone(e.target.value)} className="bg-white dark:bg-slate-800" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-indigo-800 dark:text-purple-200 mb-1 block">Reason</label>
                                            <Textarea placeholder="Follow-up on triage results..." value={reason}
                                                onChange={(e) => setReason(e.target.value)} className="bg-white dark:bg-slate-800" rows={3} />
                                        </div>
                                        <Button onClick={handleSchedule}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-6">
                                            <Clock className="w-4 h-4 mr-2" />Schedule Callback
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
