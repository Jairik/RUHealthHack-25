import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, MapPin, Edit2, Save, X, Shield, Bell, Lock } from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    fullName: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1995-03-15",
    location: "New Brunswick, NJ",
    emergencyContact: "+1 (555) 987-6543",
    bloodType: "O+",
    allergies: "None",
  });

  const [editedUser, setEditedUser] = useState({ ...user });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-purple-200 mb-2">
            My Profile
          </h1>
          <p className="text-blue-700 dark:text-purple-400">
            Manage your personal information and settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-blue-200 dark:border-purple-800">
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 p-8 relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <User className="w-16 h-16 text-blue-500 dark:text-purple-400" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user.fullName}
                </h2>
                <p className="text-blue-100 dark:text-purple-200 flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
              <div className="md:ml-auto">
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-gray-700 gap-2 shadow-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      className="bg-green-500 hover:bg-green-600 text-white gap-2 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="bg-white text-gray-700 hover:bg-gray-100 gap-2 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-blue-900 dark:text-purple-200 mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-blue-700 dark:text-purple-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-blue-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  />
                ) : (
                  <p className="px-4 py-3 bg-blue-50 dark:bg-gray-700 rounded-xl text-blue-900 dark:text-purple-200 font-medium">
                    {user.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-blue-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  />
                ) : (
                  <p className="px-4 py-3 bg-blue-50 dark:bg-gray-700 rounded-xl text-blue-900 dark:text-purple-200 font-medium">
                    {user.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedUser.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-blue-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  />
                ) : (
                  <p className="px-4 py-3 bg-blue-50 dark:bg-gray-700 rounded-xl text-blue-900 dark:text-purple-200 font-medium">
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-blue-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  />
                ) : (
                  <p className="px-4 py-3 bg-blue-50 dark:bg-gray-700 rounded-xl text-blue-900 dark:text-purple-200 font-medium">
                    {user.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="p-8 bg-blue-50 dark:bg-gray-900/50">
            <h3 className="text-2xl font-bold text-blue-900 dark:text-purple-200 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Medical Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-blue-700 dark:text-purple-300 mb-2">
                  Blood Type
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.bloodType}
                    onChange={(e) => handleChange("bloodType", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-blue-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  />
                ) : (
                  <p className="px-4 py-3 bg-white dark:bg-gray-700 rounded-xl text-blue-900 dark:text-purple-200 font-medium">
                    {user.bloodType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-700 dark:text-purple-300 mb-2">
                  Allergies
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.allergies}
                    onChange={(e) => handleChange("allergies", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-blue-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  />
                ) : (
                  <p className="px-4 py-3 bg-white dark:bg-gray-700 rounded-xl text-blue-900 dark:text-purple-200 font-medium">
                    {user.allergies}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-blue-700 dark:text-purple-300 mb-2">
                  Emergency Contact
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser.emergencyContact}
                    onChange={(e) => handleChange("emergencyContact", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 dark:border-purple-600 bg-white dark:bg-gray-700 text-blue-900 dark:text-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500"
                  />
                ) : (
                  <p className="px-4 py-3 bg-white dark:bg-gray-700 rounded-xl text-blue-900 dark:text-purple-200 font-medium">
                    {user.emergencyContact}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-blue-900 dark:text-purple-200 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-purple-400" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-purple-200">
                      Email Notifications
                    </p>
                    <p className="text-sm text-blue-600 dark:text-purple-400">
                      Receive updates about your health
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  Enabled
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-purple-400" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-purple-200">
                      Privacy Mode
                    </p>
                    <p className="text-sm text-blue-600 dark:text-purple-400">
                      Enhanced data protection
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  Active
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}