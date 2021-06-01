export enum ErrorReasons {
  STUDY_NOT_FOUND = 'STUDY_NOT_FOUND',
  SUBMITTERS_NOT_FOUND = 'STUDY_NOT_FOUND',
  STUDY_ALREADY_EXISTS = 'STUDY_ALREADY_EXISTS',
  SUBMITTERS_ALREADY_IN_STUDY = 'SUBMITTER_ALREADY_IN_STUDY',
  SUBMITTER_NOT_IN_STUDY = 'SUBMITTER_NOT_IN_STUDY',
  FAILED_TO_CREATE_STUDY = 'FAILED_TO_CREATE_STUDY',
  FAILED_TO_REMOVE_SUBMITTER_FROM_STUDY = 'FAILED_TO_REMOVE_SUBMITTER_FROM_STUDY',
  FAILED_TO_ADD_SUBMITTERS_TO_STUDY = 'FAILED_TO_ADD_SUBMITTERS_TO_STUDY',
}

type ErrrorProps = {
  status: number;
  reason: ErrorReasons;
  errorStudyId?: string;
  errorSubmitters?: string[];
};

export class ServiceError extends Error {
  name = 'ServiceError';
  message = 'Servie error occured!';

  status: number;
  reason: ErrorReasons;
  errorStudyId?: string;
  errorSubmitters?: string[];

  constructor({ status, reason, errorStudyId = '', errorSubmitters = [] }: ErrrorProps) {
    super();
    this.status = status;
    this.reason = reason;
    this.errorStudyId = errorStudyId;
    this.errorSubmitters = errorSubmitters;
  }
}

export function StudyNotFound(errorStudyId: string): ServiceError {
  const errorProps = { status: 404, reason: ErrorReasons.STUDY_NOT_FOUND, errorStudyId };
  return new ServiceError(errorProps);
}

export function SubmitterNotFound(errorSubmitters: string[]): ServiceError {
  const errorProps = { status: 404, reason: ErrorReasons.SUBMITTERS_NOT_FOUND, errorSubmitters };
  return new ServiceError(errorProps);
}

export function StudyAlreadyExists(errorStudyId: string): ServiceError {
  const errorProps = { status: 400, reason: ErrorReasons.STUDY_ALREADY_EXISTS, errorStudyId };
  return new ServiceError(errorProps);
}

export function SubmittersAlreadyInStudy(
  errorStudyId: string,
  errorSubmitters: string[]
): ServiceError {
  const errorProps = {
    status: 400,
    reason: ErrorReasons.SUBMITTERS_ALREADY_IN_STUDY,
    errorStudyId,
    errorSubmitters,
  };
  return new ServiceError(errorProps);
}
export function SubmitterNotInStudy(errorStudyId: string, errorSubmitter: string): ServiceError {
  const errorProps = {
    status: 400,
    reason: ErrorReasons.SUBMITTER_NOT_IN_STUDY,
    errorStudyId,
    errorSubmitters: [errorSubmitter],
  };
  return new ServiceError(errorProps);
}

export function FailedToCreateStudy(errorStudyId: string): ServiceError {
  const errorProps = {
    status: 500,
    reason: ErrorReasons.FAILED_TO_CREATE_STUDY,
    errorStudyId,
  };
  return new ServiceError(errorProps);
}

export function FailedToRemoveSubmitterFromStudy(
  errorStudyId: string,
  errorSubmitter: string
): ServiceError {
  const errorProps = {
    status: 500,
    reason: ErrorReasons.FAILED_TO_REMOVE_SUBMITTER_FROM_STUDY,
    errorStudyId,
    errorSubmitters: [errorSubmitter],
  };
  return new ServiceError(errorProps);
}

export function FailedToAddSubmittersToStudy(
  errorStudyId: string,
  errorSubmitters: string[]
): ServiceError {
  const errorProps = {
    status: 500,
    reason: ErrorReasons.FAILED_TO_ADD_SUBMITTERS_TO_STUDY,
    errorStudyId,
    errorSubmitters,
  };
  return new ServiceError(errorProps);
}
