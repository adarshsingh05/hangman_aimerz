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
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Dashboard checkAuth - token from localStorage:", token);
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        const data = await response.json();
        console.log("Dashboard checkAuth - response data:", data);
        
        if (data.user) {
          setUser(data.user);
          // Fetch user stats
          fetchUserStats();
        } else {
          // Redirect to login if not authenticated
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const winRate = userStats?.gamesPlayed > 0 ? ((userStats.wins / userStats.gamesPlayed) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Ready to play some Hangman?</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Score</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {userStats?.score?.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Games Played</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {userStats?.gamesPlayed || 0}
                </p>
              </div>
              <div className="text-3xl">🎮</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Wins</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {userStats?.wins || 0}
                </p>
              </div>
              <div className="text-3xl">🎉</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Win Rate</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {winRate}%
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Play Game Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Play Hangman</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Challenge yourself with new words and improve your score!
              </p>
              <Link
                href="/game"
                className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start Playing
              </Link>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Leaderboard</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                See how you rank against other players worldwide!
              </p>
              <Link
                href="/leaderboard"
                className="inline-block px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
              >
                View Rankings
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Progress</h2>
          
          {userStats?.gamesPlayed === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">You haven&apos;t played any games yet!</p>
              <Link
                href="/game"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Play Your First Game
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {userStats?.wins || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Games Won</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {userStats?.losses || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Games Lost</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {winRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
