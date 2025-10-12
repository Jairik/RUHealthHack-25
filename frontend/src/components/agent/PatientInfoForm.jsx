
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Calendar, Loader2, Hash } from "lucide-react";
import { motion } from "framer-motion";

export default function PatientInfoForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    agentId: "",
    firstName: "",
    lastName: "",
    dob: ""
  });
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.agentId.trim()) {
      newErrors.agentId = "Agent ID is required";
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-4xl flex items-center gap-4 text-indigo-800 dark:text-purple-200 font-black">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-3xl flex items-center justify-center shadow-xl">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              Patient Information
            </CardTitle>
            <p className="text-indigo-700 dark:text-purple-300 mt-3 text-lg font-semibold">
              Enter agent ID and patient details to begin triage
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-base font-bold mb-3 text-indigo-800 dark:text-purple-200 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Agent ID *
                </label>
                <Input
                  value={formData.agentId}
                  onChange={(e) => setFormData({...formData, agentId: e.target.value})}
                  placeholder="Enter your agent ID"
                  className={`text-lg bg-white dark:bg-slate-950 text-indigo-900 dark:text-purple-100 border-3 ${
                    errors.agentId 
                      ? 'border-red-500 dark:border-red-600' 
                      : 'border-indigo-400 dark:border-purple-600'
                  } focus:border-indigo-600 dark:focus:border-purple-400 font-semibold`}
                />
                {errors.agentId && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-semibold">
                    {errors.agentId}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t-2 border-indigo-200 dark:border-purple-800">
                <p className="text-sm font-bold text-indigo-700 dark:text-purple-300 mb-4">
                  Patient Information:
                </p>
              </div>

              <div>
                <label className="block text-base font-bold mb-3 text-indigo-800 dark:text-purple-200">
                  First Name *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Enter patient's first name"
                  className={`text-lg bg-white dark:bg-slate-950 text-indigo-900 dark:text-purple-100 border-3 ${
                    errors.firstName 
                      ? 'border-red-500 dark:border-red-600' 
                      : 'border-indigo-400 dark:border-purple-600'
                  } focus:border-indigo-600 dark:focus:border-purple-400 font-semibold`}
                />
                {errors.firstName && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-semibold">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-base font-bold mb-3 text-indigo-800 dark:text-purple-200">
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Enter patient's last name"
                  className={`text-lg bg-white dark:bg-slate-950 text-indigo-900 dark:text-purple-100 border-3 ${
                    errors.lastName 
                      ? 'border-red-500 dark:border-red-600' 
                      : 'border-indigo-400 dark:border-purple-600'
                  } focus:border-indigo-600 dark:focus:border-purple-400 font-semibold`}
                />
                {errors.lastName && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-semibold">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-base font-bold mb-3 text-indigo-800 dark:text-purple-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className={`text-lg bg-white dark:bg-slate-950 text-indigo-900 dark:text-purple-100 border-3 ${
                    errors.dob 
                      ? 'border-red-500 dark:border-red-600' 
                      : 'border-indigo-400 dark:border-purple-600'
                  } focus:border-indigo-600 dark:focus:border-purple-400 font-semibold`}
                />
                {errors.dob && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-semibold">
                    {errors.dob}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-lg px-8 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 hover:scale-105 shadow-xl text-white font-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Retrieving Patient Data...
                  </>
                ) : (
                  'Next: Begin Triage'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
