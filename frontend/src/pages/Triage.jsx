import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, 
  Activity, Loader2, Send, FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Triage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    primary_symptoms: "",
    symptom_details: "",
    red_flags: [],
    medical_history: {
      is_pregnant: false,
      menstrual_cycle: "",
      current_medications: "",
      allergies: "",
      last_menstrual_period: "",
      previous_surgeries: false,
      chronic_conditions: []
    }
  });

  const commonSymptoms = [
    "Pelvic pain", "Vaginal bleeding", "Abnormal discharge", "Fever",
    "Nausea/Vomiting", "Dizziness", "Headache", "Contractions",
    "Leaking fluid", "Decreased fetal movement"
  ];

  // Add redFlags array after commonSymptoms:
  const redFlags = [
    "Labor pain",
    "Heavy bleeding (>1 pad/hour)",
    "No fetal movement",
    "Chest pain/severe shortness of breath",
    "Severe headache with vision changes",
    "Fever >101°F (pregnant)"
  ];

  const chronicConditions = [
    "Diabetes", "Hypertension", "PCOS", "Endometriosis", 
    "Fibroids", "Previous C-section", "None"
  ];

  const toggleSymptom = (symptom) => {
    const current = formData.primary_symptoms;
    const symptoms = current ? current.split(", ") : [];
    
    if (symptoms.includes(symptom)) {
      setFormData({
        ...formData,
        primary_symptoms: symptoms.filter(s => s !== symptom).join(", ")
      });
    } else {
      setFormData({
        ...formData,
        primary_symptoms: [...symptoms, symptom].filter(Boolean).join(", ")
      });
    }
  };

  const toggleRedFlag = (flag) => {
    const flags = formData.red_flags || [];
    if (flags.includes(flag)) {
      setFormData({
        ...formData,
        red_flags: flags.filter(f => f !== flag)
      });
    } else {
      setFormData({
        ...formData,
        red_flags: [...flags, flag]
      });
    }
  };

  const toggleCondition = (condition) => {
    const conditions = formData.medical_history.chronic_conditions;
    if (conditions.includes(condition)) {
      setFormData({
        ...formData,
        medical_history: {
          ...formData.medical_history,
          chronic_conditions: conditions.filter(c => c !== condition)
        }
      });
    } else {
      setFormData({
        ...formData,
        medical_history: {
          ...formData.medical_history,
          chronic_conditions: [...conditions, condition]
        }
      });
    }
  };

  const analyzeSymptoms = async () => {
    setLoading(true);
    
    try {
     const triageString = `
        PATIENT TRIAGE INFORMATION
        ==========================

        PRIMARY SYMPTOMS:
        ${formData.primary_symptoms}

        SYMPTOM DETAILS:
        ${formData.symptom_details || 'Not provided'}

        RED FLAGS:
        ${formData.red_flags && formData.red_flags.length > 0 ? formData.red_flags.join('; ') : 'None reported'}

        PREGNANCY STATUS:
        ${formData.medical_history.is_pregnant ? `Yes - ${formData.medical_history.gestational_age} weeks` : 'Not pregnant'}

        MENSTRUAL HISTORY:
        Cycle: ${formData.medical_history.menstrual_cycle || 'Not specified'}
        Last Menstrual Period: ${formData.medical_history.last_menstrual_period || 'Not provided'}

        MEDICAL HISTORY:
        Current Medications: ${formData.medical_history.current_medications || 'None reported'}
        Allergies: ${formData.medical_history.allergies || 'None reported'}
        Previous OB/GYN Surgeries: ${formData.medical_history.previous_surgeries ? 'Yes' : 'No'}
        Chronic Conditions: ${formData.medical_history.chronic_conditions.length > 0 ? formData.medical_history.chronic_conditions.join(', ') : 'None reported'}

        ADDITIONAL NOTES:
        ${formData.referral_reason || 'None provided'}

        TRIAGE TIMESTAMP: ${new Date().toISOString()}
              `.trim();

    //const nlpresult = await response.json()
    

    const mockNLPResult = {
        subspecialty_rankings: [
          { name: "General OB/GYN", score: 85 },
          { name: "Maternal-Fetal Medicine", score: 72 },
          { name: "Urogynecology", score: 45 },
          { name: "Reproductive Endocrinology", score: 38 },
          { name: "Minimally Invasive Surgery", score: 25 },
          { name: "Gynecologic Oncology", score: 15 }
        ],
        top_recommendation: "General OB/GYN",
        risk_level: formData.red_flags && formData.red_flags.length > 0 ? "high" : "medium",
        clinical_explanation: "Based on the reported symptoms and medical history, initial evaluation by a general OB/GYN specialist is recommended.",
        triage_data: triageString
      };

      setResult(mockNLPResult);
      setStep(4);

    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      alert("Error analyzing symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case "high": return "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100 border-2 border-red-400 dark:border-red-600";
      case "medium": return "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100 border-2 border-yellow-400 dark:border-yellow-600";
      default: return "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100 border-2 border-green-400 dark:border-green-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-blue-800 dark:text-purple-300">
                Step {step} of 3
              </span>
              <span className="text-sm font-bold text-blue-700 dark:text-purple-400">
                {Math.round((step / 3) * 100)}% Complete
              </span>
            </div>
            <Progress value={(step / 3) * 100} className="h-3 bg-blue-200 dark:bg-purple-900" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Symptoms */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-4xl flex items-center gap-4 text-blue-800 dark:text-purple-200 font-black">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                    Tell Us About Your Symptoms
                  </CardTitle>
                  <p className="text-blue-700 dark:text-purple-300 mt-3 text-lg font-semibold">
                    Select common symptoms or describe your condition in detail
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <label className="block text-base font-bold mb-4 text-blue-800 dark:text-purple-200">
                      Quick Select (tap to add):
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {commonSymptoms.map((symptom) => (
                        <Badge
                          key={symptom}
                          className={`cursor-pointer px-5 py-3 text-base font-bold transition-all ${
                            formData.primary_symptoms.includes(symptom)
                              ? "bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 text-white border-0 shadow-lg scale-105"
                              : "bg-blue-100 dark:bg-purple-900 text-blue-800 dark:text-purple-200 border-2 border-blue-400 dark:border-purple-600 hover:scale-105"
                          }`}
                          onClick={() => toggleSymptom(symptom)}
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                      Primary Symptoms:
                    </label>
                    <Input
                      value={formData.primary_symptoms}
                      onChange={(e) => setFormData({...formData, primary_symptoms: e.target.value})}
                      placeholder="e.g., Pelvic pain, Heavy bleeding"
                      className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 focus:border-blue-600 dark:focus:border-purple-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                      Detailed Description:
                    </label>
                    <Textarea
                      value={formData.symptom_details}
                      onChange={(e) => setFormData({...formData, symptom_details: e.target.value})}
                      placeholder="Please describe your symptoms in detail. When did they start? How severe are they? Any patterns you've noticed?"
                      rows={6}
                      className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 focus:border-blue-600 dark:focus:border-purple-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card
                        className={`cursor-pointer transition-all ${
                          formData.medical_history.is_pregnant
                            ? "border-4 border-blue-600 dark:border-purple-500 bg-blue-100 dark:bg-purple-900 scale-105 shadow-xl"
                            : "border-3 border-blue-300 dark:border-purple-700 bg-white dark:bg-gray-950 hover:scale-105 hover:shadow-lg"
                        }`}
                        onClick={() => setFormData({
                          ...formData,
                          medical_history: {
                            ...formData.medical_history,
                            is_pregnant: !formData.medical_history.is_pregnant
                          }
                        })}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-lg text-blue-900 dark:text-purple-200">Currently Pregnant?</span>
                            {formData.medical_history.is_pregnant && (
                              <CheckCircle2 className="w-7 h-7 text-blue-700 dark:text-purple-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {formData.medical_history.is_pregnant && (
                        <div>
                          <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                            Weeks Pregnant:
                          </label>
                          <Input
                            type="number"
                            value={formData.medical_history.gestational_age}
                            onChange={(e) => setFormData({
                              ...formData,
                              medical_history: {
                                ...formData.medical_history,
                                gestational_age: e.target.value
                              }
                            })}
                            placeholder="Enter weeks"
                            className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold"
                          />
                        </div>
                      )}
                    </div>

                    {!formData.medical_history.is_pregnant && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                            Menstrual Cycle:
                          </label>
                          <div className="flex gap-4">
                            <Badge
                              className={`cursor-pointer px-6 py-3 text-base font-bold transition-all flex-1 justify-center ${
                                formData.medical_history.menstrual_cycle === "regular"
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 text-white border-0 shadow-lg scale-105"
                                  : "bg-blue-100 dark:bg-purple-900 text-blue-800 dark:text-purple-200 border-2 border-blue-400 dark:border-purple-600 hover:scale-105"
                              }`}
                              onClick={() => setFormData({
                                ...formData,
                                medical_history: {
                                  ...formData.medical_history,
                                  menstrual_cycle: "regular"
                                }
                              })}
                            >
                              Regular
                            </Badge>
                            <Badge
                              className={`cursor-pointer px-6 py-3 text-base font-bold transition-all flex-1 justify-center ${
                                formData.medical_history.menstrual_cycle === "irregular"
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 text-white border-0 shadow-lg scale-105"
                                  : "bg-blue-100 dark:bg-purple-900 text-blue-800 dark:text-purple-200 border-2 border-blue-400 dark:border-purple-600 hover:scale-105"
                              }`}
                              onClick={() => setFormData({
                                ...formData,
                                medical_history: {
                                  ...formData.medical_history,
                                  menstrual_cycle: "irregular"
                                }
                              })}
                            >
                              Irregular
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                            Last Menstrual Period (LMP):
                          </label>
                          <Input
                            type="date"
                            value={formData.medical_history.last_menstrual_period}
                            onChange={(e) => setFormData({
                              ...formData,
                              medical_history: {
                                ...formData.medical_history,
                                last_menstrual_period: e.target.value
                              }
                            })}
                            className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-4 text-red-800 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      RED FLAGS - Select if present (requires immediate attention):
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {redFlags.map((flag) => (
                        <Badge
                          key={flag}
                          className={`cursor-pointer px-5 py-3 text-base font-bold transition-all ${
                            formData.red_flags.includes(flag)
                              ? "bg-gradient-to-r from-red-600 to-orange-500 text-white border-0 shadow-lg scale-105"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-2 border-red-400 dark:border-red-600 hover:scale-105"
                          }`}
                          onClick={() => toggleRedFlag(flag)}
                        >
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!formData.primary_symptoms}
                      className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-black"
                    >
                      Next <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Medical History */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-4xl flex items-center gap-4 text-blue-800 dark:text-purple-200 font-black">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    Quick Medical History
                  </CardTitle>
                  <p className="text-blue-700 dark:text-purple-300 mt-3 text-lg font-semibold">
                    Essential information for triage assessment
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                      Current Medications:
                    </label>
                    <Input
                      value={formData.medical_history.current_medications}
                      onChange={(e) => setFormData({
                        ...formData,
                        medical_history: {
                          ...formData.medical_history,
                          current_medications: e.target.value
                        }
                      })}
                      placeholder="List any medications you're currently taking"
                      className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                      Known Allergies:
                    </label>
                    <Input
                      value={formData.medical_history.allergies}
                      onChange={(e) => setFormData({
                        ...formData,
                        medical_history: {
                          ...formData.medical_history,
                          allergies: e.target.value
                        }
                      })}
                      placeholder="Medications, foods, or other allergies"
                      className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card
                      className={`cursor-pointer transition-all ${
                        formData.medical_history.previous_surgeries
                          ? "border-4 border-blue-600 dark:border-purple-500 bg-blue-100 dark:bg-purple-900 scale-105 shadow-xl"
                          : "border-3 border-blue-300 dark:border-purple-700 bg-white dark:bg-gray-950 hover:scale-105 hover:shadow-lg"
                      }`}
                      onClick={() => setFormData({
                        ...formData,
                        medical_history: {
                          ...formData.medical_history,
                          previous_surgeries: !formData.medical_history.previous_surgeries
                        }
                      })}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-lg text-blue-900 dark:text-purple-200">Previous OB/GYN Surgeries</span>
                          {formData.medical_history.previous_surgeries && (
                            <CheckCircle2 className="w-7 h-7 text-blue-700 dark:text-purple-400" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-4 text-blue-800 dark:text-purple-200">
                      Relevant Medical Conditions (select all that apply):
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {chronicConditions.map((condition) => (
                        <Badge
                          key={condition}
                          className={`cursor-pointer px-5 py-4 text-base justify-center font-bold transition-all ${
                            formData.medical_history.chronic_conditions.includes(condition)
                              ? "bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 text-white border-0 shadow-lg scale-105"
                              : "bg-blue-100 dark:bg-purple-900 text-blue-800 dark:text-purple-200 border-2 border-blue-400 dark:border-purple-600 hover:scale-105"
                          }`}
                          onClick={() => toggleCondition(condition)}
                        >
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                      Additional Notes (Optional):
                    </label>
                    <Textarea
                      value={formData.referral_reason}
                      onChange={(e) => setFormData({...formData, referral_reason: e.target.value})}
                      placeholder="Any other relevant medical information?"
                      rows={3}
                      className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="text-lg px-8 py-6 border-3 border-blue-400 dark:border-purple-600 text-blue-800 dark:text-purple-200 hover:bg-blue-100 dark:hover:bg-purple-900 font-black"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-black"
                    >
                      Review <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-4xl flex items-center gap-4 text-blue-800 dark:text-purple-200 font-black">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    Review Your Information
                  </CardTitle>
                  <p className="text-blue-700 dark:text-purple-300 mt-3 text-lg font-semibold">
                    Please verify your information before submitting
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-5">
                    <div className="p-6 bg-blue-100 dark:bg-purple-900 rounded-2xl border-3 border-blue-300 dark:border-purple-700">
                      <h3 className="font-black text-xl mb-3 text-blue-900 dark:text-purple-100">Primary Symptoms</h3>
                      <p className="text-blue-800 dark:text-purple-200 text-lg font-semibold">{formData.primary_symptoms}</p>
                    </div>

                    {formData.symptom_details && (
                      <div className="p-6 bg-cyan-100 dark:bg-pink-900 rounded-2xl border-3 border-cyan-300 dark:border-pink-700">
                        <h3 className="font-black text-xl mb-3 text-cyan-900 dark:text-pink-100">Detailed Description</h3>
                        <p className="text-cyan-800 dark:text-pink-200 text-lg font-semibold">{formData.symptom_details}</p>
                      </div>
                    )}

                    {formData.red_flags && formData.red_flags.length > 0 && (
                      <div className="p-6 bg-red-100 dark:bg-red-900 rounded-2xl border-3 border-red-400 dark:border-red-700">
                        <h3 className="font-black text-xl mb-3 text-red-900 dark:text-red-100 flex items-center gap-2">
                          <AlertTriangle className="w-6 h-6" />
                          Red Flags Reported
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.red_flags.map(flag => (
                            <Badge key={flag} className="bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 border-2 border-red-400 dark:border-red-600 px-4 py-2 font-bold text-base">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-teal-100 dark:bg-rose-900 rounded-2xl border-3 border-teal-300 dark:border-rose-700">
                      <h3 className="font-black text-xl mb-4 text-teal-900 dark:text-rose-100">Pregnancy & Menstrual Status</h3>
                      <div className="space-y-2 text-teal-800 dark:text-rose-200 text-lg font-semibold">
                        {formData.medical_history.is_pregnant ? (
                          <>
                            <p>• Currently Pregnant: Yes</p>
                            {formData.medical_history.gestational_age && (
                              <p>• Gestational Age: {formData.medical_history.gestational_age} weeks</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p>• Currently Pregnant: No</p>
                            {formData.medical_history.menstrual_cycle && (
                              <p>• Menstrual Cycle: {formData.medical_history.menstrual_cycle}</p>
                            )}
                            {formData.medical_history.last_menstrual_period && (
                              <p>• Last Menstrual Period: {formData.medical_history.last_menstrual_period}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-6 bg-sky-100 dark:bg-indigo-900 rounded-2xl border-3 border-sky-300 dark:border-indigo-700">
                      <h3 className="font-black text-xl mb-4 text-sky-900 dark:text-indigo-100">Medical History</h3>
                      <div className="space-y-2 text-sky-800 dark:text-indigo-200 text-lg font-semibold">
                        {formData.medical_history.current_medications && (
                          <p>• Current Medications: {formData.medical_history.current_medications}</p>
                        )}
                        {formData.medical_history.allergies && (
                          <p>• Allergies: {formData.medical_history.allergies}</p>
                        )}
                        <p>• Previous OB/GYN Surgeries: {formData.medical_history.previous_surgeries ? 'Yes' : 'No'}</p>
                        {formData.medical_history.chronic_conditions.length > 0 && (
                          <div>
                            <p className="mb-2">• Chronic Conditions:</p>
                            <div className="flex flex-wrap gap-2 ml-4">
                              {formData.medical_history.chronic_conditions.map(condition => (
                                <Badge key={condition} className="bg-sky-200 dark:bg-indigo-800 text-sky-900 dark:text-indigo-100 border-2 border-sky-400 dark:border-indigo-600 px-3 py-1 font-bold">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      disabled={loading}
                      className="text-lg px-8 py-6 border-3 border-blue-400 dark:border-purple-600 text-blue-800 dark:text-purple-200 hover:bg-blue-100 dark:hover:bg-purple-900 font-black"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={analyzeSymptoms}
                      disabled={loading}
                      className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-black"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Get Recommendation <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {step === 4 && result && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-8">
                {/* Gradient Header Stripe */}
                <div className="h-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-600 dark:via-pink-500 dark:to-rose-500 rounded-full shadow-lg"></div>

                <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-4xl mb-3 text-blue-800 dark:text-purple-200 font-black">Triage Analysis Results</CardTitle>
                        <p className="text-blue-700 dark:text-purple-300 text-lg font-semibold">
                          Subspecialty recommendations based on your symptoms
                        </p>
                      </div>
                      <Badge className={`${getRiskColor(result.risk_level)} px-6 py-3 text-lg font-black shadow-lg`}>
                        {result.risk_level.toUpperCase()} RISK
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Top Recommendation */}
                    <div className="text-center p-10 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 rounded-3xl text-white shadow-2xl">
                      <p className="text-base opacity-95 mb-3 font-bold">Top Recommended Specialty:</p>
                      <h2 className="text-5xl font-black mb-6 drop-shadow-lg">{result.top_recommendation}</h2>
                      <div className="flex items-center justify-center gap-6">
                        <div>
                          <p className="text-base opacity-95 font-bold">Match Score</p>
                          <p className="text-4xl font-black mt-1">{result.subspecialty_rankings[0].score}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Subspecialty Rankings Bar Chart */}
                    <div className="p-8 bg-cyan-100 dark:bg-blue-900 rounded-2xl border-3 border-cyan-300 dark:border-blue-700 shadow-lg">
                      <h3 className="font-black text-2xl mb-6 flex items-center gap-3 text-cyan-900 dark:text-blue-100">
                        <Activity className="w-7 h-7" />
                        Subspecialty Match Analysis
                      </h3>
                      <div className="space-y-4">
                        {result.subspecialty_rankings.map((specialty, index) => (
                          <div key={specialty.name} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-lg text-cyan-900 dark:text-blue-100">
                                {index + 1}. {specialty.name}
                              </span>
                              <span className="font-black text-xl text-cyan-700 dark:text-blue-300">
                                {specialty.score}%
                              </span>
                            </div>
                            <div className="relative h-8 bg-cyan-200 dark:bg-blue-950 rounded-full overflow-hidden shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${specialty.score}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className={`h-full rounded-full ${
                                  index === 0
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500'
                                    : index === 1
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-purple-500 dark:to-pink-400'
                                    : 'bg-gradient-to-r from-blue-400 to-cyan-300 dark:from-purple-400 dark:to-pink-300'
                                }`}
                                style={{ 
                                  boxShadow: index === 0 ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none' 
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Clinical Explanation */}
                    <div className="p-8 bg-teal-100 dark:bg-rose-900 rounded-2xl border-3 border-teal-300 dark:border-rose-700 shadow-lg">
                      <h3 className="font-black text-xl mb-4 flex items-center gap-3 text-teal-900 dark:text-rose-100">
                        <FileText className="w-6 h-6" />
                        Clinical Reasoning
                      </h3>
                      <p className="text-teal-800 dark:text-rose-200 leading-relaxed text-lg font-semibold">
                        {result.clinical_explanation}
                      </p>
                    </div>

                    {/* High Risk Warning */}
                    {result.risk_level === "high" && (
                      <div className="p-8 bg-red-100 dark:bg-red-900 border-4 border-red-400 dark:border-red-700 rounded-2xl shadow-lg">
                        <div className="flex items-start gap-4">
                          <AlertTriangle className="w-8 h-8 text-red-700 dark:text-red-300 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-black text-red-900 dark:text-red-100 mb-3 text-xl">
                              High Priority Case
                            </h3>
                            <p className="text-red-800 dark:text-red-200 font-semibold text-lg">
                              Your symptoms indicate a need for urgent evaluation. We recommend contacting a specialist as soon as possible.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-5 pt-6">
                      <Button
                        className="flex-1 text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-black"
                        onClick={() => alert("Referral sent to provider network!")}
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send to Provider
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-lg px-8 py-6 border-3 border-blue-400 dark:border-purple-600 text-blue-800 dark:text-purple-200 hover:bg-blue-100 dark:hover:bg-purple-900 font-black"
                        onClick={() => {
                          setStep(1);
                          setResult(null);
                          setFormData({
                            primary_symptoms: "",
                            symptom_details: "",
                            red_flags: [],
                            medical_history: {
                              is_pregnant: false,
                              gestational_age: "",
                              menstrual_cycle: "",
                              last_menstrual_period: "",
                              current_medications: "",
                              allergies: "",
                              previous_surgeries: false,
                              bleeding_disorder: false,
                              chronic_conditions: []
                            },
                            referral_reason: ""
                          });
                        }}
                      >
                        Start New Triage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}