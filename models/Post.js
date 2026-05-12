import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 500 },
    likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content:  { type: String, default: "", maxlength: 2000 },
    media:    [{ url: String, type: { type: String, enum: ["image", "video"] } }],
    likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    visibility: { type: String, enum: ["public", "friends"], default: "friends" },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
