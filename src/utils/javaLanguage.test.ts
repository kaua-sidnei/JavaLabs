import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyAutocompleteInsertion,
  getJavaAutocompleteSuggestions,
  tokenizeJavaLine,
} from './javaLanguage';

test('tokenizeJavaLine preserves exact line text and classifies Java syntax tokens', () => {
  const line = '        Locale.setDefault(Locale.US); // ponto decimal';
  const tokens = tokenizeJavaLine(line);

  assert.equal(tokens.map((t) => t.text).join(''), line);
  assert.equal(tokens.some((t) => t.type === 'type' && t.text === 'Locale'), true);
  assert.equal(tokens.some((t) => t.type === 'method' && t.text === 'setDefault'), true);
  assert.equal(tokens.some((t) => t.type === 'constant' && t.text === 'US'), true);
  assert.equal(tokens.some((t) => t.type === 'comment' && t.text.includes('ponto decimal')), true);
});

test('tokenizeJavaLine highlights keywords, primitives, strings, and numbers', () => {
  const line = '    public static final double PI = 3.14159; String s = "A=%.4f%n";';
  const tokens = tokenizeJavaLine(line);

  assert.equal(tokens.map((t) => t.text).join(''), line);
  assert.equal(tokens.some((t) => t.type === 'keyword' && t.text === 'public'), true);
  assert.equal(tokens.some((t) => t.type === 'primitive' && t.text === 'double'), true);
  assert.equal(tokens.some((t) => t.type === 'constant' && t.text === 'PI'), true);
  assert.equal(tokens.some((t) => t.type === 'number' && t.text === '3.14159'), true);
  assert.equal(tokens.some((t) => t.type === 'string' && t.text === '"A=%.4f%n"'), true);
});

test('getJavaAutocompleteSuggestions suggests System when typing SyS (like IntelliJ)', () => {
  const code = 'public class Main {\n    public static void main(String[] args) {\n        SyS';
  const result = getJavaAutocompleteSuggestions(code, code.length);

  assert.equal(result.prefix, 'SyS');
  assert.ok(result.items.length > 0);
  assert.equal(result.items[0].label, 'System');
});

test('getJavaAutocompleteSuggestions resolves Scanner variable member methods on sc.', () => {
  const code = [
    'import java.util.Scanner;',
    'public class Main {',
    '    public static void main(String[] args) {',
    '        Scanner sc = new Scanner(System.in);',
    '        double raio = sc.nextD',
  ].join('\n');

  const result = getJavaAutocompleteSuggestions(code, code.length);
  assert.equal(result.prefix, 'nextD');
  assert.equal(result.items[0].label, 'nextDouble()');

  const inserted = applyAutocompleteInsertion(
    code,
    result.replaceStart,
    code.length,
    result.items[0]
  );
  assert.ok(inserted.nextCode.endsWith('double raio = sc.nextDouble()'));
});

test('getJavaAutocompleteSuggestions suggests System.out methods after System.out.', () => {
  const code = '        System.out.pr';
  const result = getJavaAutocompleteSuggestions(code, code.length);
  assert.equal(result.prefix, 'pr');
  assert.equal(result.items.some((i) => i.label.startsWith('printf')), true);
  assert.equal(result.items.some((i) => i.label.startsWith('println')), true);
});

import { getCodeAutocompleteSuggestions, tokenizeCodeLine } from './javaLanguage';

test('tokenizeCodeLine and getCodeAutocompleteSuggestions support Apps Script logistics and Python', () => {
  const gasCode = 'const sheet = SpreadsheetApp.getActiveSpreadsheet();\nSp';
  const gasResult = getCodeAutocompleteSuggestions(gasCode, gasCode.length, 'appscript');
  assert.equal(gasResult.items.some((i) => i.label.includes('SpreadsheetApp')), true);

  const pyLine = 'def calcular_frete(peso: float) -> float: # regra Python';
  const pyTokens = tokenizeCodeLine(pyLine, 'python');
  assert.equal(pyTokens.map((t) => t.text).join(''), pyLine);
  assert.equal(pyTokens.some((t) => t.type === 'keyword' && t.text === 'def'), true);
  assert.equal(pyTokens.some((t) => t.type === 'comment' && t.text.includes('regra Python')), true);

  const pyCode = 'import pandas as pd\ndf = pd.DataFrame()\ndf.gro';
  const pyResult = getCodeAutocompleteSuggestions(pyCode, pyCode.length, 'python');
  assert.equal(pyResult.items.some((i) => i.label.startsWith('groupby')), true);

  const scriptAppCode = 'ScriptApp.newT';
  const scriptAppRes = getCodeAutocompleteSuggestions(scriptAppCode, scriptAppCode.length, 'appscript');
  assert.equal(scriptAppRes.items.some((i) => i.label.startsWith('newTrigger')), true);

  const bsCode = 'soup = BeautifulSoup(html, "html.parser")\nsoup.sel';
  const bsRes = getCodeAutocompleteSuggestions(bsCode, bsCode.length, 'python');
  assert.equal(bsRes.items.some((i) => i.label.startsWith('select')), true);

  const tsLine = 'function parseSafe(raw: unknown): raw is Pedido { return true; }';
  const tsTokens = tokenizeCodeLine(tsLine, 'javascript');
  assert.equal(tsTokens.map((t) => t.text).join(''), tsLine);
  assert.equal(tsTokens.some((t) => t.type === 'keyword' && t.text === 'unknown'), true);
  assert.equal(tsTokens.some((t) => t.type === 'keyword' && t.text === 'is'), true);
});
