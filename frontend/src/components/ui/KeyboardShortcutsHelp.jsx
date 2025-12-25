import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

export default function KeyboardShortcutsHelp({ isOpen, onClose }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                    onClick={onClose}>
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
                        <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Keyboard className="w-6 h-6 text-indigo-600 dark:text-purple-400" />
                                        <h3 className="text-xl font-black text-indigo-900 dark:text-purple-100">Keyboard Shortcuts</h3>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                                </div>
                                <div className="space-y-2">
                                    {SHORTCUTS.map((shortcut, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-purple-900/30 rounded-lg">
                                            <span className="text-sm font-semibold text-indigo-800 dark:text-purple-200">{shortcut.description}</span>
                                            <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-purple-600 rounded text-xs font-mono font-bold text-indigo-700 dark:text-purple-300">
                                                {shortcut.key}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
