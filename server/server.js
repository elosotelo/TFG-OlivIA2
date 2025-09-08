const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// ===== CORS =====
const allowed = ["http://localhost:5173", "https://elosotelo.github.io"];

app.use(cors({
  origin: (origin, cb) =>
    !origin || allowed.includes(origin)
      ? cb(null, true)
      : cb(new Error("Not allowed by CORS")),
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// manejar preflight requests
app.options("/*", cors());

// ===== Logging =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Origin: ${req.headers.origin} ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: "1mb" }));

// ===== Endpoint proxy a Groq =====
app.post("/api/groq/chat", async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY no definida");
      return res.status(500).json({ error: "Server misconfigured: missing GROQ_API_KEY" });
    } else {
      console.log("🔐 GROQ_API_KEY cargada (ok)");
    }

    console.log("▶️ Body recibido:", JSON.stringify(req.body).slice(0, 200) + "...");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    console.log("⬅️ Respuesta Groq status:", response.status);

    res
      .status(response.status)
      .type(response.headers.get("content-type") || "application/json")
      .send(text);
  } catch (err) {
    console.error("💥 Groq proxy error:", err);
    res.status(500).json({ error: "Proxy error" });
  }
});

// ===== Healthcheck =====
app.get("/health", (_req, res) => res.json({ ok: true }));

// ===== Start =====
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});
