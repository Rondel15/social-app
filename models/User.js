import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username:  { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, required: true, minlength: 6 },
    name:      { type: String, default: "" },
    avatar:    { type: String, default: "" },
    cover:     { type: String, default: "" },
    bio:       { type: String, default: "", maxlength: 200 },
    location:  { type: String, default: "" },
    website:   { type: String, default: "" },
    friends:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isOnline:  { type: Boolean, default: false },
    lastSeen:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
