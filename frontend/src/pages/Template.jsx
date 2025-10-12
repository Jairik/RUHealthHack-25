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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-200 dark:bg-purple-900 rounded-full mb-8 border-2 border-blue-300 dark:border-purple-700">
              <Sparkles className="w-5 h-5 text-blue-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-blue-900 dark:text-purple-200">
                Template Page
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
              Modular Page Template
            </h1>
            
            <p className="text-2xl text-blue-700 dark:text-purple-300 max-w-2xl mx-auto font-semibold">
              Use this template to build new pages. It includes common components and layouts.
            </p>
          </motion.div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Heart, label: "Feature 1", value: "100+", color: "from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500" },
            { icon: Star, label: "Feature 2", value: "95%", color: "from-cyan-500 to-teal-400 dark:from-pink-600 dark:to-rose-500" },
            { icon: Sparkles, label: "Feature 3", value: "24/7", color: "from-teal-500 to-sky-400 dark:from-rose-600 dark:to-orange-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 hover:scale-105 transition-all">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-blue-800 dark:text-purple-200 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-base font-bold text-blue-700 dark:text-purple-300">
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
          <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-purple-200 text-2xl font-black">
                <Heart className="w-7 h-7 text-blue-600 dark:text-purple-400" />
                Sample Form
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-purple-300 font-semibold text-base">
                This is a sample form you can customize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 text-lg font-semibold"
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold mb-3 text-blue-800 dark:text-purple-200">
                    Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Enter your message"
                    rows={4}
                    className="bg-white dark:bg-gray-950 text-blue-900 dark:text-purple-100 border-3 border-blue-400 dark:border-purple-600 text-lg font-semibold"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-black"
                >
                  Submit Form
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card className="border-4 border-blue-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-purple-200 text-2xl font-black">
                <Star className="w-7 h-7 text-blue-600 dark:text-purple-400" />
                Sample Content
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-purple-300 font-semibold text-base">
                Replace this with your own content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-200 dark:bg-purple-900 text-blue-900 dark:text-purple-100 border-2 border-blue-400 dark:border-purple-600 px-4 py-2 font-bold">
                    Category 1
                  </Badge>
                  <Badge className="bg-cyan-200 dark:bg-pink-900 text-cyan-900 dark:text-pink-100 border-2 border-cyan-400 dark:border-pink-600 px-4 py-2 font-bold">
                    Category 2
                  </Badge>
                </div>
                
                <p className="text-blue-800 dark:text-purple-200 leading-relaxed text-lg font-semibold">
                  This is sample content that you can replace with your own text, images, or components. 
                  The template uses the FemPath color scheme and styling.
                </p>
                
                <div className="p-6 bg-blue-100 dark:bg-purple-900 rounded-2xl border-3 border-blue-300 dark:border-purple-700">
                  <p className="text-base text-blue-800 dark:text-purple-200 font-semibold">
                    💡 <strong>Tip:</strong> You can duplicate this page and modify it to create new features quickly!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Card */}
        <Card className="border-4 border-blue-400 dark:border-purple-600 shadow-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 dark:from-purple-700 dark:via-pink-600 dark:to-rose-600 text-white">
          <CardContent className="p-12 lg:p-16 text-center">
            <Sparkles className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-6 drop-shadow-lg">
              This is a Call-to-Action Section
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-semibold opacity-95">
              Use this section to highlight important information or actions you want users to take.
            </p>
            <Button size="lg" className="text-xl px-10 py-6 bg-white text-blue-700 dark:text-purple-700 hover:scale-105 shadow-2xl font-black">
              Take Action
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}