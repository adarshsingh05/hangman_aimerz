// app/api/game/random/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/mongoose";
import Word from "../../../../../models/words";

export async function GET() {
  try {
    await dbConnect();
    
    const res = await Word.aggregate([{ $sample: { size: 1 } }]);
    
    if (res && res[0] && res[0].text) {
      return NextResponse.json({ word: res[0].text }, { status: 200 });
    }
    
    // If no words found, return error
    return NextResponse.json({ 
      error: "No words available in database" 
    }, { status: 404 });
    
  } catch (error) {
    console.error("Error fetching random word:", error);
    return NextResponse.json({ 
      error: "Failed to fetch random word" 
    }, { status: 500 });
  }
}
