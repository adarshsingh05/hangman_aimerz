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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const winRate = userStats?.gamesPlayed > 0 ? ((userStats.wins / userStats.gamesPlayed) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">Ready to play some Hangman?</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Total Score</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {userStats?.score?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">S</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Games Played</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {userStats?.gamesPlayed || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">G</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Wins</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {userStats?.wins || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">W</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Win Rate</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {winRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Play Game Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">P</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Play Hangman</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Challenge yourself with new words and improve your score!
              </p>
              <Link
                href="/game"
                className="inline-block px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Start Playing
              </Link>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-2xl">L</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Leaderboard</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                See how you rank against other players worldwide!
              </p>
              <Link
                href="/leaderboard"
                className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                View Rankings
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Your Progress</h2>
          
          {userStats?.gamesPlayed === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-slate-600 dark:text-slate-400 font-bold text-2xl">G</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">You haven&apos;t played any games yet!</p>
              <Link
                href="/game"
                className="inline-block px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Play Your First Game
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {userStats?.wins || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">Games Won</div>
              </div>
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {userStats?.losses || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">Games Lost</div>
              </div>
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {winRate}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">Success Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
