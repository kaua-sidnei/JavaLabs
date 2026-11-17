import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI, Type } from '@google/genai';

export class ApiHttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new ApiHttpError(
      503,
      'GEMINI_API_KEY não configurada no servidor. Configure a chave nas variáveis de ambiente do projeto (AI Studio Secrets ou Vercel Environment Variables).'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';
}

function withLineNumbers(code: string): string {
  return code
    .split('\n')
    .map((line, i) => `${i + 1}: ${line}`)
    .join('\n');
}

function getTrackPromptMeta(track?: string) {
  switch (track) {
    case 'javascript':
      return {
        label: 'JavaScript ES6+ e TypeScript 5',
        fence: 'typescript',
        rules:
          'Avalie escopo (const/let vs var), igualdade estrita (===), coerção de tipos (Number.isNaN), estruturas ES6+ (map/filter/reduce, slice vs splice, destructuring/spread), assincronicidade (Promises, async/await, response.ok no fetch) e TypeScript (unknown vs any, Interfaces vs Types, Generics <T>, Partial/Omit/Pick/Record e Type Guards).',
        starterHint: 'função ou módulo JavaScript ES6+ ou TypeScript válido',
      };
    case 'appscript':
      return {
        label: 'Google Apps Script V8 (Dados & Logística)',
        fence: 'javascript',
        rules:
          'Avalie usando exatamente os dados fornecidos na tabela do enunciado (datasetTable). Penalize leitura/escrita célula a célula dentro de loops (getValue/setValue/getRange em loop — exija getValues/setValues em lote), cheque muteHttpExceptions e getResponseCode() em UrlFetchApp.fetch(), checagem (!e || !e.range) em onEdit(e), deduplicação de ScriptApp.newTrigger e uso de LockService quando aplicável.',
        starterHint: 'função Google Apps Script V8 (.gs) completa',
      };
    case 'python':
      return {
        label: 'Python 3.12 (Core, POO, Requests/BeautifulSoup, Pandas & FastAPI)',
        fence: 'python',
        rules:
          'Avalie sintaxe Python 3.12, compreensões, *args/**kwargs, Context Managers (with open), exceções específicas (evitar except: genérico), argumentos padrão mutáveis ([]/{}), POO (super(), @property, dunder methods), requests com timeout/raise_for_status, BeautifulSoup tratando retorno None de select_one, vetorização em Pandas (evitar iterrows) e validação FastAPI/Pydantic.',
        starterHint: 'função, classe ou módulo Python 3.12 com type hints',
      };
    case 'java':
    default:
      return {
        label: 'Java 21',
        fence: 'java',
        rules:
          'Considere o comportamento REAL do Java 21 (ex: em ambiente pt-BR, Scanner sem Locale.US lança InputMismatchException quando recebe "2.00"; println de double sem printf não garante 4 casas decimais fixas; divisão inteira trunca; Scanner aberto sem close gera aviso; String comparada com ==).',
        starterHint: 'código Java válido com class Main e public static void main',
      };
  }
}

export async function evaluateCodePayload(body: Record<string, unknown>) {
  const code = typeof body.code === 'string' ? body.code : '';
  const exercise = body.exercise as Record<string, unknown> | undefined;
  const mode = body.mode === 'submit' ? 'submit' : 'run';

  if (!code || !exercise) {
    throw new ApiHttpError(400, 'Código e exercício são obrigatórios.');
  }

  const ai = getGeminiClient();
  const numberedCode = withLineNumbers(code);
  const trackMeta = getTrackPromptMeta(
    typeof exercise.track === 'string' ? exercise.track : undefined
  );
  const dataset = exercise.datasetTable as
    | { sheetName: string; columns: string[]; rows: string[][] }
    | undefined;
  const datasetBlock = dataset
    ? `\nDADOS DA PLANILHA / TABELA FORNECIDA PELO SITE (${dataset.sheetName}):\nColunas: ${dataset.columns.join(' | ')}\nLinhas:\n${dataset.rows.map((r) => r.join(' | ')).join('\n')}\n`
    : '';
  const requirements = Array.isArray(exercise.requirements)
    ? (exercise.requirements as string[]).join(' | ')
    : '';

  const prompt = `Você é um executor/compilador rigoroso de ${trackMeta.label} e um mentor sênior (Copilot do JavaLabs).
Analise o código do aluno para o exercício abaixo, simule fielmente a validação sintática e execução para cada caso de teste, e produza uma revisão linha a linha em português do Brasil.

TRILHA: ${trackMeta.label}
EXERCÍCIO:
- Módulo: ${String(exercise.moduleId ?? '')}
- Título: ${String(exercise.title ?? '')}
- Dificuldade: ${String(exercise.difficulty ?? '')}
- Enunciado: ${String(exercise.prompt ?? '')}
${exercise.formula ? `- Fórmula/Contexto: ${String(exercise.formula)}` : ''}
${datasetBlock}- Requisitos: ${requirements}
- Casos de Teste:
${JSON.stringify(exercise.examples || [], null, 2)}

CÓDIGO DO ALUNO (com números de linha):
\`\`\`${trackMeta.fence}
${numberedCode}
\`\`\`

REGRAS DE AVALIAÇÃO:
1. Verifique erros de sintaxe, tipos, imports/chamadas ausentes e chaves/parênteses/indentação.
2. ${trackMeta.rules}
3. Para cada caso de teste em "examples", informe a saída exata obtida (actualOutput) e se passou (passed). Caso o código não implemente o solicitado ou falhe na execução, marque passed=false e explique.
4. Modo atual: "${mode === 'submit' ? 'Envio final' : 'Execução de testes'}".
5. Em "findings", liste entre 0 e 6 apontamentos concretos (ERRO, AVISO, DICA) com número de linha exato, explicação didática e trecho curto de correção (suggestionCode). Se o código estiver impecável, retorne findings vazio e qualityScore >= 95.
6. Em "improvementsForEnunciado", retorne os 3 principais pontos curtos do que melhorar (para aparecer diretamente na caixa "O que melhorar" no painel do enunciado).`;

  const response = await ai.models.generateContent({
    model: getModelName(),
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          compiled: { type: Type.BOOLEAN },
          compileError: { type: Type.STRING },
          allPassed: { type: Type.BOOLEAN },
          stdout: { type: Type.STRING },
          qualityScore: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          testResults: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                index: { type: Type.INTEGER },
                input: { type: Type.STRING },
                expectedOutput: { type: Type.STRING },
                actualOutput: { type: Type.STRING },
                passed: { type: Type.BOOLEAN },
                error: { type: Type.STRING },
              },
            },
          },
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                severity: { type: Type.STRING },
                title: { type: Type.STRING },
                line: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                suggestionCode: { type: Type.STRING },
                category: { type: Type.STRING },
              },
            },
          },
          improvementsForEnunciado: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                line: { type: Type.INTEGER },
                severity: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  return JSON.parse((response.text ?? '{}').trim());
}

export async function reviewCodePayload(body: Record<string, unknown>) {
  const code = typeof body.code === 'string' ? body.code : '';
  const exercise = body.exercise as Record<string, unknown> | undefined;

  if (!code || !exercise) {
    throw new ApiHttpError(400, 'Código e exercício são obrigatórios.');
  }

  const ai = getGeminiClient();
  const numberedCode = withLineNumbers(code);
  const trackMeta = getTrackPromptMeta(
    typeof exercise.track === 'string' ? exercise.track : undefined
  );
  const requirements = Array.isArray(exercise.requirements)
    ? (exercise.requirements as string[]).join(' | ')
    : '';

  const prompt = `Você é o Copilot de código (${trackMeta.label}) do JavaLabs. Revise o código abaixo com foco em:
- ${trackMeta.rules}
- Aderência aos requisitos do enunciado (dificuldade: ${String(exercise.difficulty ?? '')})
- Clareza, performance, tratamento de erros e boas práticas idiomáticas.

EXERCÍCIO: ${String(exercise.title ?? '')}
ENUNCIADO: ${String(exercise.prompt ?? '')}
REQUISITOS: ${requirements}

CÓDIGO (com linhas):
\`\`\`${trackMeta.fence}
${numberedCode}
\`\`\`

Retorne JSON estruturado com qualityScore (0-100), summary, findings (ERRO, AVISO, DICA) com line e suggestionCode, e improvementsForEnunciado (lista curta para exibir junto ao enunciado).`;

  const response = await ai.models.generateContent({
    model: getModelName(),
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          qualityScore: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                severity: { type: Type.STRING },
                title: { type: Type.STRING },
                line: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                suggestionCode: { type: Type.STRING },
                category: { type: Type.STRING },
              },
            },
          },
          improvementsForEnunciado: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                line: { type: Type.INTEGER },
                severity: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  return JSON.parse((response.text ?? '{}').trim());
}

export async function chatCopilotPayload(body: Record<string, unknown>) {
  const message = typeof body.message === 'string' ? body.message : '';
  const code = typeof body.code === 'string' ? body.code : '';
  const exercise = body.exercise as Record<string, unknown> | undefined;
  const history = body.history;
  const findings = body.findings;

  if (!message || !exercise) {
    throw new ApiHttpError(400, 'Mensagem e contexto do exercício são obrigatórios.');
  }

  const ai = getGeminiClient();
  const numberedCode = withLineNumbers(code);
  const trackMeta = getTrackPromptMeta(
    typeof exercise.track === 'string' ? exercise.track : undefined
  );
  const recentHistory = Array.isArray(history)
    ? history
        .slice(-6)
        .map(
          (m: { role?: string; content?: string }) =>
            `${m.role === 'user' ? 'Aluno' : 'Copilot'}: ${m.content ?? ''}`
        )
        .join('\n')
    : '';
  const requirements = Array.isArray(exercise.requirements)
    ? (exercise.requirements as string[]).join(' | ')
    : '';

  const prompt = `Contexto do desafio atual (${trackMeta.label}):
- Exercício: ${String(exercise.title ?? '')} (${String(exercise.difficulty ?? '')})
- Enunciado: ${String(exercise.prompt ?? '')}
- Requisitos: ${requirements}
- Pontos de melhoria detectados: ${JSON.stringify(findings || [])}

Código atual do aluno:
\`\`\`${trackMeta.fence}
${numberedCode}
\`\`\`

${recentHistory ? `Histórico recente:\n${recentHistory}\n` : ''}
Pergunta do aluno: ${message}

Responda em português do Brasil de forma objetiva, didática e encorajadora, citando linhas específicas do código quando útil e dando dicas práticas do que melhorar sem entregar a solução inteira pronta se o aluno pedir ajuda para pensar.`;

  const response = await ai.models.generateContent({
    model: getModelName(),
    contents: prompt,
    config: {
      systemInstruction: `Você é o JavaLabs Copilot, um tutor sênior de ${trackMeta.label} focado em aprendizado iterativo de algoritmos e boas práticas.`,
    },
  });

  return {
    reply: response.text ?? 'Não consegui gerar uma resposta agora.',
  };
}

export async function generateExercisePayload(body: Record<string, unknown>) {
  const mod = body.module as Record<string, unknown> | undefined;
  const difficulty = typeof body.difficulty === 'string' ? body.difficulty : '';
  const weakPatterns = body.weakPatterns;

  if (!mod || !difficulty) {
    throw new ApiHttpError(400, 'Módulo e dificuldade são obrigatórios.');
  }

  const ai = getGeminiClient();
  const track = typeof mod.track === 'string' ? mod.track : 'java';
  const trackMeta = getTrackPromptMeta(track);
  const weakText =
    Array.isArray(weakPatterns) && weakPatterns.length > 0
      ? weakPatterns
          .map(
            (p: { title?: string; description?: string }) =>
              `- ${p.title ?? ''}: ${p.description ?? ''}`
          )
          .join('\n')
      : 'Nenhum erro recente registrado; foque nas armadilhas clássicas do tema.';

  const modId = Number(mod.id ?? 0);
  const needsDatasetTable =
    track === 'appscript' || (track === 'python' && (modId === 304 || modId === 305));

  const extraDatasetInstruction = needsDatasetTable
    ? track === 'appscript'
      ? '- Inclua também "datasetTable" com sheetName, description, columns (3 a 5 colunas) e rows (3 linhas realistas de logística/frota/romaneios para o aluno manipular no Google Apps Script).'
      : '- Inclua também "datasetTable" com sheetName (ex: "fretes_sp.csv" ou "Tabela HTML #ofertas"), description, columns (3 a 5 colunas) e rows (3 linhas realistas para Scraping/BeautifulSoup, Pandas ou FastAPI).'
    : '';

  const prompt = `Crie um exercício inédito de ${trackMeta.label} para o módulo "${String(mod.code ?? '')} · ${String(mod.title ?? '')}" (${String(mod.subtitle ?? '')}) no nível de dificuldade "${difficulty}".
Considere estes pontos que o aluno precisa melhorar:
${weakText}

Importante:
- Em "preloadedImprovements", inclua 2 a 3 pontos claros do que o aluno deve melhorar/observar logo ao ler este enunciado!
- Inclua código inicial (starterCode) usando ${trackMeta.starterHint}.
- Inclua 2 a 3 exemplos de entrada e saída esperada determinísticos.
${extraDatasetInstruction}`;

  const response = await ai.models.generateContent({
    model: getModelName(),
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          estimatedMinutes: { type: Type.INTEGER },
          prompt: { type: Type.STRING },
          formula: { type: Type.STRING },
          datasetTable: {
            type: Type.OBJECT,
            properties: {
              sheetName: { type: Type.STRING },
              description: { type: Type.STRING },
              columns: { type: Type.ARRAY, items: { type: Type.STRING } },
              rows: {
                type: Type.ARRAY,
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
          },
          requirements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                input: { type: Type.STRING },
                expectedOutput: { type: Type.STRING },
              },
            },
          },
          starterCode: { type: Type.STRING },
          preloadedImprovements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                detail: { type: Type.STRING },
                severity: { type: Type.STRING },
              },
            },
          },
          focusTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
  });

  return JSON.parse((response.text ?? '{}').trim());
}

type VercelReq = IncomingMessage & { body?: unknown; method?: string };

async function readJsonBody(req: VercelReq): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    return (JSON.parse(req.body || '{}') as Record<string, unknown>) ?? {};
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export async function runVercelPostHandler(
  req: VercelReq,
  res: ServerResponse,
  context: string,
  handler: (body: Record<string, unknown>) => Promise<unknown>
) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Método não permitido. Use POST.' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await handler(body);
    sendJson(res, 200, result);
  } catch (error) {
    if (error instanceof ApiHttpError) {
      sendJson(res, error.statusCode, { error: `${context}: ${error.message}` });
      return;
    }
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido ao processar solicitação.';
    const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
    sendJson(res, status, { error: `${context}: ${message}` });
  }
}
