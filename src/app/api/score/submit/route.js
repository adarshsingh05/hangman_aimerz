// app/api/score/submit/route.js - Updated import paths
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import { getUserFromReq } from "../../../../../lib/auth";

export async function POST(req) {
  const body = await req.json();
  const { score, win } = body; // caller must send score and whether it was a win
  const user = await getUserFromReq(req);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await dbConnect();
  const update = {
    $inc: {
      gamesPlayed: 1,
      score: score || 0,
      wins: win ? 1 : 0,
      losses: win ? 0 : 1
    }
  };

  const updated = await User.findByIdAndUpdate(user._id, update, { new: true }).select("name score gamesPlayed wins losses");
  return NextResponse.json({ user: updated }, { status: 200 });
}
