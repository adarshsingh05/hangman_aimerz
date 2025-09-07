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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Leaderboard</h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">Top players and their achievements</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Top Players</h2>
          
          {top.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-slate-400 font-bold">#</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg">No players yet. Be the first to play!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {top.map((u, idx) => (
                <div 
                  key={u._id} 
                  className={`flex items-center justify-between p-6 rounded-xl border transition-all ${
                    idx === 0 
                      ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 shadow-sm' 
                      : idx === 1 
                      ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 shadow-sm'
                      : idx === 2
                      ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/20 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      idx === 0 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' 
                        : idx === 1 
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        : idx === 2
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{u.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {u.gamesPlayed} games played
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {u.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
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
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Play Game
            </Link>
            <Link 
              href="/" 
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
