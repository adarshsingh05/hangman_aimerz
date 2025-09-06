// app/leaderboard/page.js
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Leaderboard() {
  const [top, setTop] = useState([]);

  useEffect(() => {
    fetch("/api/leaderboard", {
      credentials: "include"
    }).then((r) => r.json()).then((j) => setTop(j.top || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Top players and their achievements</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Top Players</h2>
          
          {top.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">#</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No players yet. Be the first to play!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {top.map((u, idx) => (
                <div 
                  key={u._id} 
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    idx === 0 
                      ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' 
                      : idx === 1 
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                      : idx === 2
                      ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' 
                        : idx === 1 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : idx === 2
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-gray-900 dark:text-white">{u.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {u.gamesPlayed} games played
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {u.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {u.wins} wins • {((u.wins / Math.max(u.gamesPlayed, 1)) * 100).toFixed(0)}% win rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Link 
              href="/game" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Play Game
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
