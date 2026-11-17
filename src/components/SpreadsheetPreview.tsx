import { useEffect, useState } from 'react';
import { Check, Code2, Copy, Maximize2, Table2, X } from 'lucide-react';
import type { DatasetTable, LanguageTrack } from '../types/javalab';

interface SpreadsheetPreviewProps {
  datasetTable: DatasetTable;
  track?: LanguageTrack;
  compact?: boolean;
}

function getColumnLetter(index: number): string {
  let result = '';
  let n = index;
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

function SpreadsheetGrid({
  datasetTable,
  selectedCell,
  onSelectCell,
  showExpandButton,
  onExpand,
  track,
  maxBodyHeightClass = 'max-h-[220px]',
}: {
  datasetTable: DatasetTable;
  selectedCell: { row: number; col: number };
  onSelectCell: (cell: { row: number; col: number }) => void;
  showExpandButton?: boolean;
  onExpand?: () => void;
  track?: LanguageTrack;
  maxBodyHeightClass?: string;
}) {
  const allRows = [datasetTable.columns, ...datasetTable.rows];
  const safeRow = Math.min(selectedCell.row, Math.max(0, allRows.length - 1));
  const safeCol = Math.min(selectedCell.col, Math.max(0, datasetTable.columns.length - 1));
  const selectedValue = allRows[safeRow]?.[safeCol] ?? '';
  const colLetter = getColumnLetter(safeCol);
  const sheetRowNumber = safeRow + 1;
  const a1Notation = `${colLetter}${sheetRowNumber}`;

  const isGasTrack = track === 'appscript';

  return (
    <div className="overflow-hidden rounded-xl border border-[#242C26] bg-[#0B0E0C]">
      {/* Top Spreadsheet Title Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[#1E2620] bg-[#111713] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#16A34A]/20 text-[#4ADE80]">
            <Table2 className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-xs font-semibold text-white">
            Planilha · {datasetTable.sheetName}
          </span>
        </div>

        {showExpandButton && onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#263229] bg-[#162019] px-2 py-1 text-[11px] font-medium text-[#86EFAC] hover:bg-[#1E2C22] hover:text-white transition-colors whitespace-nowrap"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Expandir</span>
          </button>
        )}
      </div>

      {/* Formula / Cell Reference Bar (A1 + fx) */}
      <div className="flex items-center gap-2 border-b border-[#1D221E] bg-[#0F1310] px-2.5 py-1.5 text-[11px] font-mono">
        <span
          className="shrink-0 rounded border border-[#2A352D] bg-[#171E19] px-1.5 py-0.5 font-semibold text-[#4ADE80] tabular-nums"
          title={
            isGasTrack
              ? `Referência GAS: getRange(${sheetRowNumber}, ${safeCol + 1}) | Array: dados[${safeRow}][${safeCol}]`
              : `Célula ${a1Notation}`
          }
        >
          {a1Notation}
        </span>
        {isGasTrack && (
          <span className="hidden sm:inline shrink-0 text-[10px] text-[#7C8F82] tabular-nums">
            getRange({sheetRowNumber},{safeCol + 1}) · [{safeRow}][{safeCol}]
          </span>
        )}
        <span className="text-[#546359]" aria-hidden="true">
          fx
        </span>
        <span className="min-w-0 flex-1 truncate text-[#E4E8E5]" title={selectedValue}>
          {selectedValue || '—'}
        </span>
      </div>

      {/* Scrollable Spreadsheet Table */}
      <div className={`overflow-x-auto overflow-y-auto ${maxBodyHeightClass}`}>
        <table className="w-full border-collapse text-left font-mono text-[11px] tabular-nums">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#151A16] text-[#839186]">
              <th
                scope="col"
                className="w-8 min-w-[32px] border-b border-r border-[#232A25] bg-[#151A16] px-1.5 py-1 text-center text-[10px] font-medium"
              >
                #
              </th>
              {datasetTable.columns.map((_, cIdx) => {
                const isColSelected = cIdx === safeCol;
                return (
                  <th
                    key={cIdx}
                    scope="col"
                    className={`min-w-[104px] border-b border-r border-[#232A25] px-2 py-1 text-center text-[10px] font-semibold last:border-r-0 ${
                      isColSelected ? 'bg-[#1D2B22] text-[#4ADE80]' : 'bg-[#151A16]'
                    }`}
                  >
                    {getColumnLetter(cIdx)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allRows.map((rowValues, rIdx) => {
              const isHeaderRow = rIdx === 0;
              const isRowSelected = rIdx === safeRow;
              return (
                <tr
                  key={rIdx}
                  className={isHeaderRow ? 'bg-[#121714]' : 'bg-[#0B0E0C]'}
                >
                  <th
                    scope="row"
                    className={`border-b border-r border-[#1F2520] px-1.5 py-1.5 text-center text-[10px] font-medium ${
                      isRowSelected
                        ? 'bg-[#1D2B22] text-[#4ADE80]'
                        : 'bg-[#121613] text-[#727F75]'
                    }`}
                  >
                    {rIdx + 1}
                  </th>
                  {datasetTable.columns.map((_, cIdx) => {
                    const cellText = rowValues[cIdx] ?? '';
                    const isActive = rIdx === safeRow && cIdx === safeCol;
                    return (
                      <td
                        key={cIdx}
                        onClick={() => onSelectCell({ row: rIdx, col: cIdx })}
                        title={cellText}
                        className={`cursor-pointer border-b border-r border-[#1C221E] px-2 py-1.5 align-top last:border-r-0 transition-colors ${
                          isActive
                            ? 'bg-[#16A34A]/15 text-white outline outline-2 -outline-offset-2 outline-[#22C55E]'
                            : isHeaderRow
                            ? 'font-sans font-semibold text-[#D6E0D8] hover:bg-[#19211B]'
                            : 'text-[#C8D0CA] hover:bg-[#141A15]'
                        }`}
                      >
                        <div className="max-w-[170px] truncate">{cellText || '—'}</div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Google Sheets Tab Bar */}
      <div className="flex items-center justify-between gap-2 border-t border-[#1D241F] bg-[#101512] px-2.5 py-1.5 text-[10px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-t border-t-2 border-[#22C55E] bg-[#17211A] px-2.5 py-0.5 font-medium text-[#86EFAC] truncate">
            {datasetTable.sheetName}
          </span>
        </div>
        <span className="shrink-0 font-mono text-[#728277] tabular-nums">
          A1:{getColumnLetter(Math.max(0, datasetTable.columns.length - 1))}
          {allRows.length} · {datasetTable.rows.length} registros
        </span>
      </div>
    </div>
  );
}

export function SpreadsheetPreview({
  datasetTable,
  track,
  compact = false,
}: SpreadsheetPreviewProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({
    row: datasetTable.rows.length > 0 ? 1 : 0,
    col: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalView, setModalView] = useState<'grid' | 'matrix'>('grid');
  const [copiedMatrix, setCopiedMatrix] = useState(false);

  // Reset selected cell when switching exercises
  useEffect(() => {
    setSelectedCell({
      row: datasetTable.rows.length > 0 ? 1 : 0,
      col: 0,
    });
    setModalView('grid');
  }, [datasetTable.sheetName, datasetTable.rows.length, datasetTable.columns.length]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const matrix2D = [datasetTable.columns, ...datasetTable.rows];
  const matrixFormatted = JSON.stringify(matrix2D, null, 2);

  const handleCopyMatrix = async () => {
    try {
      await navigator.clipboard.writeText(matrixFormatted);
      setCopiedMatrix(true);
      setTimeout(() => setCopiedMatrix(false), 1800);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <>
      <div className={compact ? 'mt-3' : 'mt-5'} data-testid="exercise-dataset-table">
        {datasetTable.description && !compact && (
          <p className="mb-2 text-[11px] text-[#8C8C9B] leading-relaxed">
            {datasetTable.description}
          </p>
        )}

        <SpreadsheetGrid
          datasetTable={datasetTable}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          showExpandButton
          onExpand={() => setIsExpanded(true)}
          track={track}
          maxBodyHeightClass={compact ? 'max-h-[168px]' : 'max-h-[220px]'}
        />
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsExpanded(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="spreadsheet-modal-title"
            className="w-full max-w-4xl rounded-xl border border-[#253028] bg-[#111512] p-5 shadow-2xl space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  id="spreadsheet-modal-title"
                  className="font-display text-lg font-bold text-white"
                >
                  Planilha simulada · {datasetTable.sheetName}
                </h2>
                {datasetTable.description && (
                  <p className="mt-0.5 text-xs text-[#94A398]">{datasetTable.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="inline-flex rounded-lg border border-[#243027] bg-[#0D120E] p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setModalView('grid')}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap ${
                      modalView === 'grid'
                        ? 'bg-[#16A34A] text-[#061209] font-semibold'
                        : 'text-[#9BB0A1] hover:text-white'
                    }`}
                  >
                    <Table2 className="h-3.5 w-3.5" />
                    <span>Grade</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalView('matrix')}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap ${
                      modalView === 'matrix'
                        ? 'bg-[#16A34A] text-[#061209] font-semibold'
                        : 'text-[#9BB0A1] hover:text-white'
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>getValues() 2D</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCopyMatrix()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#253028] bg-[#161E18] px-3 py-1.5 text-xs font-medium text-[#D4E4D8] hover:bg-[#1D2820] hover:text-white transition-colors whitespace-nowrap"
                >
                  {copiedMatrix ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#4ADE80]" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar matriz</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Fechar visualização da planilha"
                  className="rounded-lg p-1.5 text-[#8C9E90] hover:bg-[#1C241E] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {modalView === 'grid' ? (
              <SpreadsheetGrid
                datasetTable={datasetTable}
                selectedCell={selectedCell}
                onSelectCell={setSelectedCell}
                track={track}
                maxBodyHeightClass="max-h-[60vh]"
              />
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#9BB0A1]">
                  Representação exata retornada em JavaScript por{' '}
                  <code className="rounded bg-[#19241C] px-1.5 py-0.5 font-mono text-[#86EFAC]">
                    aba.getDataRange().getValues()
                  </code>
                  :
                </p>
                <pre className="max-h-[55vh] overflow-auto rounded-xl border border-[#222B24] bg-[#0A0D0B] p-4 font-mono text-xs text-[#D4E8D8] leading-relaxed">
                  {matrixFormatted}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
