import type{ Patient } from '../types.ts';

const patients: Patient[] = [

    {
        "id": "d2773336-f723-11e9-8f0b-362b9e155667",
        "name": "John McClane",
        "dateOfBirth": "1986-07-09",
        "ssn": "090786-122X",
        "gender": "male",
        "occupation": "New york city cop",
        "entries": [
            {
                "id": "d811e46d-70b3-4d90-b090-4535c7cf8fb1",
                "date": "2015-01-02",
                "type": "Hospital",
                "specialist": "MD House",
                "diagnosisCodes": [
                    "S62.5"
                ],
                "description": "Healing time appr. 2 weeks. patient doesn't remember how he got the injury.",
                "discharge": {
                    "date": "2015-01-16",
                    "criteria": "Thumb has healed."
                }
            }
        ]
    },
    {
        "id": "d2773598-f723-11e9-8f0b-362b9e155667",
        "name": "Martin Riggs",
        "dateOfBirth": "1979-01-30",
        "ssn": "300179-77A",
        "gender": "male",
        "occupation": "Cop",
        "entries": [
            {
                "id": "2a3d1d94-1f40-4f12-8f40-7d8cf6db4abc",
                "date": "2019-08-05",
                "type": "OccupationalHealthcare",
                "specialist": "Dr. Workplace",
                "employerName": "NYPD",
                "description": "Annual occupational health check.",
                "sickLeave": {
                    "startDate": "2019-08-06",
                    "endDate": "2019-08-08"
                }
            }
        ]
    },
    {
        "id": "d27736ec-f723-11e9-8f0b-362b9e155667",
        "name": "Hans Gruber",
        "dateOfBirth": "1970-04-25",
        "ssn": "250470-555L",
        "gender": "other",
        "occupation": "Technician",
        "entries": []
    },
    {
        "id": "d2773822-f723-11e9-8f0b-362b9e155667",
        "name": "Dana Scully",
        "dateOfBirth": "1974-01-05",
        "ssn": "050174-432N",
        "gender": "female",
        "occupation": "Forensic Pathologist",
        "entries": []
    },
    {
        "id": "d2773c6e-f723-11e9-8f0b-362b9e155667",
        "name": "Matti Luukkainen",
        "dateOfBirth": "1971-04-09",
        "ssn": "090471-8890",
        "gender": "male",
        "occupation": "Digital evangelist",
        "entries": []
    }
];
export default patients;

