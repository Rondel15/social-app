import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";
import Notification from "@/models/Notification";

// GET /api/friends
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const userId = session.user.id;
    const requests = await FriendRequest.find({ receiver: userId, status: "pending" }).populate("sender", "username name avatar");
    const user = await User.findById(userId).populate("friends", "username name avatar isOnline lastSeen");
    return NextResponse.json({ requests, friends: user.friends });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/friends — send request
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { receiverId } = await req.json();
    const senderId = session.user.id;
    if (senderId === receiverId) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
    const exists = await FriendRequest.findOne({ $or: [{ sender: senderId, receiver: receiverId }, { sender: receiverId, receiver: senderId }] });
    if (exists) return NextResponse.json({ error: "Request already exists" }, { status: 409 });
    const request = await FriendRequest.create({ sender: senderId, receiver: receiverId });
    await Notification.create({ recipient: receiverId, sender: senderId, type: "friend_request", reference: request._id, referenceModel: "FriendRequest" });
    return NextResponse.json({ request }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/friends — accept or decline
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { requestId, action } = await req.json();
    const userId = session.user.id;
    const request = await FriendRequest.findById(requestId);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (request.receiver.toString() !== userId) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    if (action === "accept") {
      request.status = "accepted";
      await request.save();
      await User.findByIdAndUpdate(userId, { $addToSet: { friends: request.sender } });
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: userId } });
      await Notification.create({ recipient: request.sender, sender: userId, type: "friend_accept", reference: request._id, referenceModel: "FriendRequest" });
    } else {
      request.status = "declined";
      await request.save();
    }
    return NextResponse.json({ request });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/friends — unfriend
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const { friendId } = await req.json();
    const userId = session.user.id;
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    await FriendRequest.deleteOne({ $or: [{ sender: userId, receiver: friendId }, { sender: friendId, receiver: userId }] });
    return NextResponse.json({ message: "Unfriended" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
