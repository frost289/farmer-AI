import { api, unwrap } from './apiClient.js';

/** Ask FarmAI. */
export const askQuestion = ({ farm_id, question, language }) =>
  api.post('/advisory/ask', { farm_id, question, language }).then(unwrap);
