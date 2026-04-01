import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    driveName: { type: String, required: true, trim: true },

    skills: [{ type: String, trim: true }],
    notes: { type: String, default: "" },

    resumeText: { type: String, default: "" },
    aiFeedback: { type: String, default: "" },
    aiQuestions: [{ type: String }],

    status: { type: String, enum: ["pending", "selected", "rejected"], default: "pending" },

    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

registrationSchema.index({ driveName: 1, student: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);
