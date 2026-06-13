  import express from 'express';
  import diagnosisRouter from './src/routes/diagnosis.ts';
  import patientRouter from './src/routes/patients.ts';
  import cors from 'cors';
  const app = express();
  app.use(express.json());
  app.use(cors())
  app.use("/api/diagnosis", diagnosisRouter);
  app.use("/api/patients", patientRouter);
  const PORT = 3001;

  app.get('/api/ping', (_req, res) => {
    console.log('someone pinged here');
    res.send('pong');
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

