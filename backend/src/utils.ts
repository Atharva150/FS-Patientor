import{ Gender, type NewPatient, HealthCheckRating } from './types.js';


import { z } from 'zod';


const isString = (
  text: unknown
): text is string => {
  return (
    typeof text === 'string' ||
    text instanceof String
  );
};



const isDate = (
  date: string
): boolean => {
  return Boolean(Date.parse(date));
};



const parseDate = (
  date: unknown
): string => {

  if (
    !date ||
    !isString(date) ||
    !isDate(date)
  ) {
    throw new Error(
      'Incorrect or missing date'
    );
  }

  return date;
};

const parseGender = (
  gender: unknown
): Gender => {

  if (
    !gender ||
    !isString(gender) ||
    !isGender(gender)
  ) {
    throw new Error(
      'Incorrect or missing gender'
    );
  }

  return gender;
};

const parseSsn = (
  ssn: unknown
): string => {

  if (!ssn || !isString(ssn)) {
    throw new Error(
      'Incorrect or missing ssn'
    );
  }

  return ssn;
};

const parseOccupation = (
  occupation: unknown
): string => {

  if (
    !occupation ||
    !isString(occupation)
  ) {
    throw new Error(
      'Incorrect or missing occupation'
    );
  }

  return occupation;
};

const toNewPatient = (
  object: unknown
): NewPatient => {

  if (
    !object ||
    typeof object !== 'object'
  ) {
    throw new Error(
      'Invalid patient data'
    );
  }

  if (
    'name' in object &&
    'dateOfBirth' in object &&
    'ssn' in object &&
    'gender' in object &&
    'occupation' in object
  ) {

    const newPatient: NewPatient = {
      name: parseName(object.name),
      dateOfBirth: parseDate(object.dateOfBirth),
      ssn: parseSsn(object.ssn),
      gender: parseGender(object.gender),
      occupation: parseOccupation(
        object.occupation
      )
    };

    return newPatient;
  }

  throw new Error('Missing fields');
};

export default toNewPatient;

const isGender = (
  param: string
): param is Gender => {
  return Object.values(Gender)
    .includes(param as Gender);
};

const parseName = (
  name: unknown
): string => {

  if (!name || !isString(name)) {
    throw new Error(
      'Incorrect or missing name'
    );
  }

  return name;
};

export const NewPatientSchema = z.object({
  name: z.string(),
  dateOfBirth: z.string().date(),
  ssn: z.string(),
  gender: z.enum([
    Gender.Male,
    Gender.Female,
    Gender.Other
  ]),
  occupation: z.string()
});

const diagnosisCodeSchema = z.string();

const BaseEntrySchema = z.object({
  id: z.string(),
  description: z.string(),
  date: z.string().date(),
  specialist: z.string(),
  diagnosisCodes: diagnosisCodeSchema.array().optional(),
});

const NewBaseEntrySchema = BaseEntrySchema.omit({
  id: true,
});
const HealthCheckRatingSchema = z.union([
  z.literal(HealthCheckRating.Healthy),
  z.literal(HealthCheckRating.LowRisk),
  z.literal(HealthCheckRating.HighRisk),
  z.literal(HealthCheckRating.CriticalRisk),
]);

const NewOccupationalHealthcareEntrySchema = NewBaseEntrySchema.extend({
  type: z.literal('OccupationalHealthcare'),
  employerName: z.string(),
  sickLeave: z.union([
    z.undefined(),
    z.object({
      startDate: z.string().date(),
      endDate: z.string().date(),
    }),
  ]),
});

const NewHospitalEntrySchema = NewBaseEntrySchema.extend({
  type: z.literal('Hospital'),
  discharge: z.object({
    date: z.string().date(),
    criteria: z.string(),
  }),
});

const NewHealthCheckEntrySchema = NewBaseEntrySchema.extend({
  type: z.literal('HealthCheck'),
  healthCheckRating: HealthCheckRatingSchema,
});

export const NewEntrySchema = z.discriminatedUnion('type', [
  NewOccupationalHealthcareEntrySchema,
  NewHospitalEntrySchema,
  NewHealthCheckEntrySchema,
]);



