import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Check for Web Speech API support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export default function QuestionPanel({ currentQuestion, questionHistory, onSubmitAnswer, loading }) {
  const [answer, setAnswer] = useState("");
  const scrollRef = useRef(null);

  // Check if this is the first question
  const isFirstQuestion = questionHistory.length === 0;

  // Auto-scroll to the bottom of the history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questionHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmitAnswer(answer);
      setAnswer("");
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
                {isFirstQuestion ? 'Initial Question:' : 'Current Question:'}
              </p>
              <p className="text-lg font-black">{currentQuestion}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                  Patient's Answer:
                </label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type or transcribe patient's response..."
                  rows={4}
                  disabled={loading}
                  className="text-lg bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 font-semibold resize-none"
                />
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