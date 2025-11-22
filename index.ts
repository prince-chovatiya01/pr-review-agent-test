// SWE_project_website/server/index.ts
console.log("RUNNING BUILD VERSION:", new Date().toISOString());
console.log("HELLO_TEST:", process.env.HELLO_TEST);

import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";

import authRouter from "./auth.js";
import { registerRoutes } from "./routes.js";

const app = express();

/* ---------------------- ENV ----------------------- */
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://pull-panda-a3s8.vercel.app";

/* ---------------------- CORS ----------------------- */
app.use(
  cors({
    origin: FRONTEND_URL,   // Allow Vercel domain
    credentials: true,      // Allow cookies
  })
);

/* --------------------- SESSION ---------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,       // ❗ Needed for HTTPS on Railway
      sameSite: "none",   // ❗ Required for cross-site cookies
      path: "/",
    },
  })
);

/* --------------------- BODY PARSING ---------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/* ---------------------- AUTH ROUTES ---------------------- */
app.use("/api/auth", authRouter);

/* ---------------------- OTHER API ROUTES ---------------------- */
(async () => {
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ message: err.message });
  });

  app.get("/", (_req, res) => {
    res.json({ status: "Backend running", env: "production" });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
  });
})();
