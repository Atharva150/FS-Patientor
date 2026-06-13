import patients from "../data/patients.js";
import type { Entry, Patient, NewPatient, NewEntry } from "../types.ts";
import type { NonSensitivePatient } from "../types.ts";
import { v1 as uuid } from "uuid";

const getPatients = (): NonSensitivePatient[] => {
  return patients.map(({ ssn, ...rest }) => rest);
};

const getPatientById = (id: string): Patient | undefined => {
  return patients.find((patient) => patient.id === id);
};

const addPatient = (entry: NewPatient): Patient => {
  const newPatient: Patient = {
    id: uuid(),
    ...entry,
    entries: []
  };

  patients.push(newPatient);

  return newPatient;
};

const addEntry = (
  patientId: string,
  entry: NewEntry
): Patient | undefined => {
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return undefined;

  const newEntry = {
    id: uuid(),
    ...entry,
  } as Entry;

  patient.entries.push(newEntry);
  return patient;
};

export default {
  getPatients,
  getPatientById,
  addPatient,
  addEntry,
};


