// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { getUserFromReq } from "../../../../../lib/auth";
export async function GET(req) {
  const user = await getUserFromReq(req);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user }, { status: 200 });
}
