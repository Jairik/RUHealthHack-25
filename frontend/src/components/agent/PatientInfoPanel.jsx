import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function PatientInfoPanel({ patient }) {
  return (
    <Card className="border-3 border-blue-300 dark:border-purple-700 shadow-xl bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-purple-200 text-xl font-black">
          <UserCircle className="w-6 h-6" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-blue-600 dark:text-purple-400 mb-1">Full Name</p>
              <p className="text-lg font-black text-blue-900 dark:text-purple-100">
                {patient.firstName} {patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-blue-600 dark:text-purple-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date of Birth
              </p>
              <p className="text-lg font-black text-blue-900 dark:text-purple-100">
                {format(new Date(patient.dob), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Health History */}
          <div>
            <p className="text-sm font-bold text-blue-600 dark:text-purple-400 mb-3 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Existing Conditions
            </p>
            {patient.healthHistory && patient.healthHistory.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.healthHistory.map((condition, index) => (
                  <Badge
                    key={index}
                    className="bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-2 border-orange-400 dark:border-orange-600 px-3 py-1 font-bold"
                  >
                    {condition}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-blue-700 dark:text-purple-300 italic">No existing conditions on record</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}