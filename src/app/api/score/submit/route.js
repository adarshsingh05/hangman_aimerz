// app/api/score/submit/route.js - Enhanced with validation and error handling
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import { getUserFromReq } from "../../../../../lib/auth";
import { validateAndSanitize, VALIDATION_SCHEMAS } from "../../../../../lib/validation";
import { handleApiError, validateRequestBody, checkRateLimit, SECURITY_HEADERS } from "../../../../../lib/errorHandler";

export async function POST(req) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`score:${clientIP}`, { requests: 50, window: 60 * 1000 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many score submissions. Please try again later.",
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

    // Authenticate user
    const user = await getUserFromReq(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Validate request body structure
    const bodyValidation = validateRequestBody(body, {
      score: { type: 'number', required: true },
      win: { type: 'boolean', required: true }
    });

    if (bodyValidation) {
      return NextResponse.json(bodyValidation, { 
        status: bodyValidation.statusCode, 
        headers: SECURITY_HEADERS 
      });
    }

    // Validate and sanitize input data
    const validation = validateAndSanitize(body, VALIDATION_SCHEMAS.SCORE_SUBMIT);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.errors
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { score, win } = validation.data;

    await dbConnect();

    // Update user stats
    const update = {
      $inc: {
        gamesPlayed: 1,
        score: score,
        wins: win ? 1 : 0,
        losses: win ? 0 : 1
      }
    };

    const updated = await User.findByIdAndUpdate(
      user._id, 
      update, 
      { new: true }
    ).select("name score gamesPlayed wins losses");

    if (!updated) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // Log score submission
    console.log(`Score submitted by user ${user._id}: ${score} points, ${win ? 'win' : 'loss'}`);

    return NextResponse.json(
      { user: updated }, 
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    const errorResponse = handleApiError(error, 'ScoreSubmit');
    return NextResponse.json(
      errorResponse,
      { 
        status: errorResponse.statusCode,
        headers: SECURITY_HEADERS
      }
    );
  }
}
