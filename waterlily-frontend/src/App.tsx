import { useState, useEffect } from "react";
import { api } from "./lib/api";
import { setToken, getToken, clearToken } from "./lib/auth";

type Stage = "login" | "home" | "survey" | "review";

interface Survey {
  id: string;
  title: string;
  createdAt: string;
  questions: { id: string; text: string }[];
}

export default function App() {
  const [stage, setStage] = useState<Stage>("login");
  const [email, setEmail] = useState("me@test.com");
  const [password, setPassword] = useState("secret123");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const isLoggedIn = !!getToken();

  // If a token exists, start at Home.
  useEffect(() => {
    if (getToken()) setStage("home");
  }, []);

  // When we enter Home, fetch surveys once.
  useEffect(() => {
    if (stage === "home" && surveys.length === 0) {
      void loadSurveys();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    console.log("[login] submitting", { email });

    try {
      const res = await api<{ token: string; user: { id: string; email: string } }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        }
      );
      console.log("[login] success", res);
      setToken(res.token);
      setStage("home");
    } catch (err: any) {
      console.error("[login] failed", err);
      setError(err?.message ?? "Login failed");
    }
  }

  async function loadSurveys() {
    setError("");
    console.log("[surveys] loading");
    try {
      const res = await api<{ count: number; data: Survey[] }>("/surveys");
      console.log("[surveys] loaded", res.count);
      setSurveys(res.data);
    } catch (err: any) {
      console.error("[surveys] failed", err);
      setError(err?.message ?? "Failed to fetch surveys");
    }
  }

  async function loadSurvey(id: string) {
    setError("");
    console.log("[survey] loading", id);
    try {
      const res = await api<{ data: Survey }>(`/surveys/${id}`);
      setSelectedSurvey(res.data);
      const initial: Record<string, string> = {};
      res.data.questions.forEach((q) => (initial[q.id] = ""));
      setAnswers(initial);
      setStage("survey");
    } catch (err: any) {
      console.error("[survey] failed", err);
      setError(err?.message ?? "Failed to load survey");
    }
  }

  async function submitSurvey(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSurvey) return;
    setError("");
    console.log("[submit] posting", selectedSurvey.id, answers);

    try {
      await api("/surveys/responses", {
        method: "POST",
        body: JSON.stringify({ surveyId: selectedSurvey.id, answers }),
      });
      console.log("[submit] success");
      setStage("review");
    } catch (err: any) {
      console.error("[submit] failed", err);
      setError(err?.message ?? "Failed to submit survey");
    }
  }

  function logout() {
    clearToken();
    setSelectedSurvey(null);
    setSurveys([]);
    setAnswers({});
    setError("");
    setStage("login");
  }

  // ---- UI ----

  if (stage === "login") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="border-b bg-white/80 backdrop-blur">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Waterlily</h1>
            <nav className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setStage("home")}
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
              >
                Home
              </button>
              {!isLoggedIn && (
                <button
                  onClick={() => setStage("login")}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Sign in</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition"
              >
                Sign in
              </button>
            </form>
            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (stage === "home") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white/80 backdrop-blur">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Waterlily</h1>
            <nav className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setStage("home")}
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
              >
                Home
              </button>
              {isLoggedIn ? (
                <button
                  onClick={logout}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => setStage("login")}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={loadSurveys}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition"
            >
              Reload
            </button>
          </div>

          {!surveys.length ? (
            <p className="text-slate-600">No surveys yet. Create one in Postman, then click Reload.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-6">
              {surveys.map((s) => (
                <li key={s.id} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">Created {new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => loadSurvey(s.id)}
                      className="inline-flex w-full justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition"
                    >
                      Take survey
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          </div>
        </main>
      </div>
    );
  }

  if (stage === "survey" && selectedSurvey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="border-b bg-white/80 backdrop-blur">
          <div className="max-w-4xl mx-auto px-6 py-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Waterlily</h1>
            <nav className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setStage("home")}
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
              >
                Home
              </button>
              {isLoggedIn ? (
                <button
                  onClick={logout}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => setStage("login")}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">{selectedSurvey.title}</h2>
            <form onSubmit={submitSurvey} className="space-y-5">
              {selectedSurvey.questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{q.text}</label>
                  <input
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm px-3 py-2"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition"
              >
                Submit
              </button>
            </form>
            {error && (
              <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  if(stage === "review") {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="border-b bg-white/80 backdrop-blur">
              <div className="max-w-4xl mx-auto px-6 py-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Waterlily</h1>
                <nav className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setStage("home")}
                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                  >
                    Home
                  </button>
                  {isLoggedIn ? (
                    <button
                      onClick={logout}
                      className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => setStage("login")}
                      className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                    >
                      Login
                    </button>
                  )}
                </nav>
              </div>
            </header>
            <main className="flex-1 flex items-center justify-center px-6 py-10">
              <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                <h2 className="text-2xl font-semibold text-slate-900">Review</h2>
                <p className="mt-1 text-slate-600">Survey: {selectedSurvey?.title ?? "Submission"}</p>
                <pre className="mt-4 text-sm bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto text-slate-800">{JSON.stringify(answers, null, 2)}</pre>
                <div className="mt-6">
                  <button
                    onClick={() => setStage("home")}
                    className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-white font-medium shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </main>
          </div>
      );
  }
}

