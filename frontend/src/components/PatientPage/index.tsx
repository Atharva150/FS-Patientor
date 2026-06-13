import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Checkbox,
  MenuItem,
  ListItemText,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import FemaleIcon from "@mui/icons-material/Female";
import MaleIcon from "@mui/icons-material/Male";
import TransgenderIcon from "@mui/icons-material/Transgender";
import axios from "axios";
import { useParams } from "react-router-dom";

import patientService from "../../services/patients";
import diagnosesService from "../../services/diagnoses";

import { Gender } from "../../types";

import type { PatientDetails, Diagnosis, NewEntry } from "../../types";
import EntryDetails from "./EntryDetails";

const getGenderIcon = (gender: Gender) => {
  switch (gender) {
    case Gender.Male:
      return <MaleIcon sx={{ verticalAlign: "middle" }} />;
    case Gender.Female:
      return <FemaleIcon sx={{ verticalAlign: "middle" }} />;
    case Gender.Other:
      return <TransgenderIcon sx={{ verticalAlign: "middle" }} />;
    default: {
      const _exhaustive: never = gender;
      return _exhaustive;
    }
  }
};

type EntryType = "HealthCheck" | "Hospital" | "OccupationalHealthcare";

type EntryErrors = {
  description?: string;
  date?: string;
  specialist?: string;
  diagnosisCodes?: string;
  healthCheckRating?: string;
  discharge?: { date?: string; criteria?: string };
  employerName?: string;
  sickLeave?: { startDate?: string; endDate?: string };
};

type BackendIssue = {
  path?: Array<string | number>;
  message?: string;
};

const isValidDateString = (value: string) => Boolean(value && !Number.isNaN(Date.parse(value)));

const PatientPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [entryModalOpen, setEntryModalOpen] = useState(false);

  const [entryType, setEntryType] = useState<EntryType>("HealthCheck");

  // common entry fields
  const [entryDescription, setEntryDescription] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entrySpecialist, setEntrySpecialist] = useState("");
  const [entryDiagnosisCodes, setEntryDiagnosisCodes] = useState<string[]>([]);

  // HealthCheck fields
  const [entryHealthCheckRating, setEntryHealthCheckRating] = useState("0");

  // Hospital fields
  const [hospitalDischargeDate, setHospitalDischargeDate] = useState("");
  const [hospitalDischargeCriteria, setHospitalDischargeCriteria] = useState("");

  // OccupationalHealthcare fields
  const [occEmployerName, setOccEmployerName] = useState("");
  const [occSickLeaveStartDate, setOccSickLeaveStartDate] = useState("");
  const [occSickLeaveEndDate, setOccSickLeaveEndDate] = useState("");

  const [entryErrors, setEntryErrors] = useState<EntryErrors>({});

  const getErrorMessage = (value?: string) => value ?? "";

  const clearSubmitErrors = () => {
    setSubmitError(null);
    setEntryErrors({});
  };

  const openEntryModal = () => setEntryModalOpen(true);

  const closeEntryModal = () => {
    setEntryModalOpen(false);
    clearSubmitErrors();
  };

  const validateForm = (): EntryErrors => {
    const errors: EntryErrors = {};

    if (!entryDescription.trim()) {
      errors.description = "Description is required";
    }

    if (!entryDate.trim()) {
      errors.date = "Date is required";
    } else if (!isValidDateString(entryDate)) {
      errors.date = "Date must be valid";
    }

    if (!entrySpecialist.trim()) {
      errors.specialist = "Specialist is required";
    }

    const invalidDiagnosisCodes = entryDiagnosisCodes.filter(
      (code) => !diagnoses.some((diagnosis) => diagnosis.code === code)
    );
    if (invalidDiagnosisCodes.length > 0) {
      errors.diagnosisCodes = `Unknown diagnosis code${invalidDiagnosisCodes.length > 1 ? "s" : ""}: ${invalidDiagnosisCodes.join(
        ", "
      )}`;
    }

    if (entryType === "HealthCheck") {
      const rating = Number(entryHealthCheckRating);
      if (!Number.isInteger(rating) || rating < 0 || rating > 3) {
        errors.healthCheckRating = "Health check rating must be between 0 and 3";
      }
    }

    if (entryType === "Hospital") {
      if (!hospitalDischargeDate.trim()) {
        errors.discharge = { ...(errors.discharge ?? {}), date: "Discharge date is required" };
      } else if (!isValidDateString(hospitalDischargeDate)) {
        errors.discharge = { ...(errors.discharge ?? {}), date: "Discharge date must be valid" };
      }

      if (!hospitalDischargeCriteria.trim()) {
        errors.discharge = {
          ...(errors.discharge ?? {}),
          criteria: "Discharge criteria is required",
        };
      }
    }

    if (entryType === "OccupationalHealthcare") {
      if (!occEmployerName.trim()) {
        errors.employerName = "Employer name is required";
      }

      const hasSickLeaveStart = occSickLeaveStartDate.trim() !== "";
      const hasSickLeaveEnd = occSickLeaveEndDate.trim() !== "";

      if (hasSickLeaveStart !== hasSickLeaveEnd) {
        errors.sickLeave = {
          ...(errors.sickLeave ?? {}),
          startDate: hasSickLeaveStart ? undefined : "Start and end date must both be provided",
          endDate: hasSickLeaveEnd ? undefined : "Start and end date must both be provided",
        };
      }

      if (hasSickLeaveStart && !isValidDateString(occSickLeaveStartDate)) {
        errors.sickLeave = {
          ...(errors.sickLeave ?? {}),
          startDate: "Sick leave start date must be valid",
        };
      }

      if (hasSickLeaveEnd && !isValidDateString(occSickLeaveEndDate)) {
        errors.sickLeave = {
          ...(errors.sickLeave ?? {}),
          endDate: "Sick leave end date must be valid",
        };
      }
    }

    return errors;
  };

  const parseBackendErrors = (issues: BackendIssue[]): EntryErrors => {
    const parsed: EntryErrors = {};

    for (const issue of issues) {
      const path = issue.path ?? [];
      const message = issue.message ?? "Invalid value";

      if (path.length === 1 && typeof path[0] === "string") {
        const key = path[0] as keyof EntryErrors;
        if (key === "discharge" || key === "sickLeave") {
          continue;
        }
        parsed[key] = message;
      }

      if (path.length === 2 && typeof path[0] === "string" && typeof path[1] === "string") {
        const parent = path[0] as "discharge" | "sickLeave";
        const child = path[1] as string;

        parsed[parent] = {
          ...(parsed[parent] ?? {}),
          [child]: message,
        };
      }
    }

    return parsed;
  };

  const buildEntryPayload = (): NewEntry => {
    const diagnosisCodes = entryDiagnosisCodes.length > 0 ? entryDiagnosisCodes : undefined;

    const common = {
      description: entryDescription.trim(),
      date: entryDate,
      specialist: entrySpecialist.trim(),
      diagnosisCodes,
      type: entryType,
    };

    if (entryType === "HealthCheck") {
      return {
        ...common,
        type: "HealthCheck",
        healthCheckRating: Number(entryHealthCheckRating) as 0 | 1 | 2 | 3,
      };
    }

    if (entryType === "Hospital") {
      return {
        ...common,
        type: "Hospital",
        discharge: {
          date: hospitalDischargeDate,
          criteria: hospitalDischargeCriteria.trim(),
        },
      };
    }

    return {
      ...common,
      type: "OccupationalHealthcare",
      employerName: occEmployerName.trim(),
      sickLeave:
        occSickLeaveStartDate.trim() === "" && occSickLeaveEndDate.trim() === ""
          ? undefined
          : {
              startDate: occSickLeaveStartDate,
              endDate: occSickLeaveEndDate,
            },
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearSubmitErrors();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setEntryErrors(validationErrors);
      return;
    }

    if (!id) {
      setSubmitError("Invalid patient id");
      return;
    }

    try {
      const updated = await patientService.addEntry(id, buildEntryPayload());
      setPatient(updated);

      setEntryDescription("");
      setEntryDate("");
      setEntrySpecialist("");
      setEntryDiagnosisCodes([]);
      setEntryHealthCheckRating("0");
      setHospitalDischargeDate("");
      setHospitalDischargeCriteria("");
      setOccEmployerName("");
      setOccSickLeaveStartDate("");
      setOccSickLeaveEndDate("");
      setEntryModalOpen(false);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const issues = e.response?.data?.error;

        if (Array.isArray(issues)) {
          const parsedErrors = parseBackendErrors(issues as BackendIssue[]);
          setEntryErrors(parsedErrors);

          if (Object.keys(parsedErrors).length === 0) {
            setSubmitError("Failed to add entry");
          }
          return;
        }

        if (typeof e.response?.data?.error === "string") {
          setSubmitError(e.response.data.error);
          return;
        }
      }

      setSubmitError("Failed to add entry");
    }
  };

  useEffect(() => {
    const fetchDiagnoses = async () => {
      try {
        const fetched = await diagnosesService.getAll();
        setDiagnoses(fetched);
      } catch {
        // keep empty, will fall back to diagnosis code
      }
    };

    void fetchDiagnoses();
  }, []);

  useEffect(() => {
    if (!id) {
      setPageError("Invalid patient id");
      return;
    }

    const fetchPatient = async () => {
      try {
        const fetchedPatient = await patientService.getById(id);
        setPatient(fetchedPatient);
        setPageError(null);
      } catch (e: unknown) {
        if (axios.isAxiosError(e) && typeof e.response?.data?.error === "string") {
          setPageError(e.response.data.error);
        } else {
          setPageError("Failed to fetch patient information");
        }
      }
    };

    void fetchPatient();
  }, [id]);

  if (pageError) {
    return <Alert severity="error">{pageError}</Alert>;
  }

  if (!patient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" sx={{ marginBottom: "0.5em" }}>
        {patient.name} {getGenderIcon(patient.gender)}
      </Typography>
      <Typography variant="h6">ssn: {patient.ssn}</Typography>
      <Typography variant="h6">occupation: {patient.occupation}</Typography>
      <Typography variant="h6">date of birth: {patient.dateOfBirth}</Typography>

      <Divider sx={{ marginY: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ marginBottom: "0.5em" }}>
          Add entry
        </Typography>
        {!entryModalOpen && (
          <Button variant="outlined" onClick={openEntryModal}>
            Add New Entry
          </Button>
        )}
      </Box>

      <Dialog fullWidth open={entryModalOpen} onClose={closeEntryModal}>
        <DialogTitle>Add entry</DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              maxWidth: 520,
              pt: 1,
            }}
          >
            <TextField
              select
              label="Entry type"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as EntryType)}
              helperText="Select the type of entry to add"
            >
              <MenuItem value="HealthCheck">HealthCheck</MenuItem>
              <MenuItem value="Hospital">Hospital</MenuItem>
              <MenuItem value="OccupationalHealthcare">OccupationalHealthcare</MenuItem>
            </TextField>

            <TextField
              label="Description"
              value={entryDescription}
              onChange={(e) => setEntryDescription(e.target.value)}
              error={Boolean(entryErrors.description)}
              helperText={getErrorMessage(entryErrors.description)}
            />
            <TextField
              label="Date"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              error={Boolean(entryErrors.date)}
              helperText={getErrorMessage(entryErrors.date)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Specialist"
              value={entrySpecialist}
              onChange={(e) => setEntrySpecialist(e.target.value)}
              error={Boolean(entryErrors.specialist)}
              helperText={getErrorMessage(entryErrors.specialist)}
            />
            <FormControl error={Boolean(entryErrors.diagnosisCodes)}>
              <InputLabel id="diagnosis-codes-label">Diagnosis codes (optional)</InputLabel>
              <Select
                labelId="diagnosis-codes-label"
                multiple
                value={entryDiagnosisCodes}
                onChange={(event) => {
                  const value = event.target.value;
                  setEntryDiagnosisCodes(typeof value === "string" ? value.split(",") : value);
                }}
                input={<OutlinedInput label="Diagnosis codes (optional)" />}
                renderValue={(selected) => {
                  const codes = selected as string[];

                  if (codes.length === 0) {
                    return "Select diagnosis codes";
                  }

                  return (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {codes.map((code) => {
                        const diagnosis = diagnoses.find((item) => item.code === code);
                        return <Chip key={code} label={diagnosis ? `${diagnosis.code} ${diagnosis.name}` : code} size="small" />;
                      })}
                    </Box>
                  );
                }}
              >
                {diagnoses.map((diagnosis) => (
                  <MenuItem key={diagnosis.code} value={diagnosis.code}>
                    <Checkbox checked={entryDiagnosisCodes.includes(diagnosis.code)} />
                    <ListItemText primary={`${diagnosis.code} ${diagnosis.name}`} />
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" sx={{ mt: 0.5 }}>
                {getErrorMessage(entryErrors.diagnosisCodes) ||
                  (diagnoses.length > 0 ? "Select one or more valid diagnosis codes" : "Loading diagnoses...")}
              </Typography>
            </FormControl>

            {entryType === "HealthCheck" && (
              <TextField
                select
                label="Health check rating"
                value={entryHealthCheckRating}
                onChange={(e) => setEntryHealthCheckRating(e.target.value)}
                error={Boolean(entryErrors.healthCheckRating)}
                helperText={getErrorMessage(entryErrors.healthCheckRating)}
              >
                <MenuItem value="0">0 - Healthy</MenuItem>
                <MenuItem value="1">1 - Low risk</MenuItem>
                <MenuItem value="2">2 - High risk</MenuItem>
                <MenuItem value="3">3 - Critical risk</MenuItem>
              </TextField>
            )}

            {entryType === "Hospital" && (
              <>
                <TextField
                  label="Discharge date"
                  type="date"
                  value={hospitalDischargeDate}
                  onChange={(e) => setHospitalDischargeDate(e.target.value)}
                  error={Boolean(entryErrors.discharge?.date)}
                  helperText={entryErrors.discharge?.date ?? ""}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Discharge criteria"
                  value={hospitalDischargeCriteria}
                  onChange={(e) => setHospitalDischargeCriteria(e.target.value)}
                  error={Boolean(entryErrors.discharge?.criteria)}
                  helperText={entryErrors.discharge?.criteria ?? ""}
                />
              </>
            )}

            {entryType === "OccupationalHealthcare" && (
              <>
                <TextField
                  label="Employer name"
                  value={occEmployerName}
                  onChange={(e) => setOccEmployerName(e.target.value)}
                  error={Boolean(entryErrors.employerName)}
                  helperText={entryErrors.employerName ?? ""}
                />
                <TextField
                  label="Sick leave start date (optional)"
                  type="date"
                  value={occSickLeaveStartDate}
                  onChange={(e) => setOccSickLeaveStartDate(e.target.value)}
                  error={Boolean(entryErrors.sickLeave?.startDate)}
                  helperText={entryErrors.sickLeave?.startDate ?? ""}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Sick leave end date (optional)"
                  type="date"
                  value={occSickLeaveEndDate}
                  onChange={(e) => setOccSickLeaveEndDate(e.target.value)}
                  error={Boolean(entryErrors.sickLeave?.endDate)}
                  helperText={entryErrors.sickLeave?.endDate ?? ""}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            <Button variant="contained" type="submit" aria-label="Add">
              Add
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Typography variant="h5" sx={{ marginBottom: "1em" }}>
        Entries
      </Typography>

      {patient.entries.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No Entries
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {patient.entries.map((entry) => (
            <Box key={entry.id} sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle1">date: {entry.date}</Typography>
              <Typography variant="body1">description: {entry.description}</Typography>

              <EntryDetails entry={entry} diagnoses={diagnoses} />
            </Box>
          ))}
        </Box>
      )}
    </div>
  );
};

export default PatientPage;


