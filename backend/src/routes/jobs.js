import express from "express";
import prisma from "../lib/prisma.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// সব routes এ auth middleware লাগাও
router.use(authMiddleware);

// সব jobs দেখো
router.get("/", async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// নতুন job যোগ করো
router.post("/", async (req, res) => {
  try {
    const { company, position, status, location, salary, notes } = req.body;

    const job = await prisma.job.create({
      data: {
        company,
        position,
        status,
        location,
        salary,
        notes,
        userId: req.userId,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// একটা job আপডেট করো
router.patch("/:id", async (req, res) => {
  try {
    const { company, position, status, location, salary, notes } = req.body;
    const jobId = parseInt(req.params.id);

    // এই job টা এই user এর কিনা check করো
    const existing = await prisma.job.findFirst({
      where: { id: jobId, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = await prisma.job.update({
      where: { id: jobId },
      data: { company, position, status, location, salary, notes },
    });

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// একটা job delete করো
router.delete("/:id", async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);

    const existing = await prisma.job.findFirst({
      where: { id: jobId, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Job not found" });
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
