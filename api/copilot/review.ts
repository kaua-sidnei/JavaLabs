import type { IncomingMessage, ServerResponse } from 'node:http';
import { reviewCodePayload, runVercelPostHandler } from '../_lib/apiHandlers.js';

export default async function handler(
  req: IncomingMessage & { body?: unknown; method?: string },
  res: ServerResponse
) {
  await runVercelPostHandler(req, res, 'Falha na revisão do Copilot', reviewCodePayload);
}
