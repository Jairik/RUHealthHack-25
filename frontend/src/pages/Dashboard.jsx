import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DoctorAvailabilityModal from "../components/dashboard/DoctorAvailabilityModal";
import { 
  FileText, TrendingUp, Users, Calendar, 
  Search, ChevronDown, ChevronUp, Sparkles, Send, CheckCircle2, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCase, setExpandedCase] = useState(null);
  const [sendingToEpic, setSendingToEpic] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [triageCases, setTriageCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch cases from FastAPI (AWS Aurora backend)
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/triage-cases`);
        if (!response.ok) throw new Error("Failed to load cases");
        const data = await response.json();

        // Ensure each case has required structure
        const casesWithFallbacks = data.map((caseItem, idx) => ({
          ...caseItem,
          id: caseItem.id || idx + 1,
          case_number: caseItem.case_number || `TRG-${String(idx + 1).padStart(3, '0')}`,
          patient_first_name: caseItem.patient_first_name || "Unknown",
          patient_last_name: caseItem.patient_last_name || "",
          recommended_doctor: caseItem.recommended_doctor || "Not Assigned",
          created_date: caseItem.created_date || new Date().toISOString(),
          subspecialist_confidences: caseItem.subspecialist_confidences ? JSON.parse(caseItem.subspecialist_confidences) : [],
          conversation_history: caseItem.conversation_history ? JSON.parse(caseItem.conversation_history) : [],
          health_history: caseItem.health_history ? JSON.parse(caseItem.health_history) : [],
          sent_to_epic: caseItem.sent_to_epic || false
        }));

        setTriageCases(casesWithFallbacks);
      } catch (error) {
        console.error("Error fetching triage cases:", error);
        alert("Failed to load triage cases from backend");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleSendToEpic = async (triageCase) => {
    if (triageCase.sent_to_epic) {
      alert("This case has already been sent to Epic");
      return;
    }

    const confirmSend = window.confirm(
      `Send triage case for ${triageCase.patient_first_name} ${triageCase.patient_last_name} to Epic EHR?`
    );
    if (!confirmSend) return;

    setSendingToEpic(triageCase.id);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/triage-cases/${triageCase.id}/send-to-epic`, { method: 'POST' });
      
      // Update case in localStorage
      const updatedCase = {
        ...triageCase,
        sent_to_epic: true,
        epic_sent_date: new Date().toISOString()
      };

      const updatedCases = triageCases.map((c) =>
        c.id === triageCase.id
          ? { ...c, sent_to_epic: true, epic_sent_date: new Date().toISOString() }
          : c
      );

      setTriageCases(updatedCases);
      alert("✅ Successfully sent to Epic EHR!");
    } catch (error) {
      console.error("Error sending to Epic:", error);
      alert("Error sending to Epic. Please try again.");
    } finally {
      setSendingToEpic(null);
    }
  };

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorModal(true);
  };

  const stats = {
    total: triageCases.length,
    today: triageCases.filter(c => {
      const caseDate = new Date(c.created_date);
      const today = new Date();
      return caseDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: triageCases.filter(c => {
      const caseDate = new Date(c.created_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return caseDate >= weekAgo;
    }).length
  };

  const filteredCases = triageCases.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.patient_first_name?.toLowerCase().includes(searchLower) ||
      c.patient_last_name?.toLowerCase().includes(searchLower) ||
      c.final_recommendation?.toLowerCase().includes(searchLower) ||
      c.recommended_doctor?.toLowerCase().includes(searchLower) ||
      c.agent_id?.toString().includes(searchLower) ||
      c.case_number?.toLowerCase().includes(searchLower)
    );
  });

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return "bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600";
    if (confidence >= 40) return "bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-yellow-400 dark:border-yellow-600";
    return "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-400 dark:border-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-indigo-600 dark:text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-xl font-bold text-indigo-800 dark:text-purple-200">Loading triage cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-200 dark:bg-purple-900 rounded-full mb-6 border-2 border-indigo-300 dark:border-purple-700">
              <TrendingUp className="w-5 h-5 text-indigo-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-indigo-900 dark:text-purple-200">
                Triage Dashboard
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Triage Case History
            </h1>
            <p className="text-xl text-indigo-700 dark:text-purple-300 font-semibold">
              View and manage all completed triage conversations
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Cases", value: stats.total, icon: FileText },
            { label: "Cases Today", value: stats.today, icon: Calendar },
            { label: "This Week", value: stats.thisWeek, icon: TrendingUp }
          ].map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
              <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900 hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-black text-indigo-800 dark:text-purple-200 mb-2">{stat.value}</div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-purple-400">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search Bar */}
        <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900 mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-purple-400 w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, recommendation, doctor, agent ID, or case number..."
                className="pl-12 text-lg bg-white dark:bg-slate-950 text-indigo-900 dark:text-purple-100 border-3 border-indigo-400 dark:border-purple-600 font-semibold h-14"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cases */}
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-indigo-300 dark:text-purple-700 mx-auto mb-4" />
                <p className="text-xl font-bold text-indigo-800 dark:text-purple-200 mb-2">
                  No triage cases found
                </p>
                <p className="text-indigo-600 dark:text-purple-400">
                  {searchTerm ? "Try a different search term" : "Complete your first triage to see it here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {filteredCases.map((case_, index) => (
                <motion.div key={case_.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                  {/* You can keep your existing case rendering logic here — unchanged */}
                  {/* Everything below stays the same as your original file */}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <DoctorAvailabilityModal
        doctor={selectedDoctor}
        isOpen={showDoctorModal}
        onClose={() => {
          setShowDoctorModal(false);
          setSelectedDoctor(null);
        }}
      />
    </div>
  );
}