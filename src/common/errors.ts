export enum ErrorReasons {
  STUDY_NOT_FOUND,
  SUBMITTERS_NOT_FOUND,
  FAILED_TO_CREATE_STUDY_IN_METADATA_SVC,
  FAILED_TO_CREATE_STUDY_IN_AUTH_SVC,
  FAILED_TO_REMOVE_SUBMITTERS_FROM_STUDY_GROUP,
  FAILED_TO_ADD_SUBMITTERS_TO_STUDY_GROUP,
}

export const isServiceError = (obj: any): obj is ServiceError => {
  return obj.errorType === 'ServiceError';
};

export class ServiceError extends Error {
  errorType = 'ServiceError';
  status: number;
  reason: ErrorReasons;
  errorStudyId?: string;
  errorSubmitters?: string[];

  constructor({
    status,
    reason,
    errorStudyId = '',
    errorSubmitters = [],
  }: {
    status: number;
    reason: ErrorReasons;
    errorStudyId?: string;
    errorSubmitters?: string[];
  }) {
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

export function FailedToCreateStudyInSong(errorStudyId: string): ServiceError {
  const errorProps = {
    status: 500,
    reason: ErrorReasons.FAILED_TO_CREATE_STUDY_IN_METADATA_SVC,
    errorStudyId,
  };
  return new ServiceError(errorProps);
}

export function FailedToCreateStudyInEgo(errorStudyId: string): ServiceError {
  const errorProps = {
    status: 500,
    reason: ErrorReasons.FAILED_TO_CREATE_STUDY_IN_AUTH_SVC,
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
    reason: ErrorReasons.FAILED_TO_REMOVE_SUBMITTERS_FROM_STUDY_GROUP,
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
    reason: ErrorReasons.FAILED_TO_REMOVE_SUBMITTERS_FROM_STUDY_GROUP,
    errorStudyId,
    errorSubmitters,
  };
  return new ServiceError(errorProps);
}
