import { body } from "express-validator";

export const createRegistrationRules = [
  body("driveName").trim().isLength({ min: 3 }).withMessage("Drive name required"),
  body("skills").optional().trim(),
  body("notes").optional().trim(),
];

export const statusRules = [
  body("status").isIn(["pending","selected","rejected"]).withMessage("Invalid status"),
];
