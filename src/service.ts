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
import {
  FailedToRemoveSubmitterFromStudy,
  FailedToCreateStudyInEgo,
  FailedToCreateStudyInSong,
  StudyNotFound,
  SubmitterNotFound,
  FailedToAddSubmittersToStudy,
} from './errors';
import oauthClient from './oauthClient';

const { get, getWithAuth, postWithAuth, deleteWithAuth } = oauthClient;

function egoGroupToStudyId(egoGroupName: string) {
  // TODO make configurable!
  return egoGroupName.replace('STUDY-', '');
}

function studyIdToEgoGroup(studyId: string) {
  // TODO make configurable!
  return 'STUDY-' + studyId;
}

const SONG_STUDIES_URL = urljoin(SONG_URL, '/studies/all');
const EGO_GROUPS_URL = urljoin(EGO_URL, '/groups');

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
  return getWithAuth<EgoGetGroupUsersResponse>(url).then(({ resultSet }) => resultSet[0]);
}

async function getEgoGroup(groupName: string): Promise<StudyEgoUser | undefined> {
  const url = urljoin(EGO_URL, `/groups?query=${groupName}`);
  return getWithAuth<EgoGetGroupUsersResponse>(url).then(({ resultSet }) => resultSet[0]);
}

export const createStudy = async (req: CreateStudyReq): Promise<Study | undefined> => {
  // TODO check study doesn't already exist!

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
  if (songCreateStudyRes.statusCode !== 200) {
    throw FailedToCreateStudyInSong(req.studyId);
  }

  const egoCreateGroupRequest = {
    description: req.description,
    name: studyIdToEgoGroup(req.studyId),
    status: 'APPROVED',
  };
  const egoCreateGroupRes = await postWithAuth(urljoin(EGO_URL, '/groups'), egoCreateGroupRequest);
  if (egoCreateGroupRes.statusCode !== 200) {
    throw FailedToCreateStudyInEgo(req.studyId);
  }

  return {
    ...req,
    emailAddresses: [],
  };
};

export const addSubmittersToStudy = async (req: AddSubmittersReq) => {
  // TODO check user isn't already in study!

  const egoGroupName = studyIdToEgoGroup(req.studyId);
  const egoGroup = await getEgoGroup(egoGroupName);
  if (!egoGroup) {
    throw StudyNotFound([req.studyId]);
  }

  const userIds = [];
  const missingUsers = [];
  for (const email of req.emailAddresses) {
    const egoUser = await getEgoUser(email);
    if (!egoUser) {
      missingUsers.push(email);
    } else {
      userIds.push(egoUser?.id);
    }
  }
  if (missingUsers.length > 0) {
    throw SubmitterNotFound(missingUsers);
  }

  const egoAddUsersToGroupRes = await postWithAuth(
    urljoin(EGO_URL, '/groups/', egoGroup.id, '/users'),
    userIds
  );
  if (egoAddUsersToGroupRes.statusCode !== 200) {
    throw FailedToAddSubmittersToStudy(req.studyId, req.emailAddresses);
  }

  return req;
};

export const removeSubmitterFromStudy = async (req: RemoveSubmitterReq) => {
  // TODO check user isn't already not in study!

  const egoUser = await getEgoUser(req.email);
  if (!egoUser) {
    throw SubmitterNotFound([req.email]);
  }

  const egoGroupName = studyIdToEgoGroup(req.studyId);
  const egoGroup = await getEgoGroup(egoGroupName);
  if (!egoGroup) {
    throw StudyNotFound([req.studyId]);
  }

  const egoRemoveUsersFromGroupRes = await deleteWithAuth(
    urljoin(EGO_URL, '/groups/', egoGroup.id, '/users/', egoUser?.id)
  );
  if (egoRemoveUsersFromGroupRes.status !== 200) {
    throw FailedToRemoveSubmitterFromStudy(req.studyId, req.email);
  }

  return req;
};
