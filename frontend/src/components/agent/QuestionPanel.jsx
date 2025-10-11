import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionPanel({ currentQuestion, questionHistory, onSubmitAnswer, loading }) {
  const [answer, setAnswer] = useState("");
  const scrollRef = useRef(null);

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