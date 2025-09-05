import { NextResponse } from "next/server";

export async function POST() {
  // Clear the auth cookie by setting it to expire
  const cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; httpOnly; secure; sameSite=lax";
  
  return NextResponse.json(
    { message: "Logged out successfully" },
    { 
      status: 200, 
      headers: { 
        "Set-Cookie": cookie,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      } 
    }
  );
}
