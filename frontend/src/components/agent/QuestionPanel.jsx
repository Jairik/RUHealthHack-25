import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2, CheckCircle, XCircle, SkipForward, Mic, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Check for Web Speech API support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

// --- Custom Speech-to-Text Hook ---
const useSpeechToText = (currentValue, setValue) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(currentValue); // Stores confirmed text

  // Update ref when external value changes (e.g., manual typing)
  useEffect(() => {
      if (!isListening) {
          finalTranscriptRef.current = currentValue;
      }
  }, [currentValue, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  useEffect(() => {
    if (isSpeechRecognitionSupported) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }

        // Update the state (Textarea value) with previous final text + current interim text
        setValue(finalTranscriptRef.current + interimTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, [setValue]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      // Set the ref to the current manual input value before starting
      finalTranscriptRef.current = currentValue;
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        // Handle case where recognition is already active
        console.warn("Recognition start failed, possibly already started:", error);
        setIsListening(true);
      }
    } else if (!isSpeechRecognitionSupported) {
        alert("Speech-to-Text is not supported in this browser. Please use a supported browser like Chrome.");
    }
  };

  const clearTranscription = () => {
    finalTranscriptRef.current = "";
    // Note: setValue("") is handled by the component's handleSubmit logic
    stopListening();
  };

  return { isListening, startListening, stopListening, clearTranscription };
};
// --- End Custom Hook ---

// --- Helper component to render the Mic/Stop button ---
const MicButton = ({ isListening, startListening, stopListening, loading }) => (
    <div className="absolute right-3 top-3">
        {isListening ? (
            <Button
                type="button"
                onClick={stopListening}
                size="icon"
                disabled={loading}
                className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 shadow-md transition-all duration-200"
            >
                <StopCircle className="w-5 h-5 text-white" />
            </Button>
        ) : (
            <Button
                type="button"
                onClick={startListening}
                size="icon"
                disabled={loading || !isSpeechRecognitionSupported}
                className={`w-8 h-8 rounded-full shadow-md transition-all duration-200 ${
                    isSpeechRecognitionSupported
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
        )}
    </div>
);

export default function QuestionPanel({ currentQuestion, questionHistory, onSubmitAnswer, loading }) {
  const [notes, setNotes] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [openEndedAnswer, setOpenEndedAnswer] = useState("");
  const scrollRef = useRef(null);

  // Apply the hook to the Initial Note field
  const { 
    isListening: isListeningInitial, 
    startListening: startListeningInitial, 
    stopListening: stopListeningInitial, 
    clearTranscription: clearTranscriptionInitial 
  } = useSpeechToText(openEndedAnswer, setOpenEndedAnswer);

  // Apply the hook to the Additional Notes field
  const { 
    isListening: isListeningNotes, 
    startListening: startListeningNotes, 
    stopListening: stopListeningNotes, 
    clearTranscription: clearTranscriptionNotes 
  } = useSpeechToText(notes, setNotes);

  // Check if this is the first question
  const isFirstQuestion = questionHistory.length === 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questionHistory]);

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    // Stop recording notes if a structured answer is chosen
    if (isListeningNotes) stopListeningNotes();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isFirstQuestion) {
      stopListeningInitial();
      // For first question, submit the open-ended answer
      if (openEndedAnswer.trim()) {
        onSubmitAnswer(openEndedAnswer.trim());
        setOpenEndedAnswer("");
        clearTranscriptionInitial(); // Clear ref on submit
      }
    } else {
      stopListeningNotes();
      // For subsequent questions, submit yes/no/skip with optional notes
      if (selectedAnswer) {
        const fullAnswer = notes.trim() 
          ? `${selectedAnswer} - ${notes}`
          : selectedAnswer;
        
        onSubmitAnswer(fullAnswer);
        setSelectedAnswer(null);
        setNotes("");
        clearTranscriptionNotes(); // Clear ref on submit
      }
    }
  };

  const getAnswerDisplay = (answer) => {
    // If answer starts with Yes/No/Skip, display it nicely
    if (answer.startsWith('Yes -')) return { type: 'Yes', note: answer.substring(6) };
    if (answer.startsWith('No -')) return { type: 'No', note: answer.substring(5) };
    if (answer.startsWith('Skip -')) return { type: 'Skip', note: answer.substring(7) };
    if (answer === 'Yes') return { type: 'Yes', note: null };
    if (answer === 'No') return { type: 'No', note: null };
    if (answer === 'Skip') return { type: 'Skip', note: null };
    return { type: 'Custom', note: answer };
  };

  const getAnswerBadgeColor = (type) => {
    switch(type) {
      case 'Yes': return 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600';
      case 'No': return 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-400 dark:border-red-600';
      case 'Skip': return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-400 dark:border-gray-600';
      default: return 'bg-cyan-200 dark:bg-pink-900 text-cyan-900 dark:text-pink-100 border-cyan-400 dark:border-pink-600';
    }
  };

  return (
    <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-indigo-800 dark:text-purple-200 text-xl font-black">
          <MessageSquare className="w-6 h-6" />
          Triage Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Question History */}
        <div
          ref={scrollRef}
          className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-2"
        >
          <AnimatePresence>
            {questionHistory.map((item, index) => {
              const answerData = getAnswerDisplay(item.answer);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {/* Question */}
                  <div className="p-4 bg-indigo-100 dark:bg-purple-900/30 rounded-xl border-2 border-indigo-300 dark:border-purple-700">
                    <p className="text-sm font-bold text-indigo-600 dark:text-purple-400 mb-1">
                      Question {index + 1}:
                    </p>
                    <p className="text-base font-semibold text-indigo-900 dark:text-purple-100">
                      {item.question}
                    </p>
                  </div>
                  
                  {/* Answer */}
                  <div className="ml-6">
                    <div className={`inline-block px-4 py-2 rounded-lg border-2 ${getAnswerBadgeColor(answerData.type)} font-bold mb-2`}>
                      {answerData.type}
                    </div>
                    {answerData.note && (
                      <div className="p-3 bg-purple-100 dark:bg-pink-900/30 rounded-xl border-2 border-purple-300 dark:border-pink-700">
                        <p className="text-sm font-bold text-purple-600 dark:text-pink-400 mb-1">
                          {answerData.type === 'Custom' ? 'Response:' : 'Additional Notes:'}
                        </p>
                        <p className="text-base font-semibold text-purple-900 dark:text-pink-100">
                          {answerData.note}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-xl text-white">
              <p className="text-sm font-bold mb-2 opacity-90">
                {isFirstQuestion ? 'Initial Questions:' : 'Current Question:'}
              </p>
              <p className="text-lg font-black">{currentQuestion}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isFirstQuestion ? (
                /* First Question - Open Ended (with Mic) */
                <>
                  <div>
                    <label className="block text-base font-bold mb-3 text-indigo-800 dark:text-purple-200">
                      Patient's Response:
                    </label>
                    <div className="relative">
                    <Textarea
                      value={openEndedAnswer}
                      onChange={(e) => setOpenEndedAnswer(e.target.value)}
                      placeholder="Enter patient's detailed response..."
                      rows={5}
                      disabled={loading}
                      className="text-base bg-white dark:bg-slate-950 text-indigo-900 dark:text-purple-100 border-2 border-indigo-300 dark:border-purple-700 font-semibold resize-none pr-14"
                    />
                     <MicButton
                          isListening={isListeningInitial}
                          startListening={startListeningInitial}
                          stopListening={stopListeningInitial}
                          loading={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !openEndedAnswer.trim()}
                    className="w-full text-lg px-8 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 hover:scale-105 shadow-xl text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Answer & Continue
                      </>
                    )}
                  </Button>
                </>
              ) : (
                /* Subsequent Questions - Yes/No/Skip with Optional Notes (with Mic) */
                <>
                  <div>
                    <label className="block text-base font-bold mb-3 text-indigo-800 dark:text-purple-200">
                      Patient's Response:
                    </label>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <Button
                        type="button"
                        onClick={() => handleAnswerClick('Yes')}
                        disabled={loading}
                        className={`h-20 text-lg font-black ${
                          selectedAnswer === 'Yes'
                            ? 'bg-green-600 dark:bg-green-700 text-white border-4 border-green-800 dark:border-green-500 scale-105'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-3 border-green-400 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-800/50'
                        }`}
                      >
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Yes
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => handleAnswerClick('No')}
                        disabled={loading}
                        className={`h-20 text-lg font-black ${
                          selectedAnswer === 'No'
                            ? 'bg-red-600 dark:bg-red-700 text-white border-4 border-red-800 dark:border-red-500 scale-105'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 border-3 border-red-400 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800/50'
                        }`}
                      >
                        <XCircle className="w-6 h-6 mr-2" />
                        No
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={() => handleAnswerClick('Skip')}
                        disabled={loading}
                        className={`h-20 text-lg font-black ${
                          selectedAnswer === 'Skip'
                            ? 'bg-gray-600 dark:bg-gray-700 text-white border-4 border-gray-800 dark:border-gray-500 scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-3 border-gray-400 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <SkipForward className="w-6 h-6 mr-2" />
                        Skip
                      </Button>
                    </div>
                  </div>

                  {/* Optional Notes Field (with Mic) */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-indigo-700 dark:text-purple-300">
                      Additional Notes (Optional):
                    </label>
                    <div className="relative">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional details about the patient's response..."
                      rows={3}
                      disabled={loading}
                      className="text-base bg-white dark:bg-slate-950 text-indigo-900 dark:text-purple-100 border-2 border-indigo-300 dark:border-purple-700 font-semibold resize-none pr-14"
                    />
                      <MicButton
                          isListening={isListeningNotes}
                          startListening={startListeningNotes}
                          stopListening={stopListeningNotes}
                          loading={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !selectedAnswer}
                    className="w-full text-lg px-8 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 hover:scale-105 shadow-xl text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Answer & Continue
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}