// app/api/leaderboard/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
export async function GET() {
  await dbConnect();
  const top = await User.find().sort({ score: -1 }).limit(5).select("name score wins gamesPlayed");
  return NextResponse.json({ top }, { status: 200 });
}
