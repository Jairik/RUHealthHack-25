import React, { useState } from "react";
import { 
  Activity, AlertTriangle, CheckCircle2, Clock, 
  TrendingUp, Calendar, FileText, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  // Dummy data so the page renders
  const triageCases = [];
  const isLoading = false;

  const stats = {
    total: triageCases.length,
    completed: triageCases.filter(c => c.status === 'completed' || c.status === 'referred').length,
    highRisk: triageCases.filter(c => c.risk_level === 'high').length
  };

  const recentCases = triageCases.slice(0, 5);

  const specialtyDistribution = triageCases.reduce((acc, case_) => {
    acc[case_.recommendation] = (acc[case_.recommendation] || 0) + 1;
    return acc;
  }, {});

  const getRiskColor = (level) => {
    switch(level) {
      case "high": return "bg-red-200 text-red-900 border-2 border-red-400 dark:bg-red-900 dark:text-red-100 dark:border-red-600";
      case "medium": return "bg-yellow-200 text-yellow-900 border-2 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-600";
      default: return "bg-green-200 text-green-900 border-2 border-green-400 dark:bg-green-900 dark:text-green-100 dark:border-green-600";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'referred': return <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'reviewed': return <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default: return <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-blue-600 dark:text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-blue-800 dark:text-purple-200">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-200 dark:bg-purple-900 rounded-full mb-6 border-2 border-blue-300 dark:border-purple-700">
              <TrendingUp className="w-5 h-5 text-blue-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-blue-900 dark:text-purple-200">
                Your Health Dashboard
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
              Welcome back, {user?.full_name || 'User'}
            </h1>
            
            <p className="text-xl text-blue-700 dark:text-purple-300 font-semibold">
              Here's an overview of your health journey with FemPath
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Triages", value: stats.total, icon: FileText, gradient: "from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, gradient: "from-teal-500 to-green-400 dark:from-rose-600 dark:to-orange-500" },
            { label: "High Priority", value: stats.highRisk, icon: AlertTriangle, gradient: "from-orange-500 to-red-400 dark:from-orange-600 dark:to-red-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 hover:scale-105 transition-all rounded-xl">
                <div className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-xl`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-black text-blue-800 dark:text-purple-200 mb-2">{stat.value}</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-purple-400">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Triage Cases */}
          <div className="lg:col-span-2">
            <div className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 rounded-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 text-blue-800 dark:text-purple-200 text-2xl font-black mb-4">
                  <Activity className="w-7 h-7" />
                  Recent Triage Cases
                </div>
                {recentCases.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-blue-300 dark:text-purple-700 mx-auto mb-4" />
                    <p className="text-lg font-bold text-blue-800 dark:text-purple-200 mb-2">
                      No triage cases yet
                    </p>
                    <p className="text-blue-600 dark:text-purple-400 mb-6">
                      Start your first triage to get personalized recommendations
                    </p>
                    <Link to={createPageUrl("Triage")}>
                      <button className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-bold px-6 py-3 rounded">
                        <Activity className="w-5 h-5 mr-2 inline-block" />
                        Start Triage
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCases.map((case_, index) => (
                      <motion.div key={case_.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="p-5 bg-blue-50 dark:bg-purple-900/30 rounded-xl border-2 border-blue-200 dark:border-purple-700 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(case_.status)}
                              <span className="font-black text-lg text-blue-900 dark:text-purple-100">{case_.recommendation}</span>
                            </div>
                            <p className="text-sm text-blue-700 dark:text-purple-300 font-semibold line-clamp-2">{case_.primary_symptoms}</p>
                          </div>
                          <span className={`${getRiskColor(case_.risk_level)} font-bold flex-shrink-0 px-2 py-1 text-xs rounded`}>{case_.risk_level?.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-blue-600 dark:text-purple-400 font-semibold">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(case_.created_date), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            {case_.confidence_score}% confidence
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specialty Distribution */}
          <div>
            <div className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 rounded-xl p-6">
              <div className="flex items-center gap-3 text-blue-800 dark:text-purple-200 text-2xl font-black mb-4">
                <TrendingUp className="w-7 h-7" />
                Recommendations
              </div>
              {Object.keys(specialtyDistribution).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-blue-700 dark:text-purple-300 font-semibold">No data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(specialtyDistribution).sort(([,a], [,b]) => b - a).map(([specialty, count], index) => (
                    <motion.div key={specialty} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-blue-800 dark:text-purple-200">{specialty}</span>
                        <span className="bg-blue-200 dark:bg-purple-900 text-blue-900 dark:text-purple-100 border-2 border-blue-400 dark:border-purple-600 font-bold px-2 py-1 rounded text-xs">{count}</span>
                      </div>
                      <div className="h-2 bg-blue-200 dark:bg-purple-900 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(count / stats.total) * 100}%` }} transition={{ duration: 0.8, delay: index * 0.1 }} className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-4 border-blue-400 dark:border-purple-600 shadow-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-700 dark:via-pink-600 dark:to-rose-600 text-white rounded-xl">
          <div className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-4 drop-shadow-lg">Need Medical Guidance?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto font-semibold opacity-95">
              Our AI-powered triage system is ready to help you find the right specialist
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Triage")}>
                <button className="text-lg px-10 py-6 bg-white text-blue-700 dark:text-purple-700 hover:scale-105 shadow-2xl font-black rounded inline-flex items-center justify-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Start New Triage
                </button>
              </Link>
              <Link to={createPageUrl("Resources")}>
                <button className="text-lg px-10 py-6 bg-white/10 backdrop-blur-xl border-2 border-white hover:bg-white/20 hover:scale-105 text-white font-black rounded inline-flex items-center justify-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Browse Resources
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
