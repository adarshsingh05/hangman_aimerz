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
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900 dark:text-white">Aimerz's Hangman</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user.name}</span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Hangman
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Test your vocabulary and save the stick figure
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Game Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">How to Play</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-sm">Guess the Word</h3>
                  <p className="text-sm">Guess letters one by one to reveal the hidden word</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-sm">Limited Attempts</h3>
                  <p className="text-sm">You have 6 wrong guesses before the game ends</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-sm">Score Points</h3>
                  <p className="text-sm">Win games to earn points and climb the leaderboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Hangman Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Game Preview</h2>
              <div className="w-24 h-32 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded border flex items-center justify-center">
                <span className="text-2xl text-gray-400">_ _ _ _ _</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Watch the hangman drawing progress as you make wrong guesses
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                href="/game"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded text-base transition-colors"
              >
                Start Playing
              </Link>
            ) : (
              <>
                <Link
                  href="/game?mode=guest"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded text-base transition-colors"
                >
                  Play as Guest
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded text-base transition-colors"
                >
                  Sign Up to Save Progress
                </Link>
              </>
            )}
            <Link
              href="/leaderboard"
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded text-base transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              {user 
                ? "Challenge yourself with random words and compete with other players" 
                : "Play as a guest or sign up to save your progress and compete on the leaderboard"
              }
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">R</span>
            </div>
            <h3 className="font-semibold text-base mb-2">Random Words</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Every game features a different word from our database</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 dark:text-green-400 font-bold text-lg">P</span>
            </div>
            <h3 className="font-semibold text-base mb-2">Track Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your wins, losses, and total score</p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">C</span>
            </div>
            <h3 className="font-semibold text-base mb-2">Compete</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">See how you rank against other players</p>
          </div>
        </div>
      </div>
    </div>
  );
}
