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
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-black dark:text-white tracking-tight">
                HANGMAN
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-8 w-20"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {user.name}
                  </span>
                  <Link
                    href="/dashboard"
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16 sm:mb-24">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-black dark:text-white mb-6 sm:mb-8 tracking-tight">
            HANGMAN
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Challenge your vocabulary skills with the classic word guessing game
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/game?mode=guest"
              className="btn-primary text-base px-8 py-4"
            >
              Play as Guest
            </Link>
            {!user && (
              <Link
                href="/signup"
                className="btn-secondary text-base px-8 py-4"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 mb-16 sm:mb-24">
          {/* How to Play */}
          <div className="card-elevated p-8">
            <h2 className="text-2xl font-light text-black dark:text-white mb-8">How to Play</h2>
            <div className="space-y-6 text-gray-600 dark:text-gray-400">
              <div className="flex items-start space-x-4">
                <div className="w-1 h-1 bg-black dark:bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-black dark:text-white mb-2">Guess the Word</h3>
                  <p className="text-sm leading-relaxed">Guess letters one by one to reveal the hidden word</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-1 h-1 bg-black dark:bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-black dark:text-white mb-2">Limited Attempts</h3>
                  <p className="text-sm leading-relaxed">You have 6 wrong guesses before the game ends</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-1 h-1 bg-black dark:bg-white rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-black dark:text-white mb-2">Score Points</h3>
                  <p className="text-sm leading-relaxed">Win games to earn points and climb the leaderboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Game Preview */}
          <div className="card-elevated p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-light text-black dark:text-white mb-8">Game Preview</h2>
              <div className="w-32 h-40 mx-auto mb-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <span className="text-3xl text-gray-400 font-mono tracking-widest">_ _ _ _ _</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Watch the hangman drawing progress as you make wrong guesses
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-8 mb-16 sm:mb-24">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link
                href="/game"
                className="btn-primary text-base px-8 py-4"
              >
                Start Playing
              </Link>
            ) : (
              <>
                <Link
                  href="/game?mode=guest"
                  className="btn-primary text-base px-8 py-4"
                >
                  Play as Guest
                </Link>
                <Link
                  href="/signup"
                  className="btn-secondary text-base px-8 py-4"
                >
                  Sign Up to Save Progress
                </Link>
              </>
            )}
            <Link
              href="/leaderboard"
              className="btn-secondary text-base px-8 py-4"
            >
              View Leaderboard
            </Link>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
            <p className="leading-relaxed font-light">
              {user 
                ? "Challenge yourself with random words and compete with other players" 
                : "Play as a guest or sign up to save your progress and compete on the leaderboard"
              }
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card-elevated text-center p-8">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12h6m-6 4h6" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-3 text-black dark:text-white">Random Words</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light">Every game features a different word from our extensive database</p>
          </div>
          <div className="card-elevated text-center p-8">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-3 text-black dark:text-white">Track Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light">Monitor your wins, losses, and total score over time</p>
          </div>
          <div className="card-elevated text-center p-8 sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-3 text-black dark:text-white">Compete</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-light">See how you rank against other players worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
}
