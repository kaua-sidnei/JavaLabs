import type { Exercise } from '../types/javalab';

export const GAS_TRACK_EXERCISES: Exercise[] = [
  // =========================================================================
  // MÓDULO 1 (201): Fundamentos do Apps Script (GAS)
  // =========================================================================
  {
    id: 'gas-m1-ex01',
    track: 'appscript',
    moduleId: 201,
    orderInModule: 1,
    title: 'Abrir planilha ativa com SpreadsheetApp e validar aba por nome',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    prompt:
      'Implemente abrirAbaRomaneios() usando SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Romaneios_Hoje"). Valide se a aba retornada existe antes de chamar getLastRow() para evitar TypeError em planilhas renomeadas.',
    datasetTable: {
      sheetName: 'Romaneios_Hoje',
      description: 'Aba ativa na planilha de expedição (Col A: Romaneio, Col B: Motorista, Col C: Volumes).',
      columns: ['Romaneio (A)', 'Motorista (B)', 'Volumes (C)'],
      rows: [
        ['RM-401', 'Carlos Lima', '18'],
        ['RM-402', 'Juliana Reis', '24'],
        ['RM-403', 'Marcos Souza', '11'],
      ],
    },
    examples: [
      { input: 'Aba "Romaneios_Hoje" presente com 3 linhas de dados', expectedOutput: '{ ok: true, linhasDados: 3 }' },
      { input: 'Aba inexistente (getSheetByName retorna null)', expectedOutput: 'Lança erro descritivo "Aba Romaneios_Hoje não encontrada"' },
    ],
    requirements: [
      'Usar SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Romaneios_Hoje")',
      'Verificar if (!aba) antes de ler propriedades da aba',
      'Retornar a contagem descontando a linha de cabeçalho',
    ],
    starterCode: `function abrirAbaRomaneios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName("Romaneios_Hoje");
  const total = aba.getLastRow();
  return { ok: true, linhasDados: total };
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'aba pode ser null se renomeada no Google Sheets',
        detail: 'Valide if (!aba) throw new Error("Aba Romaneios_Hoje não encontrada"); antes de getLastRow().',
        line: 4,
        severity: 'ERRO',
      },
      {
        title: 'Desconte a linha 1 de cabeçalho',
        detail: 'Use Math.max(0, aba.getLastRow() - 1) para contar apenas registros.',
        line: 4,
        severity: 'DICA',
      },
    ],
    focusTags: ['SpreadsheetApp', 'getSheetByName', 'Validação'],
  },
  {
    id: 'gas-m1-ex02',
    track: 'appscript',
    moduleId: 201,
    orderInModule: 2,
    title: 'Leitura em massa com getRange().getValues() em matriz 2D',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Leia todas as linhas da aba "Frota_Ativa" (excluindo o cabeçalho) com uma única chamada getRange(2, 1, lastRow - 1, 3).getValues() e retorne a lista de placas dos veículos com carga maior que 0 kg.',
    datasetTable: {
      sheetName: 'Frota_Ativa',
      description: 'Base fornecida pelo site para leitura em matriz 2D [linha][coluna].',
      columns: ['Placa (A)', 'Regiao (B)', 'Carga_Kg (C)'],
      rows: [
        ['BRA-2E19', 'Sudeste', '1450'],
        ['BRA-8K10', 'Sul', '0'],
        ['BRA-5C71', 'Centro-Oeste', '980'],
      ],
    },
    examples: [
      { input: 'Aba "Frota_Ativa" acima (3 linhas)', expectedOutput: '["BRA-2E19", "BRA-5C71"]' },
      { input: 'Planilha apenas com cabeçalho (lastRow <= 1)', expectedOutput: '[]' },
    ],
    requirements: [
      'Garantir lastRow > 1 antes de chamar getRange(..., lastRow - 1, ...)',
      'Ler toda a tabela de uma vez com getValues()',
      'Ignorar linhas onde Carga_Kg <= 0',
    ],
    starterCode: `function listarPlacasComCarga() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Frota_Ativa");
  if (!aba) return [];
  const lastRow = aba.getLastRow();
  const matriz = aba.getRange(2, 1, lastRow - 1, 3).getValues();
  return matriz.filter((linha) => Number(linha[2]) > 0).map((linha) => linha[0]);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'getRange(..., 0, 3) lança exceção se aba só tiver cabeçalho',
        detail: 'Cheque if (lastRow < 2) return []; antes de chamar aba.getRange().',
        line: 5,
        severity: 'ERRO',
      },
    ],
    focusTags: ['getValues', 'Matriz 2D', 'getLastRow'],
  },
  {
    id: 'gas-m1-ex03',
    track: 'appscript',
    moduleId: 201,
    orderInModule: 3,
    title: 'Escrita em lote único com setValues() para calcular frete líquido',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Leia as colunas A..C da aba "Fretes_Mes", calcule Frete_Liquido = Valor_Bruto - Desconto_Avaria na memória e grave toda a coluna D em uma única chamada aba.getRange(2, 4, saida.length, 1).setValues(saida).',
    datasetTable: {
      sheetName: 'Fretes_Mes',
      description: 'Col D (Frete_Liquido) deve ser preenchida em lote.',
      columns: ['CTE (A)', 'Valor_Bruto (B)', 'Desconto_Avaria (C)', 'Frete_Liquido (D)'],
      rows: [
        ['CTE-101', '1200', '150', ''],
        ['CTE-102', '850', '0', ''],
        ['CTE-103', '420', '70', ''],
      ],
    },
    examples: [
      { input: '3 linhas acima', expectedOutput: 'Coluna D gravada em lote: [[1050], [850], [350]]' },
      { input: 'Desconto maior que bruto', expectedOutput: 'Limita mínimo a 0 com Math.max(0, bruto - desconto)' },
    ],
    requirements: [
      'Proibido chamar setValue() dentro de for/map',
      'Montar matriz 2D [[valor1], [valor2], ...] para setValues()',
      'Validar saida.length > 0 antes de gravar',
    ],
    starterCode: `function calcularFreteLiquido() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Fretes_Mes");
  if (!aba || aba.getLastRow() < 2) return;
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  for (let i = 0; i < dados.length; i++) {
    const liquido = Number(dados[i][1]) - Number(dados[i][2]);
    aba.getRange(i + 2, 4).setValue(liquido);
  }
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'setValue() dentro do loop for degrada performance no GAS',
        detail: 'Acumule cada resultado em const saida = dados.map(([_, b, d]) => [Math.max(0, b - d)]) e grave uma única vez com setValues(saida).',
        line: 7,
        severity: 'ERRO',
      },
    ],
    focusTags: ['setValues', 'Matriz 2D', 'Lote'],
  },
  {
    id: 'gas-m1-ex04',
    track: 'appscript',
    moduleId: 201,
    orderInModule: 4,
    title: 'Leitura dinâmica ignorando linhas vazias ao final da aba',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Planilhas operacionais frequentemente contêm linhas em branco ou fórmulas vazias no final. Leia da aba "Expedicao_Doca" apenas até a última linha real de Codigo_Carga (Col A) e grave o carimbo "CONFERIDO" na coluna D em lote.',
    datasetTable: {
      sheetName: 'Expedicao_Doca',
      description: 'Note a linha em branco intermediária/final que deve ser tratada.',
      columns: ['Codigo_Carga (A)', 'Doca (B)', 'Qtd_Caixas (C)', 'Conferencia (D)'],
      rows: [
        ['CG-901', 'Doca 02', '32', ''],
        ['', '', '', ''],
        ['CG-902', 'Doca 05', '15', ''],
      ],
    },
    examples: [
      { input: '3 linhas com a 2a vazia', expectedOutput: 'Grava "CONFERIDO" apenas na 1a e 3a linhas, mantendo a 2a vazia ([""])' },
      { input: 'Qtd_Caixas == 0', expectedOutput: 'Marca "PENDENTE" em vez de "CONFERIDO"' },
    ],
    requirements: [
      'Preservar o alinhamento exato das linhas na coluna D ao gravar com setValues()',
      'Não usar appendRow() nem setValue() linha por linha',
      'Tratar espaços em branco com String(colA).trim()',
    ],
    starterCode: `function marcarConferenciaDoca() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Expedicao_Doca");
  if (!aba || aba.getLastRow() < 2) return;
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  const statusCol = dados.map((r) => [r[0] ? "CONFERIDO" : ""]);
  aba.getRange(2, 4, statusCol.length, 1).setValues(statusCol);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Valide também espaços em branco e Qtd_Caixas > 0',
        detail: 'Use String(r[0]).trim() !== "" e cheque Number(r[2]) > 0 antes de marcar "CONFERIDO".',
        line: 5,
        severity: 'AVISO',
      },
    ],
    focusTags: ['getRange', 'setValues', 'Saneamento'],
  },
  {
    id: 'gas-m1-ex05',
    track: 'appscript',
    moduleId: 201,
    orderInModule: 5,
    title: 'Migração de script lento célula-a-célula para operação em lote 2D',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Refatore a função abaixo que executa getValue() e setValue() dentro de um for para cada uma das linhas da aba "Custos_Rota". Leia tudo de uma vez, aplique adicional de 12% para rotas > 300 km e grave em um único setValues().',
    datasetTable: {
      sheetName: 'Custos_Rota',
      description: 'Script legado precisa ser otimizado para evitar limite de 6 minutos do Apps Script.',
      columns: ['Rota_ID (A)', 'Km (B)', 'Tarifa_Base (C)', 'Tarifa_Final (D)'],
      rows: [
        ['RT-01', '450', '1000', ''],
        ['RT-02', '180', '500', ''],
        ['RT-03', '320', '800', ''],
      ],
    },
    examples: [
      { input: 'RT-01 (450 km, 1000)', expectedOutput: '1120 (adicional 12%)' },
      { input: 'RT-02 (180 km, 500)', expectedOutput: '500 (sem adicional)' },
    ],
    requirements: [
      'Eliminar 100% das chamadas getValue()/setValue() dentro de loops',
      'Garantir arredondamento para 2 casas com Math.round(v * 100) / 100',
      'Usar uma única leitura getValues() e uma única escrita setValues()',
    ],
    starterCode: `function atualizarTarifasLegado() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Custos_Rota");
  const ultima = aba.getLastRow();
  for (let linha = 2; linha <= ultima; linha++) {
    const km = aba.getRange(linha, 2).getValue();
    const base = aba.getRange(linha, 3).getValue();
    const finalVal = km > 300 ? base * 1.12 : base;
    aba.getRange(linha, 4).setValue(finalVal);
  }
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: '3 chamadas getRange/getValue/setValue por linha dentro do loop',
        detail: 'Em 500 linhas isso gera 1500 RPCs; leia A2:C com getValues() e escreva D2:D de uma única vez.',
        line: 5,
        severity: 'ERRO',
      },
      {
        title: 'Valide se aba existe e possui dados (ultima >= 2)',
        detail: 'Proteja antes de chamar getRange().',
        line: 3,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Otimização GAS', 'getValues', 'setValues'],
  },
  {
    id: 'gas-m1-ex06',
    track: 'appscript',
    moduleId: 201,
    orderInModule: 6,
    title: 'Sincronizador em lote entre abas Origem e Destino validando dimensões',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Copie da aba "Pedidos_Brutos" para a aba "Painel_Expedicao" apenas as colunas [ID, Cidade, Peso_Kg] das linhas com Status === "LIBERADO", limpando registros antigos da aba destino com clearContent() antes de gravar o novo bloco 2D.',
    datasetTable: {
      sheetName: 'Pedidos_Brutos',
      description: 'Exportar somente linhas LIBERADO para a aba Painel_Expedicao (3 colunas).',
      columns: ['ID (A)', 'Cidade (B)', 'Peso_Kg (C)', 'Status (D)'],
      rows: [
        ['PED-10', 'Campinas', '45', 'LIBERADO'],
        ['PED-11', 'Osasco', '12', 'BLOQUEADO'],
        ['PED-12', 'Santos', '88', 'LIBERADO'],
      ],
    },
    examples: [
      { input: '3 linhas acima', expectedOutput: 'Painel_Expedicao recebe [["PED-10","Campinas",45], ["PED-12","Santos",88]]' },
      { input: 'Nenhum pedido LIBERADO', expectedOutput: 'Limpa área de dados em Painel_Expedicao sem chamar setValues([])' },
    ],
    requirements: [
      'Garantir que todas as linhas da matriz de saída tenham exatamente 3 colunas',
      'Limpar conteúdo anterior a partir da linha 2 antes de gravar',
      'Não chamar setValues() se o array filtrado estiver vazio',
    ],
    starterCode: `function sincronizarExpedicao() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const origem = ss.getSheetByName("Pedidos_Brutos");
  const destino = ss.getSheetByName("Painel_Expedicao");
  const linhas = origem.getDataRange().getValues().slice(1);
  const saida = linhas
    .filter((r) => r[3] === "LIBERADO")
    .map((r) => [r[0], r[1], r[2]]);
  destino.getRange(2, 1, saida.length, 3).setValues(saida);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'setValues([]) falha quando nenhum pedido está LIBERADO',
        detail: 'Limpe os dados antigos da aba destino e só chame setValues(saida) se saida.length > 0.',
        line: 9,
        severity: 'ERRO',
      },
      {
        title: 'Valide se origem e destino não são null',
        detail: 'Cheque if (!origem || !destino) throw new Error(...);.',
        line: 5,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Entre abas', 'clearContent', 'setValues'],
  },

  // =========================================================================
  // MÓDULO 2 (202): Processamento de Dados Logísticos (Otimização)
  // =========================================================================
  {
    id: 'gas-m2-ex01',
    track: 'appscript',
    moduleId: 202,
    orderInModule: 1,
    title: 'Filtrar matriz 2D com .filter() para isolar cargas Em Rota e Atrasado',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'A partir da aba "Ocorrencias_Dia", leia os dados via getValues() (pulando o cabeçalho) e use .filter() para separar e contar pacotes com status "Em Rota" ou "Atrasado", ignorando "Entregue".',
    datasetTable: {
      sheetName: 'Ocorrencias_Dia',
      description: 'Base de monitoramento diário de ocorrências.',
      columns: ['Codigo (A)', 'Status (B)', 'Cidade (C)'],
      rows: [
        ['PK-101', 'Em Rota', 'Sorocaba'],
        ['PK-102', 'Entregue', 'Jundiaí'],
        ['PK-103', 'Atrasado', 'Bauru'],
      ],
    },
    examples: [
      { input: 'Tabela acima', expectedOutput: '{ emRota: 1, atrasados: 1, pendentes: ["PK-101", "PK-103"] }' },
      { input: 'Todos "Entregue"', expectedOutput: '{ emRota: 0, atrasados: 0, pendentes: [] }' },
    ],
    requirements: [
      'Normalizar texto de status com String(r[1]).trim()',
      'Usar .filter() em memória sem releituras na planilha',
      'Retornar contadores e códigos pendentes',
    ],
    starterCode: `function filtrarPacotesCriticos() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ocorrencias_Dia");
  if (!aba || aba.getLastRow() < 2) return { emRota: 0, atrasados: 0, pendentes: [] };
  const linhas = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  const criticos = linhas.filter((r) => r[1] == "Em Rota" || r[1] == "Atrasado");
  return {
    emRota: criticos.filter((r) => r[1] == "Em Rota").length,
    atrasados: criticos.filter((r) => r[1] == "Atrasado").length,
    pendentes: criticos.map((r) => r[0]),
  };
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Use === e .trim() ao comparar status da planilha',
        detail: 'Células digitadas manualmente costumam ter espaços extras; use String(r[1]).trim() === "Atrasado".',
        line: 5,
        severity: 'AVISO',
      },
    ],
    focusTags: ['.filter()', 'Matriz 2D', 'Ocorrências'],
  },
  {
    id: 'gas-m2-ex02',
    track: 'appscript',
    moduleId: 202,
    orderInModule: 2,
    title: 'Contagem de ocorrências por status usando um único passe em memória',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Leia a aba "Status_Frotes" com getValues() e produza um resumo { ENTREGUE, EM_ROTA, ATRASADO, OUTROS } percorrendo a matriz apenas uma vez em memória.',
    datasetTable: {
      sheetName: 'Status_Frotes',
      description: 'Consolidado rápido de status operacionais.',
      columns: ['Romaneio (A)', 'Status (B)', 'Transportadora (C)'],
      rows: [
        ['RM-01', 'entregue ', 'TransSul'],
        ['RM-02', 'EM ROTA', 'RápidoBR'],
        ['RM-03', 'Atrasado', 'TransSul'],
      ],
    },
    examples: [
      { input: 'Tabela acima', expectedOutput: '{ ENTREGUE: 1, EM_ROTA: 1, ATRASADO: 1, OUTROS: 0 }' },
      { input: 'Status desconhecido "AVARIA"', expectedOutput: '{ ..., OUTROS: 1 }' },
    ],
    requirements: [
      'Normalizar com .trim().toUpperCase()',
      'Evitar múltiplos loops ou múltiplas chamadas getRange',
      'Retornar objeto com as 4 chaves inicializadas em 0',
    ],
    starterCode: `function contarStatusFrota() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Status_Frotes");
  if (!aba || aba.getLastRow() < 2) return { ENTREGUE: 0, EM_ROTA: 0, ATRASADO: 0, OUTROS: 0 };
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  return dados.reduce((acc, row) => {
    const st = String(row[1]).trim().toUpperCase();
    if (st === "ENTREGUE") acc.ENTREGUE++;
    else if (st === "EM ROTA") acc.EM_ROTA++;
    else if (st === "ATRASADO") acc.ATRASADO++;
    else acc.OUTROS++;
    return acc;
  }, { ENTREGUE: 0, EM_ROTA: 0, ATRASADO: 0, OUTROS: 0 });
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Suporte variações com underscore ("EM_ROTA")',
        detail: 'Substitua espaços por _ ou aceite ambos para evitar classificar "EM_ROTA" como OUTROS.',
        line: 8,
        severity: 'DICA',
      },
    ],
    focusTags: ['Normalização', '.reduce()', 'Status'],
  },
  {
    id: 'gas-m2-ex03',
    track: 'appscript',
    moduleId: 202,
    orderInModule: 3,
    title: 'Transformação de lotes com .map() para gerar coluna de SLA em dias',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Leia a aba "Postagens_SLA" e use .map() para calcular os dias decorridos entre Data_Postagem e Data_Entrega (ou data de referência caso ainda não entregue) e gravar a coluna Dias_SLA e Situacao_SLA ("NO PRAZO" <= 3 dias, senão "ATRASADO") em lote.',
    datasetTable: {
      sheetName: 'Postagens_SLA',
      description: 'Col D e E devem ser preenchidas via map() + setValues().',
      columns: ['Pedido (A)', 'Data_Postagem (B)', 'Data_Entrega (C)', 'Dias_SLA (D)', 'Situacao_SLA (E)'],
      rows: [
        ['PD-10', '2026-11-01', '2026-11-03', '', ''],
        ['PD-11', '2026-11-01', '2026-11-06', '', ''],
        ['PD-12', '2026-11-04', '', '', ''],
      ],
    },
    examples: [
      { input: 'PD-10 (01/11 -> 03/11)', expectedOutput: '[2, "NO PRAZO"]' },
      { input: 'PD-11 (01/11 -> 06/11)', expectedOutput: '[5, "ATRASADO"]' },
    ],
    requirements: [
      'Usar .map() retornando exatamente [dias, situacao] por linha',
      'Tratar Data_Entrega vazia usando new Date("2026-11-10") como referência do relatório',
      'Gravar colunas D:E em lote único com setValues()',
    ],
    starterCode: `function calcularColunaSLA() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Postagens_SLA");
  if (!aba || aba.getLastRow() < 2) return;
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  const MS_DIA = 1000 * 60 * 60 * 24;
  const hojeRef = new Date("2026-11-10");
  const saida = dados.map((row) => {
    const inicio = new Date(row[1]);
    const fim = row[2] ? new Date(row[2]) : hojeRef;
    const dias = Math.round((fim.getTime() - inicio.getTime()) / MS_DIA);
    return [dias, dias <= 3 ? "NO PRAZO" : "ATRASADO"];
  });
  aba.getRange(2, 4, saida.length, 2).setValues(saida);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Valide datas inválidas com Number.isNaN(inicio.getTime())',
        detail: 'Se Data_Postagem estiver malformada, retorne ["INVÁLIDA", "REVISAR"] em vez de gravar NaN na planilha.',
        line: 10,
        severity: 'AVISO',
      },
    ],
    focusTags: ['.map()', 'SLA', 'setValues'],
  },
  {
    id: 'gas-m2-ex04',
    track: 'appscript',
    moduleId: 202,
    orderInModule: 4,
    title: 'Priorização de entregas críticas combinando .filter() e .map()',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Na aba "Cargas_Prioritarias", filtre apenas pedidos com Peso_Kg >= 100 OU Prazo_Restante_Horas <= 4 (desde que não entregues), ordene por menor prazo restante e grave o resumo na aba "Fila_Urgente".',
    datasetTable: {
      sheetName: 'Cargas_Prioritarias',
      description: 'Cargas para priorização de doca.',
      columns: ['Carga (A)', 'Peso_Kg (B)', 'Prazo_Restante_Horas (C)', 'Status (D)'],
      rows: [
        ['CG-01', '150', '10', 'Aguardando'],
        ['CG-02', '35', '2', 'Em Rota'],
        ['CG-03', '220', '1', 'Entregue'],
      ],
    },
    examples: [
      { input: 'Tabela acima', expectedOutput: '[["CG-02", 35, 2], ["CG-01", 150, 10]]' },
      { input: 'CG-03 (Entregue)', expectedOutput: 'Excluída pelo filter()' },
    ],
    requirements: [
      'Encadear filter() -> sort() (em cópia) -> map()',
      'Ignorar status === "Entregue"',
      'Gravar na aba "Fila_Urgente" somente se houver linhas urgentes',
    ],
    starterCode: `function priorizarFilaUrgente() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName("Cargas_Prioritarias");
  const destino = ss.getSheetByName("Fila_Urgente");
  const dados = aba.getDataRange().getValues().slice(1);
  const urgentes = dados
    .filter((r) => r[3] !== "Entregue" && (Number(r[1]) >= 100 || Number(r[2]) <= 4))
    .map((r) => [r[0], Number(r[1]), Number(r[2])]);
  destino.getRange(2, 1, urgentes.length, 3).setValues(urgentes);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Faltou ordenar por Prazo_Restante_Horas crescente e checar urgentes.length',
        detail: 'Adicione .sort((a, b) => a[2] - b[2]) e só grave se urgentes.length > 0.',
        line: 8,
        severity: 'ERRO',
      },
    ],
    focusTags: ['.filter()', '.map()', 'Priorização'],
  },
  {
    id: 'gas-m2-ex05',
    track: 'appscript',
    moduleId: 202,
    orderInModule: 5,
    title: 'Consolidação diária de volumes e faturamento com .reduce()',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Leia a aba "Romaneios_Diarios" e use .reduce() para agrupar por Data_Operacao somando Total_Volumes e Valor_Frete, ignorando linhas com Status === "Cancelado", e grave a tabela consolidada na aba "Resumo_Diario".',
    datasetTable: {
      sheetName: 'Romaneios_Diarios',
      description: 'Movimentação bruta por data para consolidação.',
      columns: ['Data_Operacao (A)', 'Romaneio (B)', 'Volumes (C)', 'Valor_Frete (D)', 'Status (E)'],
      rows: [
        ['2026-11-15', 'RM-1', '120', '1800', 'Finalizado'],
        ['2026-11-15', 'RM-2', '80', '950', 'Finalizado'],
        ['2026-11-15', 'RM-3', '40', '600', 'Cancelado'],
      ],
    },
    examples: [
      { input: '3 linhas acima', expectedOutput: '[["2026-11-15", 200, 2750, 2]]' },
      { input: 'Todas canceladas', expectedOutput: '[] (não grava linhas vazias)' },
    ],
    requirements: [
      'Usar .filter() + .reduce() em memória',
      'Formatar datas Date do Sheets com Utilities.formatDate(..., "yyyy-MM-dd") se necessário',
      'Converter mapa consolidado para array 2D e gravar em lote',
    ],
    starterCode: `function consolidarVolumesDiarios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName("Romaneios_Diarios");
  const resumo = ss.getSheetByName("Resumo_Diario");
  if (!aba || !resumo || aba.getLastRow() < 2) return;
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 5).getValues();
  const mapa = dados
    .filter((r) => r[4] !== "Cancelado")
    .reduce((acc, r) => {
      const data = String(r[0]);
      if (!acc[data]) acc[data] = { volumes: 0, frete: 0, qtd: 0 };
      acc[data].volumes += Number(r[2]);
      acc[data].frete += Number(r[3]);
      acc[data].qtd += 1;
      return acc;
    }, {});
  const matriz = Object.entries(mapa).map(([d, v]) => [d, v.volumes, v.frete, v.qtd]);
  if (matriz.length > 0) resumo.getRange(2, 1, matriz.length, 4).setValues(matriz);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Objetos Date vindos do Sheets viram strings longas com String(r[0])',
        detail: 'Se r[0] instanceof Date, formate com Utilities.formatDate(r[0], "America/Sao_Paulo", "yyyy-MM-dd").',
        line: 10,
        severity: 'AVISO',
      },
    ],
    focusTags: ['.reduce()', 'Agrupamento', 'Relatórios'],
  },
  {
    id: 'gas-m2-ex06',
    track: 'appscript',
    moduleId: 202,
    orderInModule: 6,
    title: 'Ranking de performance por motorista com taxa de entrega via .reduce()',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'A partir da aba "Entregas_Motoristas", agrupe por Motorista usando .reduce() calculando Total_Entregas, Concluidas, Taxa_Sucesso (%) e Valor_Total, ordenando por maior Taxa_Sucesso e gravando em "Ranking_Motoristas".',
    datasetTable: {
      sheetName: 'Entregas_Motoristas',
      description: 'Base para cálculo de KPI por motorista.',
      columns: ['ID (A)', 'Motorista (B)', 'Status (C)', 'Valor_Carga (D)'],
      rows: [
        ['E-01', 'Carlos Lima', 'Entregue', '1200'],
        ['E-02', 'Carlos Lima', 'Atrasado', '450'],
        ['E-03', 'Juliana Reis', 'Entregue', '980'],
      ],
    },
    examples: [
      { input: 'Carlos Lima (1/2 entregue) vs Juliana Reis (1/1)', expectedOutput: 'Juliana: 100%, Carlos: 50%' },
      { input: 'Ordenação final', expectedOutput: 'Juliana Reis na linha 2, Carlos Lima na linha 3' },
    ],
    requirements: [
      'Consolidar tudo em único .reduce()',
      'Calcular Taxa_Sucesso = Math.round((concluidas / total) * 1000) / 10',
      'Limpar destino antes de gravar ranking em lote',
    ],
    starterCode: `function gerarRankingMotoristas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const origem = ss.getSheetByName("Entregas_Motoristas");
  const destino = ss.getSheetByName("Ranking_Motoristas");
  if (!origem || !destino || origem.getLastRow() < 2) return;
  const dados = origem.getRange(2, 1, origem.getLastRow() - 1, 4).getValues();
  const porMotorista = dados.reduce((acc, r) => {
    const mot = String(r[1]).trim();
    if (!acc[mot]) acc[mot] = { total: 0, ok: 0, valor: 0 };
    acc[mot].total++;
    if (r[2] === "Entregue") acc[mot].ok++;
    acc[mot].valor += Number(r[3]) || 0;
    return acc;
  }, {});
  const tabela = Object.entries(porMotorista)
    .map(([mot, s]) => [mot, s.total, s.ok, Math.round((s.ok / s.total) * 100), s.valor])
    .sort((a, b) => b[3] - a[3]);
  destino.getRange(2, 1, tabela.length, 5).setValues(tabela);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Falta checar tabela.length > 0 e limpar destino antes de gravar',
        detail: 'Se houver menos motoristas hoje do que ontem, linhas antigas sobrarão sem clearContent().',
        line: 18,
        severity: 'AVISO',
      },
    ],
    focusTags: ['.reduce()', 'KPI Frota', 'Ordenação'],
  },

  // =========================================================================
  // MÓDULO 3 (203): Integração de Sistemas (APIs Externas)
  // =========================================================================
  {
    id: 'gas-m3-ex01',
    track: 'appscript',
    moduleId: 203,
    orderInModule: 1,
    title: 'Requisição GET básica com UrlFetchApp.fetch() e parse de JSON',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Implemente consultarCepTransportadora(cep) usando UrlFetchApp.fetch() para consultar a API externa, validar response.getResponseCode() === 200 e extrair { cidade, uf, prazoDias } do JSON.',
    datasetTable: {
      sheetName: 'CEPs_Atendimento',
      description: 'CEPs de referência e resposta JSON simulada pelo gateway.',
      columns: ['CEP (A)', 'Endpoint_Simulado (B)', 'JSON_Retorno (C)'],
      rows: [
        ['01310100', 'https://api.frete.exemplo/cep/01310100', '{"cidade":"São Paulo","uf":"SP","prazoDias":1}'],
        ['80010000', 'https://api.frete.exemplo/cep/80010000', '{"cidade":"Curitiba","uf":"PR","prazoDias":2}'],
      ],
    },
    examples: [
      { input: 'consultarCepTransportadora("01310100")', expectedOutput: '{ cidade: "São Paulo", uf: "SP", prazoDias: 1 }' },
      { input: 'HTTP 404 ou CEP inválido', expectedOutput: 'Retorna null sem quebrar execução' },
    ],
    requirements: [
      'Passar { muteHttpExceptions: true } no UrlFetchApp.fetch()',
      'Verificar response.getResponseCode() === 200 antes de JSON.parse()',
      'Envolver JSON.parse() em try/catch',
    ],
    starterCode: `function consultarCepTransportadora(cep) {
  const url = "https://api.frete.exemplo/cep/" + cep;
  const resp = UrlFetchApp.fetch(url);
  const data = JSON.parse(resp.getContentText());
  return { cidade: data.cidade, uf: data.uf, prazoDias: data.prazoDias };
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'UrlFetchApp.fetch sem muteHttpExceptions',
        detail: 'Passe { muteHttpExceptions: true } e cheque if (resp.getResponseCode() !== 200) return null; antes de JSON.parse().',
        line: 3,
        severity: 'ERRO',
      },
    ],
    focusTags: ['UrlFetchApp.fetch', 'GET', 'JSON.parse'],
  },
  {
    id: 'gas-m3-ex02',
    track: 'appscript',
    moduleId: 203,
    orderInModule: 2,
    title: 'Tratamento de códigos HTTP e fallback seguro em APIs de frete',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Crie consultarTarifaSeguro(rotaId) tratando HTTP 200 (sucesso), 404 ("ROTA_NAO_ENCONTRADA") e >= 500 ("INDISPONIVEL_TEMPORARIO") usando { muteHttpExceptions: true }.',
    datasetTable: {
      sheetName: 'Tabela_APIs_Frete',
      description: 'Cenários de status HTTP simulados para validação.',
      columns: ['Rota_ID (A)', 'HTTP_Simulado (B)', 'Corpo_Simulado (C)'],
      rows: [
        ['RT-SP-RJ', '200', '{"tarifa":420.50}'],
        ['RT-999', '404', '{"erro":"Not found"}'],
        ['RT-BA-PE', '503', '<html>Service Unavailable</html>'],
      ],
    },
    examples: [
      { input: 'consultarTarifaSeguro("RT-SP-RJ")', expectedOutput: '{ ok: true, tarifa: 420.5 }' },
      { input: 'consultarTarifaSeguro("RT-BA-PE") (503 HTML)', expectedOutput: '{ ok: false, motivo: "INDISPONIVEL_TEMPORARIO" }' },
    ],
    requirements: [
      'Nunca chamar JSON.parse em resposta HTML 503',
      'Classificar explicitamente status 200, 404 e >= 500',
      'Retornar objeto uniforme { ok, ... }',
    ],
    starterCode: `function consultarTarifaSeguro(rotaId) {
  const url = \`https://api.frete.exemplo/tarifas/\${encodeURIComponent(rotaId)}\`;
  const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const json = JSON.parse(resp.getContentText());
  return { ok: true, tarifa: json.tarifa };
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'JSON.parse executa antes de verificar getResponseCode()',
        detail: 'Quando o servidor devolve HTML 503, JSON.parse lança SyntaxError imediato.',
        line: 4,
        severity: 'ERRO',
      },
    ],
    focusTags: ['getResponseCode', 'muteHttpExceptions', 'Resiliência'],
  },
  {
    id: 'gas-m3-ex03',
    track: 'appscript',
    moduleId: 203,
    orderInModule: 3,
    title: 'atualizarStatusRastreio(): Consumo GET para atualizar romaneios',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Implemente atualizarStatusRastreio() na aba "Monitoramento" fornecida abaixo: leia as linhas em lote (getDataRange().getValues()), consulte via GET apenas os códigos cujo status não é "Entregue" e grave a coluna Status em lote com setValues().',
    datasetTable: {
      sheetName: 'Monitoramento',
      description: 'Col A: Codigo_Rastreio, Col B: Placa, Col C: Destino, Col D: Status.',
      columns: ['Codigo_Rastreio (A)', 'Placa (B)', 'Destino (C)', 'Status (D)', 'Retorno_API_Simulado'],
      rows: [
        ['LOG-2026-01', 'BRA-2E19', 'São Paulo -> Rio de Janeiro', 'Em Rota', '{"status":"Em Trânsito - Via Dutra"}'],
        ['LOG-2026-02', 'BRA-9A44', 'Curitiba -> Porto Alegre', 'Entregue', '{"status":"Entregue"}'],
        ['LOG-2026-03', 'BRA-5C71', 'BH -> Goiânia', 'Aguardando Coleta', '{"status":"Coletado no CD"}'],
      ],
    },
    examples: [
      { input: 'Aba Monitoramento com 3 romaneios', expectedOutput: 'Atualiza LOG-2026-01 e LOG-2026-03 via setValues(); ignora LOG-2026-02' },
      { input: 'API retorna HTTP 500 para LOG-2026-03', expectedOutput: 'Mantém status anterior ("Aguardando Coleta")' },
    ],
    requirements: [
      'Pular cabeçalho e linhas já marcadas como "Entregue"',
      'Usar { muteHttpExceptions: true } e checar getResponseCode() === 200',
      'Gravar toda a coluna D de uma só vez com setValues()',
    ],
    starterCode: `function atualizarStatusRastreio() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName("Monitoramento");
  if (!aba) return;
  const dados = aba.getDataRange().getValues();
  const novosStatus = [];

  for (let i = 1; i < dados.length; i++) {
    const codigo = dados[i][0];
    const atual = dados[i][3];
    if (atual !== "Entregue" && codigo) {
      const url = \`https://api.rastreio.exemplo/v1/\${encodeURIComponent(codigo)}\`;
      const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      const json = JSON.parse(resp.getContentText());
      novosStatus.push([json.status]);
    } else {
      novosStatus.push([atual]);
    }
  }
  if (novosStatus.length > 0) {
    aba.getRange(2, 4, novosStatus.length, 1).setValues(novosStatus);
  }
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Verifique getResponseCode() antes de JSON.parse',
        detail: 'Cheque resp.getResponseCode() === 200; em erro, mantenha [atual] para não corromper a coluna.',
        line: 14,
        severity: 'ERRO',
      },
    ],
    focusTags: ['UrlFetchApp.fetch', 'Monitoramento', 'setValues'],
  },
  {
    id: 'gas-m3-ex04',
    track: 'appscript',
    moduleId: 203,
    orderInModule: 4,
    title: 'Disparo de Webhook POST para alertas de avaria na carga',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Leia a aba "Avarias_Pendentes" e para cada ocorrência com Notificado !== "SIM", envie um POST JSON ao webhook da equipe de sinistros usando method: "post", contentType: "application/json", payload: JSON.stringify(...) e marque "SIM" em lote.',
    datasetTable: {
      sheetName: 'Avarias_Pendentes',
      description: 'Alertas pendentes de disparo via POST.',
      columns: ['Romaneio (A)', 'Placa (B)', 'Tipo_Avaria (C)', 'Notificado (D)'],
      rows: [
        ['RM-710', 'BRA-1B22', 'Embalagem violada', 'NAO'],
        ['RM-711', 'BRA-4D88', 'Temperatura acima de 8C', 'SIM'],
        ['RM-712', 'BRA-7F09', 'Caixa amassada', 'NAO'],
      ],
    },
    examples: [
      { input: 'RM-710 (NAO) e RM-711 (SIM)', expectedOutput: 'Dispara POST apenas para RM-710 e RM-712; atualiza Col D para SIM em lote' },
      { input: 'Webhook responde 500 em RM-712', expectedOutput: 'Mantém "ERRO_ENVIO" na Col D de RM-712 para retentativa' },
    ],
    requirements: [
      'Usar method: "post", contentType: "application/json" e payload: JSON.stringify(...)',
      'Incluir muteHttpExceptions: true e validar código 200..299',
      'Gravar atualização da coluna Notificado em lote com setValues()',
    ],
    starterCode: `function dispararAlertasAvaria() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Avarias_Pendentes");
  if (!aba || aba.getLastRow() < 2) return;
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 4).getValues();
  const webhookUrl = "https://hooks.logistica.exemplo/avarias";

  const statusEnvio = dados.map((row) => {
    if (row[3] === "SIM") return ["SIM"];
    const resp = UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      payload: { romaneio: row[0], placa: row[1], avaria: row[2] },
    });
    return [resp.getResponseCode() < 300 ? "SIM" : "ERRO_ENVIO"];
  });
  aba.getRange(2, 4, statusEnvio.length, 1).setValues(statusEnvio);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Payload de POST JSON exige contentType e JSON.stringify',
        detail: 'Sem contentType: "application/json" e JSON.stringify(...), o GAS envia x-www-form-urlencoded.',
        line: 11,
        severity: 'ERRO',
      },
      {
        title: 'Adicione muteHttpExceptions: true nas opções do fetch',
        detail: 'Garante que o loop registre "ERRO_ENVIO" em vez de abortar em resposta 500.',
        line: 9,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Webhook POST', 'UrlFetchApp', 'Alertas'],
  },
  {
    id: 'gas-m3-ex05',
    track: 'appscript',
    moduleId: 203,
    orderInModule: 5,
    title: 'Consultas paralelas com UrlFetchApp.fetchAll() para grandes romaneios',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Para evitar atingir o limite de 6 minutos do Apps Script ao consultar centenas de cargas, substitua chamadas sequenciais por UrlFetchApp.fetchAll(requests) na aba "Lote_Rastreio" e grave Status + Horario_Sync em lote.',
    datasetTable: {
      sheetName: 'Lote_Rastreio',
      description: 'Consulte todos os códigos pendentes em paralelo com fetchAll().',
      columns: ['Codigo (A)', 'Status_Atual (B)', 'Horario_Sync (C)'],
      rows: [
        ['BR-8001', 'Em Rota', ''],
        ['BR-8002', 'Entregue', '2026-11-16'],
        ['BR-8003', 'Pendente', ''],
      ],
    },
    examples: [
      { input: '3 linhas (BR-8001 e BR-8003 pendentes)', expectedOutput: 'Executa 1 única chamada fetchAll([req1, req3]) e grava Col B:C em lote' },
      { input: 'Todos já entregues', expectedOutput: 'Não dispara nenhuma requisição HTTP' },
    ],
    requirements: [
      'Montar array de objetos request com url e muteHttpExceptions: true',
      'Disparar UrlFetchApp.fetchAll(requests) somente se requests.length > 0',
      'Mapear respostas de volta aos índices originais da matriz',
    ],
    starterCode: `function sincronizarComFetchAll() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Lote_Rastreio");
  if (!aba || aba.getLastRow() < 2) return;
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  const requests = dados.map((r) => ({
    url: \`https://api.rastreio.exemplo/v1/\${r[0]}\`,
    muteHttpExceptions: true,
  }));
  const responses = UrlFetchApp.fetchAll(requests);
  Logger.log(responses.length);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Filtrar pendentes e gravar resultado de fetchAll de volta na aba',
        detail: 'Não consulte itens já "Entregue"; valide code === 200 e grave B2:C com setValues().',
        line: 5,
        severity: 'ERRO',
      },
    ],
    focusTags: ['fetchAll', 'Concorrência', 'Performance'],
  },
  {
    id: 'gas-m3-ex06',
    track: 'appscript',
    moduleId: 203,
    orderInModule: 6,
    title: 'Integração autenticada com PropertiesService e log de erros em aba',
    difficulty: 'Difícil',
    estimatedMinutes: 22,
    prompt:
      'Leia a API Key armazenada em PropertiesService.getScriptProperties().getProperty("API_LOGISTICA_KEY"), consulte os manifestos da aba "Manifestos_API" enviando header Authorization Bearer e registre quaisquer falhas HTTP na aba "Log_Integracao".',
    datasetTable: {
      sheetName: 'Manifestos_API',
      description: 'Envio autenticado sem expor token no código fonte.',
      columns: ['Manifesto (A)', 'Cliente (B)', 'Status_API (C)'],
      rows: [
        ['MN-50', 'Indústria Alpha', 'PENDENTE'],
        ['MN-51', 'Grupo Beta', 'PENDENTE'],
      ],
    },
    examples: [
      { input: 'Chave configurada em ScriptProperties', expectedOutput: 'Envia Bearer token, atualiza Status_API e registra falhas em Log_Integracao' },
      { input: 'Chave ausente', expectedOutput: 'Lança erro explícito instruindo configurar API_LOGISTICA_KEY' },
    ],
    requirements: [
      'Nunca colocar tokens ou segredos hardcoded no código',
      'Enviar headers: { Authorization: `Bearer ${apiKey}` }',
      'Gravar logs de erro em lote na aba "Log_Integracao" quando status !== 200',
    ],
    starterCode: `function sincronizarManifestosSeguros() {
  const apiKey = "chave-fixa-no-codigo-123";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName("Manifestos_API");
  const dados = aba.getDataRange().getValues().slice(1);
  Logger.log("Sincronizando " + dados.length + " com chave " + apiKey);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Segredo hardcoded e impresso em Logger.log',
        detail: 'Leia via PropertiesService.getScriptProperties().getProperty("API_LOGISTICA_KEY") e nunca logue o token.',
        line: 2,
        severity: 'ERRO',
      },
    ],
    focusTags: ['PropertiesService', 'Headers Auth', 'Logs'],
  },

  // =========================================================================
  // MÓDULO 4 (204): Automação Contínua e Triggers
  // =========================================================================
  {
    id: 'gas-m4-ex01',
    track: 'appscript',
    moduleId: 204,
    orderInModule: 1,
    title: 'Menu customizado ao abrir a planilha com trigger onOpen()',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    prompt:
      'Implemente o gatilho simples onOpen() usando SpreadsheetApp.getUi().createMenu("Logística Pro") para adicionar os itens "Atualizar Rastreio" -> "atualizarStatusRastreio" e "Gerar Ranking" -> "gerarRankingMotoristas", finalizando com addToUi().',
    datasetTable: {
      sheetName: 'Painel_Principal',
      description: 'Menu operacional exibido automaticamente ao abrir a planilha.',
      columns: ['Menu (A)', 'Rotulo_Botao (B)', 'Funcao_GAS (C)'],
      rows: [
        ['Logística Pro', 'Atualizar Rastreio', 'atualizarStatusRastreio'],
        ['Logística Pro', 'Consolidar SLA', 'calcularColunaSLA'],
        ['Logística Pro', 'Gerar Ranking', 'gerarRankingMotoristas'],
      ],
    },
    examples: [
      { input: 'Evento onOpen disparado pelo Sheets', expectedOutput: 'Menu "Logística Pro" com 3 ações visível na barra' },
      { input: 'Faltar .addToUi()', expectedOutput: 'Menu não aparece na interface' },
    ],
    requirements: [
      'Usar exatamente o nome onOpen(e) para gatilho simples',
      'Encadear createMenu -> addItem -> addSeparator -> addToUi',
      'Referenciar nomes de funções válidos sem parênteses',
    ],
    starterCode: `function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Logística Pro")
    .addItem("Atualizar Rastreio", "atualizarStatusRastreio()")
    .addItem("Consolidar SLA", "calcularColunaSLA");
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Falta .addToUi() e sobram parênteses no nome da função',
        detail: 'No addItem, passe apenas o nome string ("atualizarStatusRastreio") e finalize com .addToUi().',
        line: 4,
        severity: 'ERRO',
      },
    ],
    focusTags: ['onOpen', 'SpreadsheetApp.getUi', 'Menu'],
  },
  {
    id: 'gas-m4-ex02',
    track: 'appscript',
    moduleId: 204,
    orderInModule: 2,
    title: 'Gatilho onEdit(e) com proteção de evento e filtro por aba/coluna',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Crie onEdit(e) monitorando apenas edições na coluna 4 (Status) da aba "Monitoramento" a partir da linha 2. Adicione guarda inicial contra evento indefinido (if (!e || !e.range) return;) e registre timestamp na coluna 5.',
    datasetTable: {
      sheetName: 'Monitoramento',
      description: 'Editar Col D (Status) grava timestamp automático na Col E.',
      columns: ['Codigo (A)', 'Placa (B)', 'Destino (C)', 'Status (D)', 'Atualizado_Em (E)'],
      rows: [
        ['LOG-01', 'BRA-2E19', 'SP -> RJ', 'Entregue', ''],
        ['LOG-02', 'BRA-9A44', 'PR -> RS', 'Em Rota', ''],
      ],
    },
    examples: [
      { input: 'Edição na aba "Monitoramento", D2 = "Entregue"', expectedOutput: 'Preenche E2 com new Date()' },
      { input: 'Execução manual no editor (e === undefined) ou outra aba', expectedOutput: 'Retorna silenciosamente sem erro' },
    ],
    requirements: [
      'Proteger contra execução manual com if (!e || !e.range) return;',
      'Verificar e.range.getSheet().getName() === "Monitoramento"',
      'Filtrar e.range.getColumn() === 4 e e.range.getRow() >= 2',
    ],
    starterCode: `function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() === "Monitoramento") {
    sheet.getRange(e.range.getRow(), 5).setValue(new Date());
  }
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'onEdit(e) sem guarda para evento vazio e sem filtro de coluna/linha',
        detail: 'Adicione if (!e || !e.range) return; e cheque getColumn() === 4 && getRow() >= 2.',
        line: 2,
        severity: 'ERRO',
      },
    ],
    focusTags: ['onEdit(e)', 'Triggers simples', 'Guarda de evento'],
  },
  {
    id: 'gas-m4-ex03',
    track: 'appscript',
    moduleId: 204,
    orderInModule: 3,
    title: 'onEdit(e) inteligente marcando data de conclusão e bloqueando status vazio',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Estenda o trigger onEdit(e) na aba "Expedicao_Status": quando a célula da coluna 3 mudar para "Entregue", preencha Data_Conclusao na coluna 4; se o usuário apagar a célula (e.value undefined), limpe a coluna 4.',
    datasetTable: {
      sheetName: 'Expedicao_Status',
      description: 'Automação reativa ao editar Status na Col C.',
      columns: ['Carga (A)', 'Motorista (B)', 'Status (C)', 'Data_Conclusao (D)'],
      rows: [
        ['CG-10', 'Ana Paula', 'Entregue', ''],
        ['CG-11', 'Rafael Luz', 'Em Rota', '2026-11-15'],
      ],
    },
    examples: [
      { input: 'C2 alterado para "Entregue"', expectedOutput: 'D2 recebe timestamp atual' },
      { input: 'C3 apagado ou alterado para "Em Rota"', expectedOutput: 'D3 é limpo com clearContent()' },
    ],
    requirements: [
      'Tratar edição em faixa múltipla verificando getNumRows() === 1 && getNumColumns() === 1',
      'Usar e.value normalizado para "Entregue" vs limpeza',
      'Validar aba "Expedicao_Status", linha >= 2 e coluna === 3',
    ],
    starterCode: `function onEdit(e) {
  if (!e || !e.range) return;
  const range = e.range;
  const aba = range.getSheet();
  if (aba.getName() !== "Expedicao_Status" || range.getRow() < 2 || range.getColumn() !== 3) return;
  const celulaData = aba.getRange(range.getRow(), 4);
  if (e.value === "Entregue") {
    celulaData.setValue(new Date());
  }
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Falta tratar reversão de status ou célula apagada + multi-seleção',
        detail: 'Verifique range.getNumRows() === 1 e execute celulaData.clearContent() quando o novo valor não for "Entregue".',
        line: 7,
        severity: 'AVISO',
      },
    ],
    focusTags: ['onEdit(e)', 'Reatividade', 'Triggers'],
  },
  {
    id: 'gas-m4-ex04',
    track: 'appscript',
    moduleId: 204,
    orderInModule: 4,
    title: 'Agendamento programático de Time-driven Triggers sem duplicidade',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Implemente configurarGatilhoHorario(nomeFuncao = "atualizarPainelMonitoramento") usando ScriptApp.getProjectTriggers() para remover gatilhos antigos da mesma função antes de criar um novo gatilho .timeBased().everyHours(1).create().',
    datasetTable: {
      sheetName: 'Config_Triggers',
      description: 'Política de agendamento de rotinas automáticas.',
      columns: ['Rotina (A)', 'Frequencia (B)', 'Janela (C)'],
      rows: [
        ['atualizarPainelMonitoramento', 'A cada 1 hora', '24h'],
        ['consolidarFechamentoDiario', 'Diário 22h', 'Fim do expediente'],
      ],
    },
    examples: [
      { input: 'configurarGatilhoHorario("atualizarPainelMonitoramento") chamado 2x', expectedOutput: 'Remove trigger anterior e mantém exatamente 1 trigger ativo' },
      { input: 'Nome de função vazio', expectedOutput: 'Lança erro antes de registrar trigger' },
    ],
    requirements: [
      'Inspecionar ScriptApp.getProjectTriggers() e apagar duplicados com deleteTrigger()',
      'Criar trigger com ScriptApp.newTrigger(nomeFuncao).timeBased().everyHours(1).create()',
      'Validar nomeFuncao não vazio',
    ],
    starterCode: `function configurarGatilhoHorario(nomeFuncao) {
  ScriptApp.newTrigger(nomeFuncao)
    .timeBased()
    .everyHours(1)
    .create();
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Criar triggers sem limpar os anteriores acumula execuções duplicadas',
        detail: 'Percorra ScriptApp.getProjectTriggers() e chame ScriptApp.deleteTrigger(t) para t.getHandlerFunction() === nomeFuncao.',
        line: 2,
        severity: 'ERRO',
      },
    ],
    focusTags: ['ScriptApp', 'Time-driven Triggers', 'Idempotência'],
  },
  {
    id: 'gas-m4-ex05',
    track: 'appscript',
    moduleId: 204,
    orderInModule: 5,
    title: 'Painel horário protegido contra concorrência com LockService',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Envolva a rotina agendada atualizarPainelHorario() com LockService.getScriptLock() usando tryLock(10000) e liberação garantida em bloco finally (lock.releaseLock()) para evitar gravações simultâneas corrompendo a aba "Painel_SLA".',
    datasetTable: {
      sheetName: 'Painel_SLA',
      description: 'Painel atualizado por trigger horário e por botão manual.',
      columns: ['Regiao (A)', 'Em_Rota (B)', 'Atrasados (C)', 'Ultima_Atualizacao (D)'],
      rows: [
        ['Sudeste', '14', '2', '2026-11-17 08:00'],
        ['Sul', '9', '0', '2026-11-17 08:00'],
      ],
    },
    examples: [
      { input: 'Lock obtido com sucesso', expectedOutput: 'Executa atualização e chama lock.releaseLock() no finally' },
      { input: 'Outro processo segurando lock > 10s', expectedOutput: 'Aborta graciosamente registrando aviso em Logger.log' },
    ],
    requirements: [
      'Usar LockService.getScriptLock() + lock.tryLock(10000)',
      'Sempre liberar o lock dentro de finally',
      'Retornar cedo se !lock.hasLock()',
    ],
    starterCode: `function atualizarPainelHorario() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Painel_SLA");
  if (!aba) return;
  const dados = aba.getDataRange().getValues();
  Logger.log("Atualizando " + (dados.length - 1) + " regiões");
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Ausência de LockService permite corrida entre trigger e clique manual',
        detail: 'Obtenha const lock = LockService.getScriptLock(); try { if (!lock.tryLock(10000)) return; ... } finally { lock.releaseLock(); }.',
        line: 1,
        severity: 'ERRO',
      },
    ],
    focusTags: ['LockService', 'Concorrência', 'Time-driven'],
  },
  {
    id: 'gas-m4-ex06',
    track: 'appscript',
    moduleId: 204,
    orderInModule: 6,
    title: 'Auditoria de alterações com onEdit(e) gravando histórico anterior e novo',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Crie registrarAuditoria(e) para monitorar edições na aba "Frota_Controle". Sempre que uma célula única for alterada, grave na aba "Auditoria_Frota" uma linha [Data, Aba, CelulaA1, Valor_Anterior (e.oldValue), Valor_Novo (e.value), Usuario] protegendo contra falha caso getEmail() venha vazio.',
    datasetTable: {
      sheetName: 'Auditoria_Frota',
      description: 'Log histórico gerado a partir de alterações em Frota_Controle.',
      columns: ['Timestamp (A)', 'Celula (B)', 'Antes (C)', 'Depois (D)', 'Usuario (E)'],
      rows: [
        ['2026-11-17 09:10', 'D2', 'Em Rota', 'Entregue', 'ops@frota.com'],
        ['2026-11-17 09:14', 'B3', 'BRA-1111', 'BRA-2222', 'ops@frota.com'],
      ],
    },
    examples: [
      { input: 'Edição D2 de "Em Rota" para "Entregue"', expectedOutput: 'Registra linha de auditoria com oldValue="Em Rota", value="Entregue"' },
      { input: 'Edição na própria aba "Auditoria_Frota"', expectedOutput: 'Ignora para evitar loop infinito' },
    ],
    requirements: [
      'Ignorar edições fora de "Frota_Controle" ou na linha 1',
      'Tratar Session.getActiveUser().getEmail() || "desconhecido"',
      'Usar e.oldValue ?? "" e e.value ?? ""',
    ],
    starterCode: `function onEdit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const audit = ss.getSheetByName("Auditoria_Frota");
  audit.appendRow([new Date(), e.range.getA1Notation(), e.oldValue, e.value]);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Falta guarda de evento e filtro de aba (risco de loop na própria auditoria)',
        detail: 'Cheque if (!e || !e.range || e.range.getSheet().getName() !== "Frota_Controle") return; e capture Session.getActiveUser().getEmail().',
        line: 2,
        severity: 'ERRO',
      },
    ],
    focusTags: ['onEdit(e)', 'Auditoria', 'oldValue'],
  },

  // =========================================================================
  // MÓDULO 5 (205): Lógica de Regras de Negócio
  // =========================================================================
  {
    id: 'gas-m5-ex01',
    track: 'appscript',
    moduleId: 205,
    orderInModule: 1,
    title: 'Padronização de códigos de rastreio e limpeza de espaços extras',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    prompt:
      'Implemente limparCodigosPlanilha() na aba "Rastreios_Sujos": remova espaços no início/fim/meio, converta para maiúsculas, remova hífens extras mantendo padrão "BRXXXXXXXXX" e grave a coluna B normalizada em lote.',
    datasetTable: {
      sheetName: 'Rastreios_Sujos',
      description: 'Códigos digitados manualmente com sujeira de formatação.',
      columns: ['Codigo_Bruto (A)', 'Codigo_Limpo (B)'],
      rows: [
        ['  br-102030  ', ''],
        ['Br 4050 60', ''],
        ['  ', ''],
      ],
    },
    examples: [
      { input: '"  br-102030  "', expectedOutput: '"BR102030"' },
      { input: '"Br 4050 60"', expectedOutput: '"BR405060"' },
    ],
    requirements: [
      'Usar .trim().toUpperCase().replace(/[^A-Z0-9]/g, "")',
      'Preservar célula vazia [""] quando a entrada estiver em branco',
      'Gravar toda coluna B em lote com setValues()',
    ],
    starterCode: `function limparCodigosPlanilha() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Rastreios_Sujos");
  if (!aba || aba.getLastRow() < 2) return;
  const brutos = aba.getRange(2, 1, aba.getLastRow() - 1, 1).getValues();
  const limpos = brutos.map(([cod]) => [String(cod).trim().toUpperCase()]);
  aba.getRange(2, 2, limpos.length, 1).setValues(limpos);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'trim() não remove espaços internos nem hífens',
        detail: 'Encadeie .replace(/[^A-Z0-9]/g, "") após .toUpperCase() para limpar "Br 4050 60" e "br-102030".',
        line: 5,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Limpeza de dados', 'Regex', 'Padronização'],
  },
  {
    id: 'gas-m5-ex02',
    track: 'appscript',
    moduleId: 205,
    orderInModule: 2,
    title: 'Comparação de datas de entrega vs prazo contratado (detectar atraso)',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Leia a aba "Prazos_Entrega" e compare Data_Prevista com Data_Entrega zerando horas/minutos (setHours(0,0,0,0)) para evitar falsos atrasos no mesmo dia. Grave "NO PRAZO" ou "ATRASADO (+N d)" em lote na coluna D.',
    datasetTable: {
      sheetName: 'Prazos_Entrega',
      description: 'Compare datas ignorando diferença de horário no mesmo dia.',
      columns: ['Pedido (A)', 'Data_Prevista (B)', 'Data_Entrega (C)', 'Status_Prazo (D)'],
      rows: [
        ['PD-201', '2026-11-10T00:00:00', '2026-11-10T18:30:00', ''],
        ['PD-202', '2026-11-10T00:00:00', '2026-11-12T09:00:00', ''],
      ],
    },
    examples: [
      { input: 'Prevista 10/11 00:00 e Entrega 10/11 18:30', expectedOutput: '"NO PRAZO" (mesmo dia!)' },
      { input: 'Prevista 10/11 e Entrega 12/11', expectedOutput: '"ATRASADO (+2 d)"' },
    ],
    requirements: [
      'Normalizar ambas as datas para meia-noite antes de subtrair',
      'Tratar Data_Entrega vazia marcando "EM ABERTO"',
      'Gravar coluna D com setValues()',
    ],
    starterCode: `function avaliarAtrasosEntrega() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Prazos_Entrega");
  if (!aba || aba.getLastRow() < 2) return;
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 3).getValues();
  const resultado = dados.map((r) => {
    const prev = new Date(r[1]);
    const entr = new Date(r[2]);
    return [entr > prev ? "ATRASADO" : "NO PRAZO"];
  });
  aba.getRange(2, 4, resultado.length, 1).setValues(resultado);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Comparar Date com hora gera falso atraso no mesmo dia',
        detail: 'Zere hora/min/seg (setHours(0, 0, 0, 0)) e verifique se r[2] está vazio antes de converter.',
        line: 8,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Datas', 'Comparação', 'Regras SLA'],
  },
  {
    id: 'gas-m5-ex03',
    track: 'appscript',
    moduleId: 205,
    orderInModule: 3,
    title: 'Cálculo exato de dias úteis descontando fins de semana e feriados',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Implemente contarDiasUteis(inicio, fim, feriadosISO) e aplique sobre a aba "SLA_Dias_Uteis" descontando sábados (6), domingos (0) e feriados da lista, gravando os Dias_Uteis reais na coluna D.',
    datasetTable: {
      sheetName: 'SLA_Dias_Uteis',
      description: 'Considere feriado nacional em 2026-11-15 e 2026-11-20.',
      columns: ['CTE (A)', 'Coleta (B)', 'Entrega (C)', 'Dias_Uteis (D)'],
      rows: [
        ['CTE-01', '2026-11-13', '2026-11-17', ''],
        ['CTE-02', '2026-11-19', '2026-11-23', ''],
      ],
    },
    examples: [
      { input: '2026-11-13 (sex) até 2026-11-17 (ter)', expectedOutput: '2 dias úteis (sáb 14, dom 15/feriado ignorados)' },
      { input: '2026-11-19 (qui) até 2026-11-23 (seg), feriado 20/11', expectedOutput: '1 dia útil (seg 23)' },
    ],
    requirements: [
      'Usar Set<string> com datas ISO "yyyy-MM-dd" para lookup O(1) de feriados',
      'Avançar dia a dia excluindo dia === 0 || dia === 6',
      'Gravar coluna D em lote com setValues()',
    ],
    starterCode: `const FERIADOS_BR = new Set(["2026-11-15", "2026-11-20"]);

function contarDiasUteis(inicioStr, fimStr) {
  const atual = new Date(inicioStr + "T00:00:00");
  const fim = new Date(fimStr + "T00:00:00");
  let uteis = 0;
  while (atual < fim) {
    atual.setDate(atual.getDate() + 1);
    const diaSem = atual.getDay();
    if (diaSem !== 0 && diaSem !== 6) uteis++;
  }
  return uteis;
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'FERIADOS_BR declarado mas não consultado no laço',
        detail: 'Formate a data corrente em YYYY-MM-DD e cheque !FERIADOS_BR.has(iso) antes de incrementar uteis.',
        line: 10,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Dias úteis', 'Set', 'Datas'],
  },
  {
    id: 'gas-m5-ex04',
    track: 'appscript',
    moduleId: 205,
    orderInModule: 4,
    title: 'Remoção de duplicatas preservando o evento mais recente com Map',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'A aba "Importacao_Webhooks" recebe eventos duplicados do mesmo Codigo_Rastreio. Use um Map<string, any[]> para deduplicar mantendo apenas o registro com maior Timestamp_Evento e grave na aba "Base_Limpa".',
    datasetTable: {
      sheetName: 'Importacao_Webhooks',
      description: 'Deduplicar por Codigo_Rastreio mantendo evento mais recente.',
      columns: ['Codigo_Rastreio (A)', 'Status (B)', 'Timestamp_Evento (C)'],
      rows: [
        ['LOG-90', 'Coletado', '2026-11-16T08:00:00'],
        ['LOG-90', 'Entregue', '2026-11-16T16:40:00'],
        ['LOG-91', 'Em Rota', '2026-11-16T10:15:00'],
      ],
    },
    examples: [
      { input: '3 linhas acima (LOG-90 duplicado)', expectedOutput: '2 linhas em Base_Limpa: LOG-90 ("Entregue") e LOG-91 ("Em Rota")' },
      { input: 'Mesmo timestamp repetido', expectedOutput: 'Mantém apenas 1 ocorrência' },
    ],
    requirements: [
      'Normalizar chave Codigo_Rastreio com .trim().toUpperCase()',
      'Comparar Date(novo) >= Date(existente) dentro do Map',
      'Gravar saída deduplicada em lote com setValues()',
    ],
    starterCode: `function deduplicarEventosMaisRecentes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const origem = ss.getSheetByName("Importacao_Webhooks");
  const destino = ss.getSheetByName("Base_Limpa");
  if (!origem || !destino || origem.getLastRow() < 2) return;
  const dados = origem.getRange(2, 1, origem.getLastRow() - 1, 3).getValues();
  const mapa = new Map();
  for (const row of dados) {
    const chave = String(row[0]).trim().toUpperCase();
    mapa.set(chave, row);
  }
  const limpos = Array.from(mapa.values());
  if (limpos.length > 0) destino.getRange(2, 1, limpos.length, 3).setValues(limpos);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'mapa.set sobrescreve sem comparar qual Timestamp_Evento é maior',
        detail: 'Se a planilha estiver fora de ordem cronológica, um evento antigo sobrescreverá o mais novo. Compare new Date(row[2]) > new Date(atual[2]).',
        line: 10,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Deduplicação', 'Map', 'Regras'],
  },
  {
    id: 'gas-m5-ex05',
    track: 'appscript',
    moduleId: 205,
    orderInModule: 5,
    title: 'Motor de saneamento completo: códigos, placas, duplicatas e SLA útil',
    difficulty: 'Difícil',
    estimatedMinutes: 22,
    prompt:
      'Construa higienizarBaseLogistica() para limpar espaços e hífens de Codigo e Placa na aba "Base_Bruta", deduplicar por Codigo mantendo o maior valor de frete e calcular os dias úteis entre Postagem e Previsão gravando em "Base_Auditada".',
    datasetTable: {
      sheetName: 'Base_Bruta',
      description: 'Base suja unificada para saneamento e cálculo de SLA.',
      columns: ['Codigo (A)', 'Placa (B)', 'Postagem (C)', 'Previsao (D)', 'Frete (E)'],
      rows: [
        [' br-100 ', 'bra 1a23', '2026-11-13', '2026-11-17', '300'],
        ['BR100', 'BRA-1A23', '2026-11-13', '2026-11-17', '350'],
        ['br-200', 'bra-9z99', '2026-11-16', '2026-11-19', '480'],
      ],
    },
    examples: [
      { input: '3 linhas com br-100 duplicado', expectedOutput: '2 linhas limpas: BR100 (BRA1A23, frete 350, 2 dias úteis) e BR200 (BRA9Z99, frete 480, 3 dias úteis)' },
      { input: 'Linha sem código válido', expectedOutput: 'Ignorada no saneamento' },
    ],
    requirements: [
      'Normalizar Codigo e Placa removendo não-alfanuméricos',
      'Deduplicar usando Map mantendo maior Frete',
      'Calcular dias úteis sem fins de semana e gravar em lote na aba destino',
    ],
    starterCode: `function higienizarBaseLogistica() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bruta = ss.getSheetByName("Base_Bruta");
  const auditada = ss.getSheetByName("Base_Auditada");
  if (!bruta || !auditada || bruta.getLastRow() < 2) return;
  const rows = bruta.getRange(2, 1, bruta.getLastRow() - 1, 5).getValues();
  // Implemente saneamento, deduplicação e cálculo de dias úteis em lote
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Padronize chaves antes de inserir no Map de deduplicação',
        detail: '" br-100 " e "BR100" só se reconhecem como duplicatas após .trim().toUpperCase().replace(/[^A-Z0-9]/g, "").',
        line: 6,
        severity: 'DICA',
      },
    ],
    focusTags: ['Saneamento', 'Deduplicação', 'Dias úteis'],
  },
  {
    id: 'gas-m5-ex06',
    track: 'appscript',
    moduleId: 205,
    orderInModule: 6,
    title: 'Auditor de regras de SLA contratual por região e emissão de resumo',
    difficulty: 'Difícil',
    estimatedMinutes: 22,
    prompt:
      'Leia "Auditoria_Contratos" e aplique o SLA contratual por região (Sudeste: 2 dias úteis, Sul: 3, Nordeste: 5), detecte violações e grave Status ("OK" / "VIOLACAO_SLA") e Multa_Estimada (2% do frete por dia excedente) em lote.',
    datasetTable: {
      sheetName: 'Auditoria_Contratos',
      description: 'Regras contratuais com multa automática por atraso em dias úteis.',
      columns: ['CTE (A)', 'Regiao (B)', 'Dias_Uteis_Reais (C)', 'Valor_Frete (D)', 'Status (E)', 'Multa (F)'],
      rows: [
        ['CTE-701', 'Sudeste', '4', '1000', '', ''],
        ['CTE-702', 'Sul', '3', '800', '', ''],
        ['CTE-703', 'Nordeste', '7', '1500', '', ''],
      ],
    },
    examples: [
      { input: 'CTE-701 (Sudeste max 2, real 4, frete 1000)', expectedOutput: '["VIOLACAO_SLA", 40] (2 dias * 2% * 1000)' },
      { input: 'CTE-702 (Sul max 3, real 3)', expectedOutput: '["OK", 0]' },
    ],
    requirements: [
      'Mapear SLA por região com objeto lookup imutável e fallback padrão 5',
      'Calcular excedente = Math.max(0, reais - limite)',
      'Gravar colunas E:F em uma única chamada setValues()',
    ],
    starterCode: `const SLA_LIMITE = { SUDESTE: 2, SUL: 3, NORDESTE: 5 };

function auditarSLAContratos() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Auditoria_Contratos");
  if (!aba || aba.getLastRow() < 2) return;
  const dados = aba.getRange(2, 1, aba.getLastRow() - 1, 4).getValues();
  const saida = dados.map((r) => {
    const reg = String(r[1]).trim().toUpperCase();
    const limite = SLA_LIMITE[reg] ?? 5;
    const reais = Number(r[2]) || 0;
    const frete = Number(r[3]) || 0;
    const excedente = Math.max(0, reais - limite);
    const multa = Number((excedente * 0.02 * frete).toFixed(2));
    return [excedente > 0 ? "VIOLACAO_SLA" : "OK", multa];
  });
  aba.getRange(2, 5, saida.length, 2).setValues(saida);
}
`,
    fileName: 'Code.gs',
    runtimeLabel: 'Apps Script V8',
    preloadedImprovements: [
      {
        title: 'Valide valores negativos em Dias_Uteis_Reais e Valor_Frete',
        detail: 'Garanta Math.max(0, Number(r[2]) || 0) e avise quando uma região desconhecida cair no SLA padrão.',
        line: 10,
        severity: 'DICA',
      },
    ],
    focusTags: ['Regras de negócio', 'SLA', 'Auditoria'],
  },
];
