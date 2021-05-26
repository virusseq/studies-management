import urljoin from 'url-join';
import { SONG_URL } from '../config';
import { CreateStudyReq, SongStudy } from '../common/types';

import oauthClient from '../components/oauthClient';
const { get, postWithAuth } = oauthClient;

const SONG_STUDIES_URL = urljoin(SONG_URL, '/studies/all');

export const getSongStudies = async () => {
  // get all studyIds and studyDetails from song
  const studyIds: string[] = await get(SONG_STUDIES_URL);
  const studyDetails: SongStudy[] = [];
  for (const studyId of studyIds) {
    const studyDetail: SongStudy = await get(urljoin(SONG_URL, '/studies/', studyId));
    studyDetails.push(studyDetail);
  }

  return { studyIds, studyDetails };
};

export const createSongStudy = async (req: CreateStudyReq) => {
  const songCreateStudyReq = {
    description: req.description,
    name: req.studyName,
    organization: req.organization,
    studyId: req.studyId,
  };
  const songCreateStudyRes = await postWithAuth(
    urljoin(SONG_URL, '/studies/', req.studyId, '/'),
    songCreateStudyReq
  );
  return songCreateStudyRes.status === 200;
};