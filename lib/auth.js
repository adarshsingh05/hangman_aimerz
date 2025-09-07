import jwt from "jsonwebtoken";
import { parse, serialize } from "cookie";
import dbConnect from "./mongoose";
import User from "../models/users";
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in .env.local");
}

export function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function getSetCookieHeader(token) {
  // Check if we're in production and using HTTPS
  const isSecure = process.env.NODE_ENV === "production" && 
                   (process.env.HTTPS === "true" || process.env.FORCE_HTTPS === "true");
  
  return serialize("token", token, {
    httpOnly: true,
    secure: false, 
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getUserFromReq(req) {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  
  let token = null;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookies
    const cookieHeader = req.headers.get("cookie") || "";
    
    const { token: cookieToken } = parse(cookieHeader || "");
    token = cookieToken;
  }
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.userId).select("-password");
    return user;
  } catch (err) {
    return null;
  }
}
