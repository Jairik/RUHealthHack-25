import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function SubspecialistPanel({ subspecialists, doctorMatches }) {
  const matchLabels = ["Best Match", "Top Match", "Second Match", "Third Match", "Fourth Match", "Fifth Match"];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Subspecialist Confidence */}
      <Card className="border-3 border-blue-300 dark:border-purple-700 shadow-xl bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-purple-200 text-xl font-black">
            <TrendingUp className="w-6 h-6" />
            Subspecialist Confidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {subspecialists && subspecialists.map((subspecialist, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-900 dark:text-purple-200">
                    {subspecialist.name}
                  </span>
                  <Badge className={`${
                    subspecialist.confidence >= 70
                      ? 'bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600'
                      : subspecialist.confidence >= 40
                      ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-yellow-400 dark:border-yellow-600'
                      : 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-400 dark:border-red-600'
                  } border-2 font-black px-3 py-1`}>
                    {subspecialist.confidence}%
                  </Badge>
                </div>
                <Progress 
                  value={subspecialist.confidence} 
                  className="h-3 bg-blue-200 dark:bg-purple-900"
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctor Matches */}
      <Card className="border-3 border-blue-300 dark:border-purple-700 shadow-xl bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-purple-200 text-xl font-black">
            <Users className="w-6 h-6" />
            Recommended Doctors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doctorMatches && doctorMatches.map((doctor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-4 bg-cyan-100 dark:bg-pink-900/30 rounded-xl border-2 border-cyan-300 dark:border-pink-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge className={`${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0'
                        : 'bg-blue-200 dark:bg-purple-900 text-blue-900 dark:text-purple-100 border-2 border-blue-400 dark:border-purple-600'
                    } font-black mb-2`}>
                      {index < matchLabels.length ? matchLabels[index] : `Match ${index + 1}`}
                      {index === 0 && <Star className="w-3 h-3 ml-1 inline" />}
                    </Badge>
                    <p className="text-lg font-black text-cyan-900 dark:text-pink-100">
                      Dr. {doctor.name}
                    </p>
                    <p className="text-sm font-semibold text-cyan-700 dark:text-pink-300">
                      {doctor.specialty}
                    </p>
                  </div>
                  <Badge className="bg-teal-200 dark:bg-rose-900 text-teal-900 dark:text-rose-100 border-2 border-teal-400 dark:border-rose-600 font-bold">
                    {doctor.availability}
                  </Badge>
                </div>
                {doctor.credentials && (
                  <p className="text-xs text-cyan-600 dark:text-pink-400 font-semibold">
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