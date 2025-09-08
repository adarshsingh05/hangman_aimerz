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
    const rateLimit = checkRateLimit(`login:${clientIP}`, { requests: 5, window: 15 * 60 * 1000 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
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
    const validation = validateAndSanitize(body, VALIDATION_SCHEMAS.LOGIN);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: validation.errors
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { email, password } = validation.data;

    await dbConnect();

    // Find user with case-insensitive email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Log failed login attempt (without revealing if email exists)
      console.warn(`Failed login attempt for email: ${email} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn(`Failed login attempt for user: ${user._id} from IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Generate token and cookie
    const token = createToken(user._id.toString());
    const cookie = getSetCookieHeader(token);

    

    return NextResponse.json(
      { 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email,
          gamesPlayed: user.gamesPlayed || 0,
          score: user.score || 0
        },
        token: token
      },
      { 
        status: 200, 
        headers: { 
          "Set-Cookie": cookie,
          ...SECURITY_HEADERS
        } 
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error, 'Login');
    return NextResponse.json(
      errorResponse,
      { 
        status: errorResponse.statusCode,
        headers: SECURITY_HEADERS
      }
    );
  }
}
