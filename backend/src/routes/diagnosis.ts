import express from "express";
import diagnosisServices from "../services/diagnosisServices.js";

const router = express.Router();

router.get("/", (_req, res) => {
  res.json(diagnosisServices.getEntries());
});

export default router;