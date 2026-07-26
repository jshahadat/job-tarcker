import cors from "cors";
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://job-tarcker-fv6xzwjrk-jshahadats-projects.vercel.app",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
