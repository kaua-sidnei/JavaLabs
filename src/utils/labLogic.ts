import type {
  CopilotFinding,
  DashboardStats,
  Difficulty,
  Exercise,
  ImprovementHint,
  JavaModule,
  LanguageTrack,
  ModuleCategory,
  RecurringPattern,
  SubmissionRecord,
} from '../types/javalab';

export interface StaticAnalysisOutput {
  findings: CopilotFinding[];
  improvementsForEnunciado: ImprovementHint[];
  qualityScore: number;
}

export interface ModuleProgress {
  solved: number;
  total: number;
  percent: number;
  status: 'Concluído' | 'Em andamento' | 'Não iniciado';
}

function finalizeAnalysis(findings: CopilotFinding[]): StaticAnalysisOutput {
  let penalty = 0;
  for (const item of findings) {
    if (item.severity === 'ERRO') penalty += 24;
    else if (item.severity === 'AVISO') penalty += 11;
    else penalty += 6;
  }
  const qualityScore = Math.max(15, Math.min(100, 100 - penalty));

  const improvementsForEnunciado: ImprovementHint[] = findings.slice(0, 4).map((f) => ({
    title: f.title,
    detail: f.explanation,
    line: f.line,
    severity: f.severity,
  }));

  return {
    findings,
    improvementsForEnunciado,
    qualityScore,
  };
}

function findFirstLine(lines: string[], predicate: (line: string) => boolean, fallback = 1): number {
  const idx = lines.findIndex(predicate);
  return idx >= 0 ? idx + 1 : fallback;
}

export function analyzeJavaCodeStatic(
  code: string,
  exercise: Exercise
): StaticAnalysisOutput {
  const lines = code.split('\n');
  const findings: CopilotFinding[] = [];
  const promptAndReqs = `${exercise.prompt} ${exercise.requirements.join(' ')}`.toLowerCase();

  const findLine = (predicate: (line: string) => boolean, fallback = 1): number =>
    findFirstLine(lines, predicate, fallback);

  // 1. Scanner + decimal separator check
  const hasScanner = /\bScanner\b/.test(code);
  const scannerLine = findLine((l) => /\bnew\s+Scanner\s*\(/.test(l), findLine((l) => /\bScanner\b/.test(l)));
  const usesLocaleUS = /Locale\.setDefault\s*\(\s*Locale\.US\s*\)|\.useLocale\s*\(\s*Locale\.US\s*\)/.test(code);
  const expectsDecimalInput =
    /\bnextDouble\b|\bnextFloat\b/.test(code) ||
    /ponto|decimal|double|casas decimais|raio/i.test(promptAndReqs);

  if (hasScanner && expectsDecimalInput && !usesLocaleUS) {
    findings.push({
      id: 'static-locale-us',
      severity: 'ERRO',
      title: 'Ponto decimal depende do sistema',
      line: scannerLine,
      explanation:
        'Em máquinas pt-BR o Scanner espera vírgula: entradas com ponto (ex: 2.00) lançam InputMismatchException.',
      suggestionCode: 'Locale.setDefault(Locale.US);',
      category: 'Locale do Scanner',
    });
  }

  // 2. Output formatting with decimal places
  const needsFormattedDecimals = /quatro casas|duas casas|três casas|casas decimais|%[\d.]*f|formato\s+[a-z]=\d+\.\d+/i.test(
    promptAndReqs
  );
  const usesPrintfOrFormat = /System\.out\.printf|String\.format|DecimalFormat/.test(code);
  const printlnLine = findLine((l) => /System\.out\.println\s*\(/.test(l));

  if (needsFormattedDecimals && !usesPrintfOrFormat) {
    findings.push({
      id: 'static-decimal-format',
      severity: 'ERRO',
      title: 'Saída sem formatação decimal fixa',
      line: printlnLine,
      explanation:
        'O enunciado exige casas decimais exatas. Concatenar double no println imprime todas as casas sem arredondamento padrão.',
      suggestionCode: 'System.out.printf("A=%.4f%n", area);',
      category: 'Formatação de saída',
    });
  }

  // 3. Scanner resource closing
  const closesScanner = /\.close\s*\(\s*\)/.test(code) || /try\s*\(\s*Scanner\b/.test(code);
  if (hasScanner && !closesScanner) {
    findings.push({
      id: 'static-scanner-close',
      severity: 'AVISO',
      title: 'Scanner nunca é fechado',
      line: scannerLine,
      explanation:
        'Recurso aberto sem liberar. Feche com sc.close() no fim do main ou use try-with-resources.',
      suggestionCode: 'sc.close();',
      category: 'Gestão de recursos',
    });
  }

  // 4. String comparison with ==
  const stringEqLine = findLine(
    (l) => /"[^"]*"\s*==|==\s*"[^"]*"/.test(l)
  );
  if (/"[^"]*"\s*==|==\s*"[^"]*"/.test(code)) {
    findings.push({
      id: 'static-string-equals',
      severity: 'ERRO',
      title: 'Comparação de String usando ==',
      line: stringEqLine,
      explanation:
        'Em Java, == compara referências de memória. Use .equals() ou .equalsIgnoreCase() para comparar o conteúdo de Strings.',
      suggestionCode: 'if (texto.equals("SIM")) {',
      category: 'Comparação de objetos',
    });
  }

  // 5. Empty catch block
  const emptyCatchLine = findLine((l) => /catch\s*\([^)]+\)\s*\{\s*\}/.test(l));
  if (/catch\s*\([^)]+\)\s*\{\s*\}/.test(code)) {
    findings.push({
      id: 'static-empty-catch',
      severity: 'ERRO',
      title: 'Bloco catch vazio silencia falhas',
      line: emptyCatchLine,
      explanation:
        'Engolir exceções oculta bugs em produção. Trate a exceção, registre uma mensagem clara ou relance uma exceção de domínio.',
      suggestionCode: 'catch (DomainException e) {\n    System.out.println("Erro: " + e.getMessage());\n}',
      category: 'Tratamento de exceções',
    });
  }

  // 6. Single-letter variable names (excluding loop counters i/j/k and e in catch)
  const singleVarLine = findLine((l) =>
    /\b(double|int|float|long|String)\s+([a-df-hj-z])\s*=/.test(l)
  );
  if (/\b(double|int|float|long|String)\s+([a-df-hj-z])\s*=/.test(code)) {
    findings.push({
      id: 'static-single-letter-vars',
      severity: 'DICA',
      title: 'Nomes de variável de uma letra',
      line: singleVarLine,
      explanation:
        'Nomes descritivos (como raio, area, salario) tornam o algoritmo autoexplicativo sem exigir que o leitor adivinhe o significado.',
      suggestionCode: 'double raio = sc.nextDouble();',
      category: 'Nomes de variáveis',
    });
  }

  // 7. Magic number 3.14159 without final constant
  const piLine = findLine((l) => /3\.14159/.test(l) && !/\bfinal\b/.test(l));
  if (/3\.14159/.test(code) && !/\bfinal\s+double\s+PI\b/.test(code)) {
    findings.push({
      id: 'static-magic-pi',
      severity: 'DICA',
      title: 'Número mágico 3.14159',
      line: piLine,
      explanation:
        'Declare π como constante com final: dá nome semântico ao valor e evita repetição ou erro de digitação.',
      suggestionCode: 'final double PI = 3.14159;',
      category: 'Constantes e legibilidade',
    });
  }

  // 8. Math.pow(x, 2) micro-idiom
  const powLine = findLine((l) => /Math\.pow\s*\([^,]+,\s*2\s*\)/.test(l));
  if (/Math\.pow\s*\([^,]+,\s*2\s*\)/.test(code)) {
    findings.push({
      id: 'static-math-pow',
      severity: 'DICA',
      title: 'Math.pow para elevar ao quadrado',
      line: powLine,
      explanation:
        'Para expoente 2, multiplicar a variável por ela mesma (raio * raio) é mais direto, legível e evita chamada de método.',
      suggestionCode: 'double area = PI * raio * raio;',
      category: 'Clareza algorítmica',
    });
  }

  // 9. Unbalanced braces check
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    findings.push({
      id: 'static-braces',
      severity: 'ERRO',
      title: 'Chaves { } desbalanceadas',
      line: lines.length,
      explanation: `Encontradas ${openBraces} chaves de abertura e ${closeBraces} de fechamento. O compilador Java falhará antes de executar.`,
      category: 'Sintaxe Java',
    });
  }

  return finalizeAnalysis(findings);
}

function findLineInsideLoop(lines: string[], targetRegex: RegExp): number {
  let depth = 0;
  let loopDepth: number | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\b(for|while)\s*\(|\.forEach\s*\(/.test(line) && loopDepth === null) {
      loopDepth = depth;
    }
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    if (loopDepth !== null && targetRegex.test(line)) {
      return i + 1;
    }
    depth += opens - closes;
    if (loopDepth !== null && depth <= loopDepth && closes > 0) {
      loopDepth = null;
    }
  }
  return 0;
}

function analyzeJavaScriptStatic(code: string): StaticAnalysisOutput {
  const lines = code.split('\n');
  const findings: CopilotFinding[] = [];

  if (/\bvar\s+\w+/.test(code)) {
    findings.push({
      id: 'static-js-var',
      severity: 'AVISO',
      title: 'Uso de var gera hoisting e vazamento de escopo',
      line: findFirstLine(lines, (l) => /\bvar\s+\w+/.test(l)),
      explanation: 'Prefira const para valores fixos e let quando precisar reatribuir a variável.',
      suggestionCode: 'let usadas = 0;',
      category: 'Escopo ES6+',
    });
  }

  if (/[^!=]==[^=]/.test(code)) {
    findings.push({
      id: 'static-js-eqeq',
      severity: 'AVISO',
      title: 'Comparação frouxa com ==',
      line: findFirstLine(lines, (l) => /[^!=]==[^=]/.test(l)),
      explanation: 'Use === e !== para evitar coerção implícita de tipos entre strings, números e booleanos.',
      suggestionCode: "if (status === 'ENTREGUE')",
      category: 'Igualdade estrita',
    });
  }

  if (/===?\s*NaN\b|\bNaN\s*===?/.test(code)) {
    findings.push({
      id: 'static-js-nan',
      severity: 'ERRO',
      title: 'Comparação direta com NaN sempre retorna false',
      line: findFirstLine(lines, (l) => /===?\s*NaN\b|\bNaN\s*===?/.test(l)),
      explanation: 'NaN nunca é igual a si mesmo em JavaScript. Use Number.isNaN(valor) ou Number.isFinite(valor).',
      suggestionCode: 'if (Number.isNaN(valor))',
      category: 'Coerção e Números',
    });
  }

  if (/\bfetch\s*\(/.test(code) && !/\.ok\b/.test(code)) {
    findings.push({
      id: 'static-js-fetch-ok',
      severity: 'ERRO',
      title: 'fetch() sem verificação de response.ok',
      line: findFirstLine(lines, (l) => /\bfetch\s*\(/.test(l)),
      explanation: 'fetch() não rejeita em HTTP 404/500. Cheque if (!resp.ok) antes de chamar resp.json().',
      suggestionCode: 'if (!resp.ok) throw new Error(`HTTP ${resp.status}`);',
      category: 'Fetch API & Rede',
    });
  }

  if (/\bJSON\.parse\s*\(/.test(code) && !/\btry\s*\{/.test(code)) {
    findings.push({
      id: 'static-js-json-try',
      severity: 'AVISO',
      title: 'JSON.parse() sem bloco try/catch',
      line: findFirstLine(lines, (l) => /\bJSON\.parse\s*\(/.test(l)),
      explanation: 'JSON malformado lança SyntaxError em runtime. Envolva JSON.parse() em try/catch.',
      suggestionCode: 'try { return JSON.parse(raw); } catch { return null; }',
      category: 'JSON & Resiliência',
    });
  }

  if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(code)) {
    findings.push({
      id: 'static-js-empty-catch',
      severity: 'ERRO',
      title: 'Bloco catch vazio silencia exceções',
      line: findFirstLine(lines, (l) => /catch\s*\([^)]*\)\s*\{\s*\}/.test(l)),
      explanation: 'Registre ou relance o erro no bloco catch em vez de ignorar falhas silenciosamente.',
      category: 'Tratamento de erros',
    });
  }

  if (/:\s*any\b/.test(code)) {
    findings.push({
      id: 'static-ts-any',
      severity: 'AVISO',
      title: 'Tipagem any anula segurança do TypeScript',
      line: findFirstLine(lines, (l) => /:\s*any\b/.test(l)),
      explanation: 'Substitua any por Generics <T>, unknown com Type Guard ou Partial<Omit<...>>.',
      category: 'TypeScript',
    });
  }

  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    findings.push({
      id: 'static-braces',
      severity: 'ERRO',
      title: 'Chaves { } desbalanceadas',
      line: lines.length,
      explanation: `Encontradas ${openBraces} chaves de abertura e ${closeBraces} de fechamento.`,
      category: 'Sintaxe JS/TS',
    });
  }

  return finalizeAnalysis(findings);
}

function analyzeAppScriptStatic(code: string, _exercise: Exercise): StaticAnalysisOutput {
  const lines = code.split('\n');
  const findings: CopilotFinding[] = [];

  const loopIoLine = findLineInsideLoop(
    lines,
    /\.(getValue|setValue|getRange|appendRow)\s*\(/
  );
  if (loopIoLine > 0) {
    findings.push({
      id: 'static-gas-loop-io',
      severity: 'ERRO',
      title: 'Chamada à planilha dentro do loop (gargalo GAS)',
      line: loopIoLine,
      explanation:
        'Ler ou gravar célula por célula dentro de for/while torna o script extremamente lento. Leia com getValues(), processe em memória e grave em lote com setValues().',
      suggestionCode: 'aba.getRange(2, col, saida.length, 1).setValues(saida);',
      category: 'Performance em Lote',
    });
  }

  const mailLoopLine = findLineInsideLoop(lines, /\b(MailApp|GmailApp)\.sendEmail\s*\(/);
  if (mailLoopLine > 0) {
    findings.push({
      id: 'static-gas-mail-loop',
      severity: 'ERRO',
      title: 'Envio de e-mail dentro de loop',
      line: mailLoopLine,
      explanation:
        'Apps Script possui cota diária rígida de envios. Consolide as ocorrências e dispare um único e-mail fora do laço.',
      category: 'Cotas Apps Script',
    });
  }

  if (/\bUrlFetchApp\.fetch\s*\(/.test(code) && !/muteHttpExceptions/.test(code)) {
    findings.push({
      id: 'static-gas-mute-http',
      severity: 'AVISO',
      title: 'UrlFetchApp.fetch sem muteHttpExceptions',
      line: findFirstLine(lines, (l) => /\bUrlFetchApp\.fetch\s*\(/.test(l)),
      explanation:
        'Sem { muteHttpExceptions: true }, respostas HTTP 4xx/5xx interrompem toda a automação antes do fallback.',
      suggestionCode: 'UrlFetchApp.fetch(url, { muteHttpExceptions: true });',
      category: 'Resiliência de API',
    });
  }

  if (/\bUrlFetchApp\.fetch\s*\(/.test(code) && !/getResponseCode\s*\(/.test(code)) {
    findings.push({
      id: 'static-gas-status-check',
      severity: 'DICA',
      title: 'Verifique getResponseCode() antes de JSON.parse',
      line: findFirstLine(lines, (l) => /\bUrlFetchApp\.fetch\s*\(/.test(l)),
      explanation:
        'Valide se response.getResponseCode() === 200 antes de converter com JSON.parse() para evitar erro com payloads HTML.',
      suggestionCode: 'if (response.getResponseCode() === 200) { ... }',
      category: 'Resiliência de API',
    });
  }

  if (/\bfunction\s+onEdit\s*\(\s*e\s*\)/.test(code) && !/!e\b|e\s*&&\s*e\.range/.test(code)) {
    findings.push({
      id: 'static-gas-onedit-guard',
      severity: 'ERRO',
      title: 'onEdit(e) sem guarda para evento vazio',
      line: findFirstLine(lines, (l) => /\bfunction\s+onEdit\s*\(/.test(l)),
      explanation:
        'Ao executar manualmente pelo editor do Apps Script, o parâmetro e vem undefined. Adicione if (!e || !e.range) return;.',
      suggestionCode: 'if (!e || !e.range) return;',
      category: 'Triggers GAS',
    });
  }

  if (/\bScriptApp\.newTrigger\s*\(/.test(code) && !/getProjectTriggers\s*\(/.test(code)) {
    findings.push({
      id: 'static-gas-duplicate-trigger',
      severity: 'AVISO',
      title: 'newTrigger() sem checar triggers duplicados',
      line: findFirstLine(lines, (l) => /\bScriptApp\.newTrigger\s*\(/.test(l)),
      explanation:
        'Verifique ScriptApp.getProjectTriggers() antes de criar um novo trigger para evitar execuções duplicadas.',
      suggestionCode: 'ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));',
      category: 'Triggers GAS',
    });
  }

  if (/\bvar\s+\w+/.test(code)) {
    findings.push({
      id: 'static-js-var',
      severity: 'AVISO',
      title: 'Uso de var no runtime V8',
      line: findFirstLine(lines, (l) => /\bvar\s+\w+/.test(l)),
      explanation: 'O Apps Script moderno usa V8 (ES6+): prefira const e let.',
      category: 'ES6+ no Apps Script',
    });
  }

  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    findings.push({
      id: 'static-braces',
      severity: 'ERRO',
      title: 'Chaves { } desbalanceadas',
      line: lines.length,
      explanation: `Encontradas ${openBraces} chaves de abertura e ${closeBraces} de fechamento.`,
      category: 'Sintaxe Apps Script',
    });
  }

  return finalizeAnalysis(findings);
}

function analyzePythonStatic(code: string): StaticAnalysisOutput {
  const lines = code.split('\n');
  const findings: CopilotFinding[] = [];

  if (/^\s*except\s*:/m.test(code)) {
    findings.push({
      id: 'static-py-bare-except',
      severity: 'ERRO',
      title: 'Cláusula except: genérica sem tipo de exceção',
      line: findFirstLine(lines, (l) => /^\s*except\s*:/.test(l)),
      explanation: 'Capturar todas as exceções com except: oculta bugs reais. Especifique (ex: except FileNotFoundError as exc:).',
      suggestionCode: 'except FileNotFoundError as exc:',
      category: 'Tratamento de exceções',
    });
  }

  if (/\bopen\s*\(/.test(code) && !/\bwith\s+open\s*\(/.test(code)) {
    findings.push({
      id: 'static-py-open-without-with',
      severity: 'AVISO',
      title: 'open() sem Context Manager (with)',
      line: findFirstLine(lines, (l) => /\bopen\s*\(/.test(l)),
      explanation: 'Sempre abra arquivos com with open(..., encoding="utf-8") as f: para garantir fechamento automático.',
      suggestionCode: 'with open(caminho, "r", encoding="utf-8") as arquivo:',
      category: 'Context Managers',
    });
  }

  if (/def\s+\w+\([^)]*=\s*(\[\]|\{\})/.test(code)) {
    findings.push({
      id: 'static-py-mutable-default',
      severity: 'ERRO',
      title: 'Argumento padrão mutável ([] ou {}) em função',
      line: findFirstLine(lines, (l) => /def\s+\w+\([^)]*=\s*(\[\]|\{\})/.test(l)),
      explanation: 'Em Python o valor padrão é compartilhado entre todas as chamadas. Use None e inicialize dentro da função.',
      suggestionCode: 'def processar(itens: list[str] | None = None):',
      category: 'Armadilhas Python',
    });
  }

  if (/\brequests\.(get|post|put|delete)\s*\(/.test(code) && !/\btimeout\s*=/.test(code)) {
    findings.push({
      id: 'static-py-requests-timeout',
      severity: 'AVISO',
      title: 'Chamada requests sem timeout explícito',
      line: findFirstLine(lines, (l) => /\brequests\.(get|post|put|delete)\s*\(/.test(l)),
      explanation: 'Sem timeout=, uma API externa lenta pode travar o processo indefinidamente. Defina timeout=10.',
      suggestionCode: 'resp = requests.get(url, timeout=10)',
      category: 'APIs & Rede Python',
    });
  }

  if (/\.select_one\s*\([^)]+\)\s*\.(text|get_text|string)/.test(code)) {
    findings.push({
      id: 'static-py-bs4-none',
      severity: 'ERRO',
      title: 'Acesso direto após select_one() pode lançar AttributeError',
      line: findFirstLine(lines, (l) => /\.select_one\s*\([^)]+\)\s*\./.test(l)),
      explanation: 'select_one() retorna None quando o seletor não existe no HTML. Armazene em variável e cheque if tag is not None.',
      suggestionCode: 'tag = card.select_one(".preco"); preco = tag.get_text(strip=True) if tag else None',
      category: 'Web Scraping Seguro',
    });
  }

  if (/\.iterrows\s*\(\s*\)/.test(code)) {
    findings.push({
      id: 'static-py-iterrows',
      severity: 'AVISO',
      title: 'Uso de .iterrows() em DataFrame',
      line: findFirstLine(lines, (l) => /\.iterrows\s*\(/.test(l)),
      explanation: 'Evite iterrows(): use operações vetorizadas em Pandas para ganhar 50x+ de performance.',
      category: 'Dados & Vetorização',
    });
  }

  const defLine = findFirstLine(lines, (l) => /^\s*(?:async\s+)?def\s+\w+\(/.test(l), 0);
  if (defLine > 0 && !/^\s*(?:async\s+)?def\s+\w+\([^)]*\)\s*->/m.test(code)) {
    findings.push({
      id: 'static-py-type-hints',
      severity: 'DICA',
      title: 'Função sem Type Hints de retorno (->)',
      line: defLine,
      explanation: 'Anotar parâmetros e retorno (-> tipo) melhora o autocomplete, validação com mypy e legibilidade.',
      category: 'Tipagem Pythonic',
    });
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    findings.push({
      id: 'static-py-parens',
      severity: 'ERRO',
      title: 'Parênteses ( ) desbalanceados',
      line: lines.length,
      explanation: `Encontrados ${openParens} parênteses de abertura e ${closeParens} de fechamento.`,
      category: 'Sintaxe Python',
    });
  }

  return finalizeAnalysis(findings);
}

export function analyzeCodeStatic(
  code: string,
  exercise: Exercise
): StaticAnalysisOutput {
  switch (exercise.track) {
    case 'javascript':
      return analyzeJavaScriptStatic(code);
    case 'appscript':
      return analyzeAppScriptStatic(code, exercise);
    case 'python':
      return analyzePythonStatic(code);
    case 'java':
    default:
      return analyzeJavaCodeStatic(code, exercise);
  }
}

export interface PersistedLabState {
  activeTrack: LanguageTrack;
  solvedIds: string[];
  submissions: SubmissionRecord[];
  codeByExercise: Record<string, string>;
  customExercises: Exercise[];
  currentExerciseId: string;
  currentExerciseByTrack: Partial<Record<LanguageTrack, string>>;
}

function isJavaExerciseId(id: string): boolean {
  return (
    !id.startsWith('js-') &&
    !id.startsWith('gas-') &&
    !id.startsWith('py-') &&
    !id.startsWith('ai-javascript-') &&
    !id.startsWith('ai-appscript-') &&
    !id.startsWith('ai-python-')
  );
}

export function migratePersistedState(
  rawJson: string | null,
  options: {
    isLegacyVersion: boolean;
    validExerciseIds: Set<string>;
    defaultByTrack: Record<LanguageTrack, string>;
    initialSolvedJavaIds: string[];
    initialJavaSubmissions: SubmissionRecord[];
  }
): PersistedLabState {
  const {
    isLegacyVersion,
    validExerciseIds,
    defaultByTrack,
    initialSolvedJavaIds,
    initialJavaSubmissions,
  } = options;
  const validTracks: LanguageTrack[] = ['java', 'javascript', 'appscript', 'python'];

  const cleanDefaultState = (): PersistedLabState => ({
    activeTrack: 'java',
    solvedIds: [...initialSolvedJavaIds],
    submissions: [...initialJavaSubmissions],
    codeByExercise: {},
    customExercises: [],
    currentExerciseId: defaultByTrack.java,
    currentExerciseByTrack: { ...defaultByTrack },
  });

  if (!rawJson) {
    return cleanDefaultState();
  }

  try {
    const parsed = JSON.parse(rawJson) as Partial<PersistedLabState>;
    const activeTrack: LanguageTrack =
      parsed.activeTrack && validTracks.includes(parsed.activeTrack)
        ? parsed.activeTrack
        : 'java';

    const rawSolved = Array.isArray(parsed.solvedIds)
      ? parsed.solvedIds
      : initialSolvedJavaIds;
    const rawSubmissions = Array.isArray(parsed.submissions)
      ? parsed.submissions.map((s) => ({ ...s, track: s.track ?? ('java' as LanguageTrack) }))
      : initialJavaSubmissions;
    const rawCustom = Array.isArray(parsed.customExercises) ? parsed.customExercises : [];
    const rawCodeMap =
      parsed.codeByExercise && typeof parsed.codeByExercise === 'object'
        ? parsed.codeByExercise
        : {};
    const rawCurrentByTrack =
      parsed.currentExerciseByTrack && typeof parsed.currentExerciseByTrack === 'object'
        ? parsed.currentExerciseByTrack
        : {};

    if (isLegacyVersion) {
      // Preserve Java 21 state completely, reset JS / Apps Script / Python to new 5-module roadmaps
      const javaCustom = rawCustom.filter((ex) => (ex.track ?? 'java') === 'java');
      const allowedIds = new Set<string>([
        ...validExerciseIds,
        ...javaCustom.map((ex) => ex.id),
      ]);
      const preservedJavaCode: Record<string, string> = {};
      for (const [k, v] of Object.entries(rawCodeMap)) {
        if (isJavaExerciseId(k) && typeof v === 'string') {
          preservedJavaCode[k] = v;
        }
      }

      const javaCurrent =
        typeof rawCurrentByTrack.java === 'string' && allowedIds.has(rawCurrentByTrack.java)
          ? rawCurrentByTrack.java
          : typeof parsed.currentExerciseId === 'string' &&
            isJavaExerciseId(parsed.currentExerciseId) &&
            allowedIds.has(parsed.currentExerciseId)
          ? parsed.currentExerciseId
          : defaultByTrack.java;

      const currentExerciseByTrack: Partial<Record<LanguageTrack, string>> = {
        java: javaCurrent,
        javascript: defaultByTrack.javascript,
        appscript: defaultByTrack.appscript,
        python: defaultByTrack.python,
      };

      return {
        activeTrack,
        solvedIds: rawSolved.filter((id) => isJavaExerciseId(id)),
        submissions: rawSubmissions.filter(
          (s) => (s.track ?? 'java') === 'java' && isJavaExerciseId(s.exerciseId)
        ),
        codeByExercise: preservedJavaCode,
        customExercises: javaCustom,
        currentExerciseId: currentExerciseByTrack[activeTrack] ?? defaultByTrack.java,
        currentExerciseByTrack,
      };
    }

    const customIds = new Set(rawCustom.map((ex) => ex.id));
    const hasValidId = (id?: string): id is string =>
      Boolean(id && (validExerciseIds.has(id) || customIds.has(id)));

    const currentExerciseByTrack: Partial<Record<LanguageTrack, string>> = {
      java: hasValidId(rawCurrentByTrack.java) ? rawCurrentByTrack.java : defaultByTrack.java,
      javascript: hasValidId(rawCurrentByTrack.javascript)
        ? rawCurrentByTrack.javascript
        : defaultByTrack.javascript,
      appscript: hasValidId(rawCurrentByTrack.appscript)
        ? rawCurrentByTrack.appscript
        : defaultByTrack.appscript,
      python: hasValidId(rawCurrentByTrack.python)
        ? rawCurrentByTrack.python
        : defaultByTrack.python,
    };

    return {
      activeTrack,
      solvedIds: rawSolved.filter((id) => hasValidId(id)),
      submissions: rawSubmissions,
      codeByExercise: rawCodeMap,
      customExercises: rawCustom,
      currentExerciseId: hasValidId(parsed.currentExerciseId)
        ? parsed.currentExerciseId
        : currentExerciseByTrack[activeTrack] ?? defaultByTrack.java,
      currentExerciseByTrack,
    };
  } catch {
    return cleanDefaultState();
  }
}

export function filterByTrack<T extends { track: LanguageTrack }>(
  items: T[],
  track: LanguageTrack | 'all'
): T[] {
  if (track === 'all') return items;
  return items.filter((item) => item.track === track);
}

export function computeModuleProgress(
  moduleId: number,
  exercises: Exercise[],
  solvedIds: Set<string>,
  difficultyFilter: Difficulty | 'Todas' = 'Todas'
): ModuleProgress {
  const moduleExercises = exercises.filter(
    (ex) =>
      ex.moduleId === moduleId &&
      (difficultyFilter === 'Todas' || ex.difficulty === difficultyFilter)
  );
  const total = moduleExercises.length;
  if (total === 0) {
    return { solved: 0, total: 0, percent: 0, status: 'Não iniciado' };
  }
  const solved = moduleExercises.filter((ex) => solvedIds.has(ex.id)).length;
  const percent = Math.round((solved / total) * 100);
  const status =
    solved === total
      ? 'Concluído'
      : solved > 0
      ? 'Em andamento'
      : 'Não iniciado';

  return { solved, total, percent, status };
}

export function computeDashboardStats(
  modules: JavaModule[],
  exercises: Exercise[],
  solvedIds: Set<string>,
  submissions: SubmissionRecord[]
): DashboardStats {
  const totalExercises = exercises.length;
  const solvedCount = exercises.filter((ex) => solvedIds.has(ex.id)).length;

  let completedModules = 0;
  for (const mod of modules) {
    const progress = computeModuleProgress(mod.id, exercises, solvedIds);
    if (progress.total > 0 && progress.solved === progress.total) {
      completedModules += 1;
    }
  }

  const averageCopilotScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc, s) => acc + s.qualityScore, 0) /
            submissions.length
        )
      : 0;

  const overallProgressPercent =
    totalExercises > 0 ? Math.round((solvedCount / totalExercises) * 100) : 0;

  return {
    solvedCount,
    totalExercises,
    completedModules,
    totalModules: modules.length,
    averageCopilotScore,
    overallProgressPercent,
  };
}

export function filterModules(
  modules: JavaModule[],
  category: ModuleCategory | 'Todos',
  searchQuery: string
): JavaModule[] {
  const q = searchQuery.trim().toLowerCase();
  return modules.filter((mod) => {
    const matchesCategory = category === 'Todos' || mod.category === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      mod.title.toLowerCase().includes(q) ||
      mod.subtitle.toLowerCase().includes(q) ||
      mod.code.toLowerCase().includes(q)
    );
  });
}

export function getModuleExercisesByDifficulty(
  exercises: Exercise[],
  moduleId: number,
  difficulty: Difficulty | 'Todas' = 'Todas'
): Exercise[] {
  return exercises
    .filter(
      (ex) =>
        ex.moduleId === moduleId &&
        (difficulty === 'Todas' || ex.difficulty === difficulty)
    )
    .sort((a, b) => a.orderInModule - b.orderInModule);
}

export function aggregateRecurringPatterns(
  submissions: SubmissionRecord[]
): RecurringPattern[] {
  const map = new Map<string, RecurringPattern>();

  for (const sub of submissions) {
    for (const finding of sub.findings) {
      const key = `${sub.track}::${finding.severity}::${finding.category}`;
      const existing = map.get(key);
      if (existing) {
        existing.occurrences += 1;
      } else {
        map.set(key, {
          id: key,
          track: sub.track,
          severity: finding.severity,
          title: finding.category || finding.title,
          description: finding.explanation,
          occurrences: 1,
          category: finding.category,
          targetExerciseId: sub.exerciseId,
        });
      }
    }
  }

  const weight = { ERRO: 3, AVISO: 2, DICA: 1 };
  return Array.from(map.values()).sort((a, b) => {
    const scoreDiff =
      b.occurrences * weight[b.severity] - a.occurrences * weight[a.severity];
    return scoreDiff !== 0 ? scoreDiff : b.occurrences - a.occurrences;
  });
}

