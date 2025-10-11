import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PatientInfoForm from "../components/agent/PatientInfoForm";
import PatientInfoPanel from "../components/agent/PatientInfoPanel";
import QuestionPanel from "../components/agent/QuestionPanel";
import SubspecialistPanel from "../components/agent/SubspecialistPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentTriage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [patient, setPatient] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionHistory, setQuestionHistory] = useState([]);
  const [subspecialists, setSubspecialists] = useState([]);
  const [doctorMatches, setDoctorMatches] = useState([]);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [agentNotes, setAgentNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // MOCK DATA - Questions pool
  const mockQuestions = [
    "What is the primary reason for today's call?",
    "How long have you been experiencing these symptoms?",
    "Have you noticed any patterns or triggers?",
    "Are you currently taking any medications?",
    "Have you experienced similar issues before?",
    "Is there anything else that concerns you?",
    "On a scale of 1-10, how would you rate your discomfort?",
    "Have you had any recent medical procedures?"
  ];

  const handlePatientSubmit = async (patientData) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      setAgentId(patientData.agentId);
      
      // PLACEHOLDER: API call would go here
      // Example: const response = await fetch('/api/patient-lookup', { method: 'POST', body: JSON.stringify(patientData) });
      
      // MOCK DATA - Patient information
      const mockPatientData = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dob: patientData.dob,
        healthHistory: ["PCOS", "Irregular periods", "Previous surgery"]
      };
      
      const mockInitialQuestion = mockQuestions[0];
      
      // MOCK DATA - Initial subspecialist confidences
      const mockSubspecialists = [
        { name: "Maternal-Fetal Medicine", confidence: 15 },
        { name: "Urogynecology", confidence: 20 },
        { name: "Minimally Invasive Surgery", confidence: 25 },
        { name: "Reproductive Endocrinology", confidence: 30 },
        { name: "Gynecologic Oncology", confidence: 10 },
        { name: "General OB/GYN", confidence: 40 }
      ];
      
      // MOCK DATA - Doctor matches
      const mockDoctors = [
        { name: "Sarah Johnson", specialty: "General OB/GYN", availability: "Available", credentials: "MD, FACOG" },
        { name: "Emily Chen", specialty: "Reproductive Endocrinology", availability: "Available", credentials: "MD, FACOG" },
        { name: "Maria Rodriguez", specialty: "Minimally Invasive Surgery", availability: "Next Week", credentials: "DO, FACOG" },
        { name: "Lisa Williams", specialty: "Urogynecology", availability: "Available", credentials: "MD, FACOG" },
        { name: "Jennifer Brown", specialty: "General OB/GYN", availability: "Today", credentials: "MD" },
        { name: "Amanda Davis", specialty: "Maternal-Fetal Medicine", availability: "Tomorrow", credentials: "MD, FACOG" }
      ];
      
      setPatient(mockPatientData);
      setCurrentQuestion(mockInitialQuestion);
      setSubspecialists(mockSubspecialists);
      setDoctorMatches(mockDoctors);
      setStep(2);
    } catch (error) {
      console.error("Error retrieving patient data:", error);
      alert("Error retrieving patient information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // PLACEHOLDER: API call would go here
      // Example: const response = await fetch('/api/triage/next-question', { 
      //   method: 'POST', 
      //   body: JSON.stringify({ question: currentQuestion, answer, history: questionHistory }) 
      // });
      
      // Add current Q&A to history
      setQuestionHistory([
        ...questionHistory,
        { question: currentQuestion, answer }
      ]);
      
      // MOCK DATA - Get next question
      const nextQuestionIndex = (questionHistory.length + 1) % mockQuestions.length;
      const mockNextQuestion = mockQuestions[nextQuestionIndex];
      
      // MOCK DATA - Update subspecialist confidences (simulate AI analysis)
      const updatedSubspecialists = subspecialists.map(sub => ({
        ...sub,
        confidence: Math.min(100, Math.max(5, sub.confidence + (Math.random() * 20 - 10)))
      })).sort((a, b) => b.confidence - a.confidence);
      
      setCurrentQuestion(mockNextQuestion);
      setSubspecialists(updatedSubspecialists);
      
    } catch (error) {
      console.error("Error processing answer:", error);
      alert("Error processing answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndConversation = () => {
    setShowEndDialog(true);
  };

  const handleSaveAndEnd = async () => {
    setSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const topSubspecialist = subspecialists[0];
      const topDoctor = doctorMatches[0];
      
      // MOCK DATA - Triage case that would be saved
      const triageData = {
        agent_id: agentId,
        patient_first_name: patient.firstName,
        patient_last_name: patient.lastName,
        patient_dob: patient.dob,
        health_history: patient.healthHistory || [],
        conversation_history: [
          ...questionHistory,
          { question: currentQuestion, answer: "" }
        ],
        final_recommendation: topSubspecialist.name,
        confidence_score: topSubspecialist.confidence,
        recommended_doctor: topDoctor.name,
        subspecialist_confidences: subspecialists,
        status: "completed",
        agent_notes: agentNotes
      };

      // PLACEHOLDER: API call would go here
      // Example: await fetch('/api/triage-cases', { method: 'POST', body: JSON.stringify(triageData) });
      
      console.log("Triage case data (would be sent to API):", triageData);
      
      // Store in localStorage as mock database
      const existingCases = JSON.parse(localStorage.getItem('triageCases') || '[]');
      existingCases.unshift({
        ...triageData,
        id: Date.now().toString(),
        created_date: new Date().toISOString()
      });
      localStorage.setItem('triageCases', JSON.stringify(existingCases));
      
      // Navigate to dashboard
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving triage case:", error);
      alert("Error saving triage case. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">
      {step === 1 ? (
        <PatientInfoForm onSubmit={handlePatientSubmit} loading={loading} />
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Patient Info Panel */}
            <PatientInfoPanel patient={patient} />
            
            {/* Question Panel */}
            <QuestionPanel
              currentQuestion={currentQuestion}
              questionHistory={questionHistory}
              onSubmitAnswer={handleAnswerSubmit}
              loading={loading}
            />
            
            {/* Subspecialist and Doctor Match Panel */}
            <SubspecialistPanel
              subspecialists={subspecialists}
              doctorMatches={doctorMatches}
            />

            {/* End Conversation Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleEndConversation}
                size="lg"
                className="text-lg px-12 py-6 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 hover:from-green-700 hover:to-emerald-700 shadow-xl text-white font-black"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                End Conversation & Save
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* End Conversation Dialog */}
      <AnimatePresence>
        {showEndDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowEndDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-black text-blue-900 dark:text-purple-200 mb-2">
                      End Conversation
                    </h2>
                    <p className="text-blue-700 dark:text-purple-300 font-semibold">
                      This will save the triage case to the dashboard
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="p-5 bg-blue-100 dark:bg-purple-900/30 rounded-xl border-2 border-blue-300 dark:border-purple-700">
                    <p className="text-sm font-bold text-blue-600 dark:text-purple-400 mb-3">
                      Final Recommendation:
                    </p>
                    <div className="space-y-2">
                      <p className="text-lg font-black text-blue-900 dark:text-purple-100">
                        {subspecialists[0]?.name} ({Math.round(subspecialists[0]?.confidence)}% confidence)
                      </p>
                      <p className="text-base font-semibold text-blue-800 dark:text-purple-200">
                        Recommended Doctor: Dr. {doctorMatches[0]?.name}
                      </p>
                      <p className="text-sm font-semibold text-blue-700 dark:text-purple-300">
                        {questionHistory.length} questions asked
                      </p>
                    </div>
                  </div>

                  {/* Agent Notes */}
                  <div>
                    <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                      Agent Notes (Optional):
                    </label>
                    <Textarea
                      value={agentNotes}
                      onChange={(e) => setAgentNotes(e.target.value)}
                      placeholder="Add any additional notes about this case..."
                      rows={4}
                      className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowEndDialog(false)}
                      disabled={saving}
                      className="flex-1 text-lg py-6 border-3 border-blue-400 dark:border-purple-600 text-blue-800 dark:text-purple-200 hover:bg-blue-100 dark:hover:bg-purple-900/50 font-black"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveAndEnd}
                      disabled={saving}
                      className="flex-1 text-lg py-6 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 hover:scale-105 shadow-xl text-white font-black"
                    >
                      {saving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Save & Go to Dashboard
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}