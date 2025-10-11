import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2, Mic, StopCircle } from "lucide-react"; // Added Mic and StopCircle
import { motion, AnimatePresence } from "framer-motion";

// Check for Web Speech API support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export default function QuestionPanel({ currentQuestion, questionHistory, onSubmitAnswer, loading }) {
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false); // New state for microphone status
  const recognitionRef = useRef(null); // Ref to store the SpeechRecognition object
  const scrollRef = useRef(null);

  // Auto-scroll to the bottom of the history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questionHistory]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (isSpeechRecognitionSupported) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // For continuous recording until stopped
      recognition.interimResults = true; // Get results while speaking
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
        
        // Update the textarea with the transcription
        // Note: For 'continuous' set to true, you might want to only append the final transcript
        // For simplicity here, we'll replace the text with the ongoing transcription.
        // A more complex setup might manage initial text vs transcription text.
        setAnswer(finalTranscript + interimTranscript); 
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log("Speech recognition ended.");
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []); // Run only once on mount

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      // Optional: Clear previous answer when starting to listen
      // setAnswer(""); 
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log("Speech recognition started.");
      } catch (error) {
        // Catch the error if recognition is already in progress
        console.warn("Recognition start failed, possibly already started:", error);
        setIsListening(true);
      }
    } else if (!isSpeechRecognitionSupported) {
        alert("Speech-to-Text is not supported in this browser. Please use a supported browser like Chrome.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("Speech recognition stopped.");
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isListening) {
        stopListening(); // Stop listening before submitting
    }
    if (answer.trim()) {
      onSubmitAnswer(answer);
      setAnswer("");
    }
  };

  return (
    <Card className="border-3 border-blue-300 dark:border-purple-700 shadow-xl bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-purple-200 text-xl font-black">
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
            {questionHistory.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {/* Question */}
                <div className="p-4 bg-blue-100 dark:bg-purple-900/30 rounded-xl border-2 border-blue-300 dark:border-purple-700">
                  <p className="text-sm font-bold text-blue-600 dark:text-purple-400 mb-1">
                    Question {index + 1}:
                  </p>
                  <p className="text-base font-semibold text-blue-900 dark:text-purple-100">
                    {item.question}
                  </p>
                </div>
                
                {/* Answer */}
                <div className="p-4 bg-cyan-100 dark:bg-pink-900/30 rounded-xl border-2 border-cyan-300 dark:border-pink-700 ml-6">
                  <p className="text-sm font-bold text-cyan-600 dark:text-pink-400 mb-1">
                    Patient Response:
                  </p>
                  <p className="text-base font-semibold text-cyan-900 dark:text-pink-100">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 rounded-xl text-white">
              <p className="text-sm font-bold mb-2 opacity-90">Current Question:</p>
              <p className="text-lg font-black">{currentQuestion}</p>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                  Patient's Answer:
                </label>
                
                <div className="relative">
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type or transcribe patient's response..."
                      rows={4}
                      disabled={loading}
                      className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold resize-none pr-14" // Added pr-14 for icon space
                    />
                    
                    {/* Microphone Button */}
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
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !answer.trim()}
                className="w-full text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Answer
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}