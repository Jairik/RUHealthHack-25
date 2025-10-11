
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

  useEffect(() => {
    // PLACEHOLDER: API call would go here
    // Example: const response = await fetch('/api/triage-cases');
    // const data = await response.json();
    
    // Load mock data from localStorage (simulated database)
    const loadCases = () => {
      const storedCases = JSON.parse(localStorage.getItem('triageCases') || '[]');
      
      // If no cases exist, create some mock data
      if (storedCases.length === 0) {
        const initialMockCases = [
          {
            id: "1",
            agent_id: "A001",
            patient_first_name: "Sarah",
            patient_last_name: "Williams",
            patient_dob: "1985-03-15",
            created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            health_history: ["Endometriosis", "Previous C-section"],
            conversation_history: [
              { question: "What is the primary reason for today's call?", answer: "Severe pelvic pain and heavy bleeding" },
              { question: "How long have you been experiencing these symptoms?", answer: "About 6 months, getting worse" },
              { question: "Are you currently taking any medications?", answer: "Birth control pills and ibuprofen" }
            ],
            final_recommendation: "Minimally Invasive Surgery",
            confidence_score: 85,
            recommended_doctor: "Dr. Maria Rodriguez", // Added "Dr. " prefix for consistency
            subspecialist_confidences: [
              { name: "Minimally Invasive Surgery", confidence: 85 },
              { name: "General OB/GYN", confidence: 60 },
              { name: "Reproductive Endocrinology", confidence: 45 },
              { name: "Urogynecology", confidence: 30 },
              { name: "Gynecologic Oncology", confidence: 20 },
              { name: "Maternal-Fetal Medicine", confidence: 15 }
            ],
            status: "completed",
            agent_notes: "Patient needs urgent follow-up",
            sent_to_epic: false
          },
          {
            id: "2",
            agent_id: "A002",
            patient_first_name: "Maria",
            patient_last_name: "Garcia",
            patient_dob: "1992-07-22",
            created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            health_history: ["PCOS", "Gestational diabetes"],
            conversation_history: [
              { question: "What is the primary reason for today's call?", answer: "Trying to conceive for 18 months" },
              { question: "Have you had any fertility testing done?", answer: "Yes, diagnosed with PCOS" },
              { question: "Are you currently taking any medications?", answer: "Metformin and prenatal vitamins" }
            ],
            final_recommendation: "Reproductive Endocrinology",
            confidence_score: 92,
            recommended_doctor: "Dr. Emily Chen", // Added "Dr. " prefix for consistency
            subspecialist_confidences: [
              { name: "Reproductive Endocrinology", confidence: 92 },
              { name: "General OB/GYN", confidence: 55 },
              { name: "Maternal-Fetal Medicine", confidence: 40 },
              { name: "Minimally Invasive Surgery", confidence: 25 },
              { name: "Urogynecology", confidence: 15 },
              { name: "Gynecologic Oncology", confidence: 10 }
            ],
            status: "completed",
            agent_notes: "Referred to fertility specialist",
            sent_to_epic: true,
            epic_sent_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        // Add case_number dynamically
        const mockCasesWithNumbers = initialMockCases.map((caseItem, idx) => ({
          ...caseItem,
          case_number: `TRG-${String(idx + 1).padStart(3, '0')}` // e.g., TRG-001, TRG-002
        }));

        localStorage.setItem('triageCases', JSON.stringify(mockCasesWithNumbers));
        setTriageCases(mockCasesWithNumbers);
      } else {
        // Ensure existing cases also have a case_number if not present (for old stored data)
        const casesWithNumbers = storedCases.map((caseItem, idx) => ({
          ...caseItem,
          case_number: caseItem.case_number || `TRG-${String(idx + 1).padStart(3, '0')}`
        }));
        setTriageCases(casesWithNumbers);
      }
      
      setLoading(false);
    };

    loadCases();
  }, []);

  const handleSendToEpic = async (triageCase) => {
    if (triageCase.sent_to_epic) {
      alert("This case has already been sent to Epic");
      return;
    }

    const confirmSend = window.confirm(
      `Send triage case for ${triageCase.patient_first_name} ${triageCase.patient_last_name} to Epic EHR?\n\nThis will transfer all triage data, recommendations, and notes to the patient's medical record.`
    );

    if (!confirmSend) return;

    setSendingToEpic(triageCase.id);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // PLACEHOLDER: API call would go here
      // Example: await fetch(`/api/triage-cases/${triageCase.id}/send-to-epic`, { method: 'POST' });
      
      // Update case in localStorage
      const updatedCase = {
        ...triageCase,
        sent_to_epic: true,
        epic_sent_date: new Date().toISOString()
      };
      
      const updatedCases = triageCases.map(c => 
        c.id === triageCase.id ? updatedCase : c
      );
      
      localStorage.setItem('triageCases', JSON.stringify(updatedCases));
      setTriageCases(updatedCases);
      
      alert("Successfully sent to Epic EHR!");
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
      c.case_number?.toLowerCase().includes(searchLower) // Include case number in search
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
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
            { label: "Total Cases", value: stats.total, icon: FileText, gradient: "from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600" },
            { label: "Cases Today", value: stats.today, icon: Calendar, gradient: "from-purple-500 via-pink-500 to-rose-500 dark:from-purple-600 dark:via-pink-600 dark:to-rose-600" },
            { label: "This Week", value: stats.thisWeek, icon: TrendingUp, gradient: "from-pink-500 via-rose-500 to-red-500 dark:from-pink-600 dark:via-rose-600 dark:to-red-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900 hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-xl`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-black text-indigo-800 dark:text-purple-200 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-purple-400">
                    {stat.label}
                  </div>
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

        {/* Cases List */}
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
                <motion.div
                  key={case_.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900 hover:shadow-2xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            {/* Case Number Badge */}
                            {case_.case_number && (
                              <Badge className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 text-white border-0 px-3 py-1 font-black">
                                {case_.case_number}
                              </Badge>
                            )}
                            <CardTitle className="text-2xl font-black text-indigo-900 dark:text-purple-100">
                              {case_.patient_first_name} {case_.patient_last_name}
                            </CardTitle>
                            <Badge className="bg-purple-200 dark:bg-purple-900 text-indigo-900 dark:text-purple-100 border-2 border-purple-400 dark:border-purple-600 px-3 py-1 font-bold">
                              Agent #{case_.agent_id}
                            </Badge>
                            {case_.sent_to_epic && (
                              <Badge className="bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 border-2 border-green-400 dark:border-green-600 px-3 py-1 font-bold">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Sent to Epic
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge className="bg-indigo-200 dark:bg-purple-900 text-indigo-900 dark:text-purple-100 border-2 border-indigo-400 dark:border-purple-600 px-3 py-1 font-bold">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(case_.created_date), 'MMM d, yyyy - h:mm a')}
                            </Badge>
                            <Badge className={`${getConfidenceColor(case_.confidence_score)} border-2 px-3 py-1 font-bold`}>
                              {case_.confidence_score}% Confidence
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleSendToEpic(case_)}
                            disabled={case_.sent_to_epic || sendingToEpic === case_.id}
                            className={`${
                              case_.sent_to_epic
                                ? 'bg-green-600 dark:bg-green-700'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 hover:from-indigo-700 hover:to-purple-700'
                            } text-white font-bold`}
                          >
                            {sendingToEpic === case_.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : case_.sent_to_epic ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Sent to Epic
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send to Epic
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setExpandedCase(expandedCase === case_.id ? null : case_.id)}
                            className="text-indigo-600 dark:text-purple-400"
                          >
                            {expandedCase === case_.id ? (
                              <ChevronUp className="w-6 h-6" />
                            ) : (
                              <ChevronDown className="w-6 h-6" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Summary */}
                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div className="p-4 bg-indigo-100 dark:bg-purple-900/30 rounded-xl border-2 border-indigo-300 dark:border-purple-700">
                          <p className="text-sm font-bold text-indigo-600 dark:text-purple-400 mb-2">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            Recommendation
                          </p>
                          <p className="text-lg font-black text-indigo-900 dark:text-purple-100">
                            {case_.final_recommendation}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-purple-100 dark:bg-pink-900/30 rounded-xl border-2 border-purple-300 dark:border-pink-700">
                          <p className="text-sm font-bold text-purple-600 dark:text-pink-400 mb-2">
                            <Users className="w-3 h-3 inline mr-1" />
                            Recommended Doctor
                          </p>
                          <p className="text-lg font-black text-indigo-900 dark:text-pink-100">
                            {case_.recommended_doctor}
                          </p>
                        </div>
                      </div>

                      {/* Epic Status */}
                      {case_.sent_to_epic && case_.epic_sent_date && (
                        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl border-2 border-green-300 dark:border-green-700">
                          <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                            <CheckCircle2 className="w-4 h-4 inline mr-1" />
                            Sent to Epic EHR on {format(new Date(case_.epic_sent_date), 'MMM d, yyyy - h:mm a')}
                          </p>
                        </div>
                      )}

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedCase === case_.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6 pt-6 border-t-2 border-indigo-200 dark:border-purple-800"
                          >
                            {/* Health History */}
                            {case_.health_history && case_.health_history.length > 0 && (
                              <div>
                                <p className="text-base font-bold text-indigo-800 dark:text-purple-200 mb-3">
                                  Health History:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {case_.health_history.map((condition, idx) => (
                                    <Badge
                                      key={idx}
                                      className="bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-2 border-orange-400 dark:border-orange-600 px-3 py-1 font-bold"
                                    >
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Conversation History */}
                            {case_.conversation_history && case_.conversation_history.length > 0 && (
                              <div>
                                <p className="text-base font-bold text-indigo-800 dark:text-purple-200 mb-4">
                                  Conversation ({case_.conversation_history.length} Q&A):
                                </p>
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                  {case_.conversation_history.map((qa, idx) => (
                                    <div key={idx} className="space-y-2">
                                      <div className="p-3 bg-indigo-100 dark:bg-purple-900/30 rounded-lg border border-indigo-300 dark:border-purple-700">
                                        <p className="text-xs font-bold text-indigo-600 dark:text-purple-400 mb-1">Q{idx + 1}:</p>
                                        <p className="text-sm font-semibold text-indigo-900 dark:text-purple-100">{qa.question}</p>
                                      </div>
                                      {qa.answer && (
                                        <div className="p-3 bg-purple-100 dark:bg-pink-900/30 rounded-lg border border-purple-300 dark:border-pink-700 ml-4">
                                          <p className="text-xs font-bold text-purple-600 dark:text-pink-400 mb-1">A:</p>
                                          <p className="text-sm font-semibold text-indigo-900 dark:text-pink-100">{qa.answer}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Subspecialist Confidences */}
                            {case_.subspecialist_confidences && case_.subspecialist_confidences.length > 0 && (
                              <div>
                                <p className="text-base font-bold text-indigo-800 dark:text-purple-200 mb-4">
                                  Final Subspecialist Confidences:
                                </p>
                                <div className="grid md:grid-cols-2 gap-3">
                                  {case_.subspecialist_confidences.map((sub, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-pink-100 dark:bg-rose-900/30 rounded-lg border border-pink-300 dark:border-rose-700">
                                      <span className="text-sm font-bold text-pink-900 dark:text-rose-100">{sub.name}</span>
                                      <Badge className={`${getConfidenceColor(sub.confidence)} border font-bold`}>
                                        {sub.confidence}%
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Doctor Matches - Clickable */}
                            {case_.recommended_doctor && (
                              <div>
                                <p className="text-base font-bold text-indigo-800 dark:text-purple-200 mb-4">
                                  Recommended Doctors (Click to View Availability):
                                </p>
                                <div className="grid md:grid-cols-2 gap-3">
                                  {/* MOCK DATA - Doctor matches */}
                                  {[
                                    { 
                                      name: case_.recommended_doctor.replace("Dr. ", ""), 
                                      specialty: case_.final_recommendation,
                                      availability: "Available",
                                      credentials: "MD, FACOG"
                                    },
                                    {
                                      name: "Emily Chen", // Hardcoded name, but specialty from next confidence
                                      specialty: case_.subspecialist_confidences?.[1]?.name || "General OB/GYN",
                                      availability: "Available",
                                      credentials: "MD, FACOG"
                                    },
                                    {
                                      name: "Maria Rodriguez", // Hardcoded name, but specialty from next confidence
                                      specialty: case_.subspecialist_confidences?.[2]?.name || "Reproductive Endocrinology",
                                      availability: "Next Week",
                                      credentials: "DO, FACOG"
                                    }
                                  ].map((doctor, docIdx) => (
                                    <button
                                      key={docIdx}
                                      onClick={() => handleDoctorClick(doctor)}
                                      className="p-4 bg-purple-100 dark:bg-pink-900/30 rounded-xl border-2 border-purple-300 dark:border-pink-700 hover:shadow-lg hover:scale-105 transition-all cursor-pointer text-left"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <Badge className={`${
                                            docIdx === 0
                                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                                              : 'bg-indigo-200 dark:bg-purple-900 text-indigo-900 dark:text-purple-100 border-2 border-indigo-400 dark:border-purple-600'
                                          } font-black mb-2`}>
                                            {docIdx === 0 ? "Best Match ⭐" : docIdx === 1 ? "Top Match" : "Second Match"}
                                          </Badge>
                                          <p className="text-lg font-black text-indigo-900 dark:text-pink-100">
                                            Dr. {doctor.name}
                                          </p>
                                          <p className="text-sm font-semibold text-purple-700 dark:text-pink-300">
                                            {doctor.specialty}
                                          </p>
                                        </div>
                                        <Badge className="bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 border-2 border-rose-400 dark:border-rose-600 font-bold">
                                          {doctor.availability}
                                        </Badge>
                                      </div>
                                      {doctor.credentials && (
                                        <p className="text-xs text-purple-600 dark:text-pink-400 font-semibold">
                                          {doctor.credentials}
                                        </p>
                                      )}
                                      <p className="text-xs text-purple-500 dark:text-pink-500 mt-2 font-semibold">
                                        Click to view availability →
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Agent Notes */}
                            {case_.agent_notes && (
                              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
                                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-2">
                                  Agent Notes:
                                </p>
                                <p className="text-base font-semibold text-yellow-900 dark:text-yellow-200">
                                  {case_.agent_notes}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Doctor Availability Modal */}
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
