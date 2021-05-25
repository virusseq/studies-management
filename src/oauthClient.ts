import { AccessToken, ClientCredentials } from 'simple-oauth2';
import urljoin from 'url-join';
import { EGO_URL, EGO_OAUTH_ENDPOINT, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } from './config';
import fetch from 'node-fetch';

type EgoTokenObj = {
  jwt: string;
  isExpired: () => boolean;
};

let tokenObj: EgoTokenObj;

const expiredChecker = (expiresAtEpochMs: number) => {
  return () => Date.now() >= expiresAtEpochMs;
};

async function requestNewToken() {
  const endpointQuery = `${EGO_OAUTH_ENDPOINT}?client_id=${OAUTH_CLIENT_ID}&client_secret=${OAUTH_CLIENT_SECRET}&grant_type=client_credentials`;
  const tokenInfo = await fetch(urljoin(EGO_URL, endpointQuery), { method: 'POST' }).then((res) =>
    res.json()
  );

  return {
    jwt: tokenInfo.access_token,
    isExpired: expiredChecker(Date.now() + tokenInfo.expires_in * 1000),
  };
}

async function getJwt() {
  if (tokenObj === undefined || tokenObj.isExpired()) {
    console.debug('Current token is no good, requesting new one!');
    tokenObj = await requestNewToken();
  }

  return tokenObj.jwt;
}

async function getAuthHeader() {
  return { Authorization: await getJwt() };
}

async function get<T>(url: string): Promise<T> {
  return await fetch(url).then((res) => res.json());
}

async function getWithAuth<T>(url: string): Promise<T> {
  const headers = await getAuthHeader();
  return await fetch(url, { method: 'GET', headers }).then((res) => res.json());
}

async function postWithAuth<T>(
  url: string,
  body: object
): Promise<{ statusCode: number; data: T }> {
  const authHeaders = await getAuthHeader();
  return await fetch(url, {
    method: 'POST',
    headers: { ...authHeaders, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (res) => {
    return { statusCode: res.status, data: await res.json() };
  });
}

async function deleteWithAuth(url: string) {
  const headers = await getAuthHeader();
  return await fetch(url, { method: 'DELETE', headers });
}

export default { get, getWithAuth, postWithAuth, deleteWithAuth };
