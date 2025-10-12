
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Calendar as CalendarIcon, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isBefore, startOfDay } from "date-fns";

export default function DoctorAvailabilityModal({ doctor, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (isOpen && doctor) {
      fetchAvailability();
    }
  }, [isOpen, doctor]);

  const fetchAvailability = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // PLACEHOLDER: API call would go here
    // Example: const response = await fetch(`/api/doctors/${doctor.id}/availability`);
    // const data = await response.json();
    
    // MOCK DATA - Doctor availability
    const mockAvailability = {
      availableDates: [
        { date: new Date(2025, 0, 15), slots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"] },
        { date: new Date(2025, 0, 16), slots: ["9:00 AM", "11:00 AM", "1:00 PM"] },
        { date: new Date(2025, 0, 17), slots: ["8:00 AM", "9:30 AM", "2:30 PM", "4:00 PM"] },
        { date: new Date(2025, 0, 20), slots: ["10:00 AM", "11:30 AM", "3:00 PM"] },
        { date: new Date(2025, 0, 22), slots: ["9:00 AM", "1:00 PM", "2:00 PM", "4:00 PM"] },
        { date: new Date(2025, 0, 23), slots: ["8:30 AM", "10:00 AM", "1:30 PM"] },
        { date: new Date(2025, 0, 24), slots: ["9:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"] },
        { date: new Date(2025, 0, 27), slots: ["10:00 AM", "2:00 PM"] },
        { date: new Date(2025, 0, 29), slots: ["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM"] },
        { date: new Date(2025, 0, 30), slots: ["8:00 AM", "11:00 AM", "2:30 PM"] },
      ]
    };
    
    setAvailability(mockAvailability);
    setLoading(false);
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const isDateAvailable = (date) => {
    if (!availability) return false;
    return availability.availableDates.some(availDate => 
      isSameDay(availDate.date, date)
    );
  };

  const getTimeSlotsForDate = (date) => {
    if (!availability) return [];
    const availDate = availability.availableDates.find(availDate => 
      isSameDay(availDate.date, date)
    );
    return availDate ? availDate.slots : [];
  };

  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
    }
  };

  const isPastDate = (date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  const getDateClassName = (date) => {
    const baseClasses = "h-12 w-12 rounded-xl font-semibold transition-all duration-200";
    
    if (isPastDate(date)) {
      return `${baseClasses} text-gray-400 dark:text-gray-700 cursor-not-allowed`;
    }
    
    if (selectedDate && isSameDay(date, selectedDate)) {
      return `${baseClasses} bg-gradient-to-r from-indigo-500 to-purple-400 dark:from-purple-600 dark:to-pink-500 text-white shadow-lg scale-110`;
    }
    
    if (isDateAvailable(date)) {
      return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-2 border-green-400 dark:border-green-600 hover:scale-110 hover:shadow-lg cursor-pointer`;
    }
    
    return `${baseClasses} text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-purple-900/20`;
  };

  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="border-4 border-indigo-300 dark:border-purple-700 shadow-2xl bg-white dark:bg-slate-900">
            {/* Header */}
            <CardHeader className="border-b-2 border-indigo-200 dark:border-purple-800">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-black text-indigo-900 dark:text-purple-100 mb-2">
                    Dr. {doctor?.name}
                  </CardTitle>
                  <Badge className="bg-indigo-200 dark:bg-purple-900 text-indigo-900 dark:text-purple-100 border-2 border-indigo-400 dark:border-purple-600 px-4 py-2 text-base font-bold">
                    {doctor?.specialty}
                  </Badge>
                  {doctor?.credentials && (
                    <p className="text-sm text-indigo-700 dark:text-purple-300 font-semibold mt-2">
                      {doctor.credentials}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl hover:bg-indigo-100 dark:hover:bg-purple-900/50"
                >
                  <X className="w-6 h-6 text-indigo-600 dark:text-purple-400" />
                </Button>
              </div>
            </CardHeader>

            {/* Body */}
            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-16 h-16 text-indigo-600 dark:text-purple-400 animate-spin mb-4" />
                  <p className="text-lg font-bold text-indigo-800 dark:text-purple-200">
                    Loading availability...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="border-2 border-indigo-400 dark:border-purple-600 hover:bg-indigo-100 dark:hover:bg-purple-900/50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h3 className="text-2xl font-black text-indigo-900 dark:text-purple-100 flex items-center gap-2">
                      <CalendarIcon className="w-6 h-6" />
                      {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="border-2 border-indigo-400 dark:border-purple-600 hover:bg-indigo-100 dark:hover:bg-purple-900/50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-6">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-bold text-indigo-700 dark:text-purple-300 mb-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: monthDays[0].getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    
                    {/* Calendar days */}
                    {monthDays.map(date => (
                      <button
                        key={date.toString()}
                        onClick={() => handleDateClick(date)}
                        disabled={isPastDate(date) || !isDateAvailable(date)}
                        className={getDateClassName(date)}
                      >
                        {format(date, 'd')}
                      </button>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 justify-center p-4 bg-indigo-100 dark:bg-purple-900/30 rounded-xl border-2 border-indigo-300 dark:border-purple-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600"></div>
                      <span className="text-sm font-bold text-indigo-900 dark:text-purple-100">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-400 dark:from-purple-600 dark:to-pink-500"></div>
                      <span className="text-sm font-bold text-indigo-900 dark:text-purple-100">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                      <span className="text-sm font-bold text-indigo-900 dark:text-purple-100">Unavailable</span>
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-purple-100 dark:bg-pink-900/30 rounded-xl border-2 border-purple-300 dark:border-pink-700"
                    >
                      <h4 className="text-xl font-black text-purple-900 dark:text-pink-100 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Available Times for {format(selectedDate, 'MMMM d, yyyy')}
                      </h4>
                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {timeSlots.map((slot, index) => (
                            <div
                              key={index}
                              className="p-3 bg-white dark:bg-slate-950 rounded-xl border-2 border-purple-400 dark:border-pink-600 text-center"
                            >
                              <span className="text-base font-bold text-purple-900 dark:text-pink-100">
                                {slot}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-purple-800 dark:text-pink-200 font-semibold">
                          No time slots available for this date.
                        </p>
                      )}
                    </motion.div>
                  )}

                  {!selectedDate && (
                    <div className="text-center p-8 bg-indigo-100 dark:bg-purple-900/30 rounded-xl border-2 border-indigo-300 dark:border-purple-700">
                      <CalendarIcon className="w-12 h-12 text-indigo-600 dark:text-purple-400 mx-auto mb-3" />
                      <p className="text-lg font-bold text-indigo-900 dark:text-purple-100">
                        Select a date to view available time slots
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            {/* Footer */}
            <div className="border-t-2 border-indigo-200 dark:border-purple-800 p-6">
              <Button
                onClick={onClose}
                className="w-full text-lg py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 hover:scale-105 shadow-xl text-white font-black"
              >
                Close
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
