import { EGO_URL, EGO_STUDY_PREFIX } from '../config';
import {
  EgoStudyGroup,
  EgoGetGroupsResponse,
  EgoGetGroupUsersResponse,
  EgoUser,
  EgoGroup,
} from '../common/types';
import urljoin from 'url-join';

import oauthClient from '../components/oauthClient';
const { getWithAuth, postWithAuth, deleteWithAuth } = oauthClient;

const EGO_GROUPS_URL = urljoin(EGO_URL, '/groups');

function egoGroupToStudyId(egoGroupName: string) {
  return egoGroupName.replace(EGO_STUDY_PREFIX, '');
}

function studyIdToEgoGroup(studyId: string) {
  return EGO_STUDY_PREFIX + studyId;
}

function studyIdToEgoPolicy(studyId: string) {
  return EGO_STUDY_PREFIX + studyId;
}

export const getEgpStudyGroups = async (studyIds: string[]) => {
  const studyGroups: EgoStudyGroup[] = (
    await getWithAuth<EgoGetGroupsResponse>(EGO_GROUPS_URL).then(({ resultSet }) => resultSet)
  )
    .filter((g) => g.name.startsWith('STUDY-'))
    .map((g) => {
      return {
        name: g.name,
        studyId: egoGroupToStudyId(g.name),
        id: g.id,
        status: g.status,
      };
    })
    .filter((g) => studyIds.includes(egoGroupToStudyId(g.studyId)));

  return studyGroups;
};

export const getEgoStudyUsers = async (studyGroups: EgoStudyGroup[]) => {
  const studyUsers: Record<string, string[]> = {};
  for (const { id, studyId } of studyGroups) {
    const users = await getWithAuth<EgoGetGroupUsersResponse>(
      urljoin(EGO_URL, '/groups/', id, '/users')
    ).then(({ resultSet }) => resultSet);

    studyUsers[studyId] = users.map((u) => u.email);
  }
  return studyUsers;
};

export const addUsersToGroup = async (groupId: string, userIds: string[]) => {
  const res = await postWithAuth(urljoin(EGO_URL, '/groups/', groupId, '/users'), userIds);
  return res.status === 200;
};

export const removeUserFromGroup = async (groupId: string, userId: string) => {
  const res = await deleteWithAuth(urljoin(EGO_URL, '/groups/', groupId, '/users/', userId));
  return res.status === 200;
};

export async function getEgoUser(email: string): Promise<EgoUser | undefined> {
  const url = urljoin(EGO_URL, `/users?query=${email}`);
  return getWithAuth<EgoGetGroupUsersResponse>(url).then(({ resultSet }) => resultSet[0]);
}

export async function getEgoStudyGroup(studyId: string): Promise<EgoGroup | undefined> {
  const egoGroupName = studyIdToEgoGroup(studyId);
  const url = urljoin(EGO_URL, `/groups?query=${egoGroupName}`);
  return getWithAuth<EgoGetGroupsResponse>(url).then(({ resultSet }) => resultSet[0]);
}

// return group id
export const createEgoStudyGroup = async (studyId: string, description: string = '') => {
  const egoCreateGroupRequest = {
    description: description,
    name: studyIdToEgoGroup(studyId),
    status: 'APPROVED',
  };
  const res = await postWithAuth<{ id: string }>(
    urljoin(EGO_URL, '/groups'),
    egoCreateGroupRequest
  );

  if (res.status === 200) {
    return res.data.id;
  } else {
    return undefined;
  }
};

export const createEgoStudyPolicy = async (studyId: string) => {
  const egoCreatePolicyRequest = {
    name: studyIdToEgoPolicy(studyId),
  };
  const egoCreatePolicyRes = await postWithAuth<{ id: string }>(
    urljoin(EGO_URL, '/policies'),
    egoCreatePolicyRequest
  );
  if (egoCreatePolicyRes.status === 200) {
    return egoCreatePolicyRes.data.id;
  } else {
    return undefined;
  }
};

export const addGroupToPolicyWithWriteMask = async (groupId: string, policyId: string) => {
  const mask = {
    mask: 'WRITE',
  };
  const egoUpdateGroupPermissionRes = await postWithAuth(
    urljoin(EGO_URL, `/policies/${policyId}/permission/group/${groupId}`),
    mask
  );
  console.log(egoUpdateGroupPermissionRes);
  return egoUpdateGroupPermissionRes.status === 200;
};
