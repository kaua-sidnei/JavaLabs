import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY não configurada no servidor. Configure a chave em Settings > Secrets para usar o Copilot e o avaliador Java.'
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

function withLineNumbers(code: string): string {
  return code
    .split('\n')
    .map((line, i) => `${i + 1}: ${line}`)
    .join('\n');
}

function handleApiError(res: Response, error: unknown, context: string) {
  const message =
    error instanceof Error ? error.message : 'Erro desconhecido ao processar solicitação.';
  const status = message.includes('GEMINI_API_KEY') ? 503 : 500;
  res.status(status).json({
    error: `${context}: ${message}`,
  });
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'JavaLabs' });
  });

  // 1. Avaliar código (Executar / Enviar solução) + Gerar feedback do Copilot
  app.post('/api/java/evaluate', async (req: Request, res: Response) => {
    try {
      const { code, exercise, mode } = req.body;
      if (!code || !exercise) {
        res.status(400).json({ error: 'Código e exercício são obrigatórios.' });
        return;
      }

      const ai = getGeminiClient();
      const numberedCode = withLineNumbers(code);
      const trackMeta = getTrackPromptMeta(exercise.track);
      const datasetBlock = exercise.datasetTable
        ? `\nDADOS DA PLANILHA / TABELA FORNECIDA PELO SITE (${exercise.datasetTable.sheetName}):\nColunas: ${exercise.datasetTable.columns.join(' | ')}\nLinhas:\n${exercise.datasetTable.rows.map((r: string[]) => r.join(' | ')).join('\n')}\n`
        : '';

      const prompt = `Você é um executor/compilador rigoroso de ${trackMeta.label} e um mentor sênior (Copilot do JavaLabs).
Analise o código do aluno para o exercício abaixo, simule fielmente a validação sintática e execução para cada caso de teste, e produza uma revisão linha a linha em português do Brasil.

TRILHA: ${trackMeta.label}
EXERCÍCIO:
- Módulo: ${exercise.moduleId}
- Título: ${exercise.title}
- Dificuldade: ${exercise.difficulty}
- Enunciado: ${exercise.prompt}
${exercise.formula ? `- Fórmula/Contexto: ${exercise.formula}` : ''}
${datasetBlock}- Requisitos: ${(exercise.requirements || []).join(' | ')}
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
        model: 'gemini-4-hydrogen',
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

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error) {
      handleApiError(res, error, 'Falha ao avaliar código');
    }
  });

  // 2. Revisão rápida com Copilot (Revisar com Copilot)
  app.post('/api/copilot/review', async (req: Request, res: Response) => {
    try {
      const { code, exercise } = req.body;
      if (!code || !exercise) {
        res.status(400).json({ error: 'Código e exercício são obrigatórios.' });
        return;
      }

      const ai = getGeminiClient();
      const numberedCode = withLineNumbers(code);
      const trackMeta = getTrackPromptMeta(exercise.track);

      const prompt = `Você é o Copilot de código (${trackMeta.label}) do JavaLabs. Revise o código abaixo com foco em:
- ${trackMeta.rules}
- Aderência aos requisitos do enunciado (dificuldade: ${exercise.difficulty})
- Clareza, performance, tratamento de erros e boas práticas idiomáticas.

EXERCÍCIO: ${exercise.title}
ENUNCIADO: ${exercise.prompt}
REQUISITOS: ${(exercise.requirements || []).join(' | ')}

CÓDIGO (com linhas):
\`\`\`${trackMeta.fence}
${numberedCode}
\`\`\`

Retorne JSON estruturado com qualityScore (0-100), summary, findings (ERRO, AVISO, DICA) com line e suggestionCode, e improvementsForEnunciado (lista curta para exibir junto ao enunciado).`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
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

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error) {
      handleApiError(res, error, 'Falha na revisão do Copilot');
    }
  });

  // 3. Chat contextual com Copilot sobre o código do exercício
  app.post('/api/copilot/chat', async (req: Request, res: Response) => {
    try {
      const { message, code, exercise, history, findings } = req.body;
      if (!message || !exercise) {
        res.status(400).json({ error: 'Mensagem e contexto do exercício são obrigatórios.' });
        return;
      }

      const ai = getGeminiClient();
      const numberedCode = withLineNumbers(code || '');
      const trackMeta = getTrackPromptMeta(exercise.track);
      const recentHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Aluno' : 'Copilot'}: ${m.content}`)
            .join('\n')
        : '';

      const prompt = `Contexto do desafio atual (${trackMeta.label}):
- Exercício: ${exercise.title} (${exercise.difficulty})
- Enunciado: ${exercise.prompt}
- Requisitos: ${(exercise.requirements || []).join(' | ')}
- Pontos de melhoria detectados: ${JSON.stringify(findings || [])}

Código atual do aluno:
\`\`\`${trackMeta.fence}
${numberedCode}
\`\`\`

${recentHistory ? `Histórico recente:\n${recentHistory}\n` : ''}
Pergunta do aluno: ${message}

Responda em português do Brasil de forma objetiva, didática e encorajadora, citando linhas específicas do código quando útil e dando dicas práticas do que melhorar sem entregar a solução inteira pronta se o aluno pedir ajuda para pensar.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: `Você é o JavaLabs Copilot, um tutor sênior de ${trackMeta.label} focado em aprendizado iterativo de algoritmos e boas práticas.`,
        },
      });

      res.json({
        reply: response.text ?? 'Não consegui gerar uma resposta agora.',
      });
    } catch (error) {
      handleApiError(res, error, 'Falha no chat com Copilot');
    }
  });

  // 4. Gerar novo exercício personalizado por módulo, dificuldade e pontos a melhorar
  app.post('/api/copilot/generate-exercise', async (req: Request, res: Response) => {
    try {
      const { module, difficulty, weakPatterns } = req.body;
      if (!module || !difficulty) {
        res.status(400).json({ error: 'Módulo e dificuldade são obrigatórios.' });
        return;
      }

      const ai = getGeminiClient();
      const trackMeta = getTrackPromptMeta(module.track);
      const weakText =
        Array.isArray(weakPatterns) && weakPatterns.length > 0
          ? weakPatterns.map((p: { title: string; description: string }) => `- ${p.title}: ${p.description}`).join('\n')
          : 'Nenhum erro recente registrado; foque nas armadilhas clássicas do tema.';

      const needsDatasetTable =
        module.track === 'appscript' ||
        (module.track === 'python' && (module.id === 304 || module.id === 305));

      const extraDatasetInstruction = needsDatasetTable
        ? module.track === 'appscript'
          ? '- Inclua também "datasetTable" com sheetName, description, columns (3 a 5 colunas) e rows (3 linhas realistas de logística/frota/romaneios para o aluno manipular no Google Apps Script).'
          : '- Inclua também "datasetTable" com sheetName (ex: "fretes_sp.csv" ou "Tabela HTML #ofertas"), description, columns (3 a 5 colunas) e rows (3 linhas realistas para Scraping/BeautifulSoup, Pandas ou FastAPI).'
        : '';

      const prompt = `Crie um exercício inédito de ${trackMeta.label} para o módulo "${module.code} · ${module.title}" (${module.subtitle}) no nível de dificuldade "${difficulty}".
Considere estes pontos que o aluno precisa melhorar:
${weakText}

Importante:
- Em "preloadedImprovements", inclua 2 a 3 pontos claros do que o aluno deve melhorar/observar logo ao ler este enunciado!
- Inclua código inicial (starterCode) usando ${trackMeta.starterHint}.
- Inclua 2 a 3 exemplos de entrada e saída esperada determinísticos.
${extraDatasetInstruction}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
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

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
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
