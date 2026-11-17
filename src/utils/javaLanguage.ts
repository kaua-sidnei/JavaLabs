import type { LanguageTrack } from '../types/javalab';

export type JavaTokenType =
  | 'comment'
  | 'string'
  | 'annotation'
  | 'keyword'
  | 'primitive'
  | 'type'
  | 'number'
  | 'method'
  | 'constant'
  | 'operator'
  | 'plain';

export interface JavaToken {
  type: JavaTokenType;
  text: string;
}

export type CompletionKind = 'class' | 'method' | 'field' | 'keyword' | 'snippet' | 'variable';

export interface AutocompleteItem {
  id: string;
  label: string;
  insertText: string;
  cursorOffsetFromEnd?: number;
  detail: string;
  kind: CompletionKind;
  score: number;
}

export interface AutocompleteResult {
  prefix: string;
  replaceStart: number;
  items: AutocompleteItem[];
}

const JAVA_KEYWORDS = new Set([
  'abstract',
  'assert',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'else',
  'enum',
  'extends',
  'final',
  'finally',
  'for',
  'if',
  'implements',
  'import',
  'instanceof',
  'interface',
  'native',
  'new',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'strictfp',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'try',
  'void',
  'volatile',
  'while',
  'var',
  'record',
  'true',
  'false',
  'null',
]);

const JAVA_PRIMITIVES = new Set([
  'boolean',
  'byte',
  'char',
  'double',
  'float',
  'int',
  'long',
  'short',
]);

const JAVA_COMMON_TYPES = new Set([
  'String',
  'System',
  'Scanner',
  'Locale',
  'Math',
  'Object',
  'Integer',
  'Double',
  'Long',
  'Boolean',
  'Character',
  'List',
  'ArrayList',
  'LinkedList',
  'Set',
  'HashSet',
  'TreeSet',
  'Map',
  'HashMap',
  'TreeMap',
  'LinkedHashMap',
  'Collection',
  'Collections',
  'Arrays',
  'Optional',
  'Stream',
  'Collectors',
  'Comparator',
  'Comparable',
  'Predicate',
  'Function',
  'Consumer',
  'LocalDate',
  'LocalDateTime',
  'Instant',
  'Duration',
  'ZoneId',
  'DateTimeFormatter',
  'ChronoUnit',
  'File',
  'BufferedReader',
  'FileReader',
  'InputStreamReader',
  'IOException',
  'Exception',
  'RuntimeException',
  'IllegalArgumentException',
  'IllegalStateException',
  'InputMismatchException',
  'StringBuilder',
  'PrintStream',
  'URLDecoder',
  'StandardCharsets',
]);

const JS_KEYWORDS = new Set([
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'interface',
  'is',
  'keyof',
  'let',
  'new',
  'never',
  'of',
  'readonly',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'type',
  'typeof',
  'unknown',
  'var',
  'void',
  'while',
  'true',
  'false',
  'null',
  'undefined',
]);

const JS_TYPES = new Set([
  'Array',
  'Object',
  'String',
  'Number',
  'Boolean',
  'Promise',
  'AbortController',
  'JSON',
  'Math',
  'Date',
  'Map',
  'Set',
  'Error',
  'console',
  'fetch',
  'Partial',
  'Pick',
  'Omit',
  'Record',
  'SpreadsheetApp',
  'UrlFetchApp',
  'ScriptApp',
  'LockService',
  'CacheService',
  'GmailApp',
  'MailApp',
  'Session',
  'Logger',
  'Utilities',
  'DriveApp',
  'PropertiesService',
]);

const PYTHON_KEYWORDS = new Set([
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'False',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'None',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'True',
  'try',
  'while',
  'with',
  'yield',
  'self',
  'cls',
]);

const PYTHON_TYPES = new Set([
  'int',
  'float',
  'str',
  'bool',
  'list',
  'dict',
  'set',
  'tuple',
  'Optional',
  'List',
  'Dict',
  'Any',
  'Union',
  'Literal',
  'BaseModel',
  'Field',
  'FastAPI',
  'Depends',
  'HTTPException',
  'BeautifulSoup',
  'DataFrame',
  'pd',
  'requests',
  'csv',
  'json',
  'httpx',
  'asyncio',
  'dataclass',
]);

const JAVA_JS_TOKEN_REGEX =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|@[A-Za-z_][A-Za-z0-9_]*|\b\d+(?:\.\d+)?[fFdDlL]?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[{}()[\].,;:=+\-*/%<>!&|?]+|\s+)/g;

const PYTHON_TOKEN_REGEX =
  /(#[^\n]*|[fFrRbB]?"(?:\\.|[^"\\])*"|[fFrRbB]?'(?:\\.|[^'\\])*'|@[A-Za-z_][A-Za-z0-9_.]*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[{}()[\].,;:=+\-*/%<>!&|@]+|\s+)/g;

export function tokenizeJavaLine(line: string): JavaToken[] {
  return tokenizeCodeLine(line, 'java');
}

export function tokenizeCodeLine(line: string, track: LanguageTrack): JavaToken[] {
  if (!line) return [];
  const tokens: JavaToken[] = [];
  let lastIndex = 0;

  const regex = track === 'python' ? PYTHON_TOKEN_REGEX : JAVA_JS_TOKEN_REGEX;
  regex.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', text: line.slice(lastIndex, match.index) });
    }
    const text = match[0];
    lastIndex = match.index + text.length;

    if (
      (track === 'python' && text.startsWith('#')) ||
      (track !== 'python' && (text.startsWith('//') || text.startsWith('/*')))
    ) {
      tokens.push({ type: 'comment', text });
    } else if (
      text.startsWith('"') ||
      text.startsWith("'") ||
      text.startsWith('`') ||
      /^[fFrRbB]["']/.test(text)
    ) {
      tokens.push({ type: 'string', text });
    } else if (text.startsWith('@')) {
      tokens.push({ type: 'annotation', text });
    } else if (/^\d/.test(text)) {
      tokens.push({ type: 'number', text });
    } else if (track === 'python') {
      if (PYTHON_KEYWORDS.has(text)) {
        tokens.push({ type: 'keyword', text });
      } else if (PYTHON_TYPES.has(text) || /^[A-Z][A-Za-z0-9_]*$/.test(text)) {
        tokens.push({
          type: /^[A-Z][A-Z0-9_]{1,}$/.test(text) ? 'constant' : 'type',
          text,
        });
      } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(text)) {
        const rest = line.slice(lastIndex);
        if (/^__[a-zA-Z0-9_]+__$/.test(text)) {
          tokens.push({ type: 'annotation', text });
        } else if (/^\s*\(/.test(rest)) {
          tokens.push({ type: 'method', text });
        } else {
          tokens.push({ type: 'plain', text });
        }
      } else if (/^[=+\-*/%<>!&|]+$/.test(text)) {
        tokens.push({ type: 'operator', text });
      } else {
        tokens.push({ type: 'plain', text });
      }
    } else if (track === 'javascript' || track === 'appscript') {
      if (JS_KEYWORDS.has(text)) {
        tokens.push({ type: 'keyword', text });
      } else if (JS_TYPES.has(text) || /^[A-Z][A-Za-z0-9_]*$/.test(text)) {
        tokens.push({
          type: /^[A-Z][A-Z0-9_]{1,}$/.test(text) ? 'constant' : 'type',
          text,
        });
      } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(text)) {
        const rest = line.slice(lastIndex);
        tokens.push({ type: /^\s*\(/.test(rest) ? 'method' : 'plain', text });
      } else if (/^[=+\-*/%<>!&|]+$/.test(text)) {
        tokens.push({ type: 'operator', text });
      } else {
        tokens.push({ type: 'plain', text });
      }
    } else {
      // Java
      if (JAVA_KEYWORDS.has(text)) {
        tokens.push({ type: 'keyword', text });
      } else if (JAVA_PRIMITIVES.has(text)) {
        tokens.push({ type: 'primitive', text });
      } else if (JAVA_COMMON_TYPES.has(text) || /^[A-Z][A-Za-z0-9_]*$/.test(text)) {
        tokens.push({
          type: /^[A-Z][A-Z0-9_]{1,}$/.test(text) ? 'constant' : 'type',
          text,
        });
      } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(text)) {
        const rest = line.slice(lastIndex);
        tokens.push({ type: /^\s*\(/.test(rest) ? 'method' : 'plain', text });
      } else if (/^[=+\-*/%<>!&|]+$/.test(text)) {
        tokens.push({ type: 'operator', text });
      } else {
        tokens.push({ type: 'plain', text });
      }
    }
  }

  if (lastIndex < line.length) {
    tokens.push({ type: 'plain', text: line.slice(lastIndex) });
  }

  return tokens;
}

const JAVA_MEMBER_CATALOG: Record<string, Omit<AutocompleteItem, 'id' | 'score'>[]> = {
  System: [
    { label: 'out', insertText: 'out', detail: 'PrintStream · java.lang.System', kind: 'field' },
    { label: 'in', insertText: 'in', detail: 'InputStream · java.lang.System', kind: 'field' },
    { label: 'err', insertText: 'err', detail: 'PrintStream · java.lang.System', kind: 'field' },
    { label: 'out.println()', insertText: 'out.println();', cursorOffsetFromEnd: 2, detail: 'void · Imprimir linha', kind: 'method' },
    { label: 'out.printf()', insertText: 'out.printf("%n");', cursorOffsetFromEnd: 4, detail: 'PrintStream · Saída formatada', kind: 'method' },
    { label: 'currentTimeMillis()', insertText: 'currentTimeMillis()', detail: 'long · Timestamp ms', kind: 'method' },
    { label: 'exit(int)', insertText: 'exit(0);', cursorOffsetFromEnd: 2, detail: 'void · Encerrar JVM', kind: 'method' },
  ],
  'System.out': [
    { label: 'printf(format, args)', insertText: 'printf("%.4f%n", )', cursorOffsetFromEnd: 1, detail: 'PrintStream · Formatar saída', kind: 'method' },
    { label: 'println(x)', insertText: 'println()', cursorOffsetFromEnd: 1, detail: 'void · Imprimir com quebra', kind: 'method' },
    { label: 'print(x)', insertText: 'print()', cursorOffsetFromEnd: 1, detail: 'void · Imprimir sem quebra', kind: 'method' },
  ],
  Scanner: [
    { label: 'nextDouble()', insertText: 'nextDouble()', detail: 'double · Ler decimal', kind: 'method' },
    { label: 'nextInt()', insertText: 'nextInt()', detail: 'int · Ler inteiro', kind: 'method' },
    { label: 'nextLine()', insertText: 'nextLine()', detail: 'String · Ler linha inteira', kind: 'method' },
    { label: 'next()', insertText: 'next()', detail: 'String · Ler próxima palavra', kind: 'method' },
    { label: 'hasNextLine()', insertText: 'hasNextLine()', detail: 'boolean · Próxima linha', kind: 'method' },
    { label: 'hasNextInt()', insertText: 'hasNextInt()', detail: 'boolean · Próximo inteiro', kind: 'method' },
    { label: 'useLocale(Locale.US)', insertText: 'useLocale(Locale.US)', detail: 'Scanner · Separador ponto', kind: 'method' },
    { label: 'close()', insertText: 'close();', detail: 'void · Fechar recurso', kind: 'method' },
  ],
  Locale: [
    { label: 'US', insertText: 'US', detail: 'Locale · Ponto decimal (en-US)', kind: 'field' },
    { label: 'setDefault(Locale.US)', insertText: 'setDefault(Locale.US);', detail: 'void · Padrão numérico US', kind: 'method' },
    { label: 'ROOT', insertText: 'ROOT', detail: 'Locale · Locale neutro', kind: 'field' },
    { label: 'getDefault()', insertText: 'getDefault()', detail: 'Locale · Locale atual', kind: 'method' },
  ],
  Math: [
    { label: 'pow(a, b)', insertText: 'pow(, )', cursorOffsetFromEnd: 3, detail: 'double · Potência', kind: 'method' },
    { label: 'sqrt(a)', insertText: 'sqrt()', cursorOffsetFromEnd: 1, detail: 'double · Raiz quadrada', kind: 'method' },
    { label: 'abs(a)', insertText: 'abs()', cursorOffsetFromEnd: 1, detail: 'number · Valor absoluto', kind: 'method' },
    { label: 'max(a, b)', insertText: 'max(, )', cursorOffsetFromEnd: 3, detail: 'number · Maior valor', kind: 'method' },
    { label: 'min(a, b)', insertText: 'min(, )', cursorOffsetFromEnd: 3, detail: 'number · Menor valor', kind: 'method' },
    { label: 'PI', insertText: 'PI', detail: 'double · 3.1415926535...', kind: 'field' },
  ],
  String: [
    { label: 'trim()', insertText: 'trim()', detail: 'String · Remove espaços', kind: 'method' },
    { label: 'toLowerCase()', insertText: 'toLowerCase()', detail: 'String · Minúsculas', kind: 'method' },
    { label: 'toUpperCase()', insertText: 'toUpperCase()', detail: 'String · Maiúsculas', kind: 'method' },
    { label: 'split(regex)', insertText: 'split(" ")', cursorOffsetFromEnd: 2, detail: 'String[] · Quebrar texto', kind: 'method' },
    { label: 'equals(obj)', insertText: 'equals()', cursorOffsetFromEnd: 1, detail: 'boolean · Comparar conteúdo', kind: 'method' },
    { label: 'equalsIgnoreCase(str)', insertText: 'equalsIgnoreCase()', cursorOffsetFromEnd: 1, detail: 'boolean · Ignora maiúsc.', kind: 'method' },
    { label: 'length()', insertText: 'length()', detail: 'int · Tamanho', kind: 'method' },
    { label: 'charAt(index)', insertText: 'charAt(0)', cursorOffsetFromEnd: 1, detail: 'char · Caractere no índice', kind: 'method' },
    { label: 'substring(begin, end)', insertText: 'substring(0, )', cursorOffsetFromEnd: 1, detail: 'String · Subtexto', kind: 'method' },
  ],
  List: [
    { label: 'add(e)', insertText: 'add()', cursorOffsetFromEnd: 1, detail: 'boolean · Adicionar item', kind: 'method' },
    { label: 'get(index)', insertText: 'get()', cursorOffsetFromEnd: 1, detail: 'E · Obter por índice', kind: 'method' },
    { label: 'size()', insertText: 'size()', detail: 'int · Quantidade de itens', kind: 'method' },
    { label: 'remove(index)', insertText: 'remove()', cursorOffsetFromEnd: 1, detail: 'E · Remover item', kind: 'method' },
    { label: 'stream()', insertText: 'stream()', detail: 'Stream<E> · Pipeline funcional', kind: 'method' },
    { label: 'isEmpty()', insertText: 'isEmpty()', detail: 'boolean · Lista vazia', kind: 'method' },
  ],
  LocalDate: [
    { label: 'now()', insertText: 'now()', detail: 'LocalDate · Data de hoje', kind: 'method' },
    { label: 'parse(text)', insertText: 'parse("")', cursorOffsetFromEnd: 2, detail: 'LocalDate · Converter ISO', kind: 'method' },
    { label: 'of(year, month, day)', insertText: 'of(2026, 1, 1)', cursorOffsetFromEnd: 1, detail: 'LocalDate · Criar data', kind: 'method' },
    { label: 'format(formatter)', insertText: 'format()', cursorOffsetFromEnd: 1, detail: 'String · Formatar data', kind: 'method' },
  ],
  Duration: [
    { label: 'between(start, end)', insertText: 'between(, )', cursorOffsetFromEnd: 3, detail: 'Duration · Diferença temporal', kind: 'method' },
    { label: 'toHours()', insertText: 'toHours()', detail: 'long · Total em horas', kind: 'method' },
    { label: 'toMinutesPart()', insertText: 'toMinutesPart()', detail: 'int · Minutos restantes', kind: 'method' },
  ],
};

const JS_MEMBER_CATALOG: Record<string, Omit<AutocompleteItem, 'id' | 'score'>[]> = {
  console: [
    { label: 'log(data)', insertText: 'log()', cursorOffsetFromEnd: 1, detail: 'void · Imprimir no console', kind: 'method' },
    { label: 'error(err)', insertText: 'error()', cursorOffsetFromEnd: 1, detail: 'void · Log de erro', kind: 'method' },
    { label: 'table(rows)', insertText: 'table()', cursorOffsetFromEnd: 1, detail: 'void · Exibir tabela', kind: 'method' },
  ],
  Number: [
    { label: 'isNaN(val)', insertText: 'isNaN()', cursorOffsetFromEnd: 1, detail: 'boolean · Checagem estrita NaN', kind: 'method' },
    { label: 'isFinite(val)', insertText: 'isFinite()', cursorOffsetFromEnd: 1, detail: 'boolean · Número finito válido', kind: 'method' },
  ],
  JSON: [
    { label: 'parse(text)', insertText: 'parse()', cursorOffsetFromEnd: 1, detail: 'any · Converter string JSON', kind: 'method' },
    { label: 'stringify(obj)', insertText: 'stringify()', cursorOffsetFromEnd: 1, detail: 'string · Serializar objeto', kind: 'method' },
  ],
  Array: [
    { label: 'map(fn)', insertText: 'map(item => )', cursorOffsetFromEnd: 1, detail: 'T[] · Transformar itens', kind: 'method' },
    { label: 'filter(fn)', insertText: 'filter(item => )', cursorOffsetFromEnd: 1, detail: 'T[] · Filtrar itens', kind: 'method' },
    { label: 'reduce(fn, init)', insertText: 'reduce((acc, item) => acc + item, 0)', detail: 'U · Reduzir valores', kind: 'method' },
    { label: 'find(fn)', insertText: 'find(item => )', cursorOffsetFromEnd: 1, detail: 'T | undefined · Buscar primeiro', kind: 'method' },
    { label: 'slice(start, end)', insertText: 'slice(0, )', cursorOffsetFromEnd: 1, detail: 'T[] · Fatia imutável', kind: 'method' },
    { label: 'splice(start, count)', insertText: 'splice(, 1)', cursorOffsetFromEnd: 4, detail: 'T[] · Remover/inserir in-place', kind: 'method' },
    { label: 'some(fn)', insertText: 'some(item => )', cursorOffsetFromEnd: 1, detail: 'boolean · Algum satisfaz', kind: 'method' },
  ],
  Promise: [
    { label: 'all(promises)', insertText: 'all([])', cursorOffsetFromEnd: 2, detail: 'Promise<T[]> · Paralelo fail-fast', kind: 'method' },
    { label: 'allSettled(promises)', insertText: 'allSettled([])', cursorOffsetFromEnd: 2, detail: 'Promise · Todos os resultados', kind: 'method' },
  ],
  SpreadsheetApp: [
    { label: 'getActiveSpreadsheet()', insertText: 'getActiveSpreadsheet()', detail: 'Spreadsheet · Planilha ativa', kind: 'method' },
    { label: 'getUi()', insertText: 'getUi()', detail: 'Ui · Menus e alertas', kind: 'method' },
  ],
  UrlFetchApp: [
    { label: 'fetch(url, params)', insertText: 'fetch(url, { muteHttpExceptions: true })', detail: 'HTTPResponse · Requisição externa', kind: 'method' },
    { label: 'fetchAll(requests)', insertText: 'fetchAll([])', cursorOffsetFromEnd: 2, detail: 'HTTPResponse[] · Lote em paralelo', kind: 'method' },
  ],
  ScriptApp: [
    { label: 'getProjectTriggers()', insertText: 'getProjectTriggers()', detail: 'Trigger[] · Listar gatilhos ativos', kind: 'method' },
    { label: 'newTrigger(fnName)', insertText: 'newTrigger("")', cursorOffsetFromEnd: 2, detail: 'TriggerBuilder · Criar gatilho', kind: 'method' },
    { label: 'deleteTrigger(trigger)', insertText: 'deleteTrigger()', cursorOffsetFromEnd: 1, detail: 'void · Remover gatilho', kind: 'method' },
  ],
  LockService: [
    { label: 'getScriptLock()', insertText: 'getScriptLock()', detail: 'Lock · Evitar execução concorrente', kind: 'method' },
  ],
  CacheService: [
    { label: 'getScriptCache()', insertText: 'getScriptCache()', detail: 'Cache · Cache compartilhado', kind: 'method' },
  ],
  GmailApp: [
    { label: 'sendEmail(to, subject, body)', insertText: 'sendEmail(destinatario, assunto, corpo)', detail: 'GmailApp · Enviar resumo', kind: 'method' },
  ],
  sheet: [
    { label: 'getRange(row, col, numRows, numCols)', insertText: 'getRange(2, 1, , )', cursorOffsetFromEnd: 3, detail: 'Range · Selecionar intervalo', kind: 'method' },
    { label: 'getDataRange()', insertText: 'getDataRange()', detail: 'Range · Todo o bloco preenchido', kind: 'method' },
    { label: 'getLastRow()', insertText: 'getLastRow()', detail: 'number · Última linha preenchida', kind: 'method' },
    { label: 'getSheetByName(name)', insertText: 'getSheetByName("")', cursorOffsetFromEnd: 2, detail: 'Sheet · Aba pelo nome', kind: 'method' },
    { label: 'appendRow(row)', insertText: 'appendRow([])', cursorOffsetFromEnd: 2, detail: 'Sheet · Inserir linha ao final', kind: 'method' },
  ],
  range: [
    { label: 'getValues()', insertText: 'getValues()', detail: 'any[][] · Ler matriz 2D em lote', kind: 'method' },
    { label: 'setValues(values)', insertText: 'setValues()', cursorOffsetFromEnd: 1, detail: 'Range · Gravar matriz 2D em lote', kind: 'method' },
    { label: 'clearContent()', insertText: 'clearContent()', detail: 'Range · Limpar mantendo formatação', kind: 'method' },
    { label: 'getValue()', insertText: 'getValue()', detail: 'any · Evite dentro de loops', kind: 'method' },
  ],
  resposta: [
    { label: 'getResponseCode()', insertText: 'getResponseCode()', detail: 'number · Código HTTP (200, 404)', kind: 'method' },
    { label: 'getContentText()', insertText: 'getContentText()', detail: 'string · Corpo da resposta', kind: 'method' },
  ],
  Logger: [
    { label: 'log(data)', insertText: 'log()', cursorOffsetFromEnd: 1, detail: 'Logger · Registrar log GAS', kind: 'method' },
  ],
};

const PYTHON_MEMBER_CATALOG: Record<string, Omit<AutocompleteItem, 'id' | 'score'>[]> = {
  pd: [
    { label: 'DataFrame(data)', insertText: 'DataFrame()', cursorOffsetFromEnd: 1, detail: 'DataFrame · Tabela Pandas', kind: 'class' },
    { label: 'read_csv(path)', insertText: 'read_csv("")', cursorOffsetFromEnd: 2, detail: 'DataFrame · Ler CSV', kind: 'method' },
    { label: 'to_datetime(col)', insertText: 'to_datetime()', cursorOffsetFromEnd: 1, detail: 'Series · Converter datas', kind: 'method' },
  ],
  df: [
    { label: 'groupby(col)', insertText: 'groupby("")', cursorOffsetFromEnd: 2, detail: 'GroupBy · Agrupar dados', kind: 'method' },
    { label: 'fillna(value)', insertText: 'fillna(0)', cursorOffsetFromEnd: 1, detail: 'DataFrame · Preencher nulos', kind: 'method' },
    { label: 'dropna()', insertText: 'dropna()', detail: 'DataFrame · Remover nulos', kind: 'method' },
    { label: 'sort_values(by=...)', insertText: 'sort_values(by="", ascending=False)', detail: 'DataFrame · Ordenar colunas', kind: 'method' },
    { label: 'to_dict(orient="records")', insertText: 'to_dict(orient="records")', detail: 'list[dict] · Exportar registros', kind: 'method' },
  ],
  requests: [
    { label: 'get(url, params=..., timeout=10)', insertText: 'get(url, timeout=10)', detail: 'Response · GET seguro com timeout', kind: 'method' },
    { label: 'post(url, json=..., timeout=10)', insertText: 'post(url, json=payload, timeout=10)', detail: 'Response · POST JSON', kind: 'method' },
    { label: 'Session()', insertText: 'Session()', detail: 'Session · Reuso de conexão HTTP', kind: 'class' },
  ],
  soup: [
    { label: 'select(css)', insertText: 'select("")', cursorOffsetFromEnd: 2, detail: 'list[Tag] · Lista por seletor CSS', kind: 'method' },
    { label: 'select_one(css)', insertText: 'select_one("")', cursorOffsetFromEnd: 2, detail: 'Tag | None · Primeiro elemento', kind: 'method' },
    { label: 'find_all(tag)', insertText: 'find_all("")', cursorOffsetFromEnd: 2, detail: 'ResultSet · Buscar tags HTML', kind: 'method' },
  ],
  csv: [
    { label: 'DictReader(file)', insertText: 'DictReader(f)', detail: 'DictReader · Ler CSV como dicts', kind: 'class' },
    { label: 'DictWriter(file, fieldnames)', insertText: 'DictWriter(f, fieldnames=[])', detail: 'DictWriter · Gravar CSV', kind: 'class' },
  ],
  httpx: [
    { label: 'get(url)', insertText: 'get(url, timeout=10.0)', detail: 'Response · GET síncrono', kind: 'method' },
    { label: 'AsyncClient()', insertText: 'AsyncClient()', detail: 'AsyncClient · Cliente async', kind: 'class' },
  ],
  asyncio: [
    { label: 'run(coro)', insertText: 'run(main())', detail: 'T · Executar corrotina', kind: 'method' },
    { label: 'gather(*coros)', insertText: 'gather()', cursorOffsetFromEnd: 1, detail: 'Future · Concorrência async', kind: 'method' },
  ],
  str: [
    { label: 'strip()', insertText: 'strip()', detail: 'str · Remover espaços', kind: 'method' },
    { label: 'split(sep)', insertText: 'split(",")', cursorOffsetFromEnd: 2, detail: 'list[str] · Dividir texto', kind: 'method' },
    { label: 'lower()', insertText: 'lower()', detail: 'str · Minúsculas', kind: 'method' },
    { label: 'join(iterable)', insertText: 'join()', cursorOffsetFromEnd: 1, detail: 'str · Unir itens', kind: 'method' },
  ],
  list: [
    { label: 'append(x)', insertText: 'append()', cursorOffsetFromEnd: 1, detail: 'None · Adicionar item', kind: 'method' },
    { label: 'extend(iter)', insertText: 'extend()', cursorOffsetFromEnd: 1, detail: 'None · Estender lista', kind: 'method' },
    { label: 'sort(key=...)', insertText: 'sort(key=lambda x: x)', detail: 'None · Ordenar in-place', kind: 'method' },
  ],
};

const JAVA_GENERAL_CATALOG: Omit<AutocompleteItem, 'id' | 'score'>[] = [
  { label: 'System', insertText: 'System', detail: 'java.lang', kind: 'class' },
  { label: 'System.out.println', insertText: 'System.out.println();', cursorOffsetFromEnd: 2, detail: 'snippet · Imprimir linha', kind: 'snippet' },
  { label: 'System.out.printf', insertText: 'System.out.printf("%.4f%n", );', cursorOffsetFromEnd: 2, detail: 'snippet · Imprimir formatado', kind: 'snippet' },
  { label: 'Scanner', insertText: 'Scanner', detail: 'java.util', kind: 'class' },
  { label: 'String', insertText: 'String', detail: 'java.lang', kind: 'class' },
  { label: 'StringBuilder', insertText: 'StringBuilder', detail: 'java.lang', kind: 'class' },
  { label: 'Locale', insertText: 'Locale', detail: 'java.util', kind: 'class' },
  { label: 'Locale.setDefault(Locale.US)', insertText: 'Locale.setDefault(Locale.US);', detail: 'snippet · Separador decimal ponto', kind: 'snippet' },
  { label: 'Math', insertText: 'Math', detail: 'java.lang', kind: 'class' },
  { label: 'List', insertText: 'List', detail: 'java.util', kind: 'class' },
  { label: 'ArrayList', insertText: 'ArrayList', detail: 'java.util', kind: 'class' },
  { label: 'HashSet', insertText: 'HashSet', detail: 'java.util', kind: 'class' },
  { label: 'TreeSet', insertText: 'TreeSet', detail: 'java.util', kind: 'class' },
  { label: 'HashMap', insertText: 'HashMap', detail: 'java.util', kind: 'class' },
  { label: 'TreeMap', insertText: 'TreeMap', detail: 'java.util', kind: 'class' },
  { label: 'Collections', insertText: 'Collections', detail: 'java.util', kind: 'class' },
  { label: 'Collectors', insertText: 'Collectors', detail: 'java.util.stream', kind: 'class' },
  { label: 'Comparator', insertText: 'Comparator', detail: 'java.util', kind: 'class' },
  { label: 'LocalDate', insertText: 'LocalDate', detail: 'java.time', kind: 'class' },
  { label: 'Instant', insertText: 'Instant', detail: 'java.time', kind: 'class' },
  { label: 'Duration', insertText: 'Duration', detail: 'java.time', kind: 'class' },
  { label: 'ZoneId', insertText: 'ZoneId', detail: 'java.time', kind: 'class' },
  { label: 'DateTimeFormatter', insertText: 'DateTimeFormatter', detail: 'java.time.format', kind: 'class' },
  { label: 'BufferedReader', insertText: 'BufferedReader', detail: 'java.io', kind: 'class' },
  { label: 'IOException', insertText: 'IOException', detail: 'java.io', kind: 'class' },
  { label: 'Override', insertText: 'Override', detail: 'java.lang · @Override', kind: 'class' },
  { label: 'sout', insertText: 'System.out.println();', cursorOffsetFromEnd: 2, detail: 'snippet · System.out.println()', kind: 'snippet' },
  { label: 'souf', insertText: 'System.out.printf("%.2f%n", );', cursorOffsetFromEnd: 2, detail: 'snippet · System.out.printf()', kind: 'snippet' },
  { label: 'tryScanner', insertText: 'try (Scanner sc = new Scanner(System.in)) {\n    \n}', cursorOffsetFromEnd: 2, detail: 'snippet · Scanner com try-with-resources', kind: 'snippet' },
  { label: 'public', insertText: 'public ', detail: 'keyword', kind: 'keyword' },
  { label: 'private', insertText: 'private ', detail: 'keyword', kind: 'keyword' },
  { label: 'static', insertText: 'static ', detail: 'keyword', kind: 'keyword' },
  { label: 'final', insertText: 'final ', detail: 'keyword', kind: 'keyword' },
  { label: 'double', insertText: 'double ', detail: 'tipo primitivo', kind: 'keyword' },
  { label: 'int', insertText: 'int ', detail: 'tipo primitivo', kind: 'keyword' },
  { label: 'boolean', insertText: 'boolean ', detail: 'tipo primitivo', kind: 'keyword' },
  { label: 'return', insertText: 'return ', detail: 'keyword', kind: 'keyword' },
  { label: 'import', insertText: 'import ', detail: 'keyword', kind: 'keyword' },
];

const JS_GENERAL_CATALOG: Omit<AutocompleteItem, 'id' | 'score'>[] = [
  { label: 'console.log', insertText: 'console.log();', cursorOffsetFromEnd: 2, detail: 'snippet · Imprimir saída', kind: 'snippet' },
  { label: 'async function', insertText: 'async function nome() {\n  \n}', cursorOffsetFromEnd: 2, detail: 'snippet · Função assíncrona', kind: 'snippet' },
  { label: 'fetch', insertText: 'const res = await fetch(url);\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst data = await res.json();', detail: 'Web API · Fetch com checagem ok', kind: 'snippet' },
  { label: 'Promise.allSettled', insertText: 'Promise.allSettled([])', cursorOffsetFromEnd: 2, detail: 'ES2020 · Execução resiliente', kind: 'method' },
  { label: 'Promise.all', insertText: 'Promise.all([])', cursorOffsetFromEnd: 2, detail: 'ES6 · Execução paralela', kind: 'method' },
  { label: 'AbortController', insertText: 'const controller = new AbortController();', detail: 'Web API · Timeout/cancelamento', kind: 'class' },
  { label: 'Number.isNaN', insertText: 'Number.isNaN()', cursorOffsetFromEnd: 1, detail: 'Number · Verificar NaN seguro', kind: 'method' },
  { label: 'JSON.parse', insertText: 'JSON.parse()', cursorOffsetFromEnd: 1, detail: 'JSON · Converter string', kind: 'method' },
  { label: 'JSON.stringify', insertText: 'JSON.stringify()', cursorOffsetFromEnd: 1, detail: 'JSON · Serializar objeto', kind: 'method' },
  { label: 'interface', insertText: 'interface Nome {\n  \n}', cursorOffsetFromEnd: 2, detail: 'TypeScript · Contrato de objeto', kind: 'keyword' },
  { label: 'unknown', insertText: 'unknown', detail: 'TypeScript · Entrada não confiável segura', kind: 'keyword' },
  { label: 'Partial<T>', insertText: 'Partial<>', cursorOffsetFromEnd: 1, detail: 'TypeScript · Campos opcionais', kind: 'class' },
  { label: 'Pick<T, K>', insertText: 'Pick<, >', cursorOffsetFromEnd: 3, detail: 'TypeScript · Selecionar campos', kind: 'class' },
  { label: 'Omit<T, K>', insertText: 'Omit<, >', cursorOffsetFromEnd: 3, detail: 'TypeScript · Omitir campos', kind: 'class' },
  { label: 'Record<K, V>', insertText: 'Record<string, >', cursorOffsetFromEnd: 1, detail: 'TypeScript · Dicionário tipado', kind: 'class' },
  { label: 'const', insertText: 'const ', detail: 'keyword · Imutável', kind: 'keyword' },
  { label: 'return', insertText: 'return ', detail: 'keyword', kind: 'keyword' },
  { label: 'export', insertText: 'export ', detail: 'keyword · ES Module', kind: 'keyword' },
];

const APPSCRIPT_GENERAL_CATALOG: Omit<AutocompleteItem, 'id' | 'score'>[] = [
  { label: 'SpreadsheetApp', insertText: 'SpreadsheetApp', detail: 'Google Apps Script · Planilhas', kind: 'class' },
  { label: 'SpreadsheetApp.getActiveSpreadsheet()', insertText: 'SpreadsheetApp.getActiveSpreadsheet().getSheetByName("")', cursorOffsetFromEnd: 2, detail: 'snippet · Abrir aba por nome', kind: 'snippet' },
  { label: 'getRange().getValues()', insertText: 'getRange(2, 1, sheet.getLastRow() - 1, 2).getValues()', detail: 'snippet · Leitura em lote 2D', kind: 'snippet' },
  { label: 'getRange().setValues()', insertText: 'getRange(2, 2, dados.length, 1).setValues(dados)', detail: 'snippet · Escrita em lote 2D', kind: 'snippet' },
  { label: 'UrlFetchApp.fetch', insertText: 'UrlFetchApp.fetch(url, { muteHttpExceptions: true })', detail: 'GAS · Chamar API externa', kind: 'method' },
  { label: 'UrlFetchApp.fetchAll', insertText: 'UrlFetchApp.fetchAll(requests)', detail: 'GAS · Lote HTTP em paralelo', kind: 'method' },
  { label: 'ScriptApp.newTrigger', insertText: 'ScriptApp.newTrigger("").timeBased().everyHours(1).create()', cursorOffsetFromEnd: 34, detail: 'GAS · Trigger instalável por tempo', kind: 'snippet' },
  { label: 'LockService.getScriptLock()', insertText: 'const lock = LockService.getScriptLock();\nlock.waitLock(10000);', detail: 'GAS · Evitar concorrência', kind: 'snippet' },
  { label: 'onEdit(e)', insertText: 'function onEdit(e) {\n  if (!e || !e.range) return;\n  const range = e.range;\n}', detail: 'Trigger · Gatilho de edição seguro', kind: 'snippet' },
  { label: 'Logger.log', insertText: 'Logger.log();', cursorOffsetFromEnd: 2, detail: 'GAS · Log de execução', kind: 'method' },
  { label: 'JSON.parse', insertText: 'JSON.parse(resposta.getContentText())', detail: 'JSON · Ler payload da API', kind: 'method' },
  ...JS_GENERAL_CATALOG,
];

const PYTHON_GENERAL_CATALOG: Omit<AutocompleteItem, 'id' | 'score'>[] = [
  { label: 'print', insertText: 'print()', cursorOffsetFromEnd: 1, detail: 'builtins · Imprimir', kind: 'method' },
  { label: 'with open', insertText: 'with open("arquivo.txt", "r", encoding="utf-8") as f:\n    conteudo = f.read()', detail: 'snippet · Context Manager seguro', kind: 'snippet' },
  { label: 'BeautifulSoup', insertText: 'soup = BeautifulSoup(html, "html.parser")', detail: 'bs4 · Parser HTML', kind: 'class' },
  { label: 'requests.get', insertText: 'resp = requests.get(url, timeout=10)\nresp.raise_for_status()', detail: 'requests · GET com timeout', kind: 'snippet' },
  { label: 'requests.Session', insertText: 'with requests.Session() as session:\n    ', detail: 'requests · Sessão reutilizável', kind: 'snippet' },
  { label: 'BaseModel', insertText: 'class Payload(BaseModel):\n    id: int\n    nome: str', detail: 'Pydantic · Validação de schema', kind: 'class' },
  { label: 'FastAPI', insertText: 'app = FastAPI()', detail: 'fastapi · Instância da API', kind: 'class' },
  { label: 'HTTPException', insertText: 'raise HTTPException(status_code=404, detail="Não encontrado")', detail: 'fastapi · Erro HTTP explícito', kind: 'class' },
  { label: 'pd.DataFrame', insertText: 'pd.DataFrame()', cursorOffsetFromEnd: 1, detail: 'pandas · Estrutura tabular', kind: 'class' },
  { label: 'pd.to_datetime', insertText: 'pd.to_datetime()', cursorOffsetFromEnd: 1, detail: 'pandas · Conversão temporal', kind: 'method' },
  { label: 'super().__init__', insertText: 'super().__init__()', cursorOffsetFromEnd: 1, detail: 'POO · Inicializar classe base', kind: 'snippet' },
  { label: 'enumerate', insertText: 'enumerate()', cursorOffsetFromEnd: 1, detail: 'builtins · Índice e valor', kind: 'method' },
  { label: 'try / except', insertText: 'try:\n    pass\nexcept ValueError as e:\n    print(e)', detail: 'snippet · Tratamento explícito', kind: 'snippet' },
  { label: 'def', insertText: 'def ', detail: 'keyword · Definir função', kind: 'keyword' },
  { label: 'class', insertText: 'class ', detail: 'keyword · Definir classe', kind: 'keyword' },
  { label: 'return', insertText: 'return ', detail: 'keyword', kind: 'keyword' },
  { label: 'import', insertText: 'import ', detail: 'keyword', kind: 'keyword' },
];

function extractDeclaredSymbols(
  code: string,
  track: LanguageTrack
): {
  varTypes: Map<string, string>;
  localIdentifiers: { name: string; detail: string; kind: CompletionKind }[];
} {
  const varTypes = new Map<string, string>();
  const localIdentifiers: { name: string; detail: string; kind: CompletionKind }[] = [];
  const seen = new Set<string>();

  if (track === 'java') {
    const declRegex =
      /\b(Scanner|String|StringBuilder|LocalDate|Instant|Duration|List|ArrayList|Map|HashMap|Set|HashSet|BufferedReader|double|int|long|boolean|char)\s+(?:<[^>]+>\s*)?([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    let m: RegExpExecArray | null;
    while ((m = declRegex.exec(code)) !== null) {
      varTypes.set(m[2], m[1]);
      if (!seen.has(m[2])) {
        seen.add(m[2]);
        localIdentifiers.push({
          name: m[2],
          detail: `${m[1]} · variável local`,
          kind: 'variable',
        });
      }
    }
  } else if (track === 'javascript' || track === 'appscript') {
    const jsDecl = /\b(?:const|let|var|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let m: RegExpExecArray | null;
    while ((m = jsDecl.exec(code)) !== null) {
      const name = m[1];
      if (/sheet|aba/i.test(name)) varTypes.set(name, 'sheet');
      if (/dados|lista|rows|pedidos|entregas/i.test(name)) varTypes.set(name, 'Array');
      if (/resposta|res/i.test(name)) varTypes.set(name, 'resposta');
      if (/range/i.test(name)) varTypes.set(name, 'range');
      if (!seen.has(name)) {
        seen.add(name);
        localIdentifiers.push({
          name,
          detail: 'identificador local',
          kind: 'variable',
        });
      }
    }
  } else {
    const pyDecl = /(?:^|\n)\s*(?:def\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|\()/g;
    let m: RegExpExecArray | null;
    while ((m = pyDecl.exec(code)) !== null) {
      const name = m[1];
      if (['if', 'for', 'while', 'with', 'print', 'return'].includes(name)) continue;
      if (/df|tabela|dados/i.test(name)) varTypes.set(name, 'df');
      if (/soup|bs|html_doc/i.test(name)) varTypes.set(name, 'soup');
      if (!seen.has(name)) {
        seen.add(name);
        localIdentifiers.push({
          name,
          detail: 'símbolo Python',
          kind: 'variable',
        });
      }
    }
  }

  return { varTypes, localIdentifiers };
}

function matchScore(candidate: string, query: string): number {
  const candLower = candidate.toLowerCase();
  const queryLower = query.toLowerCase();
  if (!queryLower) return 10;

  if (candLower === queryLower) return 120;
  if (candLower.startsWith(queryLower)) {
    const exactCase = candidate.startsWith(query) ? 10 : 0;
    return 100 + exactCase - Math.min(20, candidate.length - query.length);
  }

  let qi = 0;
  for (let ci = 0; ci < candLower.length && qi < queryLower.length; ci++) {
    if (candLower[ci] === queryLower[qi]) {
      qi++;
    }
  }
  if (qi === queryLower.length) {
    return 60 - Math.min(25, candidate.length - query.length);
  }

  return 0;
}

export function getJavaAutocompleteSuggestions(
  code: string,
  cursorIndex: number
): AutocompleteResult {
  return getCodeAutocompleteSuggestions(code, cursorIndex, 'java');
}

export function getCodeAutocompleteSuggestions(
  code: string,
  cursorIndex: number,
  track: LanguageTrack
): AutocompleteResult {
  const beforeCursor = code.slice(0, cursorIndex);
  const lineStart = beforeCursor.lastIndexOf('\n') + 1;
  const currentLineBefore = beforeCursor.slice(lineStart);

  if (
    (track === 'python' && /^\s*#/.test(currentLineBefore)) ||
    (track !== 'python' && /^\s*\/\//.test(currentLineBefore))
  ) {
    return { prefix: '', replaceStart: cursorIndex, items: [] };
  }

  const { varTypes, localIdentifiers } = extractDeclaredSymbols(code, track);

  const memberCatalog =
    track === 'python'
      ? PYTHON_MEMBER_CATALOG
      : track === 'javascript' || track === 'appscript'
      ? JS_MEMBER_CATALOG
      : JAVA_MEMBER_CATALOG;

  const memberMatch = currentLineBefore.match(/([A-Za-z_][A-Za-z0-9_.]*)\.([A-Za-z0-9_]*)$/);
  if (memberMatch) {
    const receiver = memberMatch[1];
    const memberPrefix = memberMatch[2];
    const replaceStart = cursorIndex - memberPrefix.length;

    const resolvedType = memberCatalog[receiver]
      ? receiver
      : varTypes.get(receiver) ??
        (receiver.endsWith('.out') ? 'System.out' : undefined) ??
        (track === 'appscript' && receiver.includes('getRange') ? 'range' : undefined);

    const pool = resolvedType ? memberCatalog[resolvedType] ?? [] : [];
    const items: AutocompleteItem[] = pool
      .map((item, idx) => ({
        ...item,
        id: `mem-${resolvedType}-${idx}`,
        score: matchScore(item.label, memberPrefix),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .slice(0, 10);

    return {
      prefix: memberPrefix,
      replaceStart,
      items,
    };
  }

  const identMatch = currentLineBefore.match(/([A-Za-z_][A-Za-z0-9_]*)$/);
  if (!identMatch) {
    return { prefix: '', replaceStart: cursorIndex, items: [] };
  }

  const prefix = identMatch[1];
  if (prefix.length < 2) {
    return { prefix, replaceStart: cursorIndex - prefix.length, items: [] };
  }

  const replaceStart = cursorIndex - prefix.length;

  const generalCatalog =
    track === 'python'
      ? PYTHON_GENERAL_CATALOG
      : track === 'appscript'
      ? APPSCRIPT_GENERAL_CATALOG
      : track === 'javascript'
      ? JS_GENERAL_CATALOG
      : JAVA_GENERAL_CATALOG;

  const combinedPool: Omit<AutocompleteItem, 'id' | 'score'>[] = [
    ...localIdentifiers.map((v) => ({
      label: v.name,
      insertText: v.name,
      detail: v.detail,
      kind: v.kind,
    })),
    ...generalCatalog,
  ];

  const seenLabels = new Set<string>();
  const items: AutocompleteItem[] = combinedPool
    .map((item, idx) => ({
      ...item,
      id: `gen-${idx}-${item.label}`,
      score: matchScore(item.label, prefix),
    }))
    .filter((item) => {
      if (item.score <= 0 || item.label === prefix) return false;
      if (seenLabels.has(item.label)) return false;
      seenLabels.add(item.label);
      return true;
    })
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, 10);

  return {
    prefix,
    replaceStart,
    items,
  };
}

export function applyAutocompleteInsertion(
  code: string,
  replaceStart: number,
  cursorIndex: number,
  item: Pick<AutocompleteItem, 'insertText' | 'cursorOffsetFromEnd'>
): { nextCode: string; nextCursor: number } {
  const before = code.slice(0, replaceStart);
  const after = code.slice(cursorIndex);
  const nextCode = before + item.insertText + after;
  const offsetFromEnd = item.cursorOffsetFromEnd ?? 0;
  const nextCursor = replaceStart + item.insertText.length - offsetFromEnd;
  return { nextCode, nextCursor };
}
