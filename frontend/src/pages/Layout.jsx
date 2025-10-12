
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Home, Activity, Moon, Sun, Menu, X, LayoutDashboard, ClipboardCheck, Key, Star } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    const isDark = savedMode === null ? true : savedMode === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navItems = [
    { name: "Home", path: "Home", icon: Home },
    { name: "Dashboard", path: "Dashboard", icon: LayoutDashboard },
    { name: "Triage", path: "AgentTriage", icon: Activity },
    { name: "Admin Controls", path: "AdminRules", icon: Key },
    { name: "Validation", path: "ModelValidation", icon: ClipboardCheck },

  ];

  const isActive = (path) => {
    return currentPageName === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-indigo-200 dark:border-indigo-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Lunara
                </span>
              </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={createPageUrl(item.path)}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`gap-2 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 text-white shadow-lg hover:shadow-xl"
                        : "text-indigo-700 dark:text-purple-300 hover:bg-indigo-100 dark:hover:bg-purple-900/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-xl hover:bg-indigo-100 dark:hover:bg-purple-900/50 border-2 border-transparent hover:border-indigo-300 dark:hover:border-purple-600"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-indigo-700 dark:text-purple-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-indigo-200 dark:border-purple-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={createPageUrl(item.path)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 text-white"
                        : "text-indigo-700 dark:text-purple-300"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-indigo-200 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500 dark:text-purple-400" />
              <span className="text-sm text-indigo-700 dark:text-purple-300 font-medium">
                © 2025 Lunara - Agent Triage System
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-indigo-700 dark:text-purple-300 font-medium">
                HIPAA Compliant
              </span>
              <span className="text-sm text-indigo-700 dark:text-purple-300">•</span>
              <span className="text-sm text-indigo-700 dark:text-purple-300 font-medium">
                Secure & Private
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}