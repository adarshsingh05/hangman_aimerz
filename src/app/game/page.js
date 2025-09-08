// app/game/page.js
"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function GameContent() {
  const [word, setWord] = useState("");
  const [guessed, setGuessed] = useState(new Set());
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(0);
  const maxWrong = 6;
  const [status, setStatus] = useState("playing"); // playing | won | lost three things only
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkingAuth = async () => {
      try {
        const mode = searchParams.get("mode");
        if (mode === "guest") {
          setIsGuest(true);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        
        // If no token in localStorage, set as guest
        if (!token) {
          setIsGuest(true);
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
          // If API returns no user, clear localStorage and set as guest
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setIsGuest(true);
        }
      } catch (error) {
        console.error("Auth checking failed:", error);
        // On error, clear localStorage and set as guest
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setIsGuest(true);
      } finally {
        setLoading(false);
      }
    };

    const resetGame = async () => {
      try {
        const res = await fetch("/api/game/random", {
          credentials: "include"
        });
        const json = await res.json();
        
        if (res.ok && json.word) {
          const w = json.word.toLowerCase();
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
        alert("Network error. Please checking your connection and try again.");
      }
    };

    checkingAuth();
    resetGame();
  }, [searchParams]);


  async function resetGame() {
    try {
      const res = await fetch("/api/game/random", {
        credentials: "include"
      });
      const json = await res.json();
      
      if (res.ok && json.word) {
        const w = json.word.toLowerCase();
        
        // Validate word format
        if (typeof w !== 'string' || w.length < 3 || w.length > 20) {
          console.error("Invalid word format received:", w);
          alert("Invalid word received. Please try again.");
          return;
        }
        
        // checking for non-alphabetic characters
        if (!/^[a-z]+$/.test(w)) {
          console.error("Word contains invalid characters:", w);
          alert("Invalid word format. Please try again.");
          return;
        }
        
        setWord(w);
        setGuessed(new Set());
        setWrong(0);
        setStatus("playing");
        setInput("");
        console.log("New game started with word length:", w.length);
      } else {
        console.error("Failed to get random word:", json.error);
        
        // Handle different error types
        if (res.status === 429) {
          alert("Too many requests. Please wait a moment and try again.");
        } else if (res.status === 503) {
          alert("Game service temporarily unavailable. Please try again later.");
        } else {
          alert(`Failed to load a word: ${json.error || "Unknown error"}`);
        }
      }
    } catch (error) {
      console.error("Error fetching random word:", error);
      alert("Network error. Please checking your connection and try again.");
    }
  }

  function masked() {
    return word.split("").map((c, i) => (guessed.has(c) ? c : "_")).join(" ");
  }

  function renderHangman() {
    const stages = [
      // 0 wrong guesses - empty gallows
      <div key="stage-0" className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
      </div>,
      
      // 1 wrong guess - head
      <div key="stage-1" className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
      </div>,
      
      // 2 wrong guesses - head + body
      <div key="stage-2" className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-600 dark:bg-gray-400"></div>
      </div>,
      
      // 3 wrong guesses - head + body + left arm
      <div key="stage-3" className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 rotate-45 origin-left"></div>
      </div>,
      
      // 4 wrong guesses - head + body + both arms
      <div key="stage-4" className="w-40 h-48 mx-auto relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-48 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute bottom-0 left-0 w-24 h-1 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 dark:border-gray-400 rounded-full"></div>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gray-600 dark:bg-gray-400"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 rotate-45 origin-left"></div>
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 dark:bg-gray-400 -rotate-45 origin-right"></div>
      </div>,
      
      // 5 wrong guesses - head + body + both arms + left leg
      <div key="stage-5" className="w-40 h-48 mx-auto relative">
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
      <div key="stage-6" className="w-40 h-48 mx-auto relative">
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
    
    // Validate game state
    if (status !== "playing") {
      console.warn("Attempted to guess when game is not in playing state:", status);
      return;
    }
    
    if (!input || input.trim() === "") {
      console.warn("Empty input provided");
      return;
    }
    
    // Validate input format
    const letter = input[0].toLowerCase();
    if (!/^[a-z]$/.test(letter)) {
      console.warn("Invalid character provided:", input[0]);
      alert("Please enter a valid letter (a-z)");
      setInput("");
      return;
    }
    
    // checking if letter was already guessed
    if (guessed.has(letter)) {
      console.warn("Letter already guessed:", letter);
      alert("You've already guessed this letter!");
      setInput("");
      return;
    }
    
    setInput("");
    
    // Add letter to guessed set
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);
    
    console.log(`Guessed letter: ${letter}, Word contains: ${word.includes(letter)}`);
    
    if (!word.includes(letter)) {
      const w = wrong + 1;
      setWrong(w);
      console.log(`Wrong guess! Wrong count: ${w}/${maxWrong}`);
      
      if (w >= maxWrong) {
        setStatus("lost");
        console.log("Game lost!");
      }
    } else {
      // checking if all letters are revealed (win condition)
      const allRevealed = word.split("").every((ch) => newGuessed.has(ch));
      if (allRevealed) {
        setStatus("won");
        console.log("Game won!");
      }
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
      
      // Validate score before submission
      if (score < 0 || score > 10000) {
        console.error("Invalid score calculated:", score);
        alert("Invalid score. Please try again.");
        return;
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        alert("Authentication required to submit score. Please log in again.");
        return;
      }

      const response = await fetch("/api/score/submit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ score, win }),
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Score submitted successfully:", data);
        alert("Score submitted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Score submission failed:", errorData);
        
        // Handle different error types
        if (response.status === 401) {
          alert("Session expired. Please log in again.");
          // Clear localStorage and redirect to login
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else if (response.status === 429) {
          alert("Too many requests. Please wait a moment and try again.");
        } else {
          alert(`Failed to submit score: ${errorData.error || "Unknown error"}`);
        }
      }
    } catch (error) {
      console.error("Score submission failed:", error);
      alert("Network error. Please checking your connection and try again.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-light">Loading game...</p>
        </div>
      </div>
    );
  }

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
              {user ? (
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {user.name}
                </span>
              ) : (
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Guest
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-24">
          <h1 className="text-4xl sm:text-5xl font-light text-black dark:text-white mb-6 tracking-tight">
            HANGMAN
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light">Guess the word before the hangman is complete</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Hangman Drawing */}
          <div className="lg:col-span-2 card-elevated p-8">
            <div className="flex justify-center items-center h-80 mb-6">
              {renderHangman()}
            </div>
            <div className="text-center">
              <div className="text-base font-medium text-black dark:text-white mb-3">
                Wrong Guesses: {wrong} / {maxWrong}
              </div>
              {wrong > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Wrong letters: {Array.from(guessed).filter(letter => !word.includes(letter)).join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <div className="card-elevated p-8">
            <div className="mb-8">
              <div className="text-3xl tracking-widest font-mono text-center py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                {masked()}
              </div>
              <div className="text-center mt-3 text-sm text-gray-600 dark:text-gray-400 font-light">
                {word.length} letters
              </div>
            </div>

            {status === "playing" ? (
              <div className="space-y-6">
                <form onSubmit={handleGuess} className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      className="flex-1 input-field text-center text-xl font-medium"
                      value={input}
                      onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                      maxLength={1}
                      placeholder="?"
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="btn-primary px-6 py-3"
                    >
                      Guess
                    </button>
                  </div>
                </form>
                
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={resetGame} 
                    className="btn-secondary flex-1 py-3"
                  >
                    New Word
                  </button>
                  <Link 
                    href="/leaderboard" 
                    className="btn-secondary flex-1 py-3 text-center"
                  >
                    Leaderboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {status === "won" ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl font-medium text-black dark:text-white">✓</span>
                    </div>
                    <p className="text-xl font-medium text-black dark:text-white mb-3">You Won!</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-light">The word was: <span className="font-mono font-medium text-black dark:text-white">{word}</span></p>
                    <button 
                      className="btn-primary w-full py-4" 
                      onClick={() => submitScore(true)}
                    >
                      Submit Score
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl font-medium text-black dark:text-white">✗</span>
                    </div>
                    <p className="text-xl font-medium text-black dark:text-white mb-3">Game Over</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-light">The word was: <span className="font-mono font-medium text-black dark:text-white">{word}</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-6 font-light">Better luck next time</p>
                    <button 
                      className="btn-primary w-full py-4" 
                      onClick={() => submitScore(false)}
                    >
                      Submit Score
                    </button>
                  </div>
                )}
                <button 
                  className="btn-secondary w-full py-4" 
                  onClick={resetGame}
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
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

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-light">Loading game...</p>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
