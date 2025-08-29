# Waterlily Tech Challenge — Full-stack MVP (3-hour build)
This repository contains my submission for the **Waterlily Technical Take-Home Challenge**.  
The assignment was to design and implement a simple end-to-end survey application where users can log in, answer questions, submit their responses, and then review them.  

My goal was not only to get it working, but to **demonstrate thought process, trade-offs, and decision making** — exactly how I would approach building something real under time constraints.

## 🎯 Project Overview

At its core, the system has three flows:

1. **Authentication** → Users can register and log in. Successful login returns a JWT that must be sent with protected requests.  
2. **Survey Lifecycle** → A survey has a title and questions. Users can fetch surveys, pick one, and answer the questions.  
3. **Response Submission & Review** → Answers are submitted back to the backend and stored. Users can then review what they just submitted.  

I implemented a **full stack solution** with Node.js + TypeScript for the backend and React + Vite for the frontend. The database layer uses SQLite so data persists across restarts, and I styled the UI quickly using TailwindCSS.

## ⚙️ Tech Stack

- **Backend:** Node.js, Express, TypeScript  
- **Auth:** JWT + middleware protection  
- **Validation:** Zod (ensures payloads are correct before hitting the DB)  
- **Database:** SQLite (via better-sqlite3 for simplicity)  
- **Frontend:** React (Vite + TypeScript), TailwindCSS  
- **Tooling:** Nodemon, ts-node, dotenv
---
## ⚖️ Trade-offs & Design Decisions

This assignment was scoped to ~3 hours. To keep within that limit, I made a few intentional trade-offs:

- **SQLite (better-sqlite3) instead of Prisma ORM**  
  Prisma is powerful for schema migrations and type-safety, but setting it up and running migrations takes extra time. For speed, I used SQLite with a thin wrapper. This let me persist data reliably without migration overhead.  
  👉 In a production system, I would absolutely use Prisma (or another ORM) for maintainability and schema evolution.

- **Single-page frontend instead of full routing**  
  I consolidated the frontend into a single `App.tsx` that switches between “login → home → survey → review” stages. This avoided boilerplate and still shows the full user flow.  
  👉 In future iterations, I’d split this into proper routes (`/login`, `/survey/:id`, `/review`) for clarity.

- **Minimal UI styling**  
  I used Tailwind for quick, consistent styles without spending hours polishing pixels. The focus was on functionality, correctness, and clean code.

These choices allowed me to cover **all required functionality** end-to-end while keeping the project achievable in the time limit.

## 📦 Setup Instructions

Clone the repo, then run both backend and frontend separately.

## Backend

```bash
cd waterlily-project
npm install
npm run dev
```

- Runs at http://localhost:3000  
- **Endpoints:**
  - `POST /auth/register` – create account  
  - `POST /auth/login` – get JWT  
  - `GET /surveys` – list all surveys  
  - `GET /surveys/:id` – fetch one survey  
  - `POST /surveys/responses` – submit a response (requires JWT)  
  - `GET /surveys/:id/responses` – view all responses
    
**Frontend:**

```bash
cd waterlily-frontend
npm install
npm run dev
```

- Runs at http://localhost:5173  
- Talks to the backend via API calls (CORS is enabled).  

**Typical Flow to Test**

1.	Register

POST http://localhost:3000/auth/register
{ "email": "me@test.com", "password": "secret123" }

2.	Login → copy the returned token.
3.	Frontend login → enter email/password → token is stored in localStorage.
4.	List surveys → frontend fetches GET /surveys.
5.	Take a survey → frontend fetches GET /surveys/:id and renders inputs.
6.	Submit answers → frontend posts to POST /surveys/responses with { surveyId, answers }.
7.	Review → frontend shows a summary of what you submitted.

**Challenges & Debugging**

Along the way I hit a few real-world issues:

- **CORS errors** – fixed by adding middleware with `origin: process.env.CORS_ORIGIN`.  
- **401 Unauthorized** – caused by missing/incorrect JWT headers. Solved by attaching `Authorization: Bearer <token>` in the frontend helper.  
- **204 No Content on submission** – page went blank; root cause was not awaiting the API response before navigating. Fixed by handling async properly.  
- **Strict TypeScript errors** – TypeScript required explicit types for survey/response objects; I added inline interfaces and mappings.  

Each of these mirrors real engineering work: diagnosing errors, finding root causes, and fixing with clean solutions.

**Future Improvements**

If I had extra time beyond the 3-hour build, I would focus on enhancing the survey user experience (UX). The backend and data model are already functional, so the biggest impact now would come from making the survey flow smoother, clearer, and more engaging for end users.

**1. Single-question display + Navigation**
Instead of showing all questions at once, I would present one question per screen with Next/Previous buttons. This avoids overwhelming users, makes the survey feel lighter, and lays the foundation for features like saving partial progress. The trade-off is extra state management, but the improvement in usability justifies it.

⸻

**2. Progress Indicator**
I would add a simple progress bar or counter (e.g., “Question 2 of 5”) so users always know how far they’ve come and how much is left. This reduces drop-off by creating a sense of progress and completion. The trade-off is minimal implementation effort with a disproportionately high UX payoff.

⸻

**3. Form Validation**
Adding client-side checks for required fields and input constraints (e.g., ensuring numeric answers stay within range) would both improve data quality and give users instant feedback instead of failing after submission. This adds extra frontend logic, but correctness and trust are more valuable than raw speed.

⸻

**4. Responsive Design & UI Polish**
Finally, I would refine the styling with Tailwind’s responsive classes to make the app fully mobile-friendly and improve spacing, layout, and typography. Since many surveys are completed on mobile, responsiveness is critical, though I would prioritize it after functionality improvements since the core flow already works.

⸻

✅ **Why these over others**

I chose to prioritize navigation, progress, and validation because they directly improve completion rates and data accuracy, which are the most important outcomes for any survey tool. UI polish and responsiveness matter, but they enhance perception more than functionality, so I’d implement them last in a real sprint.

**Summary**

This project demonstrates how I approach building a small but complete system under time constraints:

- Start with a clear request flow.  
- Make pragmatic trade-offs.  
- Get end-to-end functionality working.  
- Handle errors thoughtfully.  
- Leave room for clear improvements.  

🌸 Thank you for reviewing my submission!
