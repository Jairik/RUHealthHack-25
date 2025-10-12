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
import { useTriageContext } from "@/contexts/TriageContext";

// Actual component
export default function AgentTriage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [patient, setPatient] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionHistory, setQuestionHistory] = useState([]);
  const [subspecialists, setSubspecialists] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [doctorMatches, setDoctorMatches] = useState([]);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [agentNotes, setAgentNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const { triageData, setTriageData } = useTriageContext();

  // MOCK DATA - Questions pool
  const mockQuestions = [
    "What is the primary reason for today's call?\n Are you currently pregnant?\n Do you have any abnormal bleeding?",
    "Have you noticed any patterns or triggers?",
    "Are you currently taking any medications?",
    "Have you experienced similar issues before?",
    "Is there anything else that concerns you?",
    "On a scale of 1-10, how would you rate your discomfort?",
    "Have you had any recent medical procedures?"
  ];

  // Generate unique case number
  const generateCaseNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TC-${timestamp}-${random}`;
  };

  const handlePatientSubmit = async (patientData) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      setAgentId(patientData.agentId);
      
      // Generate unique case number
      const newCaseNumber = generateCaseNumber();
      setCaseNumber(newCaseNumber);
      
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
      // ==== START REPLACE (from your PLACEHOLDER down through the mock updates) ====

      const res = await fetch('http://127.0.0.1:8000/api/get_user_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(""), // <— bare JSON string, made on the spot
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const r = data?.results ?? {};

      console.log(data)
      const answer = 'answer'

      setPatient(mockPatientData)
      // add the just-answered pair to history
      //setQuestionHistory(prev => [...prev, { question: 'currentQuestion', answer }]);

      // question may be double-quoted like "\"...\"" — clean safely
      const nextQ = typeof r.question === 'string'
          ? r.question.replace(/^"(.*)"$/, '$1')
          : "What is the primary reason for today's call?\n Are you currently pregnant?\n Do you have any abnormal bleeding?";
      setCurrentQuestion(nextQ || '(no question returned)');

      // subspecialties → { name, short, rank, confidence (0–100) }
      setSubspecialists(
        (r.subspecialty_results ?? [])
          .map(s => ({
            name: s.subspecialty_name,
            short: s.subspecialty_short,
            rank: s.rank,
            confidence: Math.round((s.percent_match ?? 0) * 100),
          }))
          .sort((a, b) => b.confidence - a.confidence)
      );

      // conditions → { name, probability (0–100) }
      setConditions(
        (r.condition_results ?? [])
          .map(c => ({
            name: c.condition,
            probability: Math.round((c.condition_results ?? 0) * 100),
          }))
          .sort((a, b) => b.probability - a.probability)
      );

      // doctors (optional)
      setDoctorMatches(
        r.doctor_results
          ? Object.entries(r.doctor_results).map(([label, name]) => ({ label, name }))
          : []
      );

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
    
    try {
      // ==== START REPLACE (remove everything from the PLACEHOLDER comment down to the mock updates) ====

      // --- tiny parse+payload ---
      const MAP = { yes: 1, no: 0, skip: -1 };
      const norm = s => (s || '').trim().toLowerCase();

      let last_ans, freeText;

      if (typeof answer === 'string' && answer.includes('-')) {
        const [head, tail] = answer.split(/\s*-\s*/, 2); // remove the " - " and trim around it
        last_ans = MAP[norm(head)] ?? -1;
        freeText = (tail || '').trim() || null;
      } else {
        last_ans = MAP[norm(answer)] ?? -1;
        freeText = null;
      }

      const body = JSON.stringify({user_text: freeText ?? '' , last_ans});

      // use in your fetch:
      const res = await fetch('http://127.0.0.1:8000/api/get_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const r = data?.results ?? {};
      console.log(data)

      // 1) add the just-answered pair to history (using the current question shown)
      setQuestionHistory(prev => [...prev, { question: currentQuestion, answer }]);

      // 2) next question (backend returns "\"...\"" — remove wrapping quotes)
      const nextQ = typeof r.question === 'string'
        ? r.question.replace(/^"(.*)"$/, '$1')
        : '';
      setCurrentQuestion(nextQ || '(no question returned)');

      // 3) subspecialties → { name, confidence } (0–100), keep extra fields if you need them
      setSubspecialists(
        (r.subspecialty_results ?? [])
          .map(s => ({
            name: s.subspecialty_name,
            short: s.subspecialty_short,
            rank: s.rank,
            confidence: Math.round((s.percent_match ?? 0) * 100),
          }))
          .sort((a, b) => b.confidence - a.confidence)
      );

      // 4) conditions → { name, probability } (0–100)
      setConditions(
        (r.condition_results ?? [])
          .map(c => ({
            name: c.condition,
            probability: Math.round((c.condition_results ?? 0) * 100),
          }))
          .sort((a, b) => b.probability - a.probability)
      );

      // 5) doctors → simple list; adapt if your UI expects more fields
      setDoctorMatches(
        r.doctor_results
          ? Object.entries(r.doctor_results).map(([label, name]) => ({ label, name }))
          : []
      );

      // ==== END REPLACE ====

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
      const topCondition = conditions[0];
      
      // MOCK DATA - Triage case that would be saved
      const triageData = {
        case_number: caseNumber,
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
        condition_probabilities: conditions,
        top_condition: topCondition.name,
        top_condition_probability: topCondition.probability,
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950">
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
            {/* Case Number Banner */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-full shadow-lg">
                <span className="text-sm font-bold text-white">
                  Case Number: {caseNumber}
                </span>
              </div>
            </div>

            {/* Patient Info Panel */}
            <PatientInfoPanel patient={patient} />
            
            {/* Question Panel */}
            <QuestionPanel
              currentQuestion={currentQuestion}
              questionHistory={questionHistory}
              onSubmitAnswer={handleAnswerSubmit}
              loading={loading}
            />
            
            {/* Subspecialist, Conditions, and Doctor Match Panel */}
            <SubspecialistPanel
              subspecialists={subspecialists}
              conditions={conditions}
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
              <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-black text-indigo-900 dark:text-purple-200 mb-2">
                      End Conversation
                    </h2>
                    <p className="text-indigo-700 dark:text-purple-300 font-semibold">
                      This will save the triage case to the dashboard
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="p-5 bg-indigo-100 dark:bg-purple-900/30 rounded-xl border-2 border-indigo-300 dark:border-purple-700">
                      <p className="text-sm font-bold text-indigo-600 dark:text-purple-400 mb-3">
                        Final Recommendation:
                      </p>
                      <div className="space-y-2">
                        <p className="text-lg font-black text-indigo-900 dark:text-purple-100">
                          {subspecialists[0]?.name} ({Math.round(subspecialists[0]?.confidence)}% confidence)
                        </p>
                        <p className="text-base font-semibold text-indigo-800 dark:text-purple-200">
                          Recommended Doctor: Dr. {doctorMatches[0]?.name}
                        </p>
                        <p className="text-sm font-semibold text-indigo-700 dark:text-purple-300">
                          {questionHistory.length} questions asked
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-rose-100 dark:bg-rose-900/30 rounded-xl border-2 border-rose-300 dark:border-rose-700">
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-3">
                        Top Suspected Condition:
                      </p>
                      <p className="text-lg font-black text-rose-900 dark:text-rose-100">
                        {conditions[0]?.name} ({Math.round(conditions[0]?.probability)}% probability)
                      </p>
                    </div>
                  </div>

                  {/* Agent Notes */}
                  <div>
                    <label className="block text-base font-bold mb-3 text-indigo-800 dark:text-purple-200">
                      Agent Notes (Optional):
                    </label>
                    <Textarea
                      value={agentNotes}
                      onChange={(e) => setAgentNotes(e.target.value)}
                      placeholder="Add any additional notes about this case..."
                      rows={4}
                      className="text-lg bg-white dark:bg-slate-950 text-indigo-900 dark:text-purple-100 border-3 border-indigo-400 dark:border-purple-600 font-semibold"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowEndDialog(false)}
                      disabled={saving}
                      className="flex-1 text-lg py-6 border-3 border-indigo-400 dark:border-purple-600 text-indigo-800 dark:text-purple-200 hover:bg-indigo-100 dark:hover:bg-purple-900/50 font-black"
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
