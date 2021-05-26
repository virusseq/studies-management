export type Study = {
  studyName: string;
  studyId: string;
  organization: string;
  description: string;
  emailAddresses: string[];
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
  studyName: string;
  description: string;
};

export type AddSubmittersReq = {
  studyId: string;
  emailAddresses: string[];
};

export type RemoveSubmitterReq = {
  studyId: string;
  email: string;
};
