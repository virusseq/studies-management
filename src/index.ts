require('dotenv').config();

import { NextFunction, Request, Response } from 'express';
import {
  addSubmittersToStudy,
  createStudy,
  getStudies,
  removeSubmitterFromStudy,
} from './services/studies';

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.send(true);
});

app.get('/studies', (_req: Request, res: Response, next: NextFunction) => {
  getStudies()
    .then((studies) => res.json(studies))
    .catch(next);
});

app.post('/study', (req: Request, res: Response, next: NextFunction) => {
  createStudy(req.body)
    .then((study) =>
      res.json({ success: true, message: 'Study successfully created!', study: study })
    )
    .catch(next);
});

app.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  await addSubmittersToStudy(req.body)
    .then((result) =>
      res.json({ success: true, message: 'User successfully added!', data: result })
    )
    .catch(next);
});

app.delete('/users', (req: Request, res: Response, next: NextFunction) => {
  removeSubmitterFromStudy(req.body)
    .then((result) =>
      res.json({ success: true, message: 'User successfully removed!', data: result })
    )
    .catch(next);
});

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  const { statusCode, message, stack, isServiceError } = err;
  console.error(stack);
  if (isServiceError) {
    res.status(statusCode).json({ message, success: false });
  } else {
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3001);
console.log('App should be running at 3001!');
