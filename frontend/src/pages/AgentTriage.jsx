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
  const [triageId, setTriageId] = useState(null);


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
    try {
      const agentIdInt = Number.parseInt(patientData.agentId, 10);
      if (!Number.isInteger(agentIdInt)) {
        alert("Agent ID must be a whole number.");
        setLoading(false);
        return;
      }

      const localTimestamp = new Date().toISOString();
      const startRes = await fetch('http://localhost:8000/api/triage/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentIdInt, // <-- INT
          client_first_name: patientData.firstName,
          client_last_name: patientData.lastName,
          client_dob: patientData.dob,
        }),
      });
      if (!startRes.ok) throw new Error(`start ${startRes.status}`);
      const started = await startRes.json();
      setTriageId(started.triage_id);

      setAgentId(agentIdInt); // keep as number in state if you like
      setPatient({ firstName: patientData.firstName, lastName: patientData.lastName, dob: patientData.dob, healthHistory: [] });
      setCurrentQuestion("What is the primary reason for today's call?\n Are you currently pregnant?\n Do you have any abnormal bleeding?");
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("Error retrieving patient information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    setLoading(true);
    try {
      const MAP = { yes: 1, no: 0, skip: -1 };
      const norm = s => (s || '').trim().toLowerCase();
      let last_ans = -1, freeText = '';

      if (typeof answer === 'string' && answer.includes('-')) {
        const [head, tail] = answer.split(/\s*-\s*/, 2);
        last_ans = MAP[norm(head)] ?? -1;
        freeText = (tail || '').trim();
      } else if (typeof answer === 'string') {
        freeText = answer;
      }

      const res = await fetch('http://localhost:8000/api/triage/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triage_id: triageId,
          question: currentQuestion,
          answer: freeText || (typeof answer === 'string' ? answer : String(answer ?? '')),
          last_ans, // <-- CRITICAL
        }),
      });
      if (!res.ok) throw new Error(`answer ${res.status}`);
      const data = await res.json();

      setQuestionHistory(prev => [...prev, { question: currentQuestion, answer }]);
      setCurrentQuestion(data.next_question || '(no question)');

      setSubspecialists(
        (data.subspecialty_results ?? [])
          .map(s => ({ name: s.subspecialty_name, short: s.subspecialty_short, rank: s.rank, confidence: Math.round(Number(s.percent_match ?? 0)) }))
          .sort((a, b) => b.confidence - a.confidence)
      );

      setConditions(
        (data.condition_results ?? [])
          .map(c => ({ name: c.condition, probability: Math.round(Number((c.condition_results ?? c.probability ?? 0)) * 100) }))
          .sort((a, b) => b.probability - a.probability)
      );

      setDoctorMatches((data.doctor_results ?? []).map(d => ({ label: d.rank, name: d.name })));
    } catch (e) {
      console.error(e);
      alert("Error processing answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndConversation = () => {
    const newCaseNumber = generateCaseNumber();
    setCaseNumber(newCaseNumber);
    setShowEndDialog(true);
  };

  const handleSaveAndEnd = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/triage/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triage_id: triageId,
          agent_notes: agentNotes,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status}`);
      }

      setTriageData({
        triageId,
        patient,
        caseNumber,
        subspecialists,
        conditions,
        doctorMatches,
        questionHistory,
        agentNotes,
        agentId,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving triage:', error);
      alert('Failed to save triage case. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-rose-50 to-slate-50 dark:from-red-950 dark:via-rose-950 dark:to-slate-950">
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
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-700 dark:via-red-600 dark:to-rose-600 rounded-full shadow-lg">
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
              <Card className="border-4 border-red-300 dark:border-red-700 shadow-2xl bg-white dark:bg-slate-900">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-black text-red-900 dark:text-red-200 mb-2">
                      End Conversation
                    </h2>
                    <p className="text-red-700 dark:text-red-300 font-semibold">
                      This will save the triage case to the dashboard
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="p-5 bg-red-100 dark:bg-red-900/30 rounded-xl border-2 border-red-300 dark:border-red-700">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">
                        Final Recommendation:
                      </p>
                      <div className="space-y-2">
                        <p className="text-lg font-black text-red-900 dark:text-red-100">
                          {subspecialists[0]?.name} ({Math.round(subspecialists[0]?.confidence)}% confidence)
                        </p>
                        <p className="text-base font-semibold text-red-800 dark:text-red-200">
                          Recommended Doctor: Dr. {doctorMatches[0]?.name}
                        </p>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
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
                    <label className="block text-base font-bold mb-3 text-red-800 dark:text-red-200">
                      Agent Notes (Optional):
                    </label>
                    <Textarea
                      value={agentNotes}
                      onChange={(e) => setAgentNotes(e.target.value)}
                      placeholder="Add any additional notes about this case..."
                      rows={4}
                      className="text-lg bg-white dark:bg-slate-950 text-red-900 dark:text-red-100 border-3 border-red-400 dark:border-red-600 font-semibold"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowEndDialog(false)}
                      disabled={saving}
                      className="flex-1 text-lg py-6 border-3 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/50 font-black"
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
  )
}
