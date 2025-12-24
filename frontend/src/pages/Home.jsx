
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Headphones, Shield, Brain, Lock, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Triage",
      description: "Intelligent questioning system that adapts based on patient responses to recommend the right OB/GYN subspecialist",
      gradient: "from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Confidence",
      description: "Live confidence scores for all 6 subspecialties updated dynamically as you gather more patient information",
      gradient: "from-purple-500 via-pink-500 to-rose-500 dark:from-purple-600 dark:via-pink-600 dark:to-rose-600"
    },
    {
      icon: Users,
      title: "Doctor Matching",
      description: "Automatically matches patients with available specialists based on symptoms, conditions, and urgency",
      gradient: "from-pink-500 via-rose-500 to-red-500 dark:from-pink-600 dark:via-rose-600 dark:to-red-600"
    },
    {
      icon: Shield,
      title: "Complete Records",
      description: "Every conversation is saved with full history, recommendations, and notes for compliance and quality assurance",
      gradient: "from-indigo-500 via-blue-500 to-cyan-500 dark:from-indigo-600 dark:via-blue-600 dark:to-cyan-600"
    }
  ];

  const stats = [
    { label: "Subspecialties", value: "6", icon: Brain },
    { label: "Doctor Network", value: "20+", icon: Users },
    { label: "Triage Accuracy", value: "~95%", icon: TrendingUp },
    { label: "HIPAA Compliant", value: "100%", icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 dark:from-indigo-600/20 dark:via-purple-600/20 dark:to-pink-600/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-200 dark:bg-purple-900 rounded-full mb-8 border-2 border-indigo-300 dark:border-purple-700">
              <Headphones className="w-5 h-5 text-indigo-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-indigo-900 dark:text-purple-200">
                Call Center Agent Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight pb-2">
              Intelligent OB/GYN<br />Triage System
            </h1>

            <p className="text-xl lg:text-2xl text-indigo-700 dark:text-purple-300 mb-12 max-w-3xl mx-auto font-semibold">
              Empower your call center agents with AI-powered triage that connects patients to the right subspecialist every time
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("AgentTriage")}>
                <Button size="lg" className="text-lg px-12 py-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 hover:scale-105 shadow-2xl text-white font-black">
                  <Headphones className="w-6 h-6 mr-3" />
                  Start Triage Call
                </Button>
              </Link>
              <Link to={createPageUrl("Dashboard")}>
                <Button size="lg" variant="outline" className="text-lg px-12 py-8 border-3 border-indigo-300 dark:border-purple-700 hover:bg-indigo-100 dark:hover:bg-purple-900/50 font-black">
                  <TrendingUp className="w-6 h-6 mr-3" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900 hover:shadow-indigo-500/50 dark:hover:shadow-purple-500/50 hover:scale-105 transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-indigo-800 dark:text-purple-200 mb-2">
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
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-6xl font-black mb-6 text-indigo-800 dark:text-purple-200">
            Everything Your Agents Need
          </h2>
          <p className="text-2xl text-indigo-700 dark:text-purple-300 font-semibold">
            Streamline patient triage with intelligent automation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900 hover:shadow-indigo-500/50 dark:hover:shadow-purple-500/50 hover:scale-105 transition-all group cursor-pointer h-full">
                <CardContent className="p-10">
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-xl`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-indigo-800 dark:text-purple-200">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-indigo-700 dark:text-purple-300 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <Card className="border-4 border-indigo-400 dark:border-purple-600 shadow-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 text-white overflow-hidden">
          <CardContent className="p-16 lg:p-20 relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl">
                Ready to Transform Your Call Center?
              </h2>
              <p className="text-2xl mb-12 max-w-2xl mx-auto font-semibold opacity-95">
                Start triaging patients with AI-powered precision today
              </p>
              <Link to={createPageUrl("AgentTriage")}>
                <Button size="lg" className="text-xl px-12 py-8 bg-white text-indigo-700 dark:text-purple-700 hover:scale-105 shadow-2xl font-black">
                  <Headphones className="w-6 h-6 mr-3" />
                  Begin Triage Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
