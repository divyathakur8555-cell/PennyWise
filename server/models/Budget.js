
import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    month: {
      type: Number,
      required: true,
      min: 0,
      max: 11,
    },

    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

budgetSchema.index(
  { user: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

export default mongoose.model("Budget", budgetSchema);
