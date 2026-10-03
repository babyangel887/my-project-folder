const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
// Render (like most hosts) sits behind a proxy that forwards the real
// client IP in X-Forwarded-For. Without this, req.ip would be the proxy's
// own IP for every visitor and the limiter below would throttle all users
// as one. Trust exactly one hop so req.ip is the client IP the proxy
// reports — clients can't spoof it to dodge the limit.
app.set("trust proxy", 1);
app.use(express.json({ limit: "10kb" }));

// Basic in-memory rate limit for the AI endpoint so strangers can't
// drain the Groq quota: 20 requests per 15 minutes per IP.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 20;
const hits = new Map();
function askLimiter(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_HITS) {
    res.set("Retry-After", String(Math.ceil(WINDOW_MS / 1000)));
    return res.status(429).json({ error: "Too many requests, please try again later." });
  }
  arr.push(now);
  hits.set(ip, arr);
  next();
}

app.post("/ask", askLimiter, async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Server is missing GROQ_API_KEY." });
    }
    const text = typeof req.body.text === "string" ? req.body.text.slice(0, 4000) : "";
    if (!text.trim()) {
      return res.status(400).json({ error: "Missing text." });
    }
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: text }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: data.error?.message || "Groq error" });
    }
    res.json({ reply: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Serve the built Vite frontend. Falls back to public/ when app/dist
// doesn't exist (e.g. local dev before running the build).
const distDir = path.join(__dirname, "app", "dist");
const fallbackDir = path.join(__dirname, "public");
const staticDir = fs.existsSync(path.join(distDir, "index.html")) ? distDir : fallbackDir;
app.use(express.static(staticDir));

// SPA fallback: non-API GETs serve the frontend (hash routes work from /).
app.get(/^(?!\/ask).*/, (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on port " + PORT));
