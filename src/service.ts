import urljoin from 'url-join';
import { EGO_URL, SONG_URL } from './config';
import {
  AddSubmittersReq,
  CreateStudyReq,
  EgoGetGroupsResponse,
  EgoGetGroupUsersResponse,
  RemoveSubmitterReq,
  SongStudy,
  Study,
  StudyEgoGroup,
  StudyEgoUser,
} from './types';
import fetch from 'node-fetch';

function egoGroupToStudyId(egoGroupName: string) {
  // TODO make configurable!
  return egoGroupName.replace('STUDY-', '');
}

function studyIdToEgoGroup(studyId: string) {
  // TODO make configurable!
  return 'STUDY-' + studyId;
}

const JWT = 'Bearer TODO';
const authHeader = { Authorization: JWT };

const SONG_STUDIES_URL = urljoin(SONG_URL, '/studies/all');
const EGO_GROUPS_URL = urljoin(EGO_URL, '/groups');

async function get<T>(url: string): Promise<T> {
  return await fetch(url).then((res) => res.json());
}

async function getWithAuth<T>(url: string): Promise<T> {
  return await fetch(url, { method: 'GET', headers: authHeader }).then((res) => res.json());
}

async function postWithAuth<T>(url: string, body: object): Promise<T> {
  return await fetch(url, {
    method: 'POST',
    headers: { ...authHeader, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

async function deleteWithAuth(url: string) {
  return await fetch(url, { method: 'DELETE', headers: authHeader });
}

export const getStudies = async (): Promise<Study[]> => {
  // get all studyIds and studyDetails from song
  const studyIds: string[] = await get(SONG_STUDIES_URL);
  const studyDetails: SongStudy[] = [];
  for (const studyId of studyIds) {
    const studyDetail: SongStudy = await get(urljoin(SONG_URL, '/studies/', studyId));
    studyDetails.push(studyDetail);
  }

  // get all groups from ego, and filter groups mapping to each studyId
  const studyGroups: StudyEgoGroup[] = (
    await getWithAuth<EgoGetGroupsResponse>(EGO_GROUPS_URL).then(({ resultSet }) => resultSet)
  )
    .map((g) => {
      return {
        name: g.name,
        studyId: egoGroupToStudyId(g.name),
        id: g.id,
        status: g.status,
      };
    })
    .filter((g) => studyIds.includes(egoGroupToStudyId(g.studyId)));

  // for each group get users from ego
  const studyUsers: Record<string, string[]> = {};
  for (const { id, studyId } of studyGroups) {
    const users = await getWithAuth<EgoGetGroupUsersResponse>(
      urljoin(EGO_URL, '/groups/', id, '/users')
    ).then(({ resultSet }) => resultSet);

    studyUsers[studyId] = users.map((u) => u.email);
  }

  return studyDetails.map((sd: SongStudy) => {
    return {
      studyId: sd.studyId,
      studyName: sd.name,
      description: sd.description,
      organization: sd.organization,
      emailAddresses: studyUsers[sd.studyId],
    };
  });
};

async function getEgoUser(email: string): Promise<StudyEgoUser | undefined> {
  const url = urljoin(EGO_URL, `/users?query=${email}`);
  console.log(url);
  return getWithAuth<EgoGetGroupUsersResponse>(url).then(({ resultSet }) => resultSet[0]);
}

async function getEgoGroup(groupName: string): Promise<StudyEgoUser | undefined> {
  const url = urljoin(EGO_URL, `/groups?query=${groupName}`);
  console.log(url);
  return getWithAuth<EgoGetGroupUsersResponse>(url).then(({ resultSet }) => resultSet[0]);
}

export const createStudy = async (req: CreateStudyReq): Promise<Study | undefined> => {
  const songCreateStudyReq = {
    description: req.description,
    name: req.studyName,
    organization: req.organization,
    studyId: req.studyId,
  };
  const songCreateStudyRes = await postWithAuth<any>(
    urljoin(SONG_URL, '/studies/', req.studyId, '/'),
    songCreateStudyReq
  );
  console.log(songCreateStudyRes);

  const egoCreateGroupRequest = {
    description: req.description,
    name: studyIdToEgoGroup(req.studyId),
    status: 'APPROVED',
  };
  const egoCreateGroupRes = await postWithAuth<any>(
    urljoin(EGO_URL, '/groups'),
    egoCreateGroupRequest
  );
  console.log(egoCreateGroupRes);

  if (songCreateStudyRes.message !== undefined && egoCreateGroupRes.status === 'APPROVED') {
    return {
      ...req,
      emailAddresses: [],
    };
  }
  console.log('Failed to create somewhere');
};

export const addSubmittersToStudy = async (req: AddSubmittersReq) => {
  const userIds = [];
  for (const email of req.emailAddresses) {
    const egoUser = await getEgoUser(email);
    userIds.push(egoUser?.id);
  }

  console.log(userIds);

  const egoGroupName = studyIdToEgoGroup(req.studyId);
  const egoGroup = await getEgoGroup(egoGroupName);
  console.log(egoGroup);

  if (!egoGroup) {
    return undefined;
  }

  const egoAddUsersToGroupRes = await postWithAuth<any>(
    urljoin(EGO_URL, '/groups/', egoGroup.id, '/users'),
    userIds
  );
  console.log(egoAddUsersToGroupRes);

  return req;
};

export const removeSubmitterFromStudy = async (req: RemoveSubmitterReq) => {
  const egoUser = await getEgoUser(req.email);
  console.log(egoUser);

  const egoGroupName = studyIdToEgoGroup(req.studyId);
  const egoGroup = await getEgoGroup(egoGroupName);
  console.log(egoGroup);

  if (!egoGroup || !egoUser) {
    return undefined;
  }

  const egoRemoveUsersFromGroupRes = await deleteWithAuth(
    urljoin(EGO_URL, '/groups/', egoGroup.id, '/users/', egoUser?.id)
  );
  console.log('RES:');
  console.log(egoRemoveUsersFromGroupRes);

  return req;
};
