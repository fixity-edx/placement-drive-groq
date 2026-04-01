import mongoose from "mongoose";

/**
 * RBAC Roles:
 * - admin: manage registrations, update status, generate mock questions
 * - student: register + check status
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "student"], default: "student" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
