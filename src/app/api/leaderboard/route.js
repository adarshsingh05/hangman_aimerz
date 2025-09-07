// app/api/leaderboard/route.js - Enhanced with validation and error handling
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import { handleApiError, checkRateLimit, SECURITY_HEADERS } from "../../../../lib/errorHandler";

export async function GET(req) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`leaderboard:${clientIP}`, { requests: 30, window: 60 * 1000 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
            ...SECURITY_HEADERS
          }
        }
      );
    }

    await dbConnect();
    
    // Get top players with proper error handling
    const top = await User.find()
      .sort({ score: -1, gamesPlayed: -1, wins: -1 })
      .limit(10)
      .select("name score wins gamesPlayed losses")
      .lean(); // Use lean() for better performance

    if (!top) {
      return NextResponse.json(
        { error: "Failed to fetch leaderboard data" },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Sanitize and format the data
    const sanitizedTop = top.map((user, index) => ({
      rank: index + 1,
      name: user.name || 'Anonymous',
      score: user.score || 0,
      wins: user.wins || 0,
      gamesPlayed: user.gamesPlayed || 0,
      losses: user.losses || 0,
      winRate: user.gamesPlayed > 0 ? Math.round((user.wins / user.gamesPlayed) * 100) : 0
    }));

    // Log leaderboard request
    console.log(`Leaderboard requested from IP: ${clientIP}, returned ${sanitizedTop.length} players`);

    return NextResponse.json(
      { top: sanitizedTop }, 
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    const errorResponse = handleApiError(error, 'Leaderboard');
    return NextResponse.json(
      errorResponse,
      { 
        status: errorResponse.statusCode,
        headers: SECURITY_HEADERS
      }
    );
  }
}
