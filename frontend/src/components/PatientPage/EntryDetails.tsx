import { Box, Typography } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

import type { Diagnosis, Entry } from "../../types";

const getNever = (x: never): never => {
  throw new Error(`Unhandled entry type: ${JSON.stringify(x)}`);
};

const getDiagnosisText = (entry: Entry, diagnoses: Diagnosis[]) => {
  const codes = entry.diagnosisCodes;
  if (!codes || codes.length === 0) return "";

  const descriptions = codes.map(
    (code) => diagnoses.find((d) => d.code === code)?.name ?? code
  );

  return descriptions.join(", ");
};

export interface EntryDetailsProps {
  entry: Entry;
  diagnoses: Diagnosis[];
}

const EntryDetails = ({ entry, diagnoses }: EntryDetailsProps) => {
  switch (entry.type) {
    case "OccupationalHealthcare": {
      return (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <WorkIcon sx={{ verticalAlign: "middle" }} />
            <Typography variant="subtitle1">Occupational healthcare</Typography>
          </Box>

          <Typography variant="body2">employer: {entry.employerName}</Typography>

          {entry.sickLeave ? (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <AssignmentTurnedInIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }} />
              sick leave: {entry.sickLeave.startDate} to {entry.sickLeave.endDate}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              sick leave: none
            </Typography>
          )}

          {entry.diagnosisCodes && entry.diagnosisCodes.length > 0 ? (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              diagnose codes: {getDiagnosisText(entry, diagnoses)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              diagnose codes: none
            </Typography>
          )}
        </Box>
      );
    }

    case "Hospital": {
      return (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <LocalHospitalIcon sx={{ verticalAlign: "middle" }} />
            <Typography variant="subtitle1">Hospital</Typography>
          </Box>

          <Typography variant="body2">
            discharge: {entry.discharge.date}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            criteria: {entry.discharge.criteria}
          </Typography>

          {entry.diagnosisCodes && entry.diagnosisCodes.length > 0 ? (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              diagnose codes: {getDiagnosisText(entry, diagnoses)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              diagnose codes: none
            </Typography>
          )}
        </Box>
      );
    }

    case "HealthCheck": {
      // Render health check rating (0-3). Keep it simple since the exercise focuses on backend validation.
      return (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle1">Health check</Typography>
          </Box>

          <Typography variant="body2">health check rating: {entry.healthCheckRating}</Typography>

          {entry.diagnosisCodes && entry.diagnosisCodes.length > 0 ? (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              diagnose codes: {getDiagnosisText(entry, diagnoses)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              diagnose codes: none
            </Typography>
          )}
        </Box>
      );
    }

    default:
      return getNever(entry);
  }
};

export default EntryDetails;



