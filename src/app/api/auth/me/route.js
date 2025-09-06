// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { getUserFromReq } from "../../../../../lib/auth";

export async function GET(req) {
  console.log("GET /api/auth/me called");
  
  // Debug all headers
  console.log("All headers:", Object.fromEntries(req.headers.entries()));
  
  // Debug cookie headers
  const cookieHeader = req.headers.get("cookie");
  console.log("Cookie header:", cookieHeader);
  
  // Debug Authorization header
  const authHeader = req.headers.get("authorization");
  console.log("Authorization header:", authHeader);
  
  const user = await getUserFromReq(req);
  console.log("User from request:", user ? "Found user" : "No user found");
  
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user }, { status: 200 });
}
