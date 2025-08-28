// I’m importing the validated input types and my SQLite connection so this service can read/write the database. import type { CreateSurveyInput, SubmitResponseInput } from "../schemas/survey";
import db from "../lib/db";

// These are the shapes my API returns—clean, minimal objects, not DB rows
type Question = { id: string; text: string; description?: string };
type Survey = { id: string; title: string; createdAt: string; questions: Question[] };
type ResponseItem = {
  id: string;
  surveyId: string;
  answers: Record<string, string | number | boolean>;
  submittedAt: string;
};

// I’m using a small uid helper to generate IDs for demo purposes.
const uid = () => Math.random().toString(36).slice(2, 10);

// I insert the survey row with a new id and timestamp
export function createSurvey(input: CreateSurveyInput): Survey {
  const id = uid();
  const createdAt = new Date().toISOString();
  db.prepare("INSERT INTO surveys(id,title,created_at) VALUES(?,?,?)")
    .run(id, input.title, createdAt);

  // The DB generates question IDs, and I return them so the client uses the real IDs later when submitting answers.
  const insertQ = db.prepare(
    "INSERT INTO questions(id,survey_id,text,description) VALUES(?,?,?,?)"
  );
  const questions: Question[] = input.questions.map((q) => {
    const qid = uid();
    insertQ.run(qid, id, q.text, q.description ?? null);
    return { id: qid, text: q.text, description: q.description };
  });

  // We return exactly what the API will send to the frontend
  return { id, title: input.title, createdAt, questions };
}

// I fetch all surveys ordered by newest
export function listSurveys(): Survey[] {
  const surveys = db.prepare(
    "SELECT id, title, created_at as createdAt FROM surveys ORDER BY created_at DESC"
  ).all() as { id: string; title: string; createdAt: string }[];

  // For each survey, I pull its questions and return a simple array of {id,text,description}.
  const getQs = db.prepare(
    "SELECT id, text, description FROM questions WHERE survey_id=?"
  );

  return surveys.map((s) => {
    const qs = getQs.all(s.id) as { id: string; text: string; description: string | null }[];
    return {
      ...s,
      questions: qs.map((q) => ({ id: q.id, text: q.text, description: q.description ?? undefined })),
    };
  });
}

// If the survey doesn’t exist, the route will return 404.
export function getSurveyById(id: string): Survey | undefined {
  const s = db.prepare(
    "SELECT id, title, created_at as createdAt FROM surveys WHERE id=?"
  ).get(id) as { id: string; title: string; createdAt: string } | undefined;

  if (!s) return undefined;

  // Load questions and return the combined object.
  const qs = db.prepare(
    "SELECT id, text, description FROM questions WHERE survey_id=?"
  ).all(id) as { id: string; text: string; description: string | null }[];

  return {
    ...s,
    questions: qs.map((q) => ({ id: q.id, text: q.text, description: q.description ?? undefined })),
  };
}

// I verify the survey exists and throw a structured 404 otherwise.
export function submitResponse(input: SubmitResponseInput): ResponseItem {
  const s = db.prepare("SELECT id FROM surveys WHERE id=?").get(input.surveyId) as { id: string } | undefined;
  if (!s) throw { status: 404, code: "survey_not_found" };

  // I reject any answers with unknown question IDs, so clients can’t spoof data.
  const allowed = new Set(
    (db.prepare("SELECT id FROM questions WHERE survey_id=?").all(input.surveyId) as { id: string }[]).map(q => q.id)
  );
  for (const qid of Object.keys(input.answers)) {
    if (!allowed.has(qid)) {
      throw {
        status: 400,
        code: "validation_error",
        issues: [{ path: ["answers", qid], message: "unknown question id" }],
      };
    }
  }

  // I store answers as JSON for flexibility. In a real app I’d use the logged-in user id from req.user.
  const id = uid();
  const submittedAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO responses(id,user_id,survey_id,submitted_at,answers_json) VALUES(?,?,?,?,?)"
  ).run(id, "demo-user", input.surveyId, submittedAt, JSON.stringify(input.answers));

  // Return a neat JSON for the route to send back.
  return { id, surveyId: input.surveyId, answers: input.answers, submittedAt };
}

// Guard: if the survey doesn’t exist, throw 404.
export function listResponses(surveyId: string): ResponseItem[] {
  const exists = db.prepare("SELECT 1 FROM surveys WHERE id=?").get(surveyId);
  if (!exists) throw { status: 404, code: "survey_not_found" };

  //  I return all responses for that survey, parsing the JSON answers.
  const rows = db.prepare(
    "SELECT id, survey_id as surveyId, submitted_at as submittedAt, answers_json as answersJson FROM responses WHERE survey_id=? ORDER BY submitted_at DESC"
  ).all(surveyId) as { id: string; surveyId: string; submittedAt: string; answersJson: string }[];

  return rows.map((r) => ({
    id: r.id,
    surveyId: r.surveyId,
    submittedAt: r.submittedAt,
    answers: JSON.parse(r.answersJson),
  }));
}
