const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;
const GROQ_URL = process.env.GROQ_URL || "https://api.groq.com/openai/v1/chat/completions";
const isProd = process.env.NODE_ENV === "production";

// CORS (abierto en dev; allowlist en prod)
const allowlist = ["http://localhost:5173", "https://elosotelo.github.io"];
app.use(cors(isProd ? {
  origin: (origin, cb) => (!origin || allowlist.some(o => origin.startsWith(o))) ? cb(null, true) : cb(new Error("Not allowed by CORS"))
} : undefined));

// Logs
app.use((req, _res, next) => { if (!isProd) console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); next(); });
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/groq/chat", async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "Server misconfigured: missing GROQ_API_KEY" });
    if (!isProd) console.log("▶️ Body recibido:", JSON.stringify(req.body).slice(0, 200) + "...");

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    res.status(response.status).type(response.headers.get("content-type") || "application/json").send(text);
  } catch (err) {
    console.error("💥 Groq proxy error:", err);
    res.status(500).json({ error: "Proxy error" });
  }
});

app.listen(PORT, () => console.log(`✅ Backend corriendo en http://localhost:${PORT}`));
