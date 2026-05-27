import "./env.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import fileRoutes from "./routes/file.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middlewares/auth.js";

app.use("/api/auth", authRoutes);
app.use("/api/files", protect, fileRoutes);
app.use("/api/folders", protect, folderRoutes);

// ─── Error Handler (must be last) ─────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────
const bootstrap = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Antigravity server running on http://localhost:${PORT}`);
  });

  // Graceful shutdown handlers to prevent port sticking on Windows
  const gracefulShutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close();
    // Exit immediately to forcefully drop keep-alive connections on Windows
    process.exit(0);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown); // Catch Ctrl+C
  process.on('SIGUSR2', gracefulShutdown); // Catch nodemon restart
};

bootstrap();
