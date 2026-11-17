import type { Exercise } from '../types/javalab';

export const JS_TRACK_EXERCISES: Exercise[] = [
  // =========================================================================
  // MÓDULO 1 (101): Lógica e Fundamentos (JS)
  // =========================================================================
  {
    id: 'js-m1-ex01',
    track: 'javascript',
    moduleId: 101,
    orderInModule: 1,
    title: 'Escopo de bloco com let/const e armadilha de hoisting com var',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    prompt:
      'Corrija a função agendarAlertas(codigos) que usa var dentro de um laço for, fazendo todas as funções retornadas capturarem o último índice. Garanta escopo por iteração com let/const sem alterar a assinatura.',
    examples: [
      { input: 'agendarAlertas(["A1", "B2"]).map(fn => fn())', expectedOutput: '["Alerta: A1", "Alerta: B2"]' },
      { input: 'agendarAlertas(["C9"])[0]()', expectedOutput: '"Alerta: C9"' },
    ],
    requirements: [
      'Substituir var por let no laço e const para referências fixas',
      'Evitar vazamento de variável de controle fora do bloco for',
      'Retornar array de funções que preservam o código de cada iteração',
    ],
    starterCode: `function agendarAlertas(codigos) {
  var tarefas = [];
  for (var i = 0; i < codigos.length; i++) {
    var codigo = codigos[i];
    tarefas.push(function () {
      return "Alerta: " + codigo;
    });
  }
  return tarefas;
}

const lista = agendarAlertas(["A1", "B2"]);
console.log(lista.map((fn) => fn()));
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Uso de var gera hoisting e compartilhamento de escopo',
        detail: 'var tem escopo de função; todas as closures apontam para o mesmo codigo final.',
        line: 3,
        severity: 'ERRO',
      },
      {
        title: 'Prefira template literals',
        detail: 'Use `Alerta: ${codigo}` para maior clareza na interpolação.',
        line: 6,
        severity: 'DICA',
      },
    ],
    focusTags: ['let/const', 'Hoisting', 'Escopo léxico'],
  },
  {
    id: 'js-m1-ex02',
    track: 'javascript',
    moduleId: 101,
    orderInModule: 2,
    title: 'Tipos primitivos, null/undefined e comparação sem coerção implícita',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    prompt:
      'Implemente normalizarTaxa(entrada) que recebe string, number, null ou undefined. Converta valores numéricos válidos com Number(), trate 0 como válido (não confundir com falsy) e retorne 0 apenas quando a entrada for null, undefined ou NaN.',
    examples: [
      { input: 'normalizarTaxa("12.5")', expectedOutput: '12.5' },
      { input: 'normalizarTaxa(0) / normalizarTaxa(null)', expectedOutput: '0 / 0 (0 preservado como número válido)' },
    ],
    requirements: [
      'Usar === e !== em vez de ==',
      'Usar coalescência nula (??) ou verificação explícita de null/undefined',
      'Validar conversão numérica com Number.isFinite()',
    ],
    starterCode: `function normalizarTaxa(entrada) {
  if (entrada == null || entrada == "") {
    return 0;
  }
  var valor = Number(entrada);
  if (valor == NaN) {
    return 0;
  }
  return valor;
}

console.log(normalizarTaxa("12.5"), normalizarTaxa(0), normalizarTaxa("abc"));
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Comparação valor == NaN nunca é verdadeira',
        detail: 'Em JavaScript NaN !== NaN; utilize Number.isNaN(valor) ou Number.isFinite(valor).',
        line: 6,
        severity: 'ERRO',
      },
      {
        title: 'Evite == com strings vazias e null',
        detail: '0 == "" resulta em true por coerção implícita; use === e ?? explicitamente.',
        line: 2,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Primitivos', 'Coerção de tipos', 'Null/Undefined'],
  },
  {
    id: 'js-m1-ex03',
    track: 'javascript',
    moduleId: 101,
    orderInModule: 3,
    title: 'Classificador de prioridade com switch, if/else e laço while',
    difficulty: 'Médio',
    estimatedMinutes: 14,
    prompt:
      'Crie processarFila(pedidos) usando switch para mapear o código de prioridade ("EXP" -> 1, "PAD" -> 2, default -> 3) e um laço while/for para processar até atingir o limite de capacidade (100 kg), pulando itens inválidos.',
    examples: [
      { input: '[{id:1, tipo:"EXP", peso:40}, {id:2, tipo:"PAD", peso:70}]', expectedOutput: '{ aceitos: [1], pesoTotal: 40 }' },
      { input: '[{id:3, tipo:"ECO", peso:25}, {id:4, tipo:"EXP", peso:60}]', expectedOutput: '{ aceitos: [3, 4], pesoTotal: 85 }' },
    ],
    requirements: [
      'Usar switch com break em todos os casos',
      'Usar continue para ignorar pesos <= 0 e break ao exceder 100 kg',
      'Retornar objeto com ids aceitos e soma do pesoTotal',
    ],
    starterCode: `function nivelPrioridade(tipo) {
  let nivel;
  switch (tipo) {
    case "EXP":
      nivel = 1;
    case "PAD":
      nivel = 2;
      break;
    default:
      nivel = 3;
  }
  return nivel;
}

function processarFila(pedidos) {
  let pesoTotal = 0;
  const aceitos = [];
  let i = 0;
  while (i < pedidos.length) {
    const item = pedidos[i];
    i++;
    if (pesoTotal + item.peso <= 100) {
      pesoTotal += item.peso;
      aceitos.push({ id: item.id, prioridade: nivelPrioridade(item.tipo) });
    }
  }
  return { aceitos, pesoTotal };
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Fall-through acidental no switch ("EXP")',
        detail: 'Faltou break no case "EXP", sobrescrevendo nivel para 2 no case seguinte.',
        line: 5,
        severity: 'ERRO',
      },
      {
        title: 'Valide pesos negativos ou zero',
        detail: 'Use continue se !Number.isFinite(item.peso) || item.peso <= 0.',
        line: 20,
        severity: 'AVISO',
      },
    ],
    focusTags: ['switch/break', 'if/else', 'while/for'],
  },
  {
    id: 'js-m1-ex04',
    track: 'javascript',
    moduleId: 101,
    orderInModule: 4,
    title: 'Arrow functions, parâmetros padrão e retornos explícitos',
    difficulty: 'Médio',
    estimatedMinutes: 14,
    prompt:
      'Refatore calcularFreteParcelado como arrow function pura com parâmetros padrão (taxa = 0.02, parcelas = 1) e crie criarResumoLinha retornando um objeto literal direto entre parênteses ({ ... }).',
    examples: [
      { input: 'calcularFreteParcelado(200)', expectedOutput: '204' },
      { input: 'criarResumoLinha("SP", 200)', expectedOutput: '{ destino: "SP", total: 204 }' },
    ],
    requirements: [
      'Usar parâmetros padrão na arrow function',
      'Retornar objeto literal sem confundir chaves {} com corpo de função',
      'Evitar mutar objetos recebidos como argumento',
    ],
    starterCode: `const calcularFreteParcelado = (valor, taxa, parcelas) => {
  const juros = valor * (taxa || 0.02) * (parcelas || 1);
  return Number((valor + juros).toFixed(2));
};

const criarResumoLinha = (destino, valor) => {
  destino: destino,
  total: calcularFreteParcelado(valor)
};

console.log(criarResumoLinha("SP", 200));
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Retorno implícito de objeto sem parênteses ({ ... })',
        detail: 'Na arrow function criarResumoLinha, {} abre um bloco em vez de retornar o objeto.',
        line: 6,
        severity: 'ERRO',
      },
      {
        title: 'Substitua || por parâmetros padrão (=)',
        detail: 'Usar (taxa || 0.02) ignora taxa = 0 válido; declare (valor, taxa = 0.02, parcelas = 1).',
        line: 1,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Arrow Functions', 'Parâmetros padrão', 'Retorno'],
  },
  {
    id: 'js-m1-ex05',
    track: 'javascript',
    moduleId: 101,
    orderInModule: 5,
    title: 'Closure e escopo léxico para limitador de tentativas com histórico',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Implemente criarLimitador(maxTentativas = 3) retornando um objeto com tentar(chave) e resetar(). Use escopo léxico (closure) para manter o estado privado por chave sem expor o Map internamente.',
    examples: [
      { input: 'lim.tentar("login") (x3) -> 4a vez', expectedOutput: '{ permitido: true, restantes: 2..0 } -> { permitido: false, restantes: 0 }' },
      { input: 'lim.resetar("login"); lim.tentar("login")', expectedOutput: '{ permitido: true, restantes: 2 }' },
    ],
    requirements: [
      'Encapsular estado em Map privado via closure léxica',
      'Validar maxTentativas > 0 na inicialização',
      'Implementar tentar(chave) e resetar(chave?) com retorno padronizado',
    ],
    starterCode: `function criarLimitador(maxTentativas) {
  var contador = 0;
  return {
    tentar: function () {
      contador++;
      if (contador <= maxTentativas) {
        return { permitido: true, restantes: maxTentativas - contador };
      }
      return { permitido: false, restantes: 0 };
    },
    resetar: function () {
      contador = 0;
    },
  };
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Estado global único em vez de controle por chave',
        detail: 'Use new Map() no escopo léxico para isolar contadores por identificador.',
        line: 2,
        severity: 'ERRO',
      },
      {
        title: 'Falta valor padrão e validação para maxTentativas',
        detail: 'Defina maxTentativas = 3 e garanta que valores <= 0 lancem RangeError.',
        line: 1,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Closures', 'Escopo léxico', 'Map'],
  },
  {
    id: 'js-m1-ex06',
    track: 'javascript',
    moduleId: 101,
    orderInModule: 6,
    title: 'Avaliador completo de regras de desconto com pipeline de funções puras',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Construa calcularPrecoFinal(precoBase, cupom, clienteVip = false) combinando validações de tipo, switch de cupons ("BEMVINDO10", "FRETEZERO", "VIP20"), teto máximo de desconto (35%) e arredondamento exato para 2 casas.',
    examples: [
      { input: 'calcularPrecoFinal(200, "VIP20", true)', expectedOutput: '{ original: 200, descontoPercent: 30, final: 140 }' },
      { input: 'calcularPrecoFinal("100", "BEMVINDO10", false)', expectedOutput: '{ original: 100, descontoPercent: 10, final: 90 }' },
    ],
    requirements: [
      'Normalizar entrada numérica e rejeitar valores negativos com throw new Error()',
      'Aplicar teto de 35% usando Math.min()',
      'Compor funções auxiliares puras sem variáveis globais mutáveis',
    ],
    starterCode: `let ultimoDesconto = 0;

function calcularPrecoFinal(precoBase, cupom, clienteVip) {
  const base = Number(precoBase);
  let desc = 0;
  switch (cupom) {
    case "BEMVINDO10":
      desc = 10;
      break;
    case "VIP20":
      desc = 20;
      break;
  }
  if (clienteVip == true) {
    desc += 10;
  }
  ultimoDesconto = desc;
  return base - (base * desc) / 100;
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Variável global mutável ultimoDesconto',
        detail: 'Remova estado global; funções de regra de negócio devem ser puras e previsíveis.',
        line: 1,
        severity: 'ERRO',
      },
      {
        title: 'Falta validação de base <= 0 e teto de 35%',
        detail: 'Cheque Number.isFinite(base) && base > 0 e aplique Math.min(35, desc).',
        line: 4,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Funções puras', 'Coerção estrita', 'Regras de negócio'],
  },

  // =========================================================================
  // MÓDULO 2 (102): Estruturas de Dados e ES6+ (JS)
  // =========================================================================
  {
    id: 'js-m2-ex01',
    track: 'javascript',
    moduleId: 102,
    orderInModule: 1,
    title: 'Manipulação segura de arrays com slice vs splice',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    prompt:
      'Implemente paginarItens(lista, pagina = 1, tamanho = 3) retornando apenas a fatia da página solicitada sem mutar o array original (use slice, nunca splice). Também implemente removerSemMutar(lista, indice).',
    examples: [
      { input: 'paginarItens([10, 20, 30, 40, 50], 2, 2)', expectedOutput: '[30, 40] (lista original intacta)' },
      { input: 'removerSemMutar(["a", "b", "c"], 1)', expectedOutput: '["a", "c"]' },
    ],
    requirements: [
      'Usar slice() para paginação sem alterar lista',
      'Retornar novo array em removerSemMutar() sem usar splice no original',
      'Tratar página <= 0 usando Math.max(1, pagina)',
    ],
    starterCode: `function paginarItens(lista, pagina = 1, tamanho = 3) {
  const inicio = (pagina - 1) * tamanho;
  return lista.splice(inicio, tamanho);
}

function removerSemMutar(lista, indice) {
  lista.splice(indice, 1);
  return lista;
}

const original = [10, 20, 30, 40, 50];
console.log(paginarItens(original, 2, 2), "Original:", original.length);
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'splice() muta e destrói o array original',
        detail: 'Use lista.slice(inicio, inicio + tamanho) para leitura imutável.',
        line: 3,
        severity: 'ERRO',
      },
      {
        title: 'Cópia rasa antes de alterar ou uso de filter()',
        detail: 'Em removerSemMutar, prefira lista.filter((_, idx) => idx !== indice).',
        line: 7,
        severity: 'AVISO',
      },
    ],
    focusTags: ['slice', 'splice', 'Imutabilidade'],
  },
  {
    id: 'js-m2-ex02',
    track: 'javascript',
    moduleId: 102,
    orderInModule: 2,
    title: 'Localização e transformação de catálogo com find e map',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Dado um array de produtos { sku, nome, preco, ativo }, implemente buscarPorSku(produtos, sku) com find() (retornando null se não existir) e formatarVitrine(produtos) com map() gerando rótulos "{nome} — R$ {preco}".',
    examples: [
      { input: 'buscarPorSku(itens, "SKU-9")', expectedOutput: '{ sku: "SKU-9", nome: "Teclado", preco: 250, ativo: true }' },
      { input: 'formatarVitrine([{ nome: "Mouse", preco: 80 }])', expectedOutput: '["Mouse — R$ 80.00"]' },
    ],
    requirements: [
      'Usar Array.prototype.find() sem retornar undefined bruto (usar ?? null)',
      'Usar Array.prototype.map() formatando preço com 2 casas decimais',
      'Não usar forEach empurrando para array externo',
    ],
    starterCode: `function buscarPorSku(produtos, sku) {
  let encontrado;
  produtos.forEach((p) => {
    if (p.sku == sku) encontrado = p;
  });
  return encontrado;
}

function formatarVitrine(produtos) {
  const saida = [];
  produtos.forEach((p) => {
    saida.push(p.nome + " — R$ " + p.preco);
  });
  return saida;
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'forEach() não interrompe ao encontrar o item',
        detail: 'Substitua por produtos.find((p) => p.sku === sku) ?? null.',
        line: 3,
        severity: 'AVISO',
      },
      {
        title: 'Prefira map() com toFixed(2)',
        detail: 'Transformações 1:1 são mais legíveis com map() e template literals.',
        line: 11,
        severity: 'DICA',
      },
    ],
    focusTags: ['find', 'map', 'forEach'],
  },
  {
    id: 'js-m2-ex03',
    track: 'javascript',
    moduleId: 102,
    orderInModule: 3,
    title: 'Filtragem e totalização por categoria com filter e reduce',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Implemente resumirVendas(pedidos) que filtra apenas pedidos com status === "PAGO" usando filter() e usa reduce() para retornar { totalFaturado, porCategoria: { [cat]: soma } }.',
    examples: [
      { input: '[{cat:"Infra", valor:100, status:"PAGO"}, {cat:"Infra", valor:50, status:"CANCELADO"}]', expectedOutput: '{ totalFaturado: 100, porCategoria: { Infra: 100 } }' },
      { input: '[]', expectedOutput: '{ totalFaturado: 0, porCategoria: {} }' },
    ],
    requirements: [
      'Encadear filter() antes de reduce()',
      'Inicializar reduce() com { totalFaturado: 0, porCategoria: {} }',
      'Garantir arredondamento para evitar erro de ponto flutuante',
    ],
    starterCode: `function resumirVendas(pedidos) {
  return pedidos
    .filter((p) => p.status === "PAGO")
    .reduce((acc, p) => {
      acc.totalFaturado += p.valor;
      acc.porCategoria[p.cat] = acc.porCategoria[p.cat] + p.valor;
      return acc;
    }, { totalFaturado: 0, porCategoria: {} });
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'NaN na primeira ocorrência da categoria',
        detail: 'acc.porCategoria[p.cat] começa como undefined; use (acc.porCategoria[p.cat] ?? 0) + p.valor.',
        line: 6,
        severity: 'ERRO',
      },
      {
        title: 'Arredonde somas decimais em JS',
        detail: 'Use Number(soma.toFixed(2)) para evitar 0.1 + 0.2 === 0.30000000000000004.',
        line: 5,
        severity: 'DICA',
      },
    ],
    focusTags: ['filter', 'reduce', 'Agregação'],
  },
  {
    id: 'js-m2-ex04',
    track: 'javascript',
    moduleId: 102,
    orderInModule: 4,
    title: 'Parsing e serialização resiliente de objetos JSON',
    difficulty: 'Médio',
    estimatedMinutes: 14,
    prompt:
      'Crie lerConfiguracao(jsonTexto, padrao) usando JSON.parse dentro de try/catch, mesclando as propriedades lidas sobre o objeto padrão sem mutar padrao e implemente exportarConfig(obj) com JSON.stringify formatado.',
    examples: [
      { input: 'lerConfiguracao(\'{"tema":"escuro"}\', {tema:"claro", idioma:"pt"})', expectedOutput: '{ tema: "escuro", idioma: "pt" }' },
      { input: 'lerConfiguracao("{json-invalido", {tema:"claro"})', expectedOutput: '{ tema: "claro" }' },
    ],
    requirements: [
      'Envolver JSON.parse() em try/catch retornando cópia do padrão em falhas',
      'Garantir que o valor parseado seja um objeto válido (não null/array)',
      'Usar JSON.stringify(obj, null, 2) para saída legível',
    ],
    starterCode: `function lerConfiguracao(jsonTexto, padrao) {
  const dados = JSON.parse(jsonTexto);
  return Object.assign(padrao, dados);
}

function exportarConfig(obj) {
  return JSON.stringify(obj);
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'JSON.parse sem try/catch derruba a aplicação',
        detail: 'Entradas malformadas lançam SyntaxError; trate o erro e retorne { ...padrao }.',
        line: 2,
        severity: 'ERRO',
      },
      {
        title: 'Object.assign(padrao, dados) muta o objeto padrão',
        detail: 'Use spread { ...padrao, ...dados } para preservar o objeto original.',
        line: 3,
        severity: 'AVISO',
      },
    ],
    focusTags: ['JSON.parse', 'JSON.stringify', 'Objetos'],
  },
  {
    id: 'js-m2-ex05',
    track: 'javascript',
    moduleId: 102,
    orderInModule: 5,
    title: 'Desestruturação aninhada e operador Spread/Rest (...)',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Implemente atualizarPerfil(usuario, { endereco: novoEndereco = {}, ...outrosCampos }) usando desestruturação com fallback padrão, rest operator para separar campos e spread para clonar sem mutar o usuário original.',
    examples: [
      { input: 'atualizarPerfil({ nome:"Ana", endereco:{ cidade:"SP", cep:"01000" } }, { endereco:{ cep:"01310" } })', expectedOutput: '{ nome:"Ana", endereco:{ cidade:"SP", cep:"01310" } }' },
      { input: 'separarPrimeiro([10, 20, 30])', expectedOutput: '{ primeiro: 10, restante: [20, 30] }' },
    ],
    requirements: [
      'Realizar merge imutável de primeiro e segundo nível (endereco)',
      'Usar rest parameter (...rest) tanto em objetos quanto em arrays',
      'Definir valores padrão na desestruturação para evitar TypeError em campos ausentes',
    ],
    starterCode: `function atualizarPerfil(usuario, alteracoes) {
  const { endereco } = alteracoes;
  return {
    ...usuario,
    ...alteracoes,
    endereco: endereco,
  };
}

function separarPrimeiro(itens) {
  const primeiro = itens[0];
  return { primeiro, restante: itens };
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Merge raso sobrescreve propriedades aninhadas de endereco',
        detail: 'Combine { ...usuario.endereco, ...(alteracoes.endereco ?? {}) } para preservar cidade.',
        line: 6,
        severity: 'ERRO',
      },
      {
        title: 'Use desestruturação com rest em arrays',
        detail: 'const [primeiro = null, ...restante] = itens; separa o primeiro elemento de forma limpa.',
        line: 11,
        severity: 'DICA',
      },
    ],
    focusTags: ['Desestruturação', 'Spread/Rest', 'Imutabilidade'],
  },
  {
    id: 'js-m2-ex06',
    track: 'javascript',
    moduleId: 102,
    orderInModule: 6,
    title: 'Pipeline ES6+ para consolidar pedidos JSON de múltiplas filiais',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Receba uma string JSON com filiais e seus arrays de pedidos. Implemente consolidarFiliais(jsonBruto) usando flatMap/map/filter/reduce e desestruturação para gerar o ranking de filiais por receita líquida (excluindo cancelados).',
    examples: [
      { input: '\'[{"filial":"SP","pedidos":[{"total":300,"status":"OK"},{"total":50,"status":"CANCELADO"}]}]\'', expectedOutput: '[{ filial: "SP", receita: 300, qtd: 1 }]' },
      { input: '"invalid"', expectedOutput: '[]' },
    ],
    requirements: [
      'Parsear JSON com fallback seguro para []',
      'Usar desestruturação + filter + reduce por filial sem mutar dados de entrada',
      'Ordenar resultado em ordem decrescente de receita sem mutar array intermediário',
    ],
    starterCode: `function consolidarFiliais(jsonBruto) {
  const filiais = JSON.parse(jsonBruto);
  return filiais.map((f) => {
    const validos = f.pedidos.filter((p) => p.status !== "CANCELADO");
    const receita = validos.reduce((acc, p) => acc + p.total, 0);
    return { filial: f.filial, receita, qtd: validos.length };
  });
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Falta ordenação decrescente e proteção do JSON.parse',
        detail: 'Trate SyntaxError no parse e use [...resultado].sort((a, b) => b.receita - a.receita).',
        line: 2,
        severity: 'ERRO',
      },
      {
        title: 'Desestruture { filial, pedidos = [] } no parâmetro do map',
        detail: 'Evita erro caso uma filial venha sem a propriedade pedidos.',
        line: 3,
        severity: 'AVISO',
      },
    ],
    focusTags: ['ES6+', 'JSON', 'reduce'],
  },

  // =========================================================================
  // MÓDULO 3 (103): Assincronicidade e APIs (JS)
  // =========================================================================
  {
    id: 'js-m3-ex01',
    track: 'javascript',
    moduleId: 103,
    orderInModule: 1,
    title: 'Criação e consumo de Promises com .then, .catch e .finally',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Implemente consultarEstoquePromesa(sku, mapaEstoque) retornando uma Promise que resolve com a quantidade se encontrada (> 0) ou rejeita com Error se indisponível. Consuma usando .then().catch().finally() registrando finalização.',
    examples: [
      { input: 'consultarEstoquePromesa("P1", { P1: 5 })', expectedOutput: 'Resolve 5 e executa finally' },
      { input: 'consultarEstoquePromesa("P9", { P1: 5 })', expectedOutput: 'Rejeita com "SKU P9 indisponível" e executa finally' },
    ],
    requirements: [
      'Retornar new Promise((resolve, reject) => ...)',
      'Tratar rejeição explicitamente no .catch()',
      'Garantir limpeza de flag de carregamento no .finally()',
    ],
    starterCode: `function consultarEstoquePromesa(sku, mapaEstoque) {
  return new Promise((resolve) => {
    const qtd = mapaEstoque[sku];
    if (qtd > 0) {
      resolve(qtd);
    }
    resolve(0);
  });
}

let carregando = true;
consultarEstoquePromesa("P9", { P1: 5 }).then((qtd) => {
  console.log("Qtd:", qtd);
  carregando = false;
});
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Falta reject() e encadeamento .catch() / .finally()',
        detail: 'Quando o SKU não existir ou for <= 0, chame reject(new Error(...)) e libere carregando no .finally().',
        line: 6,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Promises', '.then/.catch', '.finally'],
  },
  {
    id: 'js-m3-ex02',
    track: 'javascript',
    moduleId: 103,
    orderInModule: 2,
    title: 'Conversão para async/await com tratamento try/catch',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Refatore carregarPedidoCompleto(id, buscarPedido, buscarCliente) de cadeias aninhadas de .then() para async/await com um único bloco try/catch e retorno estruturado em erro.',
    examples: [
      { input: 'carregarPedidoCompleto(10)', expectedOutput: '{ ok: true, pedido: {...}, cliente: {...} }' },
      { input: 'carregarPedidoCompleto(-1) (erro)', expectedOutput: '{ ok: false, erro: "Pedido inválido" }' },
    ],
    requirements: [
      'Converter função para async function usando await sequencial ou paralelo',
      'Capturar falhas com try/catch sem rejeitar sem tratamento',
      'Usar Promise.all quando chamadas independentes puderem rodar juntas',
    ],
    starterCode: `function carregarPedidoCompleto(id, buscarPedido, buscarCliente) {
  return buscarPedido(id).then((pedido) => {
    return buscarCliente(pedido.clienteId).then((cliente) => {
      return { ok: true, pedido, cliente };
    });
  });
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Ausência de .catch() ou try/catch em chamada assíncrona',
        detail: 'Converta para async function com try { ... } catch (err) { return { ok: false, erro: err.message }; }.',
        line: 1,
        severity: 'ERRO',
      },
    ],
    focusTags: ['async/await', 'try/catch', 'Promises'],
  },
  {
    id: 'js-m3-ex03',
    track: 'javascript',
    moduleId: 103,
    orderInModule: 3,
    title: 'Fetch API GET com validação de response.ok e status HTTP',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Implemente buscarCotacao(codigo) usando fetch() em método GET. Como o fetch() só rejeita em erro de rede (e não em 404/500), valide !response.ok antes de chamar response.json() e lance erro informativo com o status HTTP.',
    examples: [
      { input: 'HTTP 200 {"valor": 89.9}', expectedOutput: '{ valor: 89.9 }' },
      { input: 'HTTP 404', expectedOutput: 'Erro lançado: "Falha HTTP 404 ao consultar cotação"' },
    ],
    requirements: [
      'Validar if (!response.ok) antes de ler response.json()',
      'Tratar Content-Type ou falha de JSON dentro de try/catch',
      'Usar encodeURIComponent(codigo) ao montar a URL',
    ],
    starterCode: `async function buscarCotacao(codigo) {
  const resp = await fetch("https://api.exemplo.com/cotacoes/" + codigo);
  const dados = await resp.json();
  return dados;
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'fetch() sem verificação de response.ok',
        detail: 'Em HTTP 404/500 resp.json() pode falhar tentando ler HTML de erro; cheque if (!resp.ok) antes.',
        line: 2,
        severity: 'ERRO',
      },
      {
        title: 'Sanitize parâmetros de rota com encodeURIComponent()',
        detail: 'Evita quebra de URL caso codigo contenha espaços ou caracteres especiais.',
        line: 2,
        severity: 'DICA',
      },
    ],
    focusTags: ['Fetch API', 'GET', 'response.ok'],
  },
  {
    id: 'js-m3-ex04',
    track: 'javascript',
    moduleId: 103,
    orderInModule: 4,
    title: 'Fetch API POST com headers JSON, Bearer token e tratamento 201',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Implemente enviarDespacho(url, payload, token) usando fetch() com método POST, cabeçalhos "Content-Type": "application/json" e "Authorization": "Bearer <token>", corpo JSON.stringify(payload) e tratamento de respostas 204 vs JSON.',
    examples: [
      { input: 'enviarDespacho(url, { placa: "BRA-1A23" }, "tok")', expectedOutput: '{ enviado: true, status: 201, dados: {...} }' },
      { input: 'HTTP 401', expectedOutput: 'Erro: "Não autorizado (401)"' },
    ],
    requirements: [
      'Configurar method: "POST", headers completos e body serializado',
      'Validar resp.ok e tratar resposta 204 No Content sem quebrar resp.json()',
      'Validar token não vazio antes de disparar requisição',
    ],
    starterCode: `async function enviarDespacho(url, payload, token) {
  const resp = await fetch(url, {
    method: "POST",
    body: payload,
  });
  return resp.json();
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Body enviado como objeto sem JSON.stringify e sem Content-Type',
        detail: 'Defina headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } e body: JSON.stringify(payload).',
        line: 3,
        severity: 'ERRO',
      },
      {
        title: 'Verifique resp.ok e resp.status === 204',
        detail: 'Respostas 204 não possuem corpo; chamar resp.json() lançaria SyntaxError.',
        line: 6,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Fetch POST', 'Headers', 'Async/Await'],
  },
  {
    id: 'js-m3-ex05',
    track: 'javascript',
    moduleId: 103,
    orderInModule: 5,
    title: 'Execução concorrente resiliente com Promise.allSettled',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Implemente consultarMultiplosRastreios(codigos, fetcher) usando Promise.allSettled() para consultar todos em paralelo sem cancelar o lote quando um código falhar, separando { concluidos, falhas }.',
    examples: [
      { input: '["C1", "C2-ERRO", "C3"]', expectedOutput: '{ concluidos: [{codigo:"C1",...}, {codigo:"C3",...}], falhas: [{codigo:"C2-ERRO", erro:"..."}] }' },
      { input: '[]', expectedOutput: '{ concluidos: [], falhas: [] }' },
    ],
    requirements: [
      'Substituir Promise.all por Promise.allSettled para tolerância a falhas parciais',
      'Mapear status === "fulfilled" vs "rejected" preservando o código correspondente',
      'Retornar vazio rapidamente se codigos.length === 0',
    ],
    starterCode: `async function consultarMultiplosRastreios(codigos, fetcher) {
  const resultados = await Promise.all(
    codigos.map((codigo) => fetcher(codigo))
  );
  return { concluidos: resultados, falhas: [] };
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Promise.all cancela todo o lote se 1 requisição falhar',
        detail: 'Use Promise.allSettled() e separe resultados com status "fulfilled" e "rejected".',
        line: 2,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Promise.allSettled', 'Concorrência', 'Async'],
  },
  {
    id: 'js-m3-ex06',
    track: 'javascript',
    moduleId: 103,
    orderInModule: 6,
    title: 'Cliente HTTP com timeout (AbortController) e retentativas',
    difficulty: 'Difícil',
    estimatedMinutes: 22,
    prompt:
      'Implemente fetchComTimeout(url, { timeoutMs = 3000, tentativas = 2 }) usando AbortController + setTimeout para abortar requisições travadas, limpando o timer no finally e repetindo apenas em erros transitórios (5xx/AbortError).',
    examples: [
      { input: 'Servidor responde 503 na 1a tentativa e 200 na 2a', expectedOutput: 'Retorna JSON da 2a tentativa' },
      { input: 'Servidor trava > timeoutMs em todas', expectedOutput: 'Lança erro de timeout após esgotar tentativas' },
    ],
    requirements: [
      'Passar controller.signal no fetch() e cancelar com clearTimeout() no finally',
      'Não repetir em erros 4xx (ex.: 400/404)',
      'Propagar erro final após esgotar as tentativas',
    ],
    starterCode: `async function fetchComTimeout(url, { timeoutMs = 3000 } = {}) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("HTTP " + resp.status);
  return resp.json();
}
`,
    fileName: 'index.js',
    runtimeLabel: 'Node 22 / ES6+',
    preloadedImprovements: [
      {
        title: 'Falta AbortController para cancelar requisição travada',
        detail: 'Crie const controller = new AbortController(), agende setTimeout(() => controller.abort(), timeoutMs) e limpe no finally.',
        line: 2,
        severity: 'ERRO',
      },
      {
        title: 'Adicione retentativa controlada apenas para falhas transitórias',
        detail: 'Evite repetir requisições em HTTP 400/401/404 pois o erro é permanente.',
        line: 3,
        severity: 'AVISO',
      },
    ],
    focusTags: ['AbortController', 'Timeout', 'Fetch API'],
  },

  // =========================================================================
  // MÓDULO 4 (104): Fundamentos de TypeScript (TS)
  // =========================================================================
  {
    id: 'js-m4-ex01',
    track: 'javascript',
    moduleId: 104,
    orderInModule: 1,
    title: 'Tipagem básica, arrays tipados e eliminação de any com unknown',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Tipifique corretamente a função somarNotas(notas: number[]): number e reescreva extrairMensagemErro(erro: unknown): string usando narrowing (instanceof Error / typeof) no lugar de any.',
    examples: [
      { input: 'somarNotas([8.5, 9.0, 7.5])', expectedOutput: '25' },
      { input: 'extrairMensagemErro(new Error("Falha"))', expectedOutput: '"Falha"' },
    ],
    requirements: [
      'Substituir todos os tipos any implícitos ou explícitos',
      'Usar unknown para valores externos e aplicar narrowing antes de acessar .message',
      'Tipar arrays como number[] ou readonly number[]',
    ],
    starterCode: `function somarNotas(notas: any[]): any {
  return notas.reduce((acc, n) => acc + n, 0);
}

function extrairMensagemErro(erro: any): string {
  return erro.message || String(erro);
}
`,
    fileName: 'fundamentos.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Tipagem any anula segurança do compilador TS',
        detail: 'Troque notas: any[] por readonly number[] e retorno para number; troque erro: any por unknown.',
        line: 1,
        severity: 'ERRO',
      },
      {
        title: 'Acesso inseguro a .message em valor unknown',
        detail: 'Verifique if (erro instanceof Error) return erro.message; antes de converter com String(erro).',
        line: 6,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Tipagem básica', 'unknown vs any', 'Arrays tipados'],
  },
  {
    id: 'js-m4-ex02',
    track: 'javascript',
    moduleId: 104,
    orderInModule: 2,
    title: 'Contratos de dados com interface e type aliases',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Defina um type alias StatusEntrega = "PENDENTE" | "EM_ROTA" | "ENTREGUE" e uma interface RomaneioItem com id readonly, codigo: string, pesoKg: number, status: StatusEntrega e observacao?: string.',
    examples: [
      { input: 'formatarRomaneio({ id: 1, codigo: "RM-10", pesoKg: 12.4, status: "EM_ROTA" })', expectedOutput: '"[EM_ROTA] RM-10 (12.4 kg)"' },
      { input: 'Alterar item.id = 2', expectedOutput: 'Erro em tempo de compilação (readonly)' },
    ],
    requirements: [
      'Usar type alias para union literal StatusEntrega',
      'Usar interface com campo readonly id e campo opcional observacao?',
      'Remover any dos parâmetros e retorno da função formatarRomaneio',
    ],
    starterCode: `type StatusEntrega = string;

interface RomaneioItem {
  id: number;
  codigo: string;
  pesoKg: any;
  status: StatusEntrega;
}

export function formatarRomaneio(item: any): string {
  return \`[\${item.status}] \${item.codigo} (\${item.pesoKg} kg)\`;
}
`,
    fileName: 'contratos.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'StatusEntrega como string aceita valores inválidos',
        detail: 'Restrinja com union literal: "PENDENTE" | "EM_ROTA" | "ENTREGUE".',
        line: 1,
        severity: 'AVISO',
      },
      {
        title: 'Marque id como readonly e tipifique item: RomaneioItem',
        detail: 'Evita mutações acidentais de ID e elimina o uso de any.',
        line: 4,
        severity: 'ERRO',
      },
    ],
    focusTags: ['interface', 'type alias', 'readonly'],
  },
  {
    id: 'js-m4-ex03',
    track: 'javascript',
    moduleId: 104,
    orderInModule: 3,
    title: 'Funções tipadas com parâmetros opcionais, padrão e callbacks',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Crie filtrarETransformar(itens: string[], transformador: (valor: string, indice: number) => string, prefixoFiltro?: string): string[] garantindo tipagem estrita da assinatura de callback e retorno explícito.',
    examples: [
      { input: 'filtrarETransformar(["sp-01", "rj-02"], v => v.toUpperCase(), "sp")', expectedOutput: '["SP-01"]' },
      { input: 'filtrarETransformar(["a", "b"], (v, i) => `${i}:${v}`)', expectedOutput: '["0:a", "1:b"]' },
    ],
    requirements: [
      'Tipar o callback (valor: string, indice: number) => string',
      'Tratar prefixoFiltro opcional com narrowing seguro',
      'Anotar explicitamente o retorno string[]',
    ],
    starterCode: `export function filtrarETransformar(
  itens: string[],
  transformador: Function,
  prefixoFiltro?: string
) {
  return itens
    .filter((item) => item.startsWith(prefixoFiltro))
    .map((item, idx) => transformador(item, idx));
}
`,
    fileName: 'funcoes.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Tipo genérico Function aceita qualquer assinatura insegura',
        detail: 'Substitua por type Transformador = (valor: string, indice: number) => string.',
        line: 3,
        severity: 'ERRO',
      },
      {
        title: 'prefixoFiltro pode ser undefined no startsWith()',
        detail: 'Se prefixoFiltro não for informado, retorne true no filter antes do map.',
        line: 7,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Funções tipadas', 'Parâmetros opcionais', 'Callbacks'],
  },
  {
    id: 'js-m4-ex04',
    track: 'javascript',
    moduleId: 104,
    orderInModule: 4,
    title: 'Diferenças práticas entre interface (extensão) e type (unions/tuplas)',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Modele EntidadeBase (interface com id e criadoEm), UsuarioSistema extends EntidadeBase, e type Coordenada = [number, number]. Implemente calcularDistanciaRota(origem: Coordenada, destino: Coordenada): number.',
    examples: [
      { input: 'calcularDistanciaRota([0, 0], [3, 4])', expectedOutput: '5' },
      { input: 'criarUsuario({ id: "u1", nome: "Lia" })', expectedOutput: '{ id: "u1", nome: "Lia", criadoEm: "..." }' },
    ],
    requirements: [
      'Usar extends entre interfaces para herdar campos comuns',
      'Usar type para tupla fixa [latitude, longitude]',
      'Anotar todos os parâmetros e retornos sem usar any',
    ],
    starterCode: `interface EntidadeBase {
  readonly id: string;
  criadoEm: string;
}

type Coordenada = number[];

export function calcularDistanciaRota(origem: Coordenada, destino: Coordenada): number {
  const dx = destino[0] - origem[0];
  const dy = destino[1] - origem[1];
  return Math.hypot(dx, dy);
}
`,
    fileName: 'contratos.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'number[] não garante exatamente 2 elementos na tupla',
        detail: 'Defina type Coordenada = readonly [lat: number, lng: number]; para validar em tempo de compilação.',
        line: 6,
        severity: 'AVISO',
      },
    ],
    focusTags: ['interface vs type', 'Tuplas', 'extends'],
  },
  {
    id: 'js-m4-ex05',
    track: 'javascript',
    moduleId: 104,
    orderInModule: 5,
    title: 'Validação de payload unknown vindo de API externa antes do uso',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Implemente parsePedidoExterno(entrada: unknown): PedidoValidado checando passo a passo se entrada é objeto não-nulo, com id (string), valor (number > 0) e itens (array de strings), lançando erro tipado caso falhe.',
    examples: [
      { input: '{ id: "P-1", valor: 120, itens: ["Monitor"] }', expectedOutput: '{ id: "P-1", valor: 120, itens: ["Monitor"] }' },
      { input: '{ id: 123, valor: -10 }', expectedOutput: 'Erro: "Payload inválido"' },
    ],
    requirements: [
      'Receber entrada: unknown (nunca any)',
      'Aplicar narrowing manual (typeof, !== null, Array.isArray, every)',
      'Retornar novo objeto tipado PedidoValidado',
    ],
    starterCode: `export interface PedidoValidado {
  id: string;
  valor: number;
  itens: string[];
}

export function parsePedidoExterno(entrada: any): PedidoValidado {
  return {
    id: entrada.id,
    valor: entrada.valor,
    itens: entrada.itens,
  };
}
`,
    fileName: 'parser.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Entrada tipada como any confia cegamente em dados externos',
        detail: 'Altere para entrada: unknown e valide cada propriedade em runtime antes de montar PedidoValidado.',
        line: 7,
        severity: 'ERRO',
      },
    ],
    focusTags: ['unknown', 'Narrowing', 'Contratos'],
  },
  {
    id: 'js-m4-ex06',
    track: 'javascript',
    moduleId: 104,
    orderInModule: 6,
    title: 'Motor tipado de eventos com sobrecarga e retorno discriminado',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Implemente buscarItem<T extends { id: string }>(lista: readonly T[], id: string): T | null e criarResultado(sucesso, dadoOuErro) com assinatura tipada sem type assertions inseguros (as any).',
    examples: [
      { input: 'buscarItem([{id:"1", nome:"A"}], "1")', expectedOutput: '{ id: "1", nome: "A" }' },
      { input: 'buscarItem([{id:"1"}], "9")', expectedOutput: 'null' },
    ],
    requirements: [
      'Evitar type assertions (as any / as T) no corpo das funções',
      'Retornar null explicitamente quando não encontrado',
      'Garantir readonly no parâmetro lista para não mutar a origem',
    ],
    starterCode: `export function buscarItem(lista: any[], id: string): any {
  const item = lista.find((el) => el.id === id);
  return item as any;
}
`,
    fileName: 'colecoes.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Uso de any e cast "as any" remove verificação de tipos',
        detail: 'Use parâmetro genérico <T extends { readonly id: string }> e retorne (item ?? null).',
        line: 1,
        severity: 'ERRO',
      },
    ],
    focusTags: ['TypeScript', 'Contratos', 'Null safety'],
  },

  // =========================================================================
  // MÓDULO 5 (105): TypeScript Avançado (TS)
  // =========================================================================
  {
    id: 'js-m5-ex01',
    track: 'javascript',
    moduleId: 105,
    orderInModule: 1,
    title: 'Funções genéricas reutilizáveis (<T>) para cache em memória',
    difficulty: 'Fácil',
    estimatedMinutes: 14,
    prompt:
      'Implemente criarRepositorioMemoria<T extends { id: string }>() com métodos salvar(item: T): void, obter(id: string): T | undefined e listar(): T[], preservando o tipo exato T para o chamador.',
    examples: [
      { input: 'repo.salvar({ id: "v1", placa: "BRA-1" }); repo.obter("v1")?.placa', expectedOutput: '"BRA-1" com autocomplete completo' },
      { input: 'repo.listar()', expectedOutput: '[{ id: "v1", placa: "BRA-1" }]' },
    ],
    requirements: [
      'Restringir T com constraint <T extends { id: string }>',
      'Armazenar internamente em Map<string, T>',
      'Retornar cópia em listar() usando Array.from(mapa.values())',
    ],
    starterCode: `export function criarRepositorioMemoria() {
  const mapa = new Map<string, any>();
  return {
    salvar(item: any) {
      mapa.set(item.id, item);
    },
    obter(id: string) {
      return mapa.get(id);
    },
    listar() {
      return Array.from(mapa.values());
    },
  };
}
`,
    fileName: 'generics.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Falta parâmetro genérico <T extends { id: string }>',
        detail: 'Sem Generic, obter() e listar() perdem o tipo original retornando any.',
        line: 1,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Generics', '<T>', 'Constraints'],
  },
  {
    id: 'js-m5-ex02',
    track: 'javascript',
    moduleId: 105,
    orderInModule: 2,
    title: 'Interface genérica Paginacao<T> e wrapper ApiResponse<T>',
    difficulty: 'Fácil',
    estimatedMinutes: 14,
    prompt:
      'Crie as interfaces genéricas ApiResponse<T> ({ ok: true; data: T } | { ok: false; error: string }) e Paginado<T> ({ itens: T[]; total: number; pagina: number }), e implemente embrulharPagina<T>(itens: T[], pagina: number).',
    examples: [
      { input: 'embrulharPagina(["a", "b"], 1)', expectedOutput: '{ ok: true, data: { itens: ["a", "b"], total: 2, pagina: 1 } }' },
      { input: 'Pagina <= 0', expectedOutput: '{ ok: false, error: "Página deve ser >= 1" }' },
    ],
    requirements: [
      'Usar discriminated union em ApiResponse<T>',
      'Compor ApiResponse<Paginado<T>> sem duplicar interfaces',
      'Retornar erro estruturado quando pagina < 1',
    ],
    starterCode: `export interface Paginado<T> {
  itens: T[];
  total: number;
  pagina: number;
}

export function embrulharPagina<T>(itens: T[], pagina: number): any {
  return {
    ok: true,
    data: { itens, total: itens.length, pagina },
  };
}
`,
    fileName: 'api-types.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Retorno tipado como any em função genérica',
        detail: 'Defina type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string } e anote o retorno.',
        line: 7,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Interfaces genéricas', 'Discriminated Union', '<T>'],
  },
  {
    id: 'js-m5-ex03',
    track: 'javascript',
    moduleId: 105,
    orderInModule: 3,
    title: 'Utility Types: Partial, Omit e Pick em DTOs de atualização',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Dado Produto { id: string; sku: string; nome: string; preco: number; estoque: number }, derive CriarProdutoDTO = Omit<Produto, "id">, AtualizarProdutoDTO = Partial<Omit<Produto, "id" | "sku">> e ResumoProduto = Pick<Produto, "id" | "nome" | "preco">.',
    examples: [
      { input: 'aplicarPatch(produto, { preco: 199 })', expectedOutput: 'Produto atualizado preservando id e sku originais' },
      { input: 'resumirProduto(produto)', expectedOutput: '{ id, nome, preco }' },
    ],
    requirements: [
      'Usar Omit e Partial para impedir alteração de id e sku no patch',
      'Usar Pick para gerar projeção enxuta sem vazar estoque',
      'Evitar mutar o objeto produto recebido em aplicarPatch',
    ],
    starterCode: `export interface Produto {
  readonly id: string;
  readonly sku: string;
  nome: string;
  preco: number;
  estoque: number;
}

export function aplicarPatch(atual: Produto, patch: any): Produto {
  return Object.assign(atual, patch);
}
`,
    fileName: 'dtos.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'patch: any permite sobrescrever id e sku readonly',
        detail: 'Use type AtualizarProdutoDTO = Partial<Omit<Produto, "id" | "sku">> e retorne { ...atual, ...patch }.',
        line: 9,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Partial', 'Omit', 'Pick'],
  },
  {
    id: 'js-m5-ex04',
    track: 'javascript',
    moduleId: 105,
    orderInModule: 4,
    title: 'Dicionários exaustivos com Record<K, V> e chaves de união',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Defina type CanalNotificacao = "EMAIL" | "SMS" | "WEBHOOK" e crie CONFIG_CANAIS: Record<CanalNotificacao, { ativo: boolean; timeoutMs: number }>. Implemente obterConfigCanal(canal: CanalNotificacao).',
    examples: [
      { input: 'obterConfigCanal("WEBHOOK")', expectedOutput: '{ ativo: true, timeoutMs: 5000 }' },
      { input: 'contarPorCanal(["EMAIL", "EMAIL", "SMS"])', expectedOutput: '{ EMAIL: 2, SMS: 1, WEBHOOK: 0 }' },
    ],
    requirements: [
      'Usar Record<CanalNotificacao, ...> garantindo cobertura exaustiva de todas as chaves',
      'Inicializar contador zerado tipado com Record<CanalNotificacao, number>',
      'Evitar índice genérico { [key: string]: number }',
    ],
    starterCode: `export type CanalNotificacao = "EMAIL" | "SMS" | "WEBHOOK";

const CONFIG_CANAIS: { [key: string]: { ativo: boolean; timeoutMs: number } } = {
  EMAIL: { ativo: true, timeoutMs: 3000 },
  SMS: { ativo: false, timeoutMs: 2000 },
};

export function obterConfigCanal(canal: CanalNotificacao) {
  return CONFIG_CANAIS[canal];
}
`,
    fileName: 'records.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Index signature { [key: string] } não detecta falta da chave WEBHOOK',
        detail: 'Troque por Record<CanalNotificacao, ConfigCanal> para o TypeScript exigir todas as chaves da união.',
        line: 3,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Record<K, V>', 'Union Types', 'Exaustividade'],
  },
  {
    id: 'js-m5-ex05',
    track: 'javascript',
    moduleId: 105,
    orderInModule: 5,
    title: 'Union & Intersection Types (| e &) com Type Guards personalizados',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Crie os tipos EntregaTerrestre ({ modal: "RODO"; placa: string }) e EntregaAerea ({ modal: "AEREO"; voo: string }), combinando com MetadadosAuditoria via Intersection (&). Implemente o Type Guard isEntregaAerea(e): e is EntregaAerea.',
    examples: [
      { input: 'descreverEntrega({ id:"1", modal:"AEREO", voo:"LA304", criadoPor:"ops" })', expectedOutput: '"Voo LA304 (por ops)"' },
      { input: 'isEntregaAerea(itemTerrestre)', expectedOutput: 'false' },
    ],
    requirements: [
      'Combinar campos compartilhados usando Intersection Type (&)',
      'Implementar predicate Type Guard: item is ComAuditoria<EntregaAerea>',
      'Garantir checagem exaustiva com never no caso impossível',
    ],
    starterCode: `export interface Metadados {
  id: string;
  criadoPor: string;
}

export interface EntregaTerrestre {
  modal: "RODO";
  placa: string;
}

export interface EntregaAerea {
  modal: "AEREO";
  voo: string;
}

export function descreverEntrega(e: any): string {
  if (e.modal === "AEREO") {
    return \`Voo \${e.voo}\`;
  }
  return \`Placa \${e.placa}\`;
}
`,
    fileName: 'guards.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Crie Union + Intersection Types no lugar de any',
        detail: 'Defina type EntregaComAuditoria = (EntregaTerrestre | EntregaAerea) & Metadados; e implemente isEntregaAerea(e).',
        line: 16,
        severity: 'ERRO',
      },
      {
        title: 'Adicione verificação exaustiva com never',
        detail: 'Um helper assertNever(x: never): never garante erro de compilação se um novo modal for adicionado.',
        line: 18,
        severity: 'DICA',
      },
    ],
    focusTags: ['Union & Intersection', 'Type Guards', 'never'],
  },
  {
    id: 'js-m5-ex06',
    track: 'javascript',
    moduleId: 105,
    orderInModule: 6,
    title: 'Pipeline tipado com Generics, Type Guards e agrupamento Record',
    difficulty: 'Difícil',
    estimatedMinutes: 22,
    prompt:
      'Implemente agruparPor<T, K extends string>(itens: readonly T[], obterChave: (item: T) => K): Record<K, T[]> e um Type Guard isRegistroValido(x: unknown) para filtrar itens crus antes do agrupamento seguro.',
    examples: [
      { input: 'agruparPor([{uf:"SP",v:1},{uf:"RJ",v:2},{uf:"SP",v:3}], x => x.uf)', expectedOutput: '{ SP: [{uf:"SP",v:1},{uf:"SP",v:3}], RJ: [{uf:"RJ",v:2}] }' },
      { input: 'isRegistroValido({ uf: "MG" })', expectedOutput: 'true' },
    ],
    requirements: [
      'Combinar dois parâmetros genéricos <T, K extends string>',
      'Construir dicionário Record<K, T[]> sem mutar os itens',
      'Usar Type Guard com predicate (x is ...) antes de agrupar entradas unknown[]',
    ],
    starterCode: `export function agruparPor(itens: any[], obterChave: (item: any) => string) {
  const grupos: any = {};
  for (const item of itens) {
    const chave = obterChave(item);
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(item);
  }
  return grupos;
}
`,
    fileName: 'pipeline.ts',
    runtimeLabel: 'TypeScript 5',
    preloadedImprovements: [
      {
        title: 'Tipagem any perde relação entre item e chave retornada',
        detail: 'Declare <T, K extends string>(itens: readonly T[], obterChave: (item: T) => K): Partial<Record<K, T[]>>.',
        line: 1,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Generics', 'Record', 'Type Guards'],
  },
];
