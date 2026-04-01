import Registration from "../models/Registration.js";
import { analyzeResume, generateMockQuestions } from "../services/groqService.js";
import { sendEmail } from "../services/resendService.js";
import pdf from "pdf-parse";

export async function listAll(req, res, next){
  try{
    const items = await Registration.find({})
      .populate("student", "name email role")
      .sort({ createdAt: -1 });
    res.json(items);
  }catch(err){ next(err); }
}

export async function myList(req, res, next){
  try{
    const items = await Registration.find({ student: req.user._id })
      .populate("student", "name email role")
      .sort({ createdAt: -1 });
    res.json(items);
  }catch(err){ next(err); }
}

export async function createRegistration(req, res, next){
  try{
    const { driveName, skills, notes } = req.body;

    const skillsArr = String(skills || "")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    let resumeText = "";
    if(req.file){
      // parse PDF into text
      const data = await pdf(req.file.buffer);
      resumeText = data.text || "";
    }

    let aiFeedback = "";
    if(resumeText && process.env.GROQ_API_KEY){
      aiFeedback = await analyzeResume({ resumeText, skills: skillsArr });
    }

    const item = await Registration.create({
      driveName,
      skills: skillsArr,
      notes: notes || "",
      resumeText,
      aiFeedback,
      student: req.user._id
    });

    // optional email
    await sendEmail({
      to: process.env.ADMIN_EMAIL || "delivered@resend.dev",
      subject: "New Placement Registration",
      html: `<p><b>${req.user.name}</b> registered for drive: <b>${driveName}</b></p>`
    }).catch(() => {});

    res.status(201).json(item);
  }catch(err){
    if(err.code === 11000){
      res.status(400);
      return next(new Error("Already registered for this drive"));
    }
    next(err);
  }
}

export async function updateStatus(req, res, next){
  try{
    const { id } = req.params;
    const { status } = req.body;

    const item = await Registration.findById(id).populate("student", "email name");
    if(!item){ res.status(404); throw new Error("Entry not found"); }

    item.status = status;
    await item.save();

    // optional email notify student
    await sendEmail({
      to: item.student.email,
      subject: "Placement Status Update",
      html: `<p>Hello ${item.student.name},</p><p>Your status for <b>${item.driveName}</b> is updated to <b>${status}</b>.</p>`
    }).catch(() => {});

    res.json(item);
  }catch(err){ next(err); }
}

export async function removeEntry(req, res, next){
  try{
    const { id } = req.params;
    const item = await Registration.findByIdAndDelete(id);
    if(!item){ res.status(404); throw new Error("Entry not found"); }
    res.json({ message: "Removed" });
  }catch(err){ next(err); }
}

export async function generateMock(req, res, next){
  try{
    const { id } = req.params;
    const item = await Registration.findById(id).populate("student", "name email");
    if(!item){ res.status(404); throw new Error("Entry not found"); }

    const questions = await generateMockQuestions({
      skills: item.skills || [],
      resumeText: item.resumeText || ""
    });

    item.aiQuestions = questions;
    await item.save();

    res.json({ message: "Mock questions generated", questions });
  }catch(err){ next(err); }
}
