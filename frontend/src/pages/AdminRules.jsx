import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Key,
    Lock,
    Unlock,
    Save,
    Search,
    Filter,
    AlertCircle,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CSV_FILE_PATH = '/symptoms.csv';

// --- Helper Functions (Theme Consistent) ---

const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
        case 'CRITICAL':
            return "destructive"; // Red
        case 'URGENT':
            return "warning"; // We might need to manually style this if 'warning' variant doesn't exist, usually yellow/orange
        case 'ELEVATED':
            return "secondary"; // Blue/Greyish
        case 'STANDARD':
            return "outline";
        default:
            return "secondary";
    }
};

const getPriorityColorClasses = (priority) => {
    switch (priority) {
        case 'CRITICAL':
            return "bg-red-500 hover:bg-red-600 text-white border-red-600";
        case 'URGENT':
            return "bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500";
        case 'ELEVATED':
            return "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800";
        case 'STANDARD':
            return "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
        default:
            return "bg-slate-100 text-slate-800";
    }
}

const getSubspecialtyColorClasses = (subspecialty) => {
    switch (subspecialty) {
        case 'OB/GYN': return "bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900";
        case 'GYNONC': return "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900";
        case 'UROGYN': return "bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-900";
        case 'MIS': return "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900";
        case 'MFM': return "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900";
        case 'REI': return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900";
        default: return "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800";
    }
};

// --- Component to Configure a Single Rule (RuleCard) ---
const RuleCard = ({ rule, index, onRuleChange, isReadOnly }) => {
    const PRIORITY_OPTIONS = ['CRITICAL', 'URGENT', 'ELEVATED', 'STANDARD'];
    const SUBSPECIALTY_OPTIONS = ['OB/GYN', 'GYNONC', 'UROGYN', 'MIS', 'MFM', 'REI'];

    const currentSubspecialty = rule.subspecialty || rule.division;

    const handleSubspecialtyChange = (value) => {
        onRuleChange(index, 'subspecialty', value);
    };

    const colorClass = getSubspecialtyColorClasses(currentSubspecialty);

    return (
        <Card className={`border-2 shadow-sm hover:shadow-md transition-shadow ${colorClass}`}>
            <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 space-y-0">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold leading-tight break-words text-slate-800 dark:text-slate-100">
                        {rule.condition}
                    </CardTitle>
                    <Badge className={`${getPriorityColorClasses(rule.scheduling_priority)} border px-2 py-0.5 whitespace-nowrap`}>
                        {rule.scheduling_priority}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Subspecialty Routing
                    </label>
                    <Select
                        value={currentSubspecialty}
                        onValueChange={handleSubspecialtyChange}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Select Subspecialty" />
                        </SelectTrigger>
                        <SelectContent>
                            {SUBSPECIALTY_OPTIONS.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Scheduling Priority
                    </label>
                    <Select
                        value={rule.scheduling_priority}
                        onValueChange={(val) => onRuleChange(index, 'scheduling_priority', val)}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITY_OPTIONS.map(p => (
                                <SelectItem key={p} value={p}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${p === 'CRITICAL' ? 'bg-red-500' : p === 'URGENT' ? 'bg-amber-500' : p === 'ELEVATED' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                        {p}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Scheduling Timeframe
                    </label>
                    <Input
                        type="text"
                        value={rule.scheduling_timeframe}
                        onChange={(e) => onRuleChange(index, 'scheduling_timeframe', e.target.value)}
                        readOnly={isReadOnly}
                        className="bg-white dark:bg-slate-950"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Keywords (Editable)
                    </label>
                    <Textarea
                        value={rule.keywords}
                        onChange={(e) => onRuleChange(index, 'keywords', e.target.value)}
                        readOnly={isReadOnly}
                        className="bg-white dark:bg-slate-950 min-h-[80px]"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

// --- Filter/Search Bar Component ---
const FilterBar = ({ subspecialtyFilter, searchText, onSubspecialtyChange, onSearchTextChange }) => {
    const SUBSPECIALTY_OPTIONS = ['All', 'OB/GYN', 'GYNONC', 'UROGYN', 'MIS', 'MFM', 'REI'];

    return (
        <Card className="border-3 border-red-200 dark:border-red-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Subspecialty Filter Dropdown */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filter by Subspecialty
                        </label>
                        <Select
                            value={subspecialtyFilter}
                            onValueChange={onSubspecialtyChange}
                        >
                            <SelectTrigger className="bg-white dark:bg-slate-950 h-11 border-red-200 dark:border-red-700">
                                <SelectValue placeholder="All Subspecialties" />
                            </SelectTrigger>
                            <SelectContent>
                                {SUBSPECIALTY_OPTIONS.map(s => (
                                    <SelectItem key={s} value={s}>{s === 'All' ? 'View All Subspecialties' : s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Free Text Search */}
                    <div className="flex-[2] min-w-[300px]">
                        <label className="text-sm font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Search Condition or Keywords
                        </label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="e.g., Pap Smear, Fibroid, Infertility"
                                value={searchText}
                                onChange={(e) => onSearchTextChange(e.target.value)}
                                className="pl-4 h-11 bg-white dark:bg-slate-950 border-red-200 dark:border-red-700"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Main Rule Configurator Component ---
const RuleConfigurator = ({ rules, onSave, isReadOnly }) => {
    const [localRules, setLocalRules] = useState(rules);
    const [statusMessage, setStatusMessage] = useState('');

    // State for Filtering
    const [subspecialtyFilter, setSubspecialtyFilter] = useState('All');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        setLocalRules(rules);
    }, [rules]);

    const filteredRules = useMemo(() => {
        let currentRules = localRules;
        const searchLower = searchText.toLowerCase().trim();

        if (subspecialtyFilter !== 'All') {
            currentRules = currentRules.filter(rule =>
                (rule.subspecialty || rule.division) === subspecialtyFilter
            );
        }

        if (searchLower) {
            currentRules = currentRules.filter(rule =>
                rule.condition.toLowerCase().includes(searchLower) ||
                (rule.keywords && rule.keywords.toLowerCase().includes(searchLower))
            );
        }

        return currentRules;
    }, [localRules, subspecialtyFilter, searchText]);

    const handleRuleChange = useCallback((index, field, value) => {
        setLocalRules(prevRules =>
            prevRules.map((rule, i) =>
                i === index ? { ...rule, [field]: value } : rule
            )
        );
    }, []);

    const handleSave = async () => {
        setStatusMessage('Saving...');

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            onSave(localRules);
            setStatusMessage('success');
            setTimeout(() => setStatusMessage(''), 5000);

        } catch (error) {
            console.error('Save error:', error);
            setStatusMessage('error');
        }
    };

    return (
        <div className="space-y-6">

            <FilterBar
                subspecialtyFilter={subspecialtyFilter}
                searchText={searchText}
                onSubspecialtyChange={setSubspecialtyFilter}
                onSearchTextChange={setSearchText}
            />

            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Showing {filteredRules.length} rules
                </p>

                {!isReadOnly && (
                    <div className="flex items-center gap-4">
                        {statusMessage && (
                            <div className={`text-sm font-bold flex items-center animate-in fade-in slide-in-from-right-5 ${statusMessage === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
                                {statusMessage === 'success' ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        Saved Successfully
                                    </>
                                ) : statusMessage === 'Saving...' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-4 h-4 mr-1.5" />
                                        Save Failed
                                    </>
                                )}
                            </div>
                        )}
                        <Button
                            onClick={handleSave}
                            disabled={statusMessage === 'Saving...'}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Configuration
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredRules.length > 0 ? (
                        filteredRules.map((rule, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <RuleCard
                                    rule={rule}
                                    index={localRules.findIndex(r => r === rule)}
                                    onRuleChange={handleRuleChange}
                                    isReadOnly={isReadOnly}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            <p className="text-lg">No rules match the current filters or search term.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};

// --- Main Page Component (AdminRules) ---
const AdminRules = () => {
    const [rules, setRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const toggleReadOnly = () => {
        setIsReadOnly(prev => !prev);
    };

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const response = await fetch(CSV_FILE_PATH);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}. Check console and ensure 'symptoms.csv' is in the public directory.`);
                }
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const cleanData = results.data.filter(
                            row => row.condition && row.division
                        ).map(rule => ({
                            ...rule,
                            subspecialty: rule.division
                        }));
                        setRules(cleanData);
                        setIsLoading(false);
                    },
                    error: (err) => {
                        setError(`CSV Parsing Error: ${err.message}`);
                        setIsLoading(false);
                    }
                });
            } catch (e) {
                setError(`Failed to fetch data: ${e.message}. Ensure CSV is in the public folder and path is correct.`);
                setIsLoading(false);
            }
        };

        fetchRules();
    }, []);

    const handleRulesSave = (newRules) => {
        setRules(newRules);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-100 via-rose-50 to-slate-50 dark:from-red-950 dark:via-rose-950 dark:to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-red-600 dark:text-red-400 animate-spin mx-auto mb-4" />
                    <p className="text-xl font-bold text-red-800 dark:text-red-200">Loading Configuration...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-100 via-rose-50 to-slate-50 dark:from-red-950 dark:via-rose-950 dark:to-slate-950 flex items-center justify-center">
                <Card className="max-w-md border-red-200 bg-red-50 text-red-900">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <h3 className="font-bold text-lg">Error Loading Rules</h3>
                        </div>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-100 via-rose-50 to-slate-50 dark:from-red-950 dark:via-rose-950 dark:to-slate-950 py-12 px-6">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 dark:bg-red-900 rounded-full mb-6 border-2 border-red-300 dark:border-red-700">
                                    <Key className="w-5 h-5 text-red-700 dark:text-red-300" />
                                    <span className="text-sm font-bold text-red-900 dark:text-red-200">
                                        Admin Controls
                                    </span>
                                </div>
                                <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-400 dark:via-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                                    Triage Rules Configuration
                                </h1>
                                <p className="text-xl text-red-700 dark:text-red-300 font-semibold">
                                    Manage routing logic and scheduling priorities
                                </p>
                            </div>

                            <Button
                                onClick={toggleReadOnly}
                                variant={isReadOnly ? "default" : "secondary"}
                                className={`text-lg px-8 py-6 h-auto shadow-xl transition-all ${isReadOnly
                                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                                    : "bg-white text-red-900 border-2 border-red-200 hover:border-red-400"
                                    }`}
                            >
                                {isReadOnly ? (
                                    <>
                                        <Lock className="w-5 h-5 mr-3" />
                                        Enable Editing
                                    </>
                                ) : (
                                    <>
                                        <Unlock className="w-5 h-5 mr-3" />
                                        Disable Editing
                                    </>
                                )}
                            </Button>

                        </div>
                    </motion.div>
                </div>

                <RuleConfigurator rules={rules} onSave={handleRulesSave} isReadOnly={isReadOnly} />
            </div>
        </div>
    );
};

export default AdminRules;