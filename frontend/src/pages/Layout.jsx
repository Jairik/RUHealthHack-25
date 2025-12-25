
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Home, Activity, Moon, Sun, Menu, X, LayoutDashboard, ClipboardCheck, Key } from "lucide-react";

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
    { name: "Triage", path: "AgentTriage", icon: Activity },
    { name: "Dashboard", path: "Dashboard", icon: LayoutDashboard },
    { name: "Admin Controls", path: "AdminRules", icon: Key },
    { name: "Validation", path: "ModelValidation", icon: ClipboardCheck },

  ];

  const isActive = (path) => {
    return currentPageName === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-rose-50 to-slate-50 dark:bg-gradient-to-br dark:from-red-950 dark:via-rose-950 dark:to-slate-950">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-red-200 dark:border-red-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-red-500 to-rose-500 dark:from-red-700 dark:via-red-600 dark:to-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-400 dark:via-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                Lunara
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={createPageUrl(item.path)}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`gap-2 ${isActive(item.path)
                        ? "bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-700 dark:via-red-600 dark:to-rose-600 text-white shadow-lg hover:shadow-xl"
                        : "text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
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
                className="rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 border-2 border-transparent hover:border-red-300 dark:hover:border-red-600"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-red-600" />
                )}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-red-700 dark:text-red-300"
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
          <div className="md:hidden border-t border-red-200 dark:border-red-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 ${isActive(item.path)
                        ? "bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-700 dark:via-red-600 dark:to-rose-600 text-white"
                        : "text-red-700 dark:text-red-300"
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
      <footer className="mt-auto border-t border-red-200 dark:border-red-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-red-500 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                © 2025 Lunara - Agent Triage System
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                HIPAA Compliant
              </span>
              <span className="text-sm text-red-700 dark:text-red-300">•</span>
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                Secure & Private
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}