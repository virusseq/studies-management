require('dotenv').config();

import { NextFunction, Request, Response } from 'express';
import { ServiceError } from './common/errors';
import studiesRouter from './routes/studies';
import express from 'express';
import { ForbiddenError, UnauthorizedError } from '@overture-stack/ego-token-middleware';
import { SERVER_PORT } from './config';

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./resources/swagger-def.json');

const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// health endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.send(true);
});

// studies endpoint
app.use('/studies', studiesRouter);

// swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// express error handler
app.use(function (
  err: ServiceError | UnauthorizedError | ForbiddenError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err.stack);
  if (err instanceof ServiceError) {
    const { status, errorStudyId, errorSubmitters, reason } = err;
    res.status(status).json({
      success: false,
      message: 'Error has occured!',
      reason,
      errorStudyId,
      errorSubmitters,
    });
  } else if (err instanceof UnauthorizedError) {
    res.status(401).send({
      success: false,
      message: err.message,
    });
  } else if (err instanceof ForbiddenError) {
    res.status(403).send({
      success: false,
      message: err.message,
    });
  } else {
    res.status(500).send({
      success: false,
      message: 'Internal Server Error! Reason is unknown!',
    });
  }
});

app.listen(SERVER_PORT, () => console.log(`App should be running at ${SERVER_PORT}!`));
