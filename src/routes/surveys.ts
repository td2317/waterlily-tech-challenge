// src/routes/surveys.ts
import { Router, type Request, type Response, type NextFunction } from "express";
import { CreateSurveySchema, SubmitResponseSchema } from "../schemas/survey";
import {
  createSurvey,
  listSurveys,
  getSurveyById,
  submitResponse,
  listResponses,
} from "../services/surveyService";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// POST /surveys -> create a survey
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateSurveySchema.parse(req.body);
    const created = createSurvey(parsed);
    return res.status(201).json({ message: "created", data: created });
  } catch (err) {
    return next(err);
  }
});

// GET /surveys -> list surveys
router.get("/", (_req: Request, res: Response) => {
  const all = listSurveys();
  return res.json({ count: all.length, data: all });
});

// GET /surveys/:id -> get one survey
router.get("/:id", (req: Request, res: Response) => {
  const s = getSurveyById(req.params.id);
  if (!s) return res.status(404).json({ error: "not_found" });
  return res.json({ data: s });
});

// POST /surveys/responses -> submit a response (protected)
router.post(
  "/responses",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = SubmitResponseSchema.parse(req.body);
      const r = submitResponse(parsed);
      return res.status(201).json({ message: "submitted", data: r });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /surveys/:id/responses -> list responses for a survey
router.get("/:id/responses", (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = listResponses(req.params.id);
    return res.json({ count: items.length, data: items });
  } catch (err) {
    return next(err);
  }
});

export default router;