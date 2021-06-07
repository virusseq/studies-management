// dotenv should be first line executed
require('dotenv').config();

import { ForbiddenError, UnauthorizedError } from '@overture-stack/ego-token-middleware';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ServiceError } from './common/errors';
import { GeneralErrorType } from './common/types';
import { SERVER_PORT } from './config';
import swaggerDocument from './resources/swagger-def.json';
import studiesRouter from './routes/studies';

// *** create and init app ***
const app = express();
app.use(cors());
app.use(express.json());

// *** setup endpoints ***
app.get('/', (_req: Request, res: Response) => {
  res.send({ endpoints: { healthCheck: '/health', swaggerUi: '/api-docs' } });
});
app.get('/health', (_req: Request, res: Response) => {
  res.send(true);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/studies', studiesRouter);

// *** define error handler ***
app.use(function (
  err: ServiceError | UnauthorizedError | ForbiddenError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err.message);
  console.error(err.stack);

  if (err instanceof ServiceError) {
    const { httpStatus, type, studyId, submitters } = err;
    res.status(httpStatus).json({ success: false, error: { type, studyId, submitters } });
  } else if (err instanceof UnauthorizedError) {
    res.status(401).send({
      success: false,
      error: { message: err.message, type: GeneralErrorType.UNAUTHORIZED },
    });
  } else if (err instanceof ForbiddenError) {
    res.status(403).send({
      success: false,
      error: { message: err.message, type: GeneralErrorType.FORBIDDEN },
    });
  } else {
    res.status(500).send({
      success: false,
      error: {
        message: 'Internal Server Error! Reason is unknown!',
        type: GeneralErrorType.UNKNOWN,
      },
    });
  }
});

// *** listen on port ***
app.listen(SERVER_PORT, () => console.log(`App should be running at ${SERVER_PORT}!`));
