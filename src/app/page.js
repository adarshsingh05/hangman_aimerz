"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // If no token in localStorage, user should be logged out
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // If API returns no user, clear localStorage and set user to null
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // On error, clear localStorage and set user to null
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint to properly clear the HTTP-only cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
      
      // Clear client-side storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the API call fails, clear client-side storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Hangman</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-9 w-24 rounded-lg"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Welcome, {user.name}</span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Hangman
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Challenge your vocabulary skills and save the stick figure from the gallows
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          {/* Game Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">How to Play</h2>
            <div className="space-y-6 text-slate-600 dark:text-slate-300">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Guess the Word</h3>
                  <p className="text-sm leading-relaxed">Guess letters one by one to reveal the hidden word</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Limited Attempts</h3>
                  <p className="text-sm leading-relaxed">You have 6 wrong guesses before the game ends</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Score Points</h3>
                  <p className="text-sm leading-relaxed">Win games to earn points and climb the leaderboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Hangman Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 flex items-center justify-center shadow-sm">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Game Preview</h2>
              <div className="w-32 h-40 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                <span className="text-3xl text-slate-400 font-mono tracking-widest">_ _ _ _ _</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Watch the hangman drawing progress as you make wrong guesses
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                href="/game"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Start Playing
              </Link>
            ) : (
              <>
                <Link
                  href="/game?mode=guest"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Play as Guest
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Sign Up to Save Progress
                </Link>
              </>
            )}
            <Link
              href="/leaderboard"
              className="border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
          
          <div className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            <p className="leading-relaxed">
              {user 
                ? "Challenge yourself with random words and compete with other players" 
                : "Play as a guest or sign up to save your progress and compete on the leaderboard"
              }
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">R</span>
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white">Random Words</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Every game features a different word from our extensive database</p>
          </div>
          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-green-600 dark:text-green-400 font-bold text-2xl">P</span>
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white">Track Progress</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">Monitor your wins, losses, and total score over time</p>
          </div>
          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-orange-600 dark:text-orange-400 font-bold text-2xl">C</span>
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white">Compete</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">See how you rank against other players worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
}
