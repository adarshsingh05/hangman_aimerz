// app/api/auth/me/route.js - Enhanced with validation and error handling
import { NextResponse } from "next/server";
import { getUserFromReq } from "../../../../../lib/auth";
import { handleApiError, checkRateLimit, SECURITY_HEADERS } from "../../../../../lib/errorHandler";

export async function GET(req) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`auth:${clientIP}`, { requests: 60, window: 60 * 1000 });
    
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

    const user = await getUserFromReq(req);
    
    if (!user) {
      return NextResponse.json(
        { user: null }, 
        { status: 200, headers: SECURITY_HEADERS }
      );
    }

    // Sanitize user data before sending
    const sanitizedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      gamesPlayed: user.gamesPlayed || 0,
      wins: user.wins || 0,
      losses: user.losses || 0,
      score: user.score || 0
    };

    return NextResponse.json(
      { user: sanitizedUser }, 
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    const errorResponse = handleApiError(error, 'AuthMe');
    return NextResponse.json(
      errorResponse,
      { 
        status: errorResponse.statusCode,
        headers: SECURITY_HEADERS
      }
    );
  }
}
