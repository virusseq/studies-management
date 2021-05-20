import fetch from 'node-fetch';
const urljoin = require('url-join');

const express = require('express');

const app = express();

const SONG_URL = 'http://localhost:8089';
const EGO_URL = 'http://localhost:8081';

app.get('/health', (_req, res) => {
  res.send(true);
});

type StudyEgoGroup = {
  name: string;
  studyId: string;
  id: string;
  status: string;
};

type StudyEgoUser = {
  id: string;
  name: string;
  email: string;
  status: string;
};

type SongStudy = {
  name: string;
  studyId: string;
  organization: string;
  description: string;
};

function egoGroupToSongId(egoGroupName: string) {
  // TODO make configurable!
  return egoGroupName.replace('STUDY-', '');
}

const JWT =
  'Bearer eyJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MjE1MjY5ODksImV4cCI6MTYyMzY3NDQ3Miwic3ViIjoiNzdmMWVmNzgtNzQ5NS00YjRhLTk4MmEtNmI5NTMyZGM2OWZiIiwiaXNzIjoiZWdvIiwianRpIjoiMDVmODQ4YTItMjZlNy00YjRhLWE4NjMtNzg0MDk0NTk0MWQwIiwiY29udGV4dCI6eyJzY29wZSI6WyJET01BSU4uV1JJVEUiLCJzb25nLlJFQUQiLCJpZC5XUklURSIsInNjb3JlLlJFQUQiLCJpZC5SRUFEIiwic2NvcmUuV1JJVEUiLCJzb25nLldSSVRFIiwiRE9NQUlOLlJFQUQiXSwiYXBwbGljYXRpb24iOnsibmFtZSI6ImFkbWluSWQiLCJjbGllbnRJZCI6ImFkbWluSWQiLCJyZWRpcmVjdFVyaSI6Imh0dHA6Ly9leGFtcGxlLmNvbSIsImRlc2NyaXB0aW9uIjoic29uZ1Njb3JlQWRtaW4iLCJzdGF0dXMiOiJBUFBST1ZFRCIsInR5cGUiOiJDTElFTlQifX19.kyehofFmhwe0V_A1hGLsLxDvYqQ43vnAEa2t4h1LWhYxfHcOeUlOdRbgXAxh7YjrPQ4AFi2SZs1J__ikoVdcljBIcn8KYGV8OXsESQM2bwCLZttAJJJhyHYHUl78_3vpGLI3hBkxubqkZm09Jbqo7vB9vJ0tAYxZeKSLO_er1SA69VrrWO7Rx4ayGQ7B7_4DnfUBWW8KgniLVQZDv_mXzUfUIJIQW-Ux3gufZvw10Y2CKAAeVOk4Y7hsoqunTA4n2d8oNUj86LwiGR8RryhYrsI-0kZyWh5ywdJ4iVtXD7YmCu_npej2naskRPmE3egH7dkykN4V3oIEoZ4QCPELyA';

const authHeader = { Authorization: JWT };

app.get('/studies', async (_req, res) => {
  // get all studyIds from song
  const studyIds: string[] = await fetch(urljoin(SONG_URL, '/studies/all')).then((res) =>
    res.json()
  );

  console.log(studyIds);

  // for each studyId get study details from song
  const studyDetails: SongStudy[] = [];
  for (const studyId of studyIds) {
    const studyDetail = (await fetch(urljoin(SONG_URL, '/studies/', studyId)).then((res) =>
      res.json()
    )) as SongStudy;

    studyDetails.push(studyDetail);
  }

  console.log(studyDetails);

  // get all groups from ego, and filter groups mapping to each studyId
  const studyGroups: StudyEgoGroup[] = (
    await fetch(urljoin(EGO_URL, '/groups'), { method: 'GET', headers: authHeader })
      .then((res) => res.json())
      .then(({ resultSet }) => resultSet)
  )
    .map((g: any) => {
      return {
        name: g.name,
        studyId: egoGroupToSongId(g.name),
        id: g.id,
        status: g.status,
      } as StudyEgoGroup;
    })
    .filter((g: StudyEgoGroup) => studyIds.includes(egoGroupToSongId(g.studyId)));

  console.log(studyGroups);

  // for each group get users from ego
  const studyUsers = {};
  for (const studyGroup of studyGroups) {
    const { id, studyId } = studyGroup;

    const users: StudyEgoUser[] = await fetch(urljoin(EGO_URL, '/groups/', id, '/users'), {
      method: 'GET',
      headers: authHeader,
    })
      .then((res) => res.json())
      .then(({ resultSet }) => resultSet);

    console.log(users);

    studyUsers[studyId] = users.map((u) => ({ name: u.name, email: u.email, status: u.status }));
  }

  const result = studyDetails.map((sd) => {
    return { ...sd, users: studyUsers[sd.studyId] };
  });

  // return collection of study with users and details
  res.send(result);
});

app.post('/study', (_req, res) => {
  // post study in song
  // create group in ego
  // create policy in ego
  // add policy for group
  // return true
  res.send([]);
});

app.get('/user', (_req, res) => {});

app.post('/users', (_req, res) => {
  res.send([]);
});

app.delete('/user', (_req, res) => {
  res.send([]);
});

app.listen(3001);
