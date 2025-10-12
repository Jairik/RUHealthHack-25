
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Star, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SubspecialistPanel({ subspecialists, conditions, doctorMatches }) {
  const matchLabels = ["Best Match", "Top Match", "Second Match"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Subspecialist Confidence */}
      <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-purple-200 text-lg font-black">
            <TrendingUp className="w-5 h-5" />
            Subspecialist Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subspecialists && subspecialists.map((subspecialist, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-purple-200">
                    {subspecialist.name}
                  </span>
                  <Badge className={`${
                    subspecialist.confidence >= 70
                      ? 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600'
                      : subspecialist.confidence >= 40
                      ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-yellow-400 dark:border-yellow-600'
                      : 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-400 dark:border-red-600'
                  } border-2 font-black px-2 py-0.5 text-xs`}>
                    {Math.round(subspecialist.confidence)}%
                  </Badge>
                </div>
                <Progress 
                  value={subspecialist.confidence} 
                  className="h-2 bg-indigo-200 dark:bg-purple-900"
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Condition Probability Guesses */}
      <Card className="border-3 border-rose-300 dark:border-rose-700 shadow-xl bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-lg font-black">
            <AlertCircle className="w-5 h-5" />
            Condition Probability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conditions && conditions.map((condition, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    {condition.name}
                  </span>
                  <Badge className={`${
                    condition.probability >= 60
                      ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-400 dark:border-red-600'
                      : condition.probability >= 30
                      ? 'bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-orange-400 dark:border-orange-600'
                      : 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-yellow-400 dark:border-yellow-600'
                  } border-2 font-black px-2 py-0.5 text-xs`}>
                    {Math.round(condition.probability)}%
                  </Badge>
                </div>
                <Progress 
                  value={condition.probability} 
                  className="h-2 bg-rose-200 dark:bg-rose-900"
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctor Matches - Top 3 Only */}
      <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-purple-200 text-lg font-black">
            <Users className="w-5 h-5" />
            Top 3 Doctors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {doctorMatches && doctorMatches.slice(0, 3).map((doctor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-3 bg-purple-100 dark:bg-pink-900/30 rounded-xl border-2 border-purple-300 dark:border-pink-700"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <Badge className={`${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                        : 'bg-indigo-200 dark:bg-purple-900 text-indigo-900 dark:text-purple-100 border-2 border-indigo-400 dark:border-purple-600'
                    } font-black mb-1 text-xs`}>
                      {matchLabels[index]}
                      {index === 0 && <Star className="w-2 h-2 ml-1 inline" />}
                    </Badge>
                    <p className="text-sm font-black text-purple-900 dark:text-pink-100">
                      Dr. {doctor.name}
                    </p>
                    <p className="text-xs font-semibold text-purple-700 dark:text-pink-300">
                      {doctor.specialty}
                    </p>
                  </div>
                  <Badge className="bg-indigo-200 dark:bg-rose-900 text-indigo-900 dark:text-rose-100 border-2 border-indigo-400 dark:border-rose-600 font-bold text-xs">
                    {doctor.availability}
                  </Badge>
                </div>
                {doctor.credentials && (
                  <p className="text-xs text-purple-600 dark:text-pink-400 font-semibold">
                    {doctor.credentials}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
