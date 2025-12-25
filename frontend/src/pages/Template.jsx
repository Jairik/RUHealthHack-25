import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Template() {
  const [formData, setFormData] = useState({
    name: "",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-rose-50 to-slate-50 dark:from-red-950 dark:via-rose-950 dark:to-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-200 dark:bg-red-900 rounded-full mb-8 border-2 border-red-300 dark:border-red-700">
              <Sparkles className="w-5 h-5 text-red-700 dark:text-red-300" />
              <span className="text-sm font-bold text-red-900 dark:text-red-200">
                Template Page
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-400 dark:via-red-400 dark:to-rose-400 bg-clip-text text-transparent">
              Modular Page Template
            </h1>

            <p className="text-2xl text-red-700 dark:text-red-300 max-w-2xl mx-auto font-semibold">
              Use this template to build new pages. It includes common components and layouts.
            </p>
          </motion.div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Heart, label: "Feature 1", value: "100+", color: "from-red-600 to-rose-500 dark:from-red-700 dark:to-rose-600" },
            { icon: Star, label: "Feature 2", value: "95%", color: "from-rose-500 to-red-400 dark:from-rose-600 dark:to-red-500" },
            { icon: Sparkles, label: "Feature 3", value: "24/7", color: "from-red-500 to-rose-400 dark:from-red-600 dark:to-rose-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-4 border-red-300 dark:border-red-700 shadow-2xl bg-white dark:bg-slate-900 hover:scale-105 transition-all">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-red-800 dark:text-red-200 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-base font-bold text-red-700 dark:text-red-300">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Form Card */}
          <Card className="border-4 border-red-300 dark:border-red-700 shadow-2xl bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-800 dark:text-red-200 text-2xl font-black">
                <Heart className="w-7 h-7 text-red-600 dark:text-red-400" />
                Sample Form
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300 font-semibold text-base">
                This is a sample form you can customize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-bold mb-3 text-red-800 dark:text-red-200">
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="bg-white dark:bg-slate-950 text-red-900 dark:text-red-100 border-3 border-red-400 dark:border-red-600 text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-3 text-red-800 dark:text-red-200">
                    Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your message"
                    rows={4}
                    className="bg-white dark:bg-slate-950 text-red-900 dark:text-red-100 border-3 border-red-400 dark:border-red-600 text-lg font-semibold"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full text-lg py-6 bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-700 dark:to-rose-600 hover:scale-105 shadow-xl text-white font-black"
                >
                  Submit Form
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card className="border-4 border-red-300 dark:border-red-700 shadow-2xl bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-800 dark:text-red-200 text-2xl font-black">
                <Star className="w-7 h-7 text-red-600 dark:text-red-400" />
                Sample Content
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300 font-semibold text-base">
                Replace this with your own content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-2 border-red-400 dark:border-red-600 px-4 py-2 font-bold">
                    Category 1
                  </Badge>
                  <Badge className="bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 border-2 border-rose-400 dark:border-rose-600 px-4 py-2 font-bold">
                    Category 2
                  </Badge>
                </div>

                <p className="text-red-800 dark:text-red-200 leading-relaxed text-lg font-semibold">
                  This is sample content that you can replace with your own text, images, or components.
                  The template uses the FemPath color scheme and styling.
                </p>

                <div className="p-6 bg-red-100 dark:bg-red-900 rounded-2xl border-3 border-red-300 dark:border-red-700">
                  <p className="text-base text-red-800 dark:text-red-200 font-semibold">
                    💡 <strong>Tip:</strong> You can duplicate this page and modify it to create new features quickly!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Card */}
        <Card className="border-4 border-red-400 dark:border-red-600 shadow-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-700 dark:via-red-600 dark:to-rose-600 text-white">
          <CardContent className="p-12 lg:p-16 text-center">
            <Sparkles className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-6 drop-shadow-lg">
              This is a Call-to-Action Section
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-semibold opacity-95">
              Use this section to highlight important information or actions you want users to take.
            </p>
            <Button size="lg" className="text-xl px-10 py-6 bg-white text-red-700 dark:text-red-700 hover:scale-105 shadow-2xl font-black">
              Take Action
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}