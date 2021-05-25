class ServiceError extends Error {
  isServiceError = true;
  statusCode: number;
  message: string;

  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export function StudyNotFound(studyIds: string[]): ServiceError {
  const message: string = `${studyIds.length > 1 ? 'Stydies' : 'Study'} [${studyIds.join(
    ','
  )}] not found! Are you sure the study was created!`;

  return new ServiceError(404, message);
}

export function SubmitterNotFound(emails: string[]): ServiceError {
  console.log('THROWING');
  const message: string = `${emails.length > 1 ? 'Submitters' : 'Submitter'} [${emails.join(
    ', '
  )}] not found! Submitters need to register before they can be added to study!`;

  return new ServiceError(404, message);
}

export function FailedToCreateStudyInSong(studyId: string): ServiceError {
  const message: string = `Failed to create study [${studyId}] in metada service!`;

  return new ServiceError(500, message);
}

export function FailedToCreateStudyInEgo(studyId: string): ServiceError {
  const message: string = `Failed to create group for study [${studyId}] in auth service!`;

  return new ServiceError(500, message);
}

export function FailedToRemoveSubmitterFromStudy(studyId: string, email: string): ServiceError {
  const message: string = `Failed to remove submitter [${email}] from the study [${studyId}]!`;

  return new ServiceError(500, message);
}

export function FailedToAddSubmittersToStudy(studyId: string, emails: string[]): ServiceError {
  const message: string = `Failed to add submitter(s) [${emails.join(
    ', '
  )}] to the study [${studyId}]!`;

  return new ServiceError(500, message);
}
