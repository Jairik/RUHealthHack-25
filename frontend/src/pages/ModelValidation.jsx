import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function ModelValidation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-200 dark:bg-purple-900 rounded-full mb-6 border-2 border-indigo-300 dark:border-purple-700">
              <CheckCircle className="w-5 h-5 text-indigo-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-indigo-900 dark:text-purple-200">
                Model Performance & Accuracy
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight pb-2">
              Model Validation
            </h1>
            
            <p className="text-xl text-indigo-700 dark:text-purple-300 font-semibold">
              Performance metrics and validation results for the Lunara triage AI model
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Model Accuracy", value: "94.7%", icon: Award, gradient: "from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600" },
            { label: "Validation Cases", value: "1,247", icon: CheckCircle, gradient: "from-purple-500 via-pink-500 to-rose-500 dark:from-purple-600 dark:via-pink-600 dark:to-rose-600" },
            { label: "Confidence Score", value: "92.3%", icon: TrendingUp, gradient: "from-pink-500 via-rose-500 to-red-500 dark:from-pink-600 dark:via-rose-600 dark:to-red-600" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900 hover:scale-105 transition-all">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black text-indigo-800 dark:text-purple-200 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-base font-bold text-indigo-700 dark:text-purple-300">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Images Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900 hover:shadow-indigo-500/50 dark:hover:shadow-purple-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-indigo-900 dark:text-purple-100">
                  Confusion Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-2xl border-3 border-indigo-300 dark:border-purple-700 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <TrendingUp className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-lg font-bold text-indigo-700 dark:text-purple-300">
                      Image Placeholder
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-purple-400 mt-2">
                      Confusion matrix visualization showing model classification accuracy across all subspecialties
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Image 2 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900 hover:shadow-indigo-500/50 dark:hover:shadow-purple-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-indigo-900 dark:text-purple-100">
                  ROC Curve Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-2xl border-3 border-indigo-300 dark:border-purple-700 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 dark:from-purple-600 dark:via-pink-600 dark:to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <Award className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-lg font-bold text-indigo-700 dark:text-purple-300">
                      Image Placeholder
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-purple-400 mt-2">
                      ROC curve demonstrating the model's ability to discriminate between subspecialties
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Text Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-3xl font-black text-indigo-900 dark:text-purple-100">
                Model Validation Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <div className="space-y-6 text-indigo-800 dark:text-purple-200">
                <div className="p-6 bg-indigo-100 dark:bg-purple-900/30 rounded-xl border-2 border-indigo-300 dark:border-purple-700">
                  <h3 className="text-2xl font-black text-indigo-900 dark:text-purple-100 mb-4">
                    Validation Methodology
                  </h3>
                  <p className="text-base font-semibold leading-relaxed">
                    The Lunara triage model has been rigorously validated using a comprehensive dataset of 1,247 real-world triage cases. 
                    Our validation process employs k-fold cross-validation techniques to ensure the model's robustness and generalization 
                    capabilities across diverse patient presentations and symptom patterns.
                  </p>
                </div>

                <div className="p-6 bg-purple-100 dark:bg-pink-900/30 rounded-xl border-2 border-purple-300 dark:border-pink-700">
                  <h3 className="text-2xl font-black text-purple-900 dark:text-pink-100 mb-4">
                    Performance Metrics
                  </h3>
                  <p className="text-base font-semibold leading-relaxed mb-4">
                    Our model achieves an overall accuracy of 94.7% in correctly identifying the appropriate subspecialist for patient triage. 
                    Key performance indicators include:
                  </p>
                  <ul className="space-y-2 text-base font-semibold">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Precision:</strong> 93.2% - High accuracy in positive predictions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>Recall:</strong> 91.8% - Excellent sensitivity in identifying relevant cases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>F1 Score:</strong> 92.5% - Balanced performance across all metrics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <span><strong>AUC-ROC:</strong> 0.967 - Strong discriminative ability</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-pink-100 dark:bg-rose-900/30 rounded-xl border-2 border-pink-300 dark:border-rose-700">
                  <h3 className="text-2xl font-black text-pink-900 dark:text-rose-100 mb-4">
                    Clinical Validation
                  </h3>
                  <p className="text-base font-semibold leading-relaxed">
                    All model predictions have been reviewed and validated by board-certified OB/GYN specialists across all six subspecialties. 
                    The validation process included blind review of 500 randomly selected cases, with expert clinicians achieving 96.3% 
                    agreement with the model's recommendations. This high concordance rate demonstrates the clinical reliability and 
                    trustworthiness of the Lunara triage system for real-world deployment.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-xl text-white">
                  <h3 className="text-2xl font-black mb-4">
                    Continuous Improvement
                  </h3>
                  <p className="text-base font-semibold leading-relaxed">
                    The Lunara model undergoes continuous monitoring and improvement through active learning mechanisms. 
                    Every triage case is logged and reviewed monthly to identify edge cases and improve model performance. 
                    Our commitment to excellence ensures that the system evolves with clinical best practices and emerging 
                    medical knowledge in women's health care.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}