import type { Exercise } from '../types/javalab';

export const PYTHON_TRACK_EXERCISES: Exercise[] = [
  // =========================================================================
  // MÓDULO 1 (301): Sintaxe e Estruturas Nativas
  // =========================================================================
  {
    id: 'py-m1-ex01',
    track: 'python',
    moduleId: 301,
    orderInModule: 1,
    title: 'Conversão de tipos (casting) e fatiamento (slicing) de códigos',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    prompt:
      'Implemente extrair_lote(codigo: str, valor_str: str) -> tuple[str, str, float] recebendo um código no formato "SP-2026-0042" e um valor em texto com vírgula ("149,90"). Use slicing para separar UF (2 primeiros caracteres), ano (índices 3:7) e casting float após substituir vírgula por ponto.',
    examples: [
      { input: 'extrair_lote("SP-2026-0042", "149,90")', expectedOutput: '("SP", "2026", 149.9)' },
      { input: 'extrair_lote(" rj-2025-0010 ", "80")', expectedOutput: '("RJ", "2025", 80.0)' },
    ],
    requirements: [
      'Limpar espaços e normalizar maiúsculas com .strip().upper()',
      'Usar slicing codigo[:2] e codigo[3:7]',
      'Converter valor_str com float(valor_str.replace(",", "."))',
    ],
    starterCode: `def extrair_lote(codigo, valor_str):
    uf = codigo[0:2]
    ano = codigo[3:7]
    valor = int(valor_str)
    return uf, ano, valor

print(extrair_lote("SP-2026-0042", "149.90"))
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Casting int() perde decimais e falha em strings com ponto/vírgula',
        detail: 'Use float(valor_str.strip().replace(",", ".")) e adicione Type Hints na assinatura.',
        line: 4,
        severity: 'ERRO',
      },
      {
        title: 'Falta .strip().upper() antes do slicing',
        detail: 'Espaços à esquerda deslocam os índices de fatiamento.',
        line: 2,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Casting', 'Slicing', 'Strings'],
  },
  {
    id: 'py-m1-ex02',
    track: 'python',
    moduleId: 301,
    orderInModule: 2,
    title: 'Classificador de faixas com if / elif / else e validação de limites',
    difficulty: 'Fácil',
    estimatedMinutes: 10,
    prompt:
      'Crie classificar_carga(peso_kg: float) -> str usando if/elif/else: peso <= 0 -> "INVALIDO", <= 5 -> "LEVE", <= 30 -> "MEDIO", > 30 -> "PESADO".',
    examples: [
      { input: 'classificar_carga(5.0)', expectedOutput: '"LEVE"' },
      { input: 'classificar_carga(0) / classificar_carga(42.5)', expectedOutput: '"INVALIDO" / "PESADO"' },
    ],
    requirements: [
      'Usar cadeia clara if / elif / else sem condições redundantes',
      'Tratar valores negativos e zero no primeiro ramo',
      'Adicionar Type Hints (-> str)',
    ],
    starterCode: `def classificar_carga(peso_kg):
    if peso_kg <= 5:
        return "LEVE"
    if peso_kg <= 30:
        return "MEDIO"
    if peso_kg > 30:
        return "PESADO"
    return "INVALIDO"
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Pesos <= 0 caem em "LEVE" antes do retorno "INVALIDO"',
        detail: 'Valide if peso_kg <= 0: return "INVALIDO" logo no topo e encadeie com elif.',
        line: 2,
        severity: 'ERRO',
      },
    ],
    focusTags: ['if/elif/else', 'Type Hints', 'Validação'],
  },
  {
    id: 'py-m1-ex03',
    track: 'python',
    moduleId: 301,
    orderInModule: 3,
    title: 'Laços for e while com break e continue em processamento de fila',
    difficulty: 'Médio',
    estimatedMinutes: 14,
    prompt:
      'Implemente carregar_caminhao(pesos: list[float], limite_kg: float) -> list[float] usando for/while: ignore itens <= 0 com continue e interrompa imediatamente com break caso um item igual a -999 (sentinela de parada) apareça ou quando o próximo peso ultrapassar limite_kg.',
    examples: [
      { input: 'carregar_caminhao([10, -1, 25, 30], 40)', expectedOutput: '[10, 25] (soma 35; 30 excederia 40)' },
      { input: 'carregar_caminhao([10, -999, 5], 50)', expectedOutput: '[10] (para em -999)' },
    ],
    requirements: [
      'Usar continue para descartar pesos <= 0 (exceto sentinela -999)',
      'Usar break ao encontrar sentinela -999',
      'Verificar limite_kg antes de incluir o item',
    ],
    starterCode: `def carregar_caminhao(pesos: list[float], limite_kg: float) -> list[float]:
    carregados: list[float] = []
    soma = 0.0
    for p in pesos:
        if p == -999:
            break
        if soma + p <= limite_kg:
            carregados.append(p)
            soma += p
    return carregados
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Pesos inválidos (0 ou negativos) estão sendo aceitos no caminhão',
        detail: 'Logo após checar -999, adicione if p <= 0: continue para ignorar pesos inválidos.',
        line: 7,
        severity: 'ERRO',
      },
    ],
    focusTags: ['for/while', 'break/continue', 'Listas'],
  },
  {
    id: 'py-m1-ex04',
    track: 'python',
    moduleId: 301,
    orderInModule: 4,
    title: 'Listas, Tuplas, Sets e Dicionários em consolidação de rotas',
    difficulty: 'Médio',
    estimatedMinutes: 14,
    prompt:
      'Dada uma lista de tuplas (cidade, sku, quantidade), implemente resumir_destinos(envios: list[tuple[str, str, int]]) -> dict[str, dict] retornando para cada cidade o total de unidades e um conjunto ordenado de SKUs únicos (usando set -> sorted(list)).',
    examples: [
      { input: '[("SP", "A1", 2), ("SP", "A1", 3), ("RJ", "B2", 1)]', expectedOutput: '{"SP": {"total": 5, "skus": ["A1"]}, "RJ": {"total": 1, "skus": ["B2"]}}' },
      { input: '[]', expectedOutput: '{}' },
    ],
    requirements: [
      'Usar desempacotamento de tupla no laço for cidade, sku, qtd in envios',
      'Usar set para deduplicar SKUs por cidade',
      'Retornar lista ordenada de SKUs sem modificar a entrada',
    ],
    starterCode: `def resumir_destinos(envios: list[tuple[str, str, int]]) -> dict[str, dict]:
    resumo = {}
    for item in envios:
        cidade = item[0]
        if cidade not in resumo:
            resumo[cidade] = {"total": 0, "skus": []}
        resumo[cidade]["total"] += item[2]
        resumo[cidade]["skus"].append(item[1])
    return resumo
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'SKUs repetidos duplicam na lista em vez de usar set()',
        detail: 'Acumule os SKUs em um set() e converta com sorted(...) na saída final.',
        line: 6,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Tuplas', 'Sets', 'Dicionários'],
  },
  {
    id: 'py-m1-ex05',
    track: 'python',
    moduleId: 301,
    orderInModule: 5,
    title: 'List & Dict Comprehensions para filtrar e normalizar cargas válidas',
    difficulty: 'Difícil',
    estimatedMinutes: 16,
    prompt:
      'Dada uma lista de tuplas (codigo, peso_kg, status), use Dict Comprehension para retornar {codigo_limpo: peso_kg} contendo apenas itens com status == "OK" e peso_kg > 0, normalizando o código com .strip().upper().',
    examples: [
      { input: '[(" c1 ", 120.5, "OK"), ("C2", 0, "OK"), ("C3", 40.0, "ERRO")]', expectedOutput: '{"C1": 120.5}' },
      { input: '[("x9", 10.0, "ok")]', expectedOutput: '{"X9": 10.0}' },
    ],
    requirements: [
      'Resolver com Dict Comprehension idiomática em Python',
      'Normalizar código (.strip().upper()) e status (.strip().upper())',
      'Incluir Type Hints na função',
    ],
    starterCode: `def filtrar_cargas_validas(registros):
    resultado = {}
    for cod, peso, status in registros:
        if status == "OK" and peso > 0:
            resultado[cod] = peso
    return resultado

dados = [(" c1 ", 120.5, "OK"), ("C2", 0, "OK"), ("C3", 40.0, "ERRO")]
print(filtrar_cargas_validas(dados))
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Substitua o loop manual por Dict Comprehension + Type Hints',
        detail: 'Use {cod.strip().upper(): peso for cod, peso, st in registros if st.strip().upper() == "OK" and peso > 0}.',
        line: 2,
        severity: 'DICA',
      },
    ],
    focusTags: ['Dict Comprehension', 'Slicing', 'Pythonic'],
  },
  {
    id: 'py-m1-ex06',
    track: 'python',
    moduleId: 301,
    orderInModule: 6,
    title: 'Janela deslizante com slicing e List Comprehension para média móvel',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Implemente media_movel(valores: list[float], janela: int) -> list[float] usando slicing valores[i:i + janela] dentro de uma List Comprehension. Valide janela > 0 e retorne lista vazia se janela > len(valores).',
    examples: [
      { input: 'media_movel([10, 20, 30, 40], 2)', expectedOutput: '[15.0, 25.0, 35.0]' },
      { input: 'media_movel([5, 10], 5)', expectedOutput: '[]' },
    ],
    requirements: [
      'Lançar ValueError se janela <= 0',
      'Usar slicing e List Comprehension com round(..., 2)',
      'Retornar [] quando len(valores) < janela',
    ],
    starterCode: `def media_movel(valores: list[float], janela: int) -> list[float]:
    return [sum(valores[i : i + janela]) / janela for i in range(len(valores))]
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'range(len(valores)) cria janelas incompletas no fim e divide por janela errado',
        detail: 'Use range(len(valores) - janela + 1) e valide if janela <= 0: raise ValueError(...).',
        line: 2,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Slicing', 'List Comprehension', 'Janela deslizante'],
  },

  // =========================================================================
  // MÓDULO 2 (302): Funções e Modularização
  // =========================================================================
  {
    id: 'py-m2-ex01',
    track: 'python',
    moduleId: 302,
    orderInModule: 1,
    title: 'Argumentos posicionais, nomeados e armadilha do default mutável',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Corrija a função adicionar_etiqueta(etiqueta: str, lista: list[str] | None = None) -> list[str] que usa lista=[] como argumento padrão (compartilhado entre chamadas em Python) e permita passagem por argumentos nomeados.',
    examples: [
      { input: 'adicionar_etiqueta("FRAGIL"); adicionar_etiqueta("URGENTE")', expectedOutput: '["FRAGIL"] e ["URGENTE"] (listas independentes)' },
      { input: 'adicionar_etiqueta(etiqueta="VIP", lista=["BASE"])', expectedOutput: '["BASE", "VIP"]' },
    ],
    requirements: [
      'Substituir lista: list[str] = [] por lista: list[str] | None = None',
      'Criar nova lista quando lista is None para não mutar chamadas anteriores',
      'Suportar argumentos posicionais e nomeados',
    ],
    starterCode: `def adicionar_etiqueta(etiqueta: str, lista: list[str] = []) -> list[str]:
    lista.append(etiqueta.strip().upper())
    return lista

print(adicionar_etiqueta("fragil"))
print(adicionar_etiqueta("urgente"))
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Argumento padrão mutável ([]) vaza estado entre chamadas',
        detail: 'Em Python, o valor default [] é avaliado uma única vez na definição da função. Use None e crie uma cópia/nova lista dentro do corpo.',
        line: 1,
        severity: 'ERRO',
      },
    ],
    focusTags: ['def', 'Default mutável', 'Argumentos nomeados'],
  },
  {
    id: 'py-m2-ex02',
    track: 'python',
    moduleId: 302,
    orderInModule: 2,
    title: 'Leitura segura de arquivo .txt com gerenciador de contexto with open',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Implemente contar_linhas_validas(caminho: str) -> int lendo um arquivo .txt com with open(caminho, "r", encoding="utf-8"), ignorando linhas em branco ou comentadas (#) e tratando FileNotFoundError.',
    examples: [
      { input: 'Arquivo com 3 linhas válidas e 1 linha "# comentario"', expectedOutput: '3' },
      { input: 'Arquivo inexistente', expectedOutput: '0 (tratando FileNotFoundError)' },
    ],
    requirements: [
      'Abrir arquivo obrigatoriamente com with open(..., encoding="utf-8")',
      'Capturar especificamente FileNotFoundError (nunca except: genérico)',
      'Ignorar linhas vazias e iniciadas com #',
    ],
    starterCode: `def contar_linhas_validas(caminho: str) -> int:
    try:
        f = open(caminho, "r")
        linhas = f.readlines()
        return len(linhas)
    except:
        return 0
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'open() sem Context Manager (with) e cláusula except: genérica',
        detail: 'Use with open(caminho, "r", encoding="utf-8") as f: e capture except FileNotFoundError:.',
        line: 3,
        severity: 'ERRO',
      },
    ],
    focusTags: ['with open', 'Arquivos .txt', 'Exceções'],
  },
  {
    id: 'py-m2-ex03',
    track: 'python',
    moduleId: 302,
    orderInModule: 3,
    title: 'Funções flexíveis com *args e **kwargs para filtros dinâmicos',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Implemente registrar_evento(origem: str, *tags: str, **metadados: str | int) -> dict e filtrar_registros(registros: list[dict], **criterios) usando *args para múltiplos rótulos e **kwargs para critérios dinâmicos de igualdade.',
    examples: [
      { input: 'registrar_evento("API", "auth", "http", status=200)', expectedOutput: '{"origem": "API", "tags": ["AUTH", "HTTP"], "meta": {"status": 200}}' },
      { input: 'filtrar_registros(lista, uf="SP", ativo=True)', expectedOutput: 'Apenas dicionários onde item["uf"] == "SP" e item["ativo"] is True' },
    ],
    requirements: [
      'Usar *tags para receber quantidade variável de strings',
      'Usar **criterios com all(item.get(k) == v for k, v in criterios.items())',
      'Anotar tipos com Type Hints',
    ],
    starterCode: `def registrar_evento(origem: str, *tags: str, **metadados) -> dict:
    return {
        "origem": origem,
        "tags": [t.strip().upper() for t in tags],
        "meta": metadados,
    }

def filtrar_registros(registros: list[dict], **criterios) -> list[dict]:
    # Implemente filtragem usando **criterios
    return registros
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Implemente a checagem de **criterios com all()',
        detail: 'Use [r for r in registros if all(r.get(k) == v for k, v in criterios.items())].',
        line: 9,
        severity: 'DICA',
      },
    ],
    focusTags: ['*args', '**kwargs', 'Modularização'],
  },
  {
    id: 'py-m2-ex04',
    track: 'python',
    moduleId: 302,
    orderInModule: 4,
    title: 'Blocos try / except / finally e levantamento explícito com raise',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Crie dividir_rateio(valor_total: float, qtd_caixas: int) -> float validando entradas com raise ValueError se valor_total < 0 ou qtd_caixas <= 0. Envolva o processamento em try/except/finally registrando log de encerramento.',
    examples: [
      { input: 'dividir_rateio(150.0, 3)', expectedOutput: '50.0' },
      { input: 'dividir_rateio(150.0, 0)', expectedOutput: 'raise ValueError("Quantidade de caixas deve ser > 0")' },
    ],
    requirements: [
      'Validar pré-condições com raise ValueError(...)',
      'Nunca usar except: nu; capturar ValueError ou ZeroDivisionError',
      'Executar limpeza/auditoria no bloco finally',
    ],
    starterCode: `def dividir_rateio(valor_total: float, qtd_caixas: int) -> float:
    try:
        return round(valor_total / qtd_caixas, 2)
    except:
        return 0.0
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'except: nu engole erro de divisão por zero retornando 0.0 silencioso',
        detail: 'Valide if qtd_caixas <= 0: raise ValueError(...) antes e remova o except: genérico.',
        line: 4,
        severity: 'ERRO',
      },
    ],
    focusTags: ['try/except/finally', 'raise', 'Exceções'],
  },
  {
    id: 'py-m2-ex05',
    track: 'python',
    moduleId: 302,
    orderInModule: 5,
    title: 'Leitura e agregação de arquivo .csv com csv.DictReader e with open',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Implemente consolidar_csv_frete(caminho_csv: str) -> dict[str, float] abrindo o arquivo com with open(..., newline="", encoding="utf-8") e csv.DictReader para somar valor_frete por transportadora, pulando linhas com valores inválidos via try/except ValueError.',
    examples: [
      { input: 'CSV com 2 linhas TransSul (120.5 e 79.5) e 1 linha inválida "N/A"', expectedOutput: '{"TransSul": 200.0}' },
      { input: 'CSV inexistente', expectedOutput: 'Lança FileNotFoundError informativo' },
    ],
    requirements: [
      'Usar csv.DictReader com newline="" e encoding="utf-8"',
      'Tratar conversão float(linha["valor_frete"]) com try/except (ValueError, KeyError)',
      'Arredondar totais para 2 casas decimais',
    ],
    starterCode: `import csv

def consolidar_csv_frete(caminho_csv: str) -> dict[str, float]:
    totais: dict[str, float] = {}
    f = open(caminho_csv, "r")
    leitor = csv.DictReader(f)
    for row in leitor:
        transp = row["transportadora"]
        totais[transp] = totais.get(transp, 0.0) + float(row["valor_frete"])
    return totais
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'open() sem with e ausência de try/except ValueError na linha',
        detail: 'Use with open(caminho_csv, "r", newline="", encoding="utf-8") as f: e proteja float(...) contra dados sujos.',
        line: 5,
        severity: 'ERRO',
      },
    ],
    focusTags: ['csv.DictReader', 'with open', 'Exceções'],
  },
  {
    id: 'py-m2-ex06',
    track: 'python',
    moduleId: 302,
    orderInModule: 6,
    title: 'Pipeline CSV -> validação -> exportação JSON com with open e json.dump',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Implemente exportar_resumo_json(caminho_csv: str, caminho_json: str) -> dict lendo pedidos de um CSV com csv.DictReader, ignorando registros sem id ou peso <= 0, gravando o JSON consolidado com json.dump(..., ensure_ascii=False, indent=2) via with open.',
    examples: [
      { input: '2 linhas válidas e 1 com peso -5', expectedOutput: 'Grava JSON com total_validos=2, ignorados=1, peso_total=...' },
      { input: 'Caminho CSV inexistente', expectedOutput: 'Lança FileNotFoundError sem criar JSON parcial' },
    ],
    requirements: [
      'Ler e validar todo o CSV antes de abrir caminho_json para escrita',
      'Usar ensure_ascii=False e indent=2 no json.dump()',
      'Retornar o dicionário de resumo gerado',
    ],
    starterCode: `import csv
import json

def exportar_resumo_json(caminho_csv: str, caminho_json: str) -> dict:
    # Leia caminho_csv com csv.DictReader, valide registros e grave caminho_json
    resumo = {"total_validos": 0, "ignorados": 0, "peso_total": 0.0}
    with open(caminho_json, "w", encoding="utf-8") as out:
        json.dump(resumo, out)
    return resumo
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Abra o JSON somente após ler e validar todo o CSV',
        detail: 'Evita gravar um JSON vazio caso o arquivo CSV de entrada não exista ou falhe.',
        line: 7,
        severity: 'AVISO',
      },
    ],
    focusTags: ['CSV', 'JSON', 'with open'],
  },

  // =========================================================================
  // MÓDULO 3 (303): Orientação a Objetos (POO)
  // =========================================================================
  {
    id: 'py-m3-ex01',
    track: 'python',
    moduleId: 303,
    orderInModule: 1,
    title: 'Classe, construtor __init__ e atributos de instância (self)',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Crie a classe Pacote com __init__(self, codigo: str, peso_kg: float) validando peso_kg > 0 (senão raise ValueError) e um atributo de instância etiqueta_emitida: bool = False. Evite atributos mutáveis de classe compartilhados.',
    examples: [
      { input: 'p = Pacote("PK-1", 4.5)', expectedOutput: 'p.codigo == "PK-1", p.peso_kg == 4.5, p.etiqueta_emitida is False' },
      { input: 'Pacote("PK-2", -1)', expectedOutput: 'raise ValueError("Peso deve ser positivo")' },
    ],
    requirements: [
      'Inicializar todos os atributos no __init__ ligados a self',
      'Normalizar codigo com .strip().upper()',
      'Validar peso_kg > 0 no construtor',
    ],
    starterCode: `class Pacote:
    historico = []

    def __init__(self, codigo: str, peso_kg: float) -> None:
        self.codigo = codigo
        self.peso_kg = peso_kg
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Lista historico definida na classe é compartilhada entre todas as instâncias',
        detail: 'Mova self.historico: list[str] = [] para dentro do __init__ e valide if peso_kg <= 0: raise ValueError(...).',
        line: 2,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Classes', '__init__', 'self'],
  },
  {
    id: 'py-m3-ex02',
    track: 'python',
    moduleId: 303,
    orderInModule: 2,
    title: 'Métodos de instância e transição controlada de estado',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Na classe Remessa(codigo, status="CRIADO"), implemente métodos de instância despachar() e entregar(). Só permita entregar() se o status atual for "EM_ROTA", caso contrário lance ValueError.',
    examples: [
      { input: 'r = Remessa("RM-1"); r.despachar(); r.entregar()', expectedOutput: 'r.status == "ENTREGUE"' },
      { input: 'r = Remessa("RM-2"); r.entregar()', expectedOutput: 'raise ValueError("Remessa precisa ser despachada antes")' },
    ],
    requirements: [
      'Encapsular regras de transição nos métodos da classe',
      'Lançar ValueError em transições inválidas',
      'Retornar self.status ou bool claro',
    ],
    starterCode: `class Remessa:
    def __init__(self, codigo: str) -> None:
        self.codigo = codigo
        self.status = "CRIADO"

    def despachar(self) -> None:
        self.status = "EM_ROTA"

    def entregar(self) -> None:
        self.status = "ENTREGUE"
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'entregar() permite pular direto de CRIADO para ENTREGUE',
        detail: 'Valide if self.status != "EM_ROTA": raise ValueError(...) antes de atualizar self.status.',
        line: 9,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Métodos de instância', 'Estado', 'POO'],
  },
  {
    id: 'py-m3-ex03',
    track: 'python',
    moduleId: 303,
    orderInModule: 3,
    title: 'Herança simples e reaproveitamento via super().__init__()',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Crie a classe base Veiculo(placa: str, capacidade_kg: float) e a subclasse CaminhaoRefrigerado(placa, capacidade_kg, temp_minima_c: float) chamando super().__init__(placa, capacidade_kg) e sobrescrevendo calcular_autonomia().',
    examples: [
      { input: 'c = CaminhaoRefrigerado("BRA-1A23", 5000, -18)', expectedOutput: 'c.placa == "BRA-1A23", c.temp_minima_c == -18' },
      { input: 'c.consumo_estimado(100)', expectedOutput: 'Inclui acréscimo de refrigeração sobre o método da classe pai' },
    ],
    requirements: [
      'Usar super().__init__(...) na subclasse sem duplicar código da base',
      'Sobrescrever método mantendo compatibilidade de assinatura',
      'Anotar todos os tipos com Type Hints',
    ],
    starterCode: `class Veiculo:
    def __init__(self, placa: str, capacidade_kg: float) -> None:
        self.placa = placa.strip().upper()
        self.capacidade_kg = capacidade_kg

    def consumo_estimado(self, km: float) -> float:
        return round(km * 0.35, 2)

class CaminhaoRefrigerado(Veiculo):
    def __init__(self, placa: str, capacidade_kg: float, temp_minima_c: float) -> None:
        self.placa = placa
        self.temp_minima_c = temp_minima_c
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Subclasse reatribuiu self.placa manualmente e esqueceu super().__init__',
        detail: 'Chame super().__init__(placa, capacidade_kg) para reaproveitar normalização e self.capacidade_kg.',
        line: 11,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Herança', 'super()', 'POO'],
  },
  {
    id: 'py-m3-ex04',
    track: 'python',
    moduleId: 303,
    orderInModule: 4,
    title: 'Polimorfismo com herança para cálculo de frete por modal',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Implemente classe base Frete(distancia_km, peso_kg) com calcular(), e subclasses FreteExpresso (adicional de 45% e taxa fixa R$ 25) e FreteEconomico (desconto de 15%), permitindo somar uma lista mista de fretes polimorficamente.',
    examples: [
      { input: 'FreteExpresso(100, 10).calcular() (base = dist*0.5 + peso*2 = 70)', expectedOutput: '126.5 (70 * 1.45 + 25)' },
      { input: 'totalizar_fretes([FreteExpresso(...), FreteEconomico(...)])', expectedOutput: 'Soma exata chamando f.calcular()' },
    ],
    requirements: [
      'Reaproveitar o cálculo base via super().calcular()',
      'Evitar isinstance() dentro de totalizar_fretes()',
      'Validar distância e peso > 0 no construtor base',
    ],
    starterCode: `class Frete:
    def __init__(self, distancia_km: float, peso_kg: float) -> None:
        self.distancia_km = distancia_km
        self.peso_kg = peso_kg

    def calcular(self) -> float:
        return self.distancia_km * 0.5 + self.peso_kg * 2.0

def totalizar_fretes(itens: list[Frete]) -> float:
    return round(sum(f.calcular() for f in itens), 2)
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Crie subclasses FreteExpresso e FreteEconomico sobrescrevendo calcular()',
        detail: 'Use round(super().calcular() * 1.45 + 25.0, 2) em FreteExpresso e round(super().calcular() * 0.85, 2) em FreteEconomico.',
        line: 6,
        severity: 'DICA',
      },
    ],
    focusTags: ['Polimorfismo', 'Herança', 'super()'],
  },
  {
    id: 'py-m3-ex05',
    track: 'python',
    moduleId: 303,
    orderInModule: 5,
    title: 'Dunder Methods: __str__ (usuário) vs __repr__ (debug) e __eq__',
    difficulty: 'Difícil',
    estimatedMinutes: 18,
    prompt:
      'Implemente na classe Motorista(cpf: str, nome: str, cnh_categoria: str) os métodos especiais __repr__ (representação inequívoca estilo Motorista(cpf="...", nome="...", cnh_categoria="...")) e __str__ (legível "Carlos Lima (CNH E)"), além de __eq__ comparando pelo CPF limpo.',
    examples: [
      { input: 'str(Motorista("123.456.789-00", "Carlos", "E"))', expectedOutput: '"Carlos (CNH E)"' },
      { input: 'Motorista("12345678900", "A", "B") == Motorista("123.456.789-00", "A", "B")', expectedOutput: 'True' },
    ],
    requirements: [
      'Diferenciar __repr__ (reprodutível/debug) de __str__ (exibição humana)',
      'Retornar NotImplemented em __eq__ quando other não for Motorista',
      'Normalizar CPF removendo pontos e hífen no __init__',
    ],
    starterCode: `class Motorista:
    def __init__(self, cpf: str, nome: str, cnh_categoria: str) -> None:
        self.cpf = cpf
        self.nome = nome.strip()
        self.cnh_categoria = cnh_categoria.strip().upper()

    def __str__(self) -> str:
        return f"Motorista({self.cpf})"
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Faltam __repr__ e __eq__ com verificação isinstance(..., Motorista)',
        detail: '__str__ deve ser legível ao usuário; __repr__ mostra os argumentos exatos de criação.',
        line: 7,
        severity: 'AVISO',
      },
    ],
    focusTags: ['__str__', '__repr__', '__eq__'],
  },
  {
    id: 'py-m3-ex06',
    track: 'python',
    moduleId: 303,
    orderInModule: 6,
    title: 'Sistema POO de Romaneio com composição, herança e Dunder Methods',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Modele ItemCarga(sku, peso_kg) e Romaneio(codigo, capacidade_max_kg) implementando __len__ (quantidade de itens), __str__ (resumo com ocupação %) e adicionar_item(item) impedindo ultrapassar capacidade_max_kg.',
    examples: [
      { input: 'len(romaneio) após adicionar 2 itens', expectedOutput: '2' },
      { input: 'Adicionar item que excede capacidade_max_kg', expectedOutput: 'raise ValueError("Capacidade excedida")' },
    ],
    requirements: [
      'Encapsular lista privada self._itens no __init__',
      'Implementar __len__(), __repr__() e __str__()',
      'Proteger capacidade máxima em adicionar_item()',
    ],
    starterCode: `class ItemCarga:
    def __init__(self, sku: str, peso_kg: float) -> None:
        self.sku = sku.strip().upper()
        self.peso_kg = peso_kg

class Romaneio:
    def __init__(self, codigo: str, capacidade_max_kg: float) -> None:
        self.codigo = codigo
        self.capacidade_max_kg = capacidade_max_kg
        self._itens: list[ItemCarga] = []
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Implemente __len__, __str__ e validação de capacidade em adicionar_item()',
        detail: 'Calcule peso_atual = sum(i.peso_kg for i in self._itens) antes de anexar novo ItemCarga.',
        line: 10,
        severity: 'DICA',
      },
    ],
    focusTags: ['POO', '__len__', 'Composição'],
  },

  // =========================================================================
  // MÓDULO 4 (304): Consumo de APIs e Web Scraping (com Bases Fornecidas)
  // =========================================================================
  {
    id: 'py-m4-ex01',
    track: 'python',
    moduleId: 304,
    orderInModule: 1,
    title: 'Requisições GET com requests, timeout e raise_for_status()',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Implemente buscar_rastreio_api(codigo: str) -> dict | None usando requests.get(url, timeout=10), chamando resp.raise_for_status() e tratando requests.RequestException sem derrubar o script.',
    datasetTable: {
      sheetName: 'API_Transportadora_GET',
      description: 'Payloads JSON simulados retornados pelo endpoint de rastreamento.',
      columns: ['Codigo (A)', 'HTTP_Status (B)', 'Payload_JSON (C)'],
      rows: [
        ['BR-101', '200', '{"codigo":"BR-101","status":"EM_ROTA","cidade":"Campinas"}'],
        ['BR-404', '404', '{"erro":"Objeto nao encontrado"}'],
      ],
    },
    examples: [
      { input: 'buscar_rastreio_api("BR-101")', expectedOutput: '{"codigo": "BR-101", "status": "EM_ROTA", "cidade": "Campinas"}' },
      { input: 'buscar_rastreio_api("BR-404") (HTTP 404)', expectedOutput: 'None (captura HTTPError após raise_for_status)' },
    ],
    requirements: [
      'Definir timeout explícito (ex: timeout=10) em requests.get()',
      'Chamar resp.raise_for_status() antes de resp.json()',
      'Capturar requests.RequestException (nunca except: genérico)',
    ],
    starterCode: `import requests

def buscar_rastreio_api(codigo: str) -> dict | None:
    url = f"https://api.rastreio.exemplo/v1/objetos/{codigo}"
    resp = requests.get(url)
    return resp.json()
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'requests.get() sem timeout pode travar indefinidamente',
        detail: 'Passe timeout=10, chame resp.raise_for_status() e envolva em try/except requests.RequestException.',
        line: 5,
        severity: 'ERRO',
      },
    ],
    focusTags: ['requests', 'GET', 'timeout'],
  },
  {
    id: 'py-m4-ex02',
    track: 'python',
    moduleId: 304,
    orderInModule: 2,
    title: 'Extração de cotações em HTML com BeautifulSoup',
    difficulty: 'Fácil',
    estimatedMinutes: 14,
    prompt:
      'Use BeautifulSoup(html, "html.parser") para extrair todos os cards <div class="frete-card"> com nome da transportadora (<h3 class="nome">) e valor numérico (<span class="preco">), convertendo "R$ 145,50" em float 145.5.',
    datasetTable: {
      sheetName: 'HTML_Cotacoes_Cards',
      description: 'Estrutura HTML simulada fornecida pelo portal de cotações.',
      columns: ['Seletor_HTML (A)', 'Conteudo_Simulado (B)', 'Saida_Esperada (C)'],
      rows: [
        ['div.frete-card h3.nome', 'Expresso Brasil', '"Expresso Brasil"'],
        ['div.frete-card span.preco', 'R$ 145,50', '145.5'],
        ['div.frete-card h3.nome', 'Sul Cargas', '"Sul Cargas" (R$ 120,00 -> 120.0)'],
      ],
    },
    examples: [
      { input: 'HTML com 2 cards', expectedOutput: '[{"transportadora": "Expresso Brasil", "preco": 145.5}, ...]' },
      { input: 'Card sem span.preco', expectedOutput: 'Ignorado com segurança sem AttributeError' },
    ],
    requirements: [
      'Usar soup.select("div.frete-card")',
      'Verificar if not nome_el or not preco_el: continue antes de acessar .text',
      'Limpar "R$", espaços e trocar "," por "." antes de float()',
    ],
    starterCode: `from bs4 import BeautifulSoup

def extrair_cotacoes_html(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    resultados = []
    for card in soup.select("div.frete-card"):
        nome = card.select_one("h3.nome").text.strip()
        preco_txt = card.select_one("span.preco").text
        resultados.append({"transportadora": nome, "preco": preco_txt})
    return resultados
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Acesso direto a .text sem checar se select_one() retornou None',
        detail: 'Se faltar a tag em um card, card.select_one(...) retorna None e lança AttributeError. Converta o preço para float.',
        line: 7,
        severity: 'ERRO',
      },
    ],
    focusTags: ['BeautifulSoup', 'Scraping HTML', 'CSS Selectors'],
  },
  {
    id: 'py-m4-ex03',
    track: 'python',
    moduleId: 304,
    orderInModule: 3,
    title: 'Envio POST com requests, headers JSON e validação de status HTTP',
    difficulty: 'Médio',
    estimatedMinutes: 15,
    prompt:
      'Implemente enviar_coleta_api(url: str, dados: dict, token: str) -> dict usando requests.post(url, json=dados, headers=..., timeout=10) tratando status 201 Created, 422 Unprocessable Entity e erros de rede.',
    datasetTable: {
      sheetName: 'API_Coletas_POST',
      description: 'Respostas da API de agendamento de coletas.',
      columns: ['Cenario (A)', 'Status_HTTP (B)', 'Corpo_JSON (C)'],
      rows: [
        ['Payload válido', '201', '{"protocolo":"COL-900","aceito":true}'],
        ['Placa inválida', '422', '{"detalhe":"Placa fora do padrão"}'],
        ['Timeout servidor', 'Timeout', 'requests.Timeout'],
      ],
    },
    examples: [
      { input: 'enviar_coleta_api(url, {"placa":"BRA1A23"}, "tok") (201)', expectedOutput: '{"ok": True, "protocolo": "COL-900"}' },
      { input: 'HTTP 422', expectedOutput: '{"ok": False, "status": 422, "erro": "Placa fora do padrão"}' },
    ],
    requirements: [
      'Enviar json=dados e Authorization: f"Bearer {token}" nos headers',
      'Tratar 200/201 como sucesso e 4xx retornando detalhe sem crash',
      'Capturar requests.Timeout e requests.RequestException',
    ],
    starterCode: `import requests

def enviar_coleta_api(url: str, dados: dict, token: str) -> dict:
    resp = requests.post(url, data=dados)
    return resp.json()
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'data=dados envia form-urlencoded em vez de JSON e falta Bearer header + timeout',
        detail: 'Substitua por requests.post(url, json=dados, headers={"Authorization": f"Bearer {token}"}, timeout=10).',
        line: 4,
        severity: 'ERRO',
      },
    ],
    focusTags: ['requests.post', 'JSON API', 'Status HTTP'],
  },
  {
    id: 'py-m4-ex04',
    track: 'python',
    moduleId: 304,
    orderInModule: 4,
    title: 'Scraping de tabela HTML de vagas/fretes com BeautifulSoup',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Extraia todas as linhas de dados (<tbody><tr>) de uma tabela HTML de ofertas de frete/vagas fornecida abaixo usando BeautifulSoup, ignorando linhas vazias e retornando lista de dicionários tipados.',
    datasetTable: {
      sheetName: 'HTML_Tabela_Fretes',
      description: 'Linhas simuladas presentes dentro de <table id="ofertas"><tbody>...</tbody></table>.',
      columns: ['Rota (td[0])', 'Veiculo (td[1])', 'Valor (td[2])', 'Urgencia (td[3])'],
      rows: [
        ['São Paulo -> Curitiba', 'Truck', 'R$ 2.400,00', 'Alta'],
        ['Campinas -> BH', 'VUC', 'R$ 1.850,00', 'Normal'],
        ['Santos -> São Paulo', 'Carreta', 'R$ 1.120,00', 'Alta'],
      ],
    },
    examples: [
      { input: 'Tabela HTML com 3 linhas', expectedOutput: '[{"rota":"São Paulo -> Curitiba", "veiculo":"Truck", "valor":2400.0, "urgencia":"Alta"}, ...]' },
      { input: 'Linha de rodapé com apenas 1 <td>', expectedOutput: 'Ignorada verificando len(cols) >= 4' },
    ],
    requirements: [
      'Selecionar table#ofertas tbody tr com BeautifulSoup',
      'Checar len(cols) >= 4 antes de indexar cols[0..3]',
      'Converter "R$ 2.400,00" removendo ponto de milhar e trocando vírgula por ponto',
    ],
    starterCode: `from bs4 import BeautifulSoup

def extrair_tabela_ofertas(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    ofertas: list[dict] = []
    for tr in soup.select("table#ofertas tbody tr"):
        cols = [td.get_text(strip=True) for td in tr.find_all("td")]
        if len(cols) < 4:
            continue
        valor_num = float(cols[2].replace("R$", "").replace(".", "").replace(",", ".").strip())
        ofertas.append({"rota": cols[0], "veiculo": cols[1], "valor": valor_num, "urgencia": cols[3]})
    return ofertas
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Proteja conversão float() com try/except ValueError',
        detail: 'Se uma célula contiver "A combinar", float() falhará sem tratamento.',
        line: 10,
        severity: 'AVISO',
      },
    ],
    focusTags: ['BeautifulSoup', 'Tabelas HTML', 'Parsing'],
  },
  {
    id: 'py-m4-ex05',
    track: 'python',
    moduleId: 304,
    orderInModule: 5,
    title: 'Paginação automática de API externa usando requests.Session()',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Implemente coletar_todas_paginas(base_url: str, max_paginas: int = 10) -> list[dict] reutilizando conexões com requests.Session(), passando params={"page": pagina}, interrompendo quando next_page for None ou items vier vazio.',
    datasetTable: {
      sheetName: 'API_Paginada_Vagas',
      description: 'Contrato de paginação simulado pela API externa.',
      columns: ['Page (A)', 'Items_Count (B)', 'Next_Page (C)'],
      rows: [
        ['1', '2 itens (Vaga Python, Vaga Dados)', '2'],
        ['2', '1 item (Vaga FastAPI)', 'null (fim)'],
      ],
    },
    examples: [
      { input: 'coletar_todas_paginas("https://api.vagas.exemplo/jobs")', expectedOutput: 'Lista consolidada com 3 itens das páginas 1 e 2' },
      { input: 'Loop infinito com next_page sempre preenchido', expectedOutput: 'Protegido pelo teto max_paginas' },
    ],
    requirements: [
      'Usar with requests.Session() as session:',
      'Definir timeout=10 e raise_for_status() em cada página',
      'Respeitar limite de segurança max_paginas para evitar loop infinito',
    ],
    starterCode: `import requests

def coletar_todas_paginas(base_url: str, max_paginas: int = 10) -> list[dict]:
    todos: list[dict] = []
    pagina = 1
    with requests.Session() as session:
        while pagina <= max_paginas:
            resp = session.get(base_url, params={"page": pagina}, timeout=10)
            resp.raise_for_status()
            payload = resp.json()
            itens = payload.get("items", [])
            todos.extend(itens)
            if not payload.get("next_page") or not itens:
                break
            pagina += 1
    return todos
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Trate requests.RequestException dentro do loop ou na chamada',
        detail: 'Registre em qual página a coleta falhou ou retorne os itens já coletados de forma explícita.',
        line: 8,
        severity: 'DICA',
      },
    ],
    focusTags: ['requests.Session', 'Paginação', 'APIs'],
  },
  {
    id: 'py-m4-ex06',
    track: 'python',
    moduleId: 304,
    orderInModule: 6,
    title: 'Automação completa: Scraping HTML + Enriquecimento via API JSON',
    difficulty: 'Difícil',
    estimatedMinutes: 22,
    prompt:
      'Combine BeautifulSoup + requests: extraia os códigos de carga de um HTML (<li data-codigo="...">), consulte os detalhes de cada código único (deduplicado com set) na API JSON via requests.Session() e retorne um relatório consolidado com sucessos e falhas.',
    datasetTable: {
      sheetName: 'HTML_e_API_Consolidado',
      description: 'Códigos extraídos do HTML e respostas enriquecidas via API.',
      columns: ['Tag_HTML (A)', 'Codigo_Extraido (B)', 'Retorno_API (C)'],
      rows: [
        ['<li data-codigo="CG-10">', 'CG-10', '{"destino":"SP","valor":540}'],
        ['<li data-codigo="CG-10">', 'CG-10 (duplicado)', 'Ignorado por set()'],
        ['<li data-codigo="CG-99">', 'CG-99', 'HTTP 404 -> vai para falhas'],
      ],
    },
    examples: [
      { input: 'HTML com CG-10 repetido e CG-99 inexistente', expectedOutput: '{"sucessos": [{"codigo":"CG-10","destino":"SP","valor":540}], "falhas": ["CG-99"]}' },
      { input: 'HTML sem itens <li data-codigo>', expectedOutput: '{"sucessos": [], "falhas": []}' },
    ],
    requirements: [
      'Deduplicar códigos extraídos preservando ordem ou usando sorted(set(...))',
      'Usar requests.Session() com timeout e tratamento por item sem abortar todo lote',
      'Retornar dicionário estruturado {"sucessos": [...], "falhas": [...]}',
    ],
    starterCode: `from bs4 import BeautifulSoup
import requests

def consolidar_scraping_e_api(html: str, api_base: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    codigos = sorted({el.get("data-codigo", "").strip() for el in soup.select("li[data-codigo]") if el.get("data-codigo")})
    sucessos, falhas = [], []
    # Consulte cada codigo na API usando requests.Session() e separe sucessos/falhas
    return {"sucessos": sucessos, "falhas": falhas}
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12',
    preloadedImprovements: [
      {
        title: 'Consulte a API com with requests.Session() e try/except RequestException por código',
        detail: 'Não deixe uma falha 404 de CG-99 interromper a coleta dos demais itens.',
        line: 8,
        severity: 'DICA',
      },
    ],
    focusTags: ['Scraping + API', 'BeautifulSoup', 'requests'],
  },

  // =========================================================================
  // MÓDULO 5 (305): Bibliotecas de Dados e APIs Web (Pandas & FastAPI)
  // =========================================================================
  {
    id: 'py-m5-ex01',
    track: 'python',
    moduleId: 305,
    orderInModule: 1,
    title: 'Pandas: Leitura de CSV, seleção de colunas e filtragem booleana',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Usando Pandas, leia o CSV fornecido com pd.read_csv(caminho), selecione apenas as colunas ["codigo", "uf", "valor_frete", "status"] e filtre linhas onde status == "ENTREGUE" e valor_frete > 100 usando máscara booleana vetorizada.',
    datasetTable: {
      sheetName: 'fretes_sp.csv',
      description: 'Arquivo CSV simulado disponível para leitura no Pandas.',
      columns: ['codigo', 'uf', 'valor_frete', 'status', 'observacao'],
      rows: [
        ['FR-01', 'SP', '250.00', 'ENTREGUE', 'ok'],
        ['FR-02', 'RJ', '85.00', 'ENTREGUE', 'leve'],
        ['FR-03', 'MG', '410.00', 'ATRASADO', 'chuva'],
      ],
    },
    examples: [
      { input: 'filtrar_fretes_csv("fretes_sp.csv")', expectedOutput: 'DataFrame com 1 linha (FR-01, SP, 250.00, ENTREGUE)' },
      { input: 'Colunas retornadas', expectedOutput: '["codigo", "uf", "valor_frete", "status"] (sem observacao)' },
    ],
    requirements: [
      'Usar pd.read_csv(..., usecols=[...]) ou seleção explícita de colunas',
      'Aplicar filtro booleano vetorizado com & entre parênteses',
      'Usar .copy() caso vá modificar o DataFrame filtrado',
    ],
    starterCode: `import pandas as pd

def filtrar_fretes_csv(caminho: str) -> pd.DataFrame:
    df = pd.read_csv(caminho)
    colunas = ["codigo", "uf", "valor_frete", "status"]
    filtrado = df[df["status"] == "ENTREGUE" & df["valor_frete"] > 100]
    return filtrado[colunas]
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12 · Pandas',
    preloadedImprovements: [
      {
        title: 'Precedência de & no filtro Pandas sem parênteses causa TypeError/ValueError',
        detail: 'Envolva cada condição entre parênteses: df[(df["status"] == "ENTREGUE") & (df["valor_frete"] > 100)].',
        line: 6,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Pandas', 'read_csv', 'Filtros'],
  },
  {
    id: 'py-m5-ex02',
    track: 'python',
    moduleId: 305,
    orderInModule: 2,
    title: 'FastAPI: Rota GET básica, parâmetro tipado e retorno JSON',
    difficulty: 'Fácil',
    estimatedMinutes: 12,
    prompt:
      'Crie uma aplicação FastAPI com a rota GET "/health" retornando {"status": "ok"} e a rota GET "/pedidos/{pedido_id}" com parâmetro inteiro tipado e parâmetro de consulta opcional detalhe: bool = False, retornando HTTP 404 (HTTPException) se pedido_id <= 0.',
    datasetTable: {
      sheetName: 'Pedidos_API_Mock',
      description: 'Base em memória consultada pelas rotas GET do FastAPI.',
      columns: ['pedido_id', 'cliente', 'status', 'valor'],
      rows: [
        ['101', 'Mercado Central', 'EM_ROTA', '580.00'],
        ['102', 'Loja Sul', 'ENTREGUE', '320.00'],
      ],
    },
    examples: [
      { input: 'GET /pedidos/101?detalhe=true', expectedOutput: '200 OK {"pedido_id": 101, "cliente": "Mercado Central", "status": "EM_ROTA", "valor": 580.0}' },
      { input: 'GET /pedidos/0', expectedOutput: '404 Not Found {"detail": "Pedido não encontrado"}' },
    ],
    requirements: [
      'Instanciar app = FastAPI(title="Logistica API")',
      'Usar Type Hints nos parâmetros da rota para validação automática do FastAPI',
      'Lançar HTTPException(status_code=404, ...) quando não existir',
    ],
    starterCode: `from fastapi import FastAPI, HTTPException

app = FastAPI()

PEDIDOS = {101: {"cliente": "Mercado Central", "status": "EM_ROTA", "valor": 580.0}}

@app.get("/pedidos/{pedido_id}")
def obter_pedido(pedido_id, detalhe=False):
    if pedido_id not in PEDIDOS:
        return {"erro": "nao encontrado"}
    return {"pedido_id": pedido_id, **PEDIDOS[pedido_id]}
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12 · FastAPI',
    preloadedImprovements: [
      {
        title: 'Parâmetro pedido_id sem tipo int faz FastAPI tratá-lo como str',
        detail: 'Anote pedido_id: int, detalhe: bool = False e use raise HTTPException(status_code=404, detail="...") em vez de retornar dict com HTTP 200.',
        line: 8,
        severity: 'ERRO',
      },
    ],
    focusTags: ['FastAPI', 'Rotas GET', 'HTTPException'],
  },
  {
    id: 'py-m5-ex03',
    track: 'python',
    moduleId: 305,
    orderInModule: 3,
    title: 'Pandas: Coluna derivada vetorizada e agrupamento groupby().agg()',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Recebendo o DataFrame da tabela "entregas_regiao.csv", crie a coluna vetorizada custo_por_kg = valor_frete / peso_kg (sem iterrows!), agrupe por regiao com groupby("regiao", as_index=False).agg(...) calculando total_fretes, soma_valor e media_custo_kg.',
    datasetTable: {
      sheetName: 'entregas_regiao.csv',
      description: 'Dados tabulares fornecidos para agrupamento Pandas.',
      columns: ['id', 'regiao', 'peso_kg', 'valor_frete'],
      rows: [
        ['1', 'Sudeste', '100', '500'],
        ['2', 'Sudeste', '50', '300'],
        ['3', 'Sul', '80', '320'],
      ],
    },
    examples: [
      { input: 'Dataset acima', expectedOutput: 'Sudeste: total=2, soma_valor=800, media_custo_kg=5.5 | Sul: total=1, soma_valor=320, media_custo_kg=4.0' },
      { input: 'peso_kg == 0 em alguma linha', expectedOutput: 'Evita divisão por zero filtrando peso_kg > 0' },
    ],
    requirements: [
      'Usar cálculo vetorizado (proibido usar .iterrows())',
      'Usar named aggregations no .agg(total_fretes=("id", "count"), ...)',
      'Filtrar peso_kg > 0 antes de dividir',
    ],
    starterCode: `import pandas as pd

def resumir_por_regiao(df: pd.DataFrame) -> pd.DataFrame:
    custos = []
    for _, row in df.iterrows():
        custos.append(row["valor_frete"] / row["peso_kg"])
    df["custo_por_kg"] = custos
    return df.groupby("regiao", as_index=False)["valor_frete"].sum()
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12 · Pandas',
    preloadedImprovements: [
      {
        title: 'Uso de .iterrows() em DataFrame prejudica muito a performance',
        detail: 'Substitua o loop por df["custo_por_kg"] = df["valor_frete"] / df["peso_kg"] e use .agg(...) nomeado.',
        line: 5,
        severity: 'ERRO',
      },
    ],
    focusTags: ['Pandas', 'groupby', 'Vetorização'],
  },
  {
    id: 'py-m5-ex04',
    track: 'python',
    moduleId: 305,
    orderInModule: 4,
    title: 'FastAPI + Pydantic BaseModel: Rota POST com validação automática',
    difficulty: 'Médio',
    estimatedMinutes: 16,
    prompt:
      'Crie os modelos Pydantic RomaneioCreate(BaseModel) (codigo: str min_length=3, peso_kg: float > 0, prioridade: Literal["NORMAL","EXPRESSA"]) e RomaneioOut(BaseModel), expondo POST "/romaneios" com status_code=201 retornando JSON tipado.',
    datasetTable: {
      sheetName: 'Payload_FastAPI_POST',
      description: 'Contratos de entrada e saída validados via Pydantic v2.',
      columns: ['Campo', 'Tipo_Pydantic', 'Regra'],
      rows: [
        ['codigo', 'str', 'Field(min_length=3)'],
        ['peso_kg', 'float', 'Field(gt=0, le=30000)'],
        ['prioridade', 'Literal["NORMAL","EXPRESSA"]', 'Default "NORMAL"'],
      ],
    },
    examples: [
      { input: 'POST /romaneios {"codigo":"RM-90","peso_kg":120,"prioridade":"EXPRESSA"}', expectedOutput: '201 Created com frete_estimado calculado' },
      { input: 'POST /romaneios {"codigo":"A","peso_kg":-5}', expectedOutput: '422 Unprocessable Entity automático pelo Pydantic' },
    ],
    requirements: [
      'Usar Field(gt=0) e Field(min_length=3) no BaseModel',
      'Declarar response_model=RomaneioOut e status_code=201 no decorator @app.post',
      'Normalizar codigo com @field_validator ou no handler',
    ],
    starterCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RomaneioCreate(BaseModel):
    codigo: str
    peso_kg: float
    prioridade: str = "NORMAL"

@app.post("/romaneios")
def criar_romaneio(payload: dict):
    return {"codigo": payload["codigo"], "status": "CRIADO"}
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12 · FastAPI',
    preloadedImprovements: [
      {
        title: 'Endpoint recebe dict bruto ignorando o modelo RomaneioCreate',
        detail: 'Troque payload: dict por payload: RomaneioCreate, adicione Field(gt=0) em peso_kg e defina status_code=201.',
        line: 12,
        severity: 'ERRO',
      },
    ],
    focusTags: ['FastAPI', 'Pydantic', 'POST'],
  },
  {
    id: 'py-m5-ex05',
    track: 'python',
    moduleId: 305,
    orderInModule: 5,
    title: 'Pandas completo: tratamento de nulos, datas e ranking operacional',
    difficulty: 'Difícil',
    estimatedMinutes: 20,
    prompt:
      'Recebendo a tabela "operacao_transportadoras.csv" com nulos em valor_frete e datas em texto, limpe removendo linhas sem transportadora (dropna), preencha nulos de frete com a mediana do grupo, converta datas com pd.to_datetime() e retorne o ranking ordenado por atraso médio.',
    datasetTable: {
      sheetName: 'operacao_transportadoras.csv',
      description: 'Base com valores nulos e datas em string para pipeline Pandas.',
      columns: ['cte', 'transportadora', 'data_coleta', 'data_entrega', 'valor_frete'],
      rows: [
        ['1', 'TransSul', '2026-11-01', '2026-11-03', '400.0'],
        ['2', 'TransSul', '2026-11-02', '2026-11-05', ''],
        ['3', 'RapidoBR', '2026-11-01', '2026-11-02', '350.0'],
      ],
    },
    examples: [
      { input: 'CSV acima (linha 2 com frete nulo)', expectedOutput: 'Preenche frete nulo com 400.0, calcula dias_transito (2, 3, 1) e ranqueia' },
      { input: 'Linha sem transportadora', expectedOutput: 'Descartada via dropna(subset=["transportadora"])' },
    ],
    requirements: [
      'Usar pd.to_datetime(..., errors="coerce") e .dt.days',
      'Preencher valor_frete nulo sem inplace=True encadeado',
      'Agrupar por transportadora e ordenar por media_dias ascendente',
    ],
    starterCode: `import pandas as pd

def ranking_transportadoras(df: pd.DataFrame) -> pd.DataFrame:
    limpo = df.dropna(subset=["transportadora"]).copy()
    limpo["data_coleta"] = pd.to_datetime(limpo["data_coleta"], errors="coerce")
    limpo["data_entrega"] = pd.to_datetime(limpo["data_entrega"], errors="coerce")
    # Calcule dias_transito, preencha valor_frete nulo e agrupe por transportadora
    return limpo
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12 · Pandas',
    preloadedImprovements: [
      {
        title: 'Calcule dias_transito vetorizado e agregue com groupby().agg()',
        detail: 'Use (limpo["data_entrega"] - limpo["data_coleta"]).dt.days e fillna(limpo["valor_frete"].median()).',
        line: 7,
        severity: 'DICA',
      },
    ],
    focusTags: ['Pandas', 'to_datetime', 'Limpeza'],
  },
  {
    id: 'py-m5-ex06',
    track: 'python',
    moduleId: 305,
    orderInModule: 6,
    title: 'API analítica FastAPI + Pydantic servindo agregações Pandas em JSON',
    difficulty: 'Difícil',
    estimatedMinutes: 22,
    prompt:
      'Construa um endpoint POST "/relatorios/fretes" em FastAPI que recebe uma lista validada de itens via Pydantic (FiltroRelatorio), carrega os registros fornecidos em um DataFrame Pandas, aplica filtro de UF e valor mínimo e devolve o resumo agrupado em JSON serializável.',
    datasetTable: {
      sheetName: 'base_fretes_endpoint',
      description: 'Registros carregados pelo serviço analítico para responder ao endpoint POST.',
      columns: ['codigo', 'uf', 'transportadora', 'valor_frete'],
      rows: [
        ['F-10', 'SP', 'TransSul', '620.0'],
        ['F-11', 'SP', 'RapidoBR', '190.0'],
        ['F-12', 'PR', 'TransSul', '410.0'],
      ],
    },
    examples: [
      { input: 'POST /relatorios/fretes {"uf":"SP","valor_minimo":200}', expectedOutput: '{"uf":"SP","total_registros":1,"por_transportadora":[{"transportadora":"TransSul","total":620.0}]}' },
      { input: 'Filtro sem resultados', expectedOutput: '200 OK {"uf":"AC","total_registros":0,"por_transportadora":[]}' },
    ],
    requirements: [
      'Definir request model FiltroRelatorio(BaseModel) com uf: str e valor_minimo: float = Field(ge=0, default=0.0)',
      'Filtrar DataFrame sem iterrows e exportar com .to_dict(orient="records")',
      'Garantir retorno JSON nativo (sem numpy.float64/int64 não serializável)',
    ],
    starterCode: `from fastapi import FastAPI
from pydantic import BaseModel, Field
import pandas as pd

app = FastAPI()

BASE_FRETES = [
    {"codigo": "F-10", "uf": "SP", "transportadora": "TransSul", "valor_frete": 620.0},
    {"codigo": "F-11", "uf": "SP", "transportadora": "RapidoBR", "valor_frete": 190.0},
    {"codigo": "F-12", "uf": "PR", "transportadora": "TransSul", "valor_frete": 410.0},
]

class FiltroRelatorio(BaseModel):
    uf: str
    valor_minimo: float = Field(default=0.0, ge=0.0)

@app.post("/relatorios/fretes")
def gerar_relatorio(filtro: FiltroRelatorio) -> dict:
    df = pd.DataFrame(BASE_FRETES)
    # Filtre por uf normalizada e valor_frete >= valor_minimo, agrupe e retorne JSON
    return {"uf": filtro.uf, "total_registros": int(len(df)), "por_transportadora": []}
`,
    fileName: 'main.py',
    runtimeLabel: 'Python 3.12 · FastAPI + Pandas',
    preloadedImprovements: [
      {
        title: 'Converta números numpy do Pandas para int()/float() ou to_dict(orient="records")',
        detail: 'FastAPI falha ao serializar numpy.int64 diretamente caso não convertido para tipos Python nativos.',
        line: 21,
        severity: 'DICA',
      },
    ],
    focusTags: ['FastAPI', 'Pandas', 'Pydantic'],
  },
];
