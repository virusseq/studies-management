import urljoin from 'url-join';
import { EGO_URL, EGO_PUBLIC_KEY_ENDPOINT, SCOPES_WRITE } from '../config';
import Auth from '@overture-stack/ego-token-middleware';

const jwtKeyUrl = urljoin(EGO_URL, EGO_PUBLIC_KEY_ENDPOINT);
const scopes = [SCOPES_WRITE];

export default Auth(jwtKeyUrl)(scopes);
