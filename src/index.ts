import { Request, Response } from 'express';
import { addSubmittersToStudy, createStudy, getStudies, removeSubmitterFromStudy } from './service';

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.send(true);
});

app.get('/studies', async (_req: Request, res: Response) => {
  res.json(await getStudies());
});

app.post('/study', async (req: Request, res: Response) => {
  const study = await createStudy(req.body);
  console.log(study);
  res.json({ message: 'Study successfully created!', study: study });
});

app.post('/users', async (req: Request, res: Response) => {
  const result = await addSubmittersToStudy(req.body);
  console.log(result);
  res.json({ message: 'User successfully added!', data: result });
});

app.delete('/users', async (req: Request, res: Response) => {
  const result = await removeSubmitterFromStudy(req.body);
  console.log(result);
  res.json({ message: 'User successfully removed!', data: result });
});

app.listen(3001);
console.log('App should be running at 3001!');
