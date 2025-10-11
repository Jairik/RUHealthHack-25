import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Activity, Shield, Sparkles, Brain, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "Smart Triage",
      description: "AI-powered system recommends the right OB/GYN specialist based on your symptoms",
      gradient: "from-blue-500 via-cyan-400 to-teal-400 dark:from-purple-600 dark:via-pink-500 dark:to-rose-500"
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your health data is encrypted and secure with enterprise-grade protection",
      gradient: "from-teal-500 via-cyan-500 to-sky-400 dark:from-pink-600 dark:via-rose-500 dark:to-orange-500"
    }
  ];

  const stats = [
    { label: "Women Empowered", value: "10K+", icon: Activity },
    { label: "Specialists Available", value: "6", icon: Brain },
    { label: "Accuracy Rate", value: "95%", icon: Activity },
    { label: "Secure & Private", value: "100%", icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-200 via-cyan-100 to-transparent dark:from-purple-900 dark:via-pink-900 dark:to-transparent opacity-50"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-pulse animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-200 dark:bg-purple-900 rounded-full mb-8 border-2 border-blue-300 dark:border-purple-700 shadow-lg">
              <Sparkles className="w-5 h-5 text-blue-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-blue-900 dark:text-purple-200">
                Rutgers Hack Health 2025 - Women's Health Track
              </span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent drop-shadow-2xl">
              Get the Right Care,<br />Live Your Best Life
            </h1>
            
            <p className="text-2xl lg:text-3xl text-blue-800 dark:text-purple-200 mb-12 max-w-3xl mx-auto font-semibold">
              FemPath uses intelligent OB/GYN triage to help you find the right specialist for your needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to={createPageUrl("Triage")}>
                <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-600 dark:via-pink-500 dark:to-rose-500 hover:scale-105 shadow-2xl hover:shadow-blue-500/50 dark:hover:shadow-purple-500/50 transition-all text-white font-bold">
                  <Brain className="w-6 h-6 mr-3" />
                  Start Triage
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
              <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 hover:shadow-blue-500/50 dark:hover:shadow-purple-500/50 hover:scale-105 transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-blue-700 dark:text-purple-300 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-blue-600 dark:text-purple-400">
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
          <h2 className="text-5xl lg:text-6xl font-black mb-6 text-blue-800 dark:text-purple-200">
            Everything You Need
          </h2>
          <p className="text-2xl text-blue-700 dark:text-purple-300 font-semibold">
            Comprehensive tools for women's health
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
              <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 hover:shadow-blue-500/50 dark:hover:shadow-purple-500/50 hover:scale-105 transition-all group cursor-pointer h-full">
                <CardContent className="p-10">
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-xl`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-blue-800 dark:text-purple-200">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-blue-700 dark:text-purple-300 leading-relaxed font-medium">
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
        <Card className="border-4 border-blue-400 dark:border-purple-600 shadow-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-700 dark:via-pink-600 dark:to-rose-600 text-white overflow-hidden">
          <CardContent className="p-16 lg:p-20 relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full -mr-40 -mt-40"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-5xl lg:text-6xl font-black mb-6 drop-shadow-2xl">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-2xl mb-12 max-w-2xl mx-auto font-semibold opacity-95">
                Join thousands of women who trust FemPath for personalized healthcare guidance
              </p>
              <Link to={createPageUrl("Triage")}>
                <Button size="lg" className="text-xl px-12 py-8 bg-white text-blue-700 dark:text-purple-700 hover:scale-105 shadow-2xl font-black">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}