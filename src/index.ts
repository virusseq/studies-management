require('dotenv').config();

import { NextFunction, Request, Response } from 'express';
import {
  addSubmittersToStudy,
  createStudy,
  getStudies,
  removeSubmitterFromStudy,
} from './services/studies';
import authFilter from './components/authFilter';
import { isServiceError, ServiceError } from './common/errors';

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.send(true);
});

app.get('/studies', authFilter, (_req: Request, res: Response, next: NextFunction) => {
  getStudies()
    .then((studies) => res.json(studies))
    .catch(next);
});

app.post('/study', authFilter, (req: Request, res: Response, next: NextFunction) => {
  createStudy(req.body)
    .then((study) =>
      res.json({ success: true, message: 'Study successfully created!', study: study })
    )
    .catch(next);
});

app.post('/users', authFilter, async (req: Request, res: Response, next: NextFunction) => {
  await addSubmittersToStudy(req.body)
    .then((result) =>
      res.json({ success: true, message: 'User successfully added!', data: result })
    )
    .catch(next);
});

app.delete('/users', authFilter, (req: Request, res: Response, next: NextFunction) => {
  removeSubmitterFromStudy(req.body)
    .then((result) =>
      res.json({ success: true, message: 'User successfully removed!', data: result })
    )
    .catch(next);
});

app.use(function (err: ServiceError | Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  if (isServiceError(err)) {
    const { status, errorStudyId, errorSubmitters, reason } = err;
    res.status(status).json({
      success: false,
      message: 'Error has occured!',
      reason,
      errorStudyId,
      errorSubmitters,
    });
  } else {
    res.status(500).send({
      success: false,
      message: 'Internal Server Error! Reason is unknown!',
    });
  }
});

app.listen(3001);
console.log('App should be running at 3001!');
