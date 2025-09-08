"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Checking if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // If no token in localStorage, redirect to login
        if (!token) {
          router.push("/login");
          return;
        }
        
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        const data = await response.json();
        
        if (data.user) {
          setUser(data.user);
          // Fetch user stats
          fetchUserStats();
        } else {
          // If API returns no user, clear localStorage and redirect to login
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // On error, clear localStorage and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.user) {
        setUserStats(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
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
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the API call fails, clear client-side storage and redirect
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const winRate = userStats?.gamesPlayed > 0 ? ((userStats.wins / userStats.gamesPlayed) * 100).toFixed(1) : 0;

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
              <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 font-medium">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm px-4 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-24">
          <h1 className="text-4xl sm:text-5xl font-light text-black dark:text-white mb-6 tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light">Ready to play some Hangman?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 sm:mb-24">
          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <span className="text-white dark:text-black font-medium text-lg">S</span>
            </div>
            <h3 className="font-medium text-lg mb-3 text-black dark:text-white">Total Score</h3>
            <p className="text-3xl font-light text-black dark:text-white">
              {userStats?.score?.toLocaleString() || 0}
            </p>
          </div>

          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <span className="text-white dark:text-black font-medium text-lg">G</span>
            </div>
            <h3 className="font-medium text-lg mb-3 text-black dark:text-white">Games Played</h3>
            <p className="text-3xl font-light text-black dark:text-white">
              {userStats?.gamesPlayed || 0}
            </p>
          </div>

          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <span className="text-white dark:text-black font-medium text-lg">W</span>
            </div>
            <h3 className="font-medium text-lg mb-3 text-black dark:text-white">Wins</h3>
            <p className="text-3xl font-light text-black dark:text-white">
              {userStats?.wins || 0}
            </p>
          </div>

          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <span className="text-white dark:text-black font-medium text-lg">%</span>
            </div>
            <h3 className="font-medium text-lg mb-3 text-black dark:text-white">Win Rate</h3>
            <p className="text-3xl font-light text-black dark:text-white">
              {winRate}%
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 sm:mb-24">
          {/* Play Game Card */}
          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <span className="text-white dark:text-black font-medium text-2xl">P</span>
            </div>
            <h2 className="text-2xl font-light text-black dark:text-white mb-4">Play Hangman</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light">
              Challenge yourself with new words and improve your score!
            </p>
            <Link
              href="/game"
              className="btn-primary text-base px-8 py-4"
            >
              Start Playing
            </Link>
          </div>

          {/* Leaderboard Card */}
          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto mb-6">
              <span className="text-white dark:text-black font-medium text-2xl">L</span>
            </div>
            <h2 className="text-2xl font-light text-black dark:text-white mb-4">Leaderboard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light">
              See how you rank against other players worldwide!
            </p>
            <Link
              href="/leaderboard"
              className="btn-secondary text-base px-8 py-4"
            >
              View Rankings
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-elevated p-8">
          <h2 className="text-2xl font-light text-black dark:text-white mb-8">Your Progress</h2>
          
          {userStats?.gamesPlayed === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 dark:text-gray-600 font-medium text-2xl">G</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg font-light">You haven&apos;t played any games yet!</p>
              <Link
                href="/game"
                className="btn-primary text-base px-8 py-4"
              >
                Play Your First Game
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="text-3xl font-light text-black dark:text-white mb-2">
                  {userStats?.wins || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-light">Games Won</div>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="text-3xl font-light text-black dark:text-white mb-2">
                  {userStats?.losses || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-light">Games Lost</div>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="text-3xl font-light text-black dark:text-white mb-2">
                  {winRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-light">Success Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center mt-10">
          <Link
            href="/"
            className="btn-ghost text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
