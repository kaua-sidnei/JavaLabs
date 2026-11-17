import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  ApiHttpError,
  chatCopilotPayload,
  evaluateCodePayload,
  generateExercisePayload,
  reviewCodePayload,
} from './api/_lib/apiHandlers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

function handleApiError(res: Response, error: unknown, context: string) {
  if (error instanceof ApiHttpError) {
    res.status(error.statusCode).json({
      error: `${context}: ${error.message}`,
    });
    return;
  }
  const message =
    error instanceof Error ? error.message : 'Erro desconhecido ao processar solicitação.';
  const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
  res.status(status).json({
    error: `${context}: ${message}`,
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'JavaLabs' });
  });

  app.post('/api/java/evaluate', async (req: Request, res: Response) => {
    try {
      const result = await evaluateCodePayload((req.body ?? {}) as Record<string, unknown>);
      res.json(result);
    } catch (error) {
      handleApiError(res, error, 'Falha ao avaliar código');
    }
  });

  app.post('/api/copilot/review', async (req: Request, res: Response) => {
    try {
      const result = await reviewCodePayload((req.body ?? {}) as Record<string, unknown>);
      res.json(result);
    } catch (error) {
      handleApiError(res, error, 'Falha na revisão do Copilot');
    }
  });

  app.post('/api/copilot/chat', async (req: Request, res: Response) => {
    try {
      const result = await chatCopilotPayload((req.body ?? {}) as Record<string, unknown>);
      res.json(result);
    } catch (error) {
      handleApiError(res, error, 'Falha no chat com Copilot');
    }
  });

  app.post('/api/copilot/generate-exercise', async (req: Request, res: Response) => {
    try {
      const result = await generateExercisePayload((req.body ?? {}) as Record<string, unknown>);
      res.json(result);
    } catch (error) {
      handleApiError(res, error, 'Falha ao gerar exercício com Copilot');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JavaLabs server running at http://localhost:${PORT}`);
  });
}

startServer();
