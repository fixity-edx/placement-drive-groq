import { Router } from "express";
import multer from "multer";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createRegistrationRules, statusRules } from "../validators/registrationValidators.js";
import {
  listAll, myList, createRegistration, updateStatus, removeEntry, generateMock
} from "../controllers/registrationController.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// student routes
router.get("/my", protect, requireRole("student","admin"), myList);
router.post("/", protect, requireRole("student"), upload.single("resume"), createRegistrationRules, validate, createRegistration);

// admin routes
router.get("/", protect, requireRole("admin"), listAll);
router.put("/:id/status", protect, requireRole("admin"), statusRules, validate, updateStatus);
router.delete("/:id", protect, requireRole("admin"), removeEntry);
router.post("/:id/generate-mock", protect, requireRole("admin"), generateMock);

export default router;
