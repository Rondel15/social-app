import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId:   { type: String, required: true },
    content:  { type: String, required: true, maxlength: 1000 },
    read:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
