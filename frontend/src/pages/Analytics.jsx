import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, TrendingUp, Users, Clock, Activity,
  FileText, Award, AlertTriangle, Database
} from "lucide-react";
import { motion } from "framer-motion";

// Process real triage data into analytics
const processTriageData = (triages) => {
  if (!triages || triages.length === 0) {
    return {
      total: 0,
      casesBySubspecialty: [],
      topConditions: [],
      hourlyData: Array.from({ length: 24 }, (_, i) => ({ hour: i, cases: 0 })),
      avgConfidence: 0,
      agents: []
    };
  }

  // Count subspecialties from final_recommendation field
  const subspecialtyCounts = {};
  const agentData = {};
  const hourCounts = Array(24).fill(0);
  let totalConfidence = 0;
  let confidenceCount = 0;

  triages.forEach((triage) => {
    // Count by final_recommendation (top subspecialty)
    const topSpec = triage.final_recommendation;
    if (topSpec) {
      subspecialtyCounts[topSpec] = (subspecialtyCounts[topSpec] || 0) + 1;
    }

    // Track confidence score
    const confScore = triage.confidence_score;
    if (typeof confScore === 'number' && confScore > 0) {
      totalConfidence += confScore;
      confidenceCount++;
    }

    // Count by agent
    const agentId = triage.agent_id || 'Unknown Agent';
    if (!agentData[agentId]) {
      agentData[agentId] = { cases: 0, totalConfidence: 0, confCount: 0 };
    }
    agentData[agentId].cases++;
    if (typeof confScore === 'number' && confScore > 0) {
      agentData[agentId].totalConfidence += confScore;
      agentData[agentId].confCount++;
    }

    // Count by hour from created_date
    if (triage.created_date) {
      try {
        const dateStr = triage.created_date;
        // Handle both ISO format and SQLite format "YYYY-MM-DD HH:MM:SS"
        const date = new Date(dateStr.replace(' ', 'T'));
        if (!isNaN(date.getTime())) {
          const hour = date.getHours();
          hourCounts[hour]++;
        }
      } catch (e) {
        console.log('Date parse error:', e);
      }
    }
  });

  // Build subspecialty array sorted by count
  const casesBySubspecialty = Object.entries(subspecialtyCounts)
    .map(([name, cases]) => ({
      name,
      cases,
      percentage: Math.round((cases / triages.length) * 100)
    }))
    .sort((a, b) => b.cases - a.cases);

  // Build agents array with confidence
  const agents = Object.entries(agentData)
    .map(([name, data], idx) => ({
      id: idx + 1,
      name: name === 'null' || !name ? 'Agent (Unknown)' : `Agent ${name}`,
      cases: data.cases,
      avgTime: '~2:30',
      accuracy: data.confCount > 0 ? Math.round(data.totalConfidence / data.confCount) : 0
    }))
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10);

  // Build hourly data
  const hourlyData = hourCounts.map((cases, hour) => ({ hour, cases }));

  // Calculate average confidence
  const avgConfidence = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;

  return {
    total: triages.length,
    casesBySubspecialty,
    topConditions: casesBySubspecialty.slice(0, 5).map(s => ({ name: s.name, count: s.cases })),
    hourlyData,
    avgConfidence,
    agents
  };
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    const fetchTriages = async () => {
      try {
        const response = await fetch('/api/triages?page=1&page_size=200');
        if (!response.ok) throw new Error(`Failed to load data (${response.status})`);

        const result = await response.json();
        const items = Array.isArray(result?.items) ? result.items : [];

        console.log('Analytics raw data:', items.slice(0, 2)); // Debug log
        setRawData(items);

        const processedData = processTriageData(items);
        console.log('Analytics processed:', processedData); // Debug log
        setData(processedData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTriages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-indigo-600 dark:text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-xl font-bold text-indigo-800 dark:text-purple-200">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-bold text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Cases", value: data.total, icon: FileText, color: "from-indigo-500 to-purple-500" },
    { label: "Subspecialties", value: data.casesBySubspecialty.length, icon: Activity, color: "from-purple-500 to-pink-500" },
    { label: "Agents", value: data.agents.length, icon: Users, color: "from-pink-500 to-rose-500" },
    { label: "Avg. Confidence", value: `${data.avgConfidence}%`, icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
  ];

  const getSubspecialtyColor = (name) => {
    const colors = {
      'General OB/GYN': 'bg-sky-500',
      'Gynecologic Oncology': 'bg-rose-500',
      'Urogynecology': 'bg-teal-500',
      'Minimally Invasive Surgery': 'bg-indigo-500',
      'Maternal-Fetal Medicine': 'bg-purple-500',
      'Reproductive Endocrinology': 'bg-emerald-500'
    };
    return colors[name] || 'bg-slate-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-200 dark:bg-purple-900 rounded-full mb-6 border-2 border-indigo-300 dark:border-purple-700">
              <Database className="w-5 h-5 text-indigo-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-indigo-900 dark:text-purple-200">
                Live Data from {data.total} Triage Cases
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-indigo-700 dark:text-purple-300 font-semibold">
              Real insights from your triage database
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900 hover:scale-105 transition-all">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-black text-indigo-800 dark:text-purple-200 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-purple-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {data.total === 0 ? (
          <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <Database className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-indigo-800 dark:text-purple-200 mb-2">No Triage Cases Yet</h3>
              <p className="text-indigo-600 dark:text-purple-400">Complete some triage sessions and return here to see analytics.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Cases by Subspecialty */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-black text-indigo-900 dark:text-purple-100">
                      <Activity className="w-5 h-5" />
                      Cases by Subspecialty
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.casesBySubspecialty.length > 0 ? data.casesBySubspecialty.map((sub, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-800 dark:text-purple-200 text-sm">{sub.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-indigo-600 dark:text-purple-400">{sub.cases} cases</span>
                            <Badge className="bg-indigo-100 dark:bg-purple-900 text-indigo-800 dark:text-purple-200 border border-indigo-300 dark:border-purple-600">
                              {sub.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <div className="h-3 bg-indigo-100 dark:bg-purple-900 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${sub.percentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }} className={`h-full ${getSubspecialtyColor(sub.name)} rounded-full`} />
                        </div>
                      </div>
                    )) : <p className="text-indigo-600 dark:text-purple-400 italic">No subspecialty data available</p>}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Subspecialties (using same data since we don't have conditions) */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-black text-indigo-900 dark:text-purple-100">
                      <AlertTriangle className="w-5 h-5" />
                      Top Subspecialties Triaged
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.topConditions.length > 0 ? data.topConditions.map((condition, index) => (
                      <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-purple-900/30 rounded-xl border border-indigo-200 dark:border-purple-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-bold text-indigo-800 dark:text-purple-200 text-sm">{condition.name}</span>
                        </div>
                        <Badge className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 font-bold">
                          {condition.count} cases
                        </Badge>
                      </motion.div>
                    )) : <p className="text-indigo-600 dark:text-purple-400 italic">No data available</p>}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Hourly Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mb-12">
              <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-black text-indigo-900 dark:text-purple-100">
                    <Clock className="w-5 h-5" />
                    Case Distribution by Hour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.hourlyData.some(h => h.cases > 0) ? (
                    <div className="flex items-end justify-between gap-1 h-40">
                      {data.hourlyData.map((hour, index) => {
                        const maxCases = Math.max(...data.hourlyData.map(h => h.cases), 1);
                        const height = maxCases > 0 ? (hour.cases / maxCases) * 100 : 0;
                        const isBusinessHour = hour.hour >= 8 && hour.hour <= 17;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(height, hour.cases > 0 ? 5 : 0)}%` }}
                              transition={{ duration: 0.5, delay: index * 0.02 }}
                              className={`w-full rounded-t-sm ${hour.cases > 0 ? (isBusinessHour ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : 'bg-indigo-300 dark:bg-purple-700') : 'bg-indigo-100 dark:bg-purple-900'}`}
                              title={`${hour.hour}:00 - ${hour.cases} cases`}
                            />
                            {index % 4 === 0 && <span className="text-xs text-indigo-600 dark:text-purple-400 font-bold">{hour.hour}:00</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center">
                      <p className="text-indigo-600 dark:text-purple-400 italic">No hourly data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Agent Performance */}
            {data.agents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                <Card className="border-3 border-indigo-300 dark:border-purple-700 shadow-xl bg-white dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-black text-indigo-900 dark:text-purple-100">
                      <Award className="w-5 h-5" />
                      Cases by Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-indigo-200 dark:border-purple-700">
                            <th className="text-left py-3 px-4 font-black text-indigo-800 dark:text-purple-200">Rank</th>
                            <th className="text-left py-3 px-4 font-black text-indigo-800 dark:text-purple-200">Agent</th>
                            <th className="text-left py-3 px-4 font-black text-indigo-800 dark:text-purple-200">Cases</th>
                            <th className="text-left py-3 px-4 font-black text-indigo-800 dark:text-purple-200">Avg Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.agents.map((agent, index) => (
                            <motion.tr key={agent.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                              className="border-b border-indigo-100 dark:border-purple-800 hover:bg-indigo-50 dark:hover:bg-purple-900/30">
                              <td className="py-3 px-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                  index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-indigo-400'
                                  }`}>{index + 1}</div>
                              </td>
                              <td className="py-3 px-4 font-bold text-indigo-800 dark:text-purple-200">{agent.name}</td>
                              <td className="py-3 px-4 font-bold text-indigo-700 dark:text-purple-300">{agent.cases}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Progress value={agent.accuracy} className="h-2 w-24 bg-indigo-100 dark:bg-purple-900" />
                                  <Badge className={`${agent.accuracy >= 70 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300' :
                                    agent.accuracy >= 50 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-300' :
                                      agent.accuracy > 0 ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300' :
                                        'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300'
                                    } border font-bold`}>{agent.accuracy}%</Badge>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
