// app/game/page.js
"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function GamePage() {
  const [word, setWord] = useState("");
  const [guessed, setGuessed] = useState(new Set());
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(0);
  const maxWrong = 6;
  const [status, setStatus] = useState("playing"); // playing | won | lost
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    checkAuth();
    resetGame();
  }, []);

  const checkAuth = async () => {
    try {
      const mode = searchParams.get("mode");
      if (mode === "guest") {
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/me");
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setIsGuest(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsGuest(true);
    } finally {
      setLoading(false);
    }
  };

  async function resetGame() {
    try {
      const res = await fetch("/api/game/random");
      const json = await res.json();
      
      if (res.ok && json.word) {
        const w = json.word.toLowerCase();
        console.log("Random word received:", w);
        setWord(w);
        setGuessed(new Set());
        setWrong(0);
        setStatus("playing");
        setInput("");
      } else {
        console.error("Failed to get random word:", json.error);
        alert("Failed to load a word. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching random word:", error);
      alert("Network error. Please check your connection and try again.");
    }
  }

  function masked() {
    return word.split("").map((c, i) => (guessed.has(c) ? c : "_")).join(" ");
  }

  function renderHangman() {
    const stages = [
      // 0 wrong guesses - empty gallows
      <div className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
      </div>,
      
      // 1 wrong guess - head
      <div className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
      </div>,
      
      // 2 wrong guesses - head + body
      <div className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-600 dark:bg-gray-400"></div>
      </div>,
      
      // 3 wrong guesses - head + body + left arm
      <div className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 rotate-45 origin-left"></div>
      </div>,
      
      // 4 wrong guesses - head + body + both arms
      <div className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 rotate-45 origin-left"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 -rotate-45 origin-right"></div>
      </div>,
      
      // 5 wrong guesses - head + body + both arms + left leg
      <div className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 rotate-45 origin-left"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 -rotate-45 origin-right"></div>
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-600 dark:bg-gray-400 rotate-45 origin-top"></div>
      </div>,
      
      // 6 wrong guesses - complete hangman
      <div className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 rotate-45 origin-left"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 -rotate-45 origin-right"></div>
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-600 dark:bg-gray-400 rotate-45 origin-top"></div>
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-600 dark:bg-gray-400 -rotate-45 origin-top"></div>
      </div>
    ];
    
    return stages[Math.min(wrong, 6)];
  }

  function handleGuess(e) {
    e.preventDefault();
    if (!input || status !== "playing") return;
    const letter = input[0].toLowerCase();
    setInput("");
    if (guessed.has(letter)) return;
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);
    if (!word.includes(letter)) {
      const w = wrong + 1;
      setWrong(w);
      if (w >= maxWrong) setStatus("lost");
    } else {
      // check win
      const allRevealed = word.split("").every((ch) => newGuessed.has(ch));
      if (allRevealed) setStatus("won");
    }
  }

  async function submitScore(win) {
    if (isGuest) {
      alert("Score not saved - you're playing as a guest. Sign up to save your progress!");
      return;
    }

    if (!user) {
      alert("Please log in to save your score!");
      return;
    }

    try {
      // score scheme: base + (maxWrong - wrong)
      const base = 10;
      const score = base + (win ? Math.max(0, maxWrong - wrong) * 2 : 0);
      
      const response = await fetch("/api/score/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, win }),
      });

      if (response.ok) {
        alert("Score submitted successfully!");
      } else {
        alert("Failed to submit score. Please try again.");
      }
    } catch (error) {
      console.error("Score submission failed:", error);
      alert("Failed to submit score. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Hangman</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Guess the word before the hangman is complete</p>
            </div>
            
                         {/* User Status */}
             <div className="flex items-center gap-3">
               {user ? (
                 <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                   <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                 </div>
               ) : (
                 <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                   <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Guest</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hangman Drawing */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-center items-center h-64 mb-4">
              {renderHangman()}
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wrong Guesses: {wrong} / {maxWrong}
              </div>
              {wrong > 0 && (
                <div className="text-xs text-gray-500">
                  Wrong letters: {Array.from(guessed).filter(letter => !word.includes(letter)).join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <div className="text-2xl tracking-widest font-mono text-center py-3 bg-gray-50 dark:bg-gray-700 rounded border">
                {masked()}
              </div>
              <div className="text-center mt-2 text-xs text-gray-500">
                {word.length} letters
              </div>
            </div>

            {status === "playing" ? (
              <div className="space-y-4">
                <form onSubmit={handleGuess} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-center text-lg font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={input}
                      onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                      maxLength={1}
                      placeholder="?"
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                    >
                      Guess
                    </button>
                  </div>
                </form>
                
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={resetGame} 
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    New Word
                  </button>
                  <a 
                    href="/leaderboard" 
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors text-center"
                  >
                    Leaderboard
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                                 {status === "won" ? (
                   <div className="text-center">
                     <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                       <span className="text-2xl font-bold text-green-600 dark:text-green-400">✓</span>
                     </div>
                     <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">You Won!</p>
                     <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">The word was: <span className="font-mono font-medium">{word}</span></p>
                     <button 
                       className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors" 
                       onClick={() => submitScore(true)}
                     >
                       Submit Score
                     </button>
                   </div>
                 ) : (
                   <div className="text-center">
                     <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                       <span className="text-2xl font-bold text-red-600 dark:text-red-400">✗</span>
                     </div>
                     <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Game Over</p>
                     <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">The word was: <span className="font-mono font-medium">{word}</span></p>
                     <p className="text-xs text-gray-500 mb-4">Better luck next time</p>
                     <button 
                       className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors" 
                       onClick={() => submitScore(false)}
                     >
                       Submit Score
                     </button>
                   </div>
                 )}
                <button 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded transition-colors" 
                  onClick={resetGame}
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>

                 {/* Navigation */}
         <div className="mt-6 flex justify-center">
           <a 
             href="/" 
             className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
           >
             Back to Home
           </a>
         </div>
      </div>
    </div>
  );
}
