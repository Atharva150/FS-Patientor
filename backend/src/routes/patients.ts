import express from "express";
import patientService from "../services/patientService.js";
import { NewEntrySchema, NewPatientSchema } from "../utils.js";

import { ZodError } from "zod";
const router = express.Router();

router.get("/", (_req, res) => {
  res.json(patientService.getPatients());
});

router.get('/:id', (req, res) => {
  const patient = patientService.getPatientById(req.params.id);

  if (!patient) {
    return res.status(404).json({
      error: 'Patient not found'
    });
  }

  return res.json(patient);
});

router.post('/', (req, res) => {
  try {

    const newPatient =
      NewPatientSchema.parse(req.body);

    const addedPatient =
      patientService.addPatient(newPatient);

    return res.status(201).json(
      addedPatient
    );

  } catch (error) {

    if (error instanceof ZodError)
      return res.status(400).json({
        error: error.issues
      });

  }

  return res.status(400).json({
    error: 'Invalid Data'
  });
});

router.post('/:id/entries', (req, res) => {
  try {
    const entry = NewEntrySchema.parse(req.body);

    const updatedPatient = patientService.addEntry(req.params.id, entry);



    if (!updatedPatient) {
      return res.status(404).json({
        error: 'Patient not found'
      });
    }

    return res.status(201).json(updatedPatient);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: error.issues
      });
    }
  }

  return res.status(400).json({
    error: 'Invalid Data'
  });
});

export default router;
