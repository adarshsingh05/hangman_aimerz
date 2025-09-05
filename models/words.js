// models/Word.js
import mongoose from "mongoose";

const WordSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" }
  },
  { timestamps: true }
);

const Word = mongoose.models.Word || mongoose.model("Word", WordSchema);
export default Word;
