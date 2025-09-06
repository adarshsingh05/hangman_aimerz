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
    secure: false, // Force to false for HTTP on EC2
    sameSite: "lax", // Keep as lax for same-origin requests
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getUserFromReq(req) {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  console.log("Authorization header:", authHeader);
  
  let token = null;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
    console.log("Token from Authorization header:", token ? "Found" : "Not found");
  } else {
    // Fallback to cookies
    const cookieHeader = req.headers.get("cookie") || "";
    console.log("Raw cookie header:", cookieHeader);
    
    const { token: cookieToken } = parse(cookieHeader || "");
    token = cookieToken;
    console.log("Token from cookie:", token ? "Found" : "Not found");
  }
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully for user:", decoded.userId);
    await dbConnect();
    const user = await User.findById(decoded.userId).select("-password");
    console.log("User found in DB:", user ? "Yes" : "No");
    return user;
  } catch (err) {
    console.log("Token verification failed:", err.message);
    return null;
  }
}
