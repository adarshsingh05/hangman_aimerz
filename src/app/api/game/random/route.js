// app/api/game/random/route.js - Enhanced with validation and error handling
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongoose";
import Word from "../../../../../models/words";
import { handleApiError, checkRateLimit, SECURITY_HEADERS } from "../../../../../lib/errorHandler";

export async function GET(req) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`game:${clientIP}`, { requests: 100, window: 60 * 1000 });
    
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
    
    // Get random word from database
    const words = await Word.aggregate([
      { $sample: { size: 1 } },
      { $project: { text: 1, _id: 0 } }
    ]);
    
    if (!words || words.length === 0 || !words[0] || !words[0].text) {
      console.error("No words found in database");
      return NextResponse.json(
        { 
          error: "No words available in database. Please contact support." 
        }, 
        { status: 503, headers: SECURITY_HEADERS }
      );
    }

    const word = words[0].text;
    
    // Validate word format
    if (typeof word !== 'string' || word.length < 3 || word.length > 20) {
      console.error("Invalid word format:", word);
      return NextResponse.json(
        { 
          error: "Invalid word format. Please try again." 
        }, 
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    // Log word request (without revealing the actual word for security)
    console.log(`Random word requested from IP: ${clientIP}, length: ${word.length}`);
    
    return NextResponse.json(
      { word: word.toLowerCase() }, 
      { status: 200, headers: SECURITY_HEADERS }
    );
    
  } catch (error) {
    const errorResponse = handleApiError(error, 'RandomWord');
    return NextResponse.json(
      errorResponse,
      { 
        status: errorResponse.statusCode,
        headers: SECURITY_HEADERS
      }
    );
  }
}
