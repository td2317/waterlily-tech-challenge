// src/lib/db.ts
import Database from "better-sqlite3";
import path from "path";

// create/open dev.db in your project root
const db = new Database(path.join(process.cwd(), "dev.db"));
db.pragma("journal_mode = WAL");

// --- schema ---------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS users(
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT
  );

  CREATE TABLE IF NOT EXISTS surveys(
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions(
    id TEXT PRIMARY KEY,
    survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS responses(
    id TEXT PRIMARY KEY,
    user_id TEXT,
    survey_id TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    submitted_at TEXT NOT NULL,
    answers_json TEXT NOT NULL
  );
`);

// --- seed a demo survey once ----------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 10);

const row = db.prepare(`SELECT COUNT(*) AS c FROM surveys`).get() as { c: number };
if (row.c === 0) {
  const sid = uid();

  db.prepare(
    `INSERT INTO surveys(id, title, created_at) VALUES (?, ?, ?)`
  ).run(sid, "Waterlily Intake", new Date().toISOString());

  const insertQ = db.prepare(
    `INSERT INTO questions(id, survey_id, text, description) VALUES (?, ?, ?, ?)`
  );

  const q1 = uid();
  const q2 = uid();
  const q3 = uid();

  insertQ.run(q1, sid, "How did you discover us?", "Open text");
  insertQ.run(q2, sid, "Hours per day doing care tasks?", "Number");
  insertQ.run(q3, sid, "Do you have LTC insurance?", "true/false");
}

export default db;