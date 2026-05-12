import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:      { type: String, enum: ["like", "comment", "friend_request", "friend_accept", "message"], required: true },
    reference: { type: mongoose.Schema.Types.ObjectId, refPath: "referenceModel" },
    referenceModel: { type: String, enum: ["Post", "FriendRequest", "Message"] },
    read:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
