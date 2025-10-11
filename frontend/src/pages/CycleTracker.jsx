import React, { useState } from "react";
import { Calendar as CalendarIcon, Heart, Droplets, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

export default function CycleTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    flow_intensity: "",
    symptoms: [],
    mood: "",
    notes: ""
  });

  // Dummy cycle entries
  const cycleEntries = [
    { id: 1, date: format(new Date(), 'yyyy-MM-dd'), flow_intensity: "medium", mood: "good", symptoms: ["Cramps", "Bloating"], notes: "Felt okay today" },
    { id: 2, date: format(new Date(new Date().setDate(new Date().getDate()-2)), 'yyyy-MM-dd'), flow_intensity: "light", mood: "great", symptoms: [], notes: "" }
  ];
  
  const availableSymptoms = ["Cramps", "Bloating", "Headache", "Fatigue", "Breast tenderness", "Back pain", "Acne", "Mood swings", "Nausea", "Food cravings"];
  
  const moodOptions = [
    { value: "great", label: "Great", icon: "😊", color: "bg-green-200 dark:bg-green-900 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600" },
    { value: "good", label: "Good", icon: "🙂", color: "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-400 dark:border-blue-600" },
    { value: "okay", label: "Okay", icon: "😐", color: "bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-yellow-400 dark:border-yellow-600" },
    { value: "low", label: "Low", icon: "😔", color: "bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-orange-400 dark:border-orange-600" },
    { value: "stressed", label: "Stressed", icon: "😰", color: "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-red-400 dark:border-red-600" }
  ];
  
  const flowIntensities = [
    { value: "spotting", label: "Spotting", color: "bg-pink-200 dark:bg-pink-900" },
    { value: "light", label: "Light", color: "bg-pink-300 dark:bg-pink-800" },
    { value: "medium", label: "Medium", color: "bg-pink-400 dark:bg-pink-700" },
    { value: "heavy", label: "Heavy", color: "bg-pink-600 dark:bg-pink-600" }
  ];

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });

  const getEntryForDate = (date) => cycleEntries.find(entry => isSameDay(new Date(entry.date), date));

  const getFlowColor = (intensity) => {
    const flow = flowIntensities.find(f => f.value === intensity);
    return flow ? flow.color : "bg-gray-200 dark:bg-gray-700";
  };

  const toggleSymptom = (symptom) => {
    if (formData.symptoms.includes(symptom)) {
      setFormData({ ...formData, symptoms: formData.symptoms.filter(s => s !== symptom) });
    } else {
      setFormData({ ...formData, symptoms: [...formData.symptoms, symptom] });
    }
  };

  const recentEntries = cycleEntries.slice(0, 10);

  const stats = {
    avgLength: 28,
    totalEntries: cycleEntries.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-cyan-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-pink-200 dark:bg-purple-900 rounded-full mb-6 border-2 border-pink-300 dark:border-purple-700">
              <Heart className="w-5 h-5 text-pink-700 dark:text-purple-300" />
              <span className="text-sm font-bold text-pink-900 dark:text-purple-200">Cycle Tracking</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
              Menstrual Cycle Tracker
            </h1>
            <p className="text-xl text-blue-700 dark:text-purple-300 font-semibold">
              Track your cycle, symptoms, and mood to understand your body better
            </p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="border-4 border-pink-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 p-6 rounded-xl">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 dark:from-purple-600 dark:to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <div className="text-4xl font-black text-pink-800 dark:text-purple-200 mb-2">{stats.avgLength}</div>
              <div className="text-sm font-bold text-pink-600 dark:text-purple-400">Avg Cycle Days</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="border-4 border-pink-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 p-6 rounded-xl">
              <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-red-500 dark:from-pink-600 dark:to-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div className="text-4xl font-black text-pink-800 dark:text-purple-200 mb-2">{stats.totalEntries}</div>
              <div className="text-sm font-bold text-pink-600 dark:text-purple-400">Total Entries</div>
            </div>
          </motion.div>
        </div>

        {/* Calendar */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border-4 border-pink-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-pink-800 dark:text-purple-200 text-2xl font-black">
                  <CalendarIcon className="w-7 h-7" /> {format(currentMonth, 'MMMM yyyy')}
                </div>
                <div className="flex gap-2">
                  <button className="border-2 border-pink-300 dark:border-purple-600 px-2 py-1 rounded" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>←</button>
                  <button className="border-2 border-pink-300 dark:border-purple-600 px-2 py-1 rounded" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>→</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2 text-center font-bold text-pink-700 dark:text-purple-300">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day,index) => {
                  const entry = getEntryForDate(day);
                  const isToday = isSameDay(day,new Date());
                  return (
                    <motion.div key={index} whileHover={{ scale: 1.05 }}
                      className={`aspect-square p-2 rounded-xl border-2 cursor-pointer transition-all
                        ${entry ? getFlowColor(entry.flow_intensity) : 'bg-gray-50 dark:bg-gray-800'}
                        ${isToday ? 'border-pink-600 dark:border-purple-500 ring-2 ring-pink-300 dark:ring-purple-500' : 'border-pink-200 dark:border-purple-800'}
                      `}
                      onClick={()=>{setSelectedDate(day);setFormData({...formData,date:format(day,'yyyy-MM-dd')}); if(!entry) setShowForm(true);}}
                    >
                      <div className="text-center">
                        <div className={`text-sm font-bold ${entry?'text-white':'text-gray-700 dark:text-gray-300'}`}>{format(day,'d')}</div>
                        {entry && <div className="flex justify-center mt-1"><Droplets className="w-3 h-3 text-white"/></div>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <button className="w-full mt-6 py-6 text-lg bg-gradient-to-r from-pink-600 to-rose-600 dark:from-purple-600 dark:to-pink-500 hover:scale-105 shadow-xl text-white font-black" onClick={()=>setShowForm(!showForm)}>
              <Heart className="w-5 h-5 mr-2" /> {showForm?'Cancel':'Log Today\'s Entry'}
            </button>
          </div>

          {/* Entry Form / Recent Entries */}
          <div>
            <AnimatePresence mode="wait">
              {showForm ? (
                <motion.div key="form" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                  <div className="border-4 border-pink-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 rounded-xl p-6">
                    <h3 className="text-pink-800 dark:text-purple-200 text-xl font-black mb-4">Log Entry</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 text-pink-800 dark:text-purple-200">Date</label>
                        <input type="date" value={formData.date} onChange={(e)=>setFormData({...formData,date:e.target.value})} className="border-2 border-pink-300 dark:border-purple-600 font-semibold w-full p-2 rounded"/>
                      </div>
                      {/* Flow Intensity */}
                      <div>
                        <label className="block text-sm font-bold mb-2 text-pink-800 dark:text-purple-200">Flow Intensity</label>
                        <div className="grid grid-cols-2 gap-2">
                          {flowIntensities.map(f=><div key={f.value} className={`cursor-pointer px-4 py-3 font-bold border-2 rounded text-center ${formData.flow_intensity===f.value?f.color+' text-white border-pink-600 dark:border-purple-500':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`} onClick={()=>setFormData({...formData,flow_intensity:f.value})}>{f.label}</div>)}
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div>
                        <label className="block text-sm font-bold mb-2 text-pink-800 dark:text-purple-200">Symptoms</label>
                        <div className="flex flex-wrap gap-2">
                          {availableSymptoms.map(s=><div key={s} className={`cursor-pointer px-3 py-2 text-xs font-bold border-2 rounded ${formData.symptoms.includes(s)?'bg-pink-600 dark:bg-purple-600 text-white border-pink-700 dark:border-purple-500':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'}`} onClick={()=>toggleSymptom(s)}>{s}</div>)}
                        </div>
                      </div>

                      <button type="button" className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 dark:from-purple-600 dark:to-pink-500 text-white font-black rounded mt-4">Save Entry</button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="list" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                  <div className="border-4 border-pink-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-gray-900 rounded-xl p-6">
                    <h3 className="text-pink-800 dark:text-purple-200 text-xl font-black mb-4">Recent Entries</h3>
                    {recentEntries.length===0?(
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-pink-300 dark:text-purple-700 mx-auto mb-3" />
                        <p className="text-pink-700 dark:text-purple-300 font-semibold">No entries yet. Start tracking today!</p>
                      </div>
                    ):(
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {recentEntries.map((entry,index)=>(
                          <div key={index} className="p-4 bg-pink-50 dark:bg-purple-900/20 rounded-xl border-2 border-pink-200 dark:border-purple-800">
                            <div className="flex justify-between mb-2">
                              <span className="font-bold text-pink-900 dark:text-purple-200">{format(new Date(entry.date),'MMM d, yyyy')}</span>
                              {entry.flow_intensity && <span className={`${getFlowColor(entry.flow_intensity)} text-white font-bold px-2 py-1 rounded`}>{entry.flow_intensity}</span>}
                            </div>
                            {entry.symptoms && <div className="flex flex-wrap gap-1 mb-2">{entry.symptoms.map(s=><span key={s} className="text-xs bg-pink-200 dark:bg-purple-800 text-pink-900 dark:text-purple-200 font-semibold px-2 py-1 rounded">{s}</span>)}</div>}
                            {entry.notes && <p className="text-sm text-pink-700 dark:text-purple-300 mt-2 italic">{entry.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-12 border-4 border-pink-400 dark:border-purple-600 shadow-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 dark:from-purple-700 dark:via-pink-600 dark:to-rose-600 text-white rounded-xl p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-black mb-4 drop-shadow-lg">Track Your Wellness Journey</h2>
          <p className="text-xl max-w-2xl mx-auto font-semibold opacity-95">
            Understanding your cycle helps you make informed decisions about your health and wellness
          </p>
        </div>

      </div>
    </div>
  );
}
