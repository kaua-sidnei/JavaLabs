import type { IncomingMessage, ServerResponse } from 'node:http';
import { chatCopilotPayload, runVercelPostHandler } from '../../server/apiHandlers';

export default async function handler(
  req: IncomingMessage & { body?: unknown; method?: string },
  res: ServerResponse
) {
  await runVercelPostHandler(req, res, 'Falha no chat com Copilot', chatCopilotPayload);
}
