import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import bcrypt from "bcryptjs";
import { createToken, getSetCookieHeader } from "../../../../../lib/auth";
import { validateAndSanitize, VALIDATION_SCHEMAS } from "../../../../../lib/validation";
import { handleApiError, validateRequestBody, checkRateLimit, SECURITY_HEADERS } from "../../../../../lib/errorHandler";

export async function POST(req) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`signup:${clientIP}`, { requests: 3, window: 60 * 60 * 1000 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many signup attempts. Please try again later.",
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
      name: { type: 'string', required: true },
      email: { type: 'string', required: true },
      password: { type: 'string', required: true }
    });

    if (bodyValidation) {
      return NextResponse.json(bodyValidation, { 
        status: bodyValidation.statusCode, 
        headers: SECURITY_HEADERS 
      });
    }

    // Validate and sanitize input data
    const validation = validateAndSanitize(body, VALIDATION_SCHEMAS.SIGNUP);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.errors
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { name, email, password } = validation.data;

    await dbConnect();

    // Checking if user already exists (case-insensitive email)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.warn(`Signup attempt with existing email: ${email} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({ 
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      score: 0
    });

    // Generate token and cookie
    const token = createToken(user._id.toString());
    const cookie = getSetCookieHeader(token);

    // Log successful signup
    console.log(`New user registered: ${user._id} from IP: ${clientIP}`);

    return NextResponse.json(
      { 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email,
          gamesPlayed: user.gamesPlayed,
          score: user.score
        },
        token: token
      },
      { 
        status: 201, 
        headers: { 
          "Set-Cookie": cookie,
          ...SECURITY_HEADERS
        } 
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error, 'Signup');
    return NextResponse.json(
      errorResponse,
      { 
        status: errorResponse.statusCode,
        headers: SECURITY_HEADERS
      }
    );
  }
}
