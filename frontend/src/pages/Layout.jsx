
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Home, Activity, Heart, Moon, Sun, Menu, X } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    initUser();

    const isDark = localStorage.getItem("darkMode") === "true";
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
    { name: "Triage", path: "Triage", icon: Activity },
  ];

  const isActive = (path) => {
    return currentPageName === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-blue-200 dark:border-purple-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-purple-300">
                FemPath
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
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 text-white shadow-lg hover:shadow-xl"
                        : "text-blue-700 dark:text-purple-300 hover:bg-blue-100 dark:hover:bg-purple-900/50"
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
                className="rounded-xl hover:bg-blue-100 dark:hover:bg-purple-900/50 border-2 border-transparent hover:border-blue-300 dark:hover:border-purple-600"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-600" />
                )}
              </Button>

              {/* User Info */}
              {user && (
                <div className="hidden md:block">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-purple-900/50 rounded-xl border border-blue-300 dark:border-purple-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {user.full_name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-blue-900 dark:text-purple-200">
                      {user.full_name || user.email}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-blue-700 dark:text-purple-300"
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
          <div className="md:hidden border-t border-blue-200 dark:border-purple-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
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
                        ? "bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 text-white"
                        : "text-blue-700 dark:text-purple-300"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
              {user && (
                <div className="pt-4 border-t border-blue-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-purple-900/50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 dark:from-purple-600 dark:to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.full_name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-blue-900 dark:text-purple-200">
                      {user.full_name || user.email}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-blue-200 dark:border-purple-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-500 dark:text-purple-400" />
              <span className="text-sm text-blue-700 dark:text-purple-300 font-medium">
                © 2025 FemPath - Built for Rutgers Hack Health 2025
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-blue-700 dark:text-purple-300 font-medium">
                HIPAA Compliant
              </span>
              <span className="text-sm text-blue-700 dark:text-purple-300">•</span>
              <span className="text-sm text-blue-700 dark:text-purple-300 font-medium">
                Secure & Private
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
