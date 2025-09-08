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
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-24">
          <h1 className="text-4xl sm:text-5xl font-light text-black dark:text-white mb-6 tracking-tight">
            LEADERBOARD
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light">Top players and their achievements</p>
        </div>

        <div className="card-elevated p-8">
          <h2 className="text-2xl font-light mb-8 text-black dark:text-white">Top Players</h2>
          
          {top.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-gray-400 font-medium">#</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-light">No players yet. Be the first to play!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {top.map((u, idx) => (
                <div 
                  key={u._id} 
                  className={`flex items-center justify-between p-6 border transition-all ${
                    idx === 0 
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900' 
                      : idx === 1 
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                      : idx === 2
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-12 h-12 border border-gray-200 dark:border-gray-800 flex items-center justify-center font-medium text-lg ${
                      idx === 0 
                        ? 'bg-black dark:bg-white text-white dark:text-black' 
                        : idx === 1 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        : idx === 2
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-black dark:text-white">{u.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                        {u.gamesPlayed} games played
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-light text-black dark:text-white">
                      {u.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-light">
                      {u.wins} wins • {((u.wins / Math.max(u.gamesPlayed, 1)) * 100).toFixed(0)}% win rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-10">
            <Link 
              href="/game" 
              className="btn-primary text-base px-8 py-4"
            >
              Play Game
            </Link>
            <Link 
              href="/" 
              className="btn-ghost text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
