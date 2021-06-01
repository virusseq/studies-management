import {
  AddSubmittersReq,
  CreateStudyReq,
  RemoveSubmitterReq,
  SongStudy,
  Study,
  EgoStudyGroup,
} from '../common/types';
import {
  FailedToRemoveSubmitterFromStudy,
  FailedToCreateStudy,
  StudyNotFound,
  SubmitterNotFound,
  FailedToAddSubmittersToStudy,
  StudyAlreadyExists,
  SubmittersAlreadyInStudy,
  SubmitterNotInStudy,
} from '../common/errors';
import { createSongStudy, getSongStudies, getSongStudyIds } from './song';
import {
  getEgpStudyGroups,
  getEgoStudyUsers,
  getEgoStudyGroup,
  getEgoUser,
  removeUserFromGroup,
  addUsersToGroup,
  createEgoStudyGroup,
  createEgoStudyPolicy,
  addGroupToPolicyWithWriteMask,
  getEgoStudyGroupUsers,
  getEgoUserGroups,
} from './ego';

export const getStudies = async (): Promise<Study[]> => {
  const { studyIds, studyDetails } = await getSongStudies();
  const studyGroups: EgoStudyGroup[] = await getEgpStudyGroups(studyIds);
  const studyUsers: Record<string, string[]> = await getEgoStudyUsers(studyGroups);

  return (
    studyDetails
      // studyUsers can be empty array but should not undefined
      .filter((sd) => studyUsers[sd.studyId] !== undefined)
      .map((sd: SongStudy) => {
        return {
          studyId: sd.studyId,
          name: sd.name,
          description: sd.description,
          organization: sd.organization,
          submitters: studyUsers[sd.studyId],
        };
      })
  );
};

export const createStudy = async (req: CreateStudyReq): Promise<Study> => {
  const existingSongIds = await getSongStudyIds();
  if (existingSongIds.includes(req.studyId)) {
    throw StudyAlreadyExists(req.studyId);
  }

  const createdSongStudy = await createSongStudy(req);
  if (!createdSongStudy) {
    console.error(`Failed to create study in SONG`, JSON.stringify(req));
    throw FailedToCreateStudy(req.studyId);
  }

  const groupId = await createEgoStudyGroup(req.studyId, req.description);
  if (!groupId) {
    console.error(`Failed to create study group in EGO`, JSON.stringify(req));
    throw FailedToCreateStudy(req.studyId);
  }

  const policyId = await createEgoStudyPolicy(req.studyId);
  if (!policyId) {
    console.error(`Failed to create study policy in EGO`, JSON.stringify(req));
    throw FailedToCreateStudy(req.studyId);
  }

  const added = await addGroupToPolicyWithWriteMask(groupId, policyId);
  if (!added) {
    console.error(`Failed to add study group to study policy in EGO`, JSON.stringify(req));
    throw FailedToCreateStudy(req.studyId);
  }

  return {
    ...req,
    submitters: [],
  };
};

export const addSubmittersToStudy = async (req: AddSubmittersReq) => {
  const egoGroup = await getEgoStudyGroup(req.studyId);
  if (!egoGroup) {
    throw StudyNotFound(req.studyId);
  }

  const groupUsers = await getEgoStudyGroupUsers(egoGroup.id);
  const groupUserEmails = groupUsers.map((u) => u.email);
  const existingGroupUsers = req.submitters.filter((u) => groupUserEmails.includes(u));
  if (existingGroupUsers.length > 0) {
    throw SubmittersAlreadyInStudy(req.studyId, existingGroupUsers);
  }

  const userIds = [];
  const missingUsers = [];
  for (const email of req.submitters) {
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

  const successfullyAdded = await addUsersToGroup(egoGroup.id, userIds);
  if (!successfullyAdded) {
    throw FailedToAddSubmittersToStudy(req.studyId, req.submitters);
  }

  return req;
};

export const removeSubmitterFromStudy = async (req: RemoveSubmitterReq) => {
  const egoGroup = await getEgoStudyGroup(req.studyId);
  if (!egoGroup) {
    throw StudyNotFound(req.studyId);
  }

  const egoUser = await getEgoUser(req.submitter);
  if (!egoUser) {
    throw SubmitterNotFound([req.submitter]);
  }

  const egoUserGroups = await getEgoUserGroups(egoUser.id);
  const exisitngEgoGroup = egoUserGroups.find((g) => g.id === egoGroup.id);
  if (!exisitngEgoGroup) {
    throw SubmitterNotInStudy(req.studyId, req.submitter);
  }

  const successfullyRemoved = await removeUserFromGroup(egoGroup.id, egoUser.id);
  if (!successfullyRemoved) {
    throw FailedToRemoveSubmitterFromStudy(req.studyId, req.submitter);
  }

  return req;
};
