import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Box, Braces, Code, Lightbulb, Sparkles, Tag, Variable } from 'lucide-react';
import type { CopilotFinding, LanguageTrack } from '../types/javalab';
import {
  applyAutocompleteInsertion,
  getCodeAutocompleteSuggestions,
  tokenizeCodeLine,
} from '../utils/javaLanguage';
import type {
  AutocompleteItem,
  CompletionKind,
  JavaTokenType,
} from '../utils/javaLanguage';

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  findings: CopilotFinding[];
  highlightedLine: number | null;
  track?: LanguageTrack;
  fileName?: string;
  onRunShortcut?: () => void;
}

const TOKEN_CLASSES: Record<JavaTokenType, string> = {
  comment: 'text-[#7A7E85] italic',
  string: 'text-[#6AAB73]',
  annotation: 'text-[#BBB529]',
  keyword: 'text-[#7AA2F7]',
  primitive: 'text-[#7AA2F7]',
  type: 'text-[#4EC9B0]',
  number: 'text-[#2AACB8]',
  method: 'text-[#56A8F5]',
  constant: 'text-[#C77DBB] italic',
  operator: 'text-[#9DA2B3]',
  plain: 'text-[#BCBEC4]',
};

const LINE_HEIGHT_PX = 20.8;
const CHAR_WIDTH_PX = 7.82;
const PADDING_TOP_PX = 12;
const PADDING_LEFT_PX = 16;

function CompletionIcon({ kind }: { kind: CompletionKind }) {
  switch (kind) {
    case 'class':
      return <Box className="h-3.5 w-3.5 text-[#56A8F5] shrink-0" />;
    case 'method':
      return <Braces className="h-3.5 w-3.5 text-[#C77DBB] shrink-0" />;
    case 'field':
      return <Tag className="h-3.5 w-3.5 text-[#2AACB8] shrink-0" />;
    case 'snippet':
      return <Sparkles className="h-3.5 w-3.5 text-[#F97316] shrink-0" />;
    case 'variable':
      return <Variable className="h-3.5 w-3.5 text-[#4EC9B0] shrink-0" />;
    case 'keyword':
    default:
      return <Code className="h-3.5 w-3.5 text-[#7AA2F7] shrink-0" />;
  }
}

export function CodeEditor({
  value,
  onChange,
  findings,
  highlightedLine,
  track = 'java',
  fileName = 'Main.java',
  onRunShortcut,
}: CodeEditorProps) {
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const [scrollPos, setScrollPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const lines = useMemo(() => value.split('\n'), [value]);
  const tokenizedLines = useMemo(
    () => lines.map((line) => tokenizeCodeLine(line, track)),
    [lines, track]
  );

  // Compute active line & column from cursorIndex
  const { activeLineNumber, activeCol } = useMemo(() => {
    const safeIdx = Math.min(cursorIndex, value.length);
    const before = value.slice(0, safeIdx);
    const lastNl = before.lastIndexOf('\n');
    const lineNum = before.split('\n').length;
    const col = lastNl === -1 ? before.length : before.length - lastNl - 1;
    return { activeLineNumber: lineNum, activeCol: col };
  }, [value, cursorIndex]);

  const autocomplete = useMemo(() => {
    if (!autocompleteOpen) {
      return { prefix: '', replaceStart: cursorIndex, items: [] as AutocompleteItem[] };
    }
    return getCodeAutocompleteSuggestions(value, cursorIndex, track);
  }, [autocompleteOpen, value, cursorIndex, track]);

  useEffect(() => {
    if (selectedIdx >= autocomplete.items.length) {
      setSelectedIdx(0);
    }
  }, [autocomplete.items.length, selectedIdx]);

  const lineSeverityMap = new Map<number, 'ERRO' | 'AVISO' | 'DICA'>();
  for (const f of findings) {
    if (!lineSeverityMap.has(f.line)) {
      lineSeverityMap.set(f.line, f.severity);
    } else if (f.severity === 'ERRO') {
      lineSeverityMap.set(f.line, 'ERRO');
    }
  }

  const syncScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (backdropRef.current) {
      backdropRef.current.scrollTop = ta.scrollTop;
    }
    setScrollPos({ top: ta.scrollTop, left: ta.scrollLeft });
  };

  const handleAcceptSuggestion = (item: AutocompleteItem) => {
    const { nextCode, nextCursor } = applyAutocompleteInsertion(
      value,
      autocomplete.replaceStart,
      cursorIndex,
      item
    );
    onChange(nextCode);
    setAutocompleteOpen(false);
    setSelectedIdx(0);

    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = nextCursor;
        setCursorIndex(nextCursor);
      }
    });
  };

  const handleChange = (nextVal: string, nextCursor: number) => {
    onChange(nextVal);
    setCursorIndex(nextCursor);
    const check = getCodeAutocompleteSuggestions(nextVal, nextCursor, track);
    if (check.items.length > 0) {
      setAutocompleteOpen(true);
      setSelectedIdx(0);
    } else {
      setAutocompleteOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Space manually triggers IntelliSense autocomplete
    if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
      e.preventDefault();
      const pos = e.currentTarget.selectionStart;
      setCursorIndex(pos);
      const check = getCodeAutocompleteSuggestions(value, pos, track);
      if (check.items.length > 0) {
        setAutocompleteOpen(true);
        setSelectedIdx(0);
      }
      return;
    }

    if (autocompleteOpen && autocomplete.items.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1) % autocomplete.items.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((prev) =>
          prev === 0 ? autocomplete.items.length - 1 : prev - 1
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const chosen = autocomplete.items[selectedIdx] ?? autocomplete.items[0];
        if (chosen) handleAcceptSuggestion(chosen);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setAutocompleteOpen(false);
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.substring(0, start) + '    ' + value.substring(end);
      onChange(next);
      setAutocompleteOpen(false);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4;
        setCursorIndex(start + 4);
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onRunShortcut) {
      e.preventDefault();
      onRunShortcut();
    }
  };

  // Popup position relative to the editing container
  const rawTop =
    PADDING_TOP_PX + activeLineNumber * LINE_HEIGHT_PX - scrollPos.top + 4;
  const rawLeft =
    PADDING_LEFT_PX + activeCol * CHAR_WIDTH_PX - scrollPos.left;

  const editorHeight = textareaRef.current?.clientHeight ?? 360;
  const editorWidth = textareaRef.current?.clientWidth ?? 640;
  const popupWidth = Math.min(480, Math.max(300, editorWidth - 20));
  const popupMaxHeight = 250;

  const clampedTop =
    rawTop + popupMaxHeight > editorHeight && rawTop > popupMaxHeight + 24
      ? Math.max(8, rawTop - popupMaxHeight - LINE_HEIGHT_PX - 6)
      : Math.max(8, rawTop);
  const clampedLeft = Math.max(
    8,
    Math.min(rawLeft, Math.max(8, editorWidth - popupWidth - 12))
  );

  return (
    <div className="relative flex flex-1 min-h-[300px] overflow-hidden bg-[#131419] font-mono text-[13px] leading-[20.8px]">
      {/* Line numbers & severity highlights */}
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="w-12 shrink-0 select-none overflow-hidden border-r border-[#20222B] bg-[#101116] py-3 text-right text-xs text-[#5A5D6C] tabular-nums"
      >
        {lines.map((_, idx) => {
          const lineNumber = idx + 1;
          const sev = lineSeverityMap.get(lineNumber);
          const isHighlighted = highlightedLine === lineNumber;
          const isActive = activeLineNumber === lineNumber;

          return (
            <div
              key={lineNumber}
              className={`px-2.5 leading-[20.8px] ${
                isHighlighted
                  ? 'bg-[#F97316]/25 text-[#F97316] font-semibold'
                  : sev === 'ERRO'
                  ? 'bg-red-500/15 text-red-400 font-semibold'
                  : sev === 'AVISO'
                  ? 'bg-amber-500/12 text-amber-400'
                  : isActive
                  ? 'bg-[#1D1F28] text-[#D4D6E0] font-medium'
                  : ''
              }`}
            >
              {lineNumber}
            </div>
          );
        })}
      </div>

      {/* Code editing surface + syntax layer + autocomplete popup */}
      <div className="relative flex-1 overflow-hidden">
        {/* Line backdrop (active line + error/warning lines) */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden py-3"
        >
          {lines.map((_, idx) => {
            const lineNumber = idx + 1;
            const sev = lineSeverityMap.get(lineNumber);
            const isHighlighted = highlightedLine === lineNumber;
            const isActive = activeLineNumber === lineNumber;
            return (
              <div
                key={lineNumber}
                className={`h-[20.8px] w-full ${
                  isHighlighted
                    ? 'bg-[#F97316]/14'
                    : sev === 'ERRO'
                    ? 'bg-red-500/10'
                    : sev === 'AVISO'
                    ? 'bg-amber-500/8'
                    : isActive
                    ? 'bg-[#1A1C24]'
                    : ''
                }`}
              />
            );
          })}
        </div>

        {/* Pixel-synced Java Syntax Highlighted Overlay */}
        <pre
          ref={preRef}
          aria-hidden="true"
          style={{ tabSize: 4 }}
          className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre px-4 py-3 font-mono text-[13px] leading-[20.8px] tracking-normal"
        >
          {tokenizedLines.map((tokens, lineIdx) => (
            <div key={lineIdx} className="h-[20.8px]">
              {tokens.length === 0
                ? ' '
                : tokens.map((tok, tokIdx) => (
                    <span key={tokIdx} className={TOKEN_CLASSES[tok.type]}>
                      {tok.text}
                    </span>
                  ))}
            </div>
          ))}
        </pre>

        {/* Transparent Interactive Textarea */}
        <label htmlFor="java-code-editor" className="sr-only">
          Editor de código {fileName}
        </label>
        <textarea
          id="java-code-editor"
          ref={textareaRef}
          value={value}
          onChange={(e) =>
            handleChange(e.target.value, e.target.selectionStart ?? e.target.value.length)
          }
          onClick={(e) => {
            setCursorIndex(e.currentTarget.selectionStart ?? 0);
            setAutocompleteOpen(false);
          }}
          onKeyUp={(e) => {
            if (!['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
              setCursorIndex(e.currentTarget.selectionStart ?? 0);
            }
          }}
          onBlur={() => {
            // Delay close so clicking a popup item registers first
            setTimeout(() => setAutocompleteOpen(false), 150);
          }}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          style={{ tabSize: 4 }}
          className="code-input relative z-10 h-full w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-[20.8px] tracking-normal text-transparent caret-white selection:bg-[#2E436E]/60 focus:outline-none whitespace-pre overflow-auto"
        />

        {/* IntelliJ-style Autocomplete Suggestion Popup */}
        {autocompleteOpen && autocomplete.items.length > 0 && (
          <div
            role="listbox"
            aria-label={`Sugestões de código ${track}`}
            data-testid="java-autocomplete-popup"
            style={{
              top: `${clampedTop}px`,
              left: `${clampedLeft}px`,
              width: `${popupWidth}px`,
            }}
            className="absolute z-30 overflow-hidden rounded-lg border border-[#3B3E47] bg-[#23252B] shadow-2xl"
          >
            <div className="max-h-[212px] overflow-y-auto py-1">
              {autocomplete.items.map((item, idx) => {
                const isSelected = idx === selectedIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleAcceptSuggestion(item);
                    }}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`flex w-full items-center justify-between gap-3 px-2.5 py-1.5 text-left font-mono text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#2E436E] text-white'
                        : 'text-[#D4D6E0] hover:bg-[#2B2D35]'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <CompletionIcon kind={item.kind} />
                      <span className="truncate font-medium">{item.label}</span>
                    </span>
                    <span
                      className={`shrink-0 text-[11px] truncate max-w-[165px] ${
                        isSelected ? 'text-[#C6D5F5]' : 'text-[#848896]'
                      }`}
                    >
                      {item.detail}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#32353E] bg-[#1E2025] px-2.5 py-1.5 font-sans text-[11px] text-[#9498A6]">
              <span>Enter para inserir · Tab para completar · Esc fechar</span>
              <Lightbulb className="h-3.5 w-3.5 text-[#E5C07B] shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
