import { ServiceErrorType } from './types';

type ErrrorProps = {
  httpStatus: number;
  type: ServiceErrorType;
  studyId?: string;
  submitters?: string[];
};

export class ServiceError extends Error {
  name = 'ServiceError';
  message = 'Servie error occured!';

  httpStatus: number;
  type: ServiceErrorType;
  studyId?: string;
  submitters?: string[];

  constructor({
    httpStatus: httpStatus,
    type: type,
    studyId: studyId = '',
    submitters: submitters = [],
  }: ErrrorProps) {
    super();
    this.httpStatus = httpStatus;
    this.type = type;
    this.studyId = studyId;
    this.submitters = submitters;
  }
}

export function StudyNotFound(studyId: string): ServiceError {
  const errorProps = { httpStatus: 404, type: ServiceErrorType.STUDY_NOT_FOUND, studyId };
  return new ServiceError(errorProps);
}

export function SubmitterNotFound(submitters: string[]): ServiceError {
  const errorProps = {
    httpStatus: 404,
    type: ServiceErrorType.SUBMITTERS_NOT_FOUND,
    submitters,
  };
  return new ServiceError(errorProps);
}

export function StudyAlreadyExists(studyId: string): ServiceError {
  const errorProps = { httpStatus: 400, type: ServiceErrorType.STUDY_ALREADY_EXISTS, studyId };
  return new ServiceError(errorProps);
}

export function SubmittersAlreadyInStudy(studyId: string, submitters: string[]): ServiceError {
  const errorProps = {
    httpStatus: 400,
    type: ServiceErrorType.SUBMITTERS_ALREADY_IN_STUDY,
    studyId,
    submitters,
  };
  return new ServiceError(errorProps);
}
export function SubmitterNotInStudy(studyId: string, errorSubmitter: string): ServiceError {
  const errorProps = {
    httpStatus: 400,
    type: ServiceErrorType.SUBMITTER_NOT_IN_STUDY,
    studyId,
    submitters: [errorSubmitter],
  };
  return new ServiceError(errorProps);
}

export function FailedToCreateStudy(studyId: string): ServiceError {
  const errorProps = {
    httpStatus: 500,
    type: ServiceErrorType.FAILED_TO_CREATE_STUDY,
    studyId,
  };
  return new ServiceError(errorProps);
}

export function FailedToRemoveSubmitterFromStudy(
  studyId: string,
  errorSubmitter: string
): ServiceError {
  const errorProps = {
    httpStatus: 500,
    type: ServiceErrorType.FAILED_TO_REMOVE_SUBMITTER_FROM_STUDY,
    studyId,
    submitters: [errorSubmitter],
  };
  return new ServiceError(errorProps);
}

export function FailedToAddSubmittersToStudy(studyId: string, submitters: string[]): ServiceError {
  const errorProps = {
    httpStatus: 500,
    type: ServiceErrorType.FAILED_TO_ADD_SUBMITTERS_TO_STUDY,
    studyId,
    submitters,
  };
  return new ServiceError(errorProps);
}
