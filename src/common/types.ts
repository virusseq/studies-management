export type Study = {
  name: string;
  studyId: string;
  organization: string;
  description: string;
  submitters: string[];
};

export type EgoStudyGroup = {
  name: string;
  studyId: string;
  id: string;
  status: string;
};

export type SongStudy = {
  name: string;
  studyId: string;
  organization: string;
  description: string;
};

export type EgoUser = {
  id: string;
  name: string;
  email: string;
  status: string;
};

export type EgoGroup = {
  name: string;
  description: string;
  id: string;
  status: string;
};

export type EgoGetGroupsResponse = EgoGetResponse<EgoGroup>;

export type EgoGetGroupUsersResponse = EgoGetResponse<EgoUser>;

export type EgoGetResponse<T> = {
  resultSet: T[];
};

export type CreateStudyReq = {
  studyId: string;
  organization: string;
  name: string;
  description: string;
};

export type AddSubmittersReq = {
  studyId: string;
  submitters: string[];
};

export type RemoveSubmitterReq = {
  studyId: string;
  submitter: string;
};
