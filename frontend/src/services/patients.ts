import axios from "axios";
import { Patient, PatientDetails, PatientFormValues, NewEntry } from "../types";

import { apiBaseUrl } from "../constants";

const getAll = async () => {
  const { data } = await axios.get<Patient[]>(
    `${apiBaseUrl}/patients`
  );

  return data;
};

const create = async (object: PatientFormValues) => {
  const { data } = await axios.post<PatientDetails>(
    `${apiBaseUrl}/patients`,
    object
  );

  return data;
};

const getById = async (id: string) => {
  const { data } = await axios.get<PatientDetails>(
    `${apiBaseUrl}/patients/${id}`
  );

  return data;
};

const addEntry = async (patientId: string, entry: NewEntry) => {
  const { data } = await axios.post<PatientDetails>(
    `${apiBaseUrl}/patients/${patientId}/entries`,
    entry
  );

  return data;
};

export default {
  getAll, create, getById, addEntry
};



