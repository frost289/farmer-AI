import { api, unwrap } from './apiClient.js';

/** Ask FarmAI without logging in. Nothing is saved on the server. */
export const askPublic = ({ question, language }) =>
  api.post('/public/ask', { question, language }).then(unwrap);