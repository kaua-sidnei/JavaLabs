import type {
  CopilotFinding,
  Difficulty,
  Exercise,
  ImprovementHint,
  JavaModule,
  SubmissionRecord,
} from '../types/javalab';
import {
  EXTRA_EXERCISES,
  EXTRA_MODULES,
  RECOMMENDED_MATERIALS,
  TRACK_METADATA,
} from './extraTracks';

export { EXTRA_MODULES, RECOMMENDED_MATERIALS, TRACK_METADATA };

const RAW_JAVA_MODULES: Omit<JavaModule, 'track'>[] = [
  {
    id: 1,
    code: '01',
    title: 'Conceitos de programação',
    subtitle: 'Algoritmos, variáveis, compilação',
    lessonsCount: 7,
    durationLabel: '24 min',
    category: 'Fundamentos',
    categoryLabel: 'Fundamentos',
  },
  {
    id: 2,
    code: '02',
    title: 'Introdução à linguagem Java',
    subtitle: 'JDK, JVM, primeiro programa',
    lessonsCount: 13,
    durationLabel: '40 min',
    category: 'Fundamentos',
    categoryLabel: 'Fundamentos',
  },
  {
    id: 3,
    code: '03',
    title: 'Estrutura sequencial',
    subtitle: 'Scanner, operadores, printf',
    lessonsCount: 12,
    durationLabel: '1h 14min',
    category: 'Fundamentos',
    categoryLabel: 'Fundamentos',
  },
  {
    id: 4,
    code: '04',
    title: 'Estrutura condicional',
    subtitle: 'if/else, switch, ternário',
    lessonsCount: 11,
    durationLabel: '54 min',
    category: 'Fundamentos',
    categoryLabel: 'Fundamentos',
  },
  {
    id: 5,
    code: '05',
    title: 'Estruturas repetitivas',
    subtitle: 'while, for, do-while',
    lessonsCount: 14,
    durationLabel: '1h 10min',
    category: 'Fundamentos',
    categoryLabel: 'Fundamentos',
  },
  {
    id: 6,
    code: '06',
    title: 'Outros tópicos básicos sobre Java',
    subtitle: 'Strings, funções, bitwise',
    lessonsCount: 6,
    durationLabel: '49 min',
    category: 'Fundamentos',
    categoryLabel: 'Fundamentos',
  },
  {
    id: 7,
    code: '07',
    title: 'Introdução à Programação Orientada a Objetos',
    subtitle: 'Classes, atributos, métodos, static',
    lessonsCount: 12,
    durationLabel: '1h 29min',
    category: 'POO',
    categoryLabel: 'Orientação a objetos',
  },
  {
    id: 8,
    code: '08',
    title: 'Construtores, this, sobrecarga, encapsulamento',
    subtitle: 'Construtores, getters e setters',
    lessonsCount: 11,
    durationLabel: '1h 16min',
    category: 'POO',
    categoryLabel: 'Orientação a objetos',
  },
  {
    id: 9,
    code: '09',
    title: 'Comportamento de memória, arrays, listas',
    subtitle: 'Stack e heap, vetores, ArrayList, matrizes',
    lessonsCount: 20,
    durationLabel: '2h 40min',
    category: 'POO',
    categoryLabel: 'Orientação a objetos',
  },
  {
    id: 10,
    code: '10',
    title: 'Tópicos especiais: data-hora',
    subtitle: 'LocalDate, Instant, Duration, DateTimeFormatter',
    lessonsCount: 13,
    durationLabel: '1h 49min',
    category: 'Avançado',
    categoryLabel: 'Avançado',
  },
  {
    id: 11,
    code: '11',
    title: 'Enumerações, composição',
    subtitle: 'enum, composição de objetos, StringBuilder',
    lessonsCount: 11,
    durationLabel: '1h 29min',
    category: 'POO',
    categoryLabel: 'Orientação a objetos',
  },
  {
    id: 12,
    code: '12',
    title: 'Herança e polimorfismo',
    subtitle: 'extends, @Override, abstract, upcasting',
    lessonsCount: 13,
    durationLabel: '2h 01min',
    category: 'POO',
    categoryLabel: 'Orientação a objetos',
  },
  {
    id: 13,
    code: '13',
    title: 'Tratamento de exceções',
    subtitle: 'try/catch, finally, exceções personalizadas',
    lessonsCount: 12,
    durationLabel: '1h 46min',
    category: 'Avançado',
    categoryLabel: 'Avançado',
  },
  {
    id: 14,
    code: '14',
    title: 'Trabalhando com arquivos',
    subtitle: 'File, BufferedReader, try-with-resources',
    lessonsCount: 10,
    durationLabel: '39 min',
    category: 'Avançado',
    categoryLabel: 'Avançado',
  },
  {
    id: 15,
    code: '15',
    title: 'Interfaces',
    subtitle: 'Contratos, default methods, Comparable',
    lessonsCount: 14,
    durationLabel: '3h 11min',
    category: 'POO',
    categoryLabel: 'Orientação a objetos',
  },
  {
    id: 16,
    code: '16',
    title: 'Generics, Set, Map',
    subtitle: 'Wildcards, HashSet, TreeSet, HashMap',
    lessonsCount: 14,
    durationLabel: '2h 07min',
    category: 'Avançado',
    categoryLabel: 'Avançado',
  },
  {
    id: 17,
    code: '17',
    title: 'Programação funcional e expressões lambda',
    subtitle: 'Comparator, Predicate, Stream API',
    lessonsCount: 13,
    durationLabel: '2h 04min',
    category: 'Avançado',
    categoryLabel: 'Avançado',
  },
  {
    id: 18,
    code: '18',
    title: 'Bônus: Nivelamento sobre Git e GitHub',
    subtitle: 'Commits, branches, merge, pull requests',
    lessonsCount: 27,
    durationLabel: '2h 15min',
    category: 'Bônus',
    categoryLabel: 'Bônus · projeto',
    isProject: true,
  },
  {
    id: 19,
    code: '19',
    title: 'Bônus: Acesso a banco de dados com JDBC',
    subtitle: 'Connection, PreparedStatement, DAO pattern',
    lessonsCount: 26,
    durationLabel: '3h 52min',
    category: 'Bônus',
    categoryLabel: 'Bônus · projeto',
    isProject: true,
  },
  {
    id: 20,
    code: '20',
    title: 'Bônus: Java EE - JPA / Hibernate',
    subtitle: 'EntityManager, mapeamento objeto-relacional',
    lessonsCount: 6,
    durationLabel: '54 min',
    category: 'Bônus',
    categoryLabel: 'Bônus · projeto',
    isProject: true,
  },
  {
    id: 21,
    code: '21',
    title: 'Bônus: Web services com Spring Boot + JPA',
    subtitle: 'REST, camadas, DTO, CRUD e exceções HTTP',
    lessonsCount: 34,
    durationLabel: '5h 11min',
    category: 'Bônus',
    categoryLabel: 'Bônus · projeto',
    isProject: true,
  },
  {
    id: 22,
    code: '22',
    title: 'Bônus: Projeto Sistema jogo de xadrez',
    subtitle: 'Matriz 8x8, regras de movimento, camadas',
    lessonsCount: 33,
    durationLabel: '5h 45min',
    category: 'Bônus',
    categoryLabel: 'Bônus · projeto',
    isProject: true,
  },
  {
    id: 23,
    code: '23',
    title: 'Bônus: Spring Boot e banco MongoDB',
    subtitle: 'NoSQL, documentos, consultas e DTOs',
    lessonsCount: 27,
    durationLabel: '3h 25min',
    category: 'Bônus',
    categoryLabel: 'Bônus · projeto',
    isProject: true,
  },
  {
    id: 24,
    code: '24',
    title: 'Bônus (Legado): Interface gráfica com JavaFX',
    subtitle: 'Telas FXML, eventos, padrão MVC (Java 11)',
    lessonsCount: 43,
    durationLabel: '6h 48min',
    category: 'Bônus',
    categoryLabel: 'Bônus · projeto',
    isProject: true,
  },
];

export const JAVA_MODULES: JavaModule[] = RAW_JAVA_MODULES.map((m) => ({
  ...m,
  track: 'java' as const,
}));

export const ALL_MODULES: JavaModule[] = [...JAVA_MODULES, ...EXTRA_MODULES];

interface SpecTemplate {
  moduleId: number;
  difficulty: Difficulty;
  orderInModule: number;
  title: string;
  estimatedMinutes: number;
  prompt: string;
  formula?: string;
  examples: { input: string; expectedOutput: string }[];
  requirements: string[];
  starterCode: string;
  preloadedImprovements: ImprovementHint[];
  focusTags: string[];
}

function makeStarter(body: string, imports = ''): string {
  const imp = imports ? `${imports}\n\n` : '';
  return `${imp}public class Main {\n    public static void main(String[] args) {\n${body}\n    }\n}`;
}

const RAW_EXERCISES: SpecTemplate[] = [
  // Módulo 01 - Conceitos de programação
  {
    moduleId: 1,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Troca de variáveis com auxiliar',
    estimatedMinutes: 8,
    prompt: 'Leia dois números inteiros A e B, troque seus valores usando uma variável auxiliar e imprima os novos valores de A e B.',
    examples: [
      { input: '10\n25', expectedOutput: 'A=25 B=10' },
      { input: '-4\n7', expectedOutput: 'A=7 B=-4' },
    ],
    requirements: ['Ler A e B com Scanner', 'Realizar troca usando variável temporária', 'Imprimir no formato A=X B=Y'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        // Troque os valores usando uma variável auxiliar\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Ordem da atribuição', detail: 'Salve o valor de A antes de sobrescrevê-lo para não perder o dado original.', severity: 'AVISO' },
      { title: 'Fechar Scanner', detail: 'Sempre libere o Scanner ao final do algoritmo.', severity: 'DICA' },
    ],
    focusTags: ['Algoritmos', 'Variáveis', 'Atribuição'],
  },
  {
    moduleId: 1,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Conversor de segundos para HH:MM:SS',
    estimatedMinutes: 12,
    prompt: 'Dado um valor inteiro N representando a duração em segundos de um evento, converta e exiba no formato horas:minutos:segundos.',
    formula: 'horas = N / 3600; resto = N % 3600',
    examples: [
      { input: '3665', expectedOutput: '1:1:5' },
      { input: '140153', expectedOutput: '38:55:53' },
    ],
    requirements: ['Usar divisão inteira (/) e módulo (%)', 'Não usar bibliotecas de data neste exercício', 'Imprimir H:M:S'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int totalSegundos = sc.nextInt();\n        // Calcule horas, minutos e segundos usando / e %\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Resto da divisão (%)', detail: 'Lembre-se de extrair o resto após calcular horas antes de dividir por 60.', severity: 'AVISO' },
      { title: 'Nomes descritivos', detail: 'Evite nomes como h, m, s se puder nomear horas, minutos e segundos.', severity: 'DICA' },
    ],
    focusTags: ['Operadores aritméticos', 'Módulo', 'Lógica sequencial'],
  },
  {
    moduleId: 1,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Decomposição mínima de cédulas',
    estimatedMinutes: 18,
    prompt: 'Leia um valor inteiro em reais e calcule o menor número possível de notas (100, 50, 20, 10, 5, 2, 1) necessárias para compor o valor.',
    examples: [
      { input: '576', expectedOutput: '100:5 50:1 20:1 10:0 5:1 2:0 1:1' },
    ],
    requirements: ['Processar da maior cédula para a menor', 'Atualizar o restante com operador %', 'Exibir todas as denominações'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int valor = sc.nextInt();\n        int[] notas = {100, 50, 20, 10, 5, 2, 1};\n        // Calcule e imprima a quantidade de cada nota\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Evite repetição de código', detail: 'Um array com as cédulas e um laço for evitam 7 blocos repetidos.', severity: 'DICA' },
      { title: 'Espaço extra no final', detail: 'Cuide para não imprimir espaços sobrando no fim da linha.', severity: 'AVISO' },
    ],
    focusTags: ['Decomposição', 'Arrays', 'Lógica'],
  },

  // Módulo 02 - Introdução à linguagem Java
  {
    moduleId: 2,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Saída formatada de produto',
    estimatedMinutes: 8,
    prompt: 'Declare variáveis para produto ("Notebook"), código (5290), gênero (\'M\') e preço (4299.90) e exiba o resumo formatado com duas casas decimais usando Locale.US.',
    examples: [
      { input: '(sem entrada)', expectedOutput: 'Notebook, codigo 5290, genero M: R$ 4299.90' },
    ],
    requirements: ['Configurar Locale.setDefault(Locale.US)', 'Usar tipos primitivos adequados (String, int, char, double)', 'Formatar preço com %.2f'],
    starterCode: makeStarter(
      '        String produto = "Notebook";\n        int codigo = 5290;\n        char genero = \'M\';\n        double preco = 4299.90;\n        // Imprima no formato especificado',
      'import java.util.Locale;'
    ),
    preloadedImprovements: [
      { title: 'Aspas simples para char', detail: 'Em Java, char usa aspas simples (\'M\') e String usa aspas duplas.', severity: 'ERRO' },
      { title: 'Locale.US antes do printf', detail: 'Configure Locale.setDefault(Locale.US) antes de formatar números decimais.', severity: 'AVISO' },
    ],
    focusTags: ['Tipos primitivos', 'printf', 'Locale.US'],
  },
  {
    moduleId: 2,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Casting explícito e perda de precisão',
    estimatedMinutes: 12,
    prompt: 'Leia dois inteiros A e B e exiba a divisão inteira e a divisão decimal (com 2 casas) usando casting explícito (double).',
    examples: [
      { input: '5\n2', expectedOutput: 'Inteira=2 Decimal=2.50' },
    ],
    requirements: ['Aplicar casting (double) antes da divisão', 'Configurar Locale.US', 'Formatar decimal com %.2f'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        // Calcule divisão inteira e com casting para double\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Divisão entre inteiros trunca', detail: 'Escrever (double) (a / b) faz o casting tarde demais; converta um operando antes: (double) a / b.', severity: 'ERRO' },
    ],
    focusTags: ['Casting', 'Divisão inteira', 'Tipos'],
  },
  {
    moduleId: 2,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Limites de overflow com int e long',
    estimatedMinutes: 15,
    prompt: 'Leia dois números inteiros grandes (até 10^9) representando largura e altura de um terreno em mm e calcule a área em mm² sem sofrer overflow.',
    examples: [
      { input: '100000\n100000', expectedOutput: 'AREA=10000000000' },
    ],
    requirements: ['Usar tipo long para evitar overflow de 32 bits', 'Converter antes da multiplicação', 'Imprimir AREA=<valor>'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int largura = sc.nextInt();\n        int altura = sc.nextInt();\n        // Cuidado com overflow na multiplicação de int * int!\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Overflow antes da atribuição', detail: 'long area = largura * altura ainda multiplica em 32 bits se ambos forem int! Use (long) largura * altura.', severity: 'ERRO' },
    ],
    focusTags: ['Overflow', 'long', 'Promoção numérica'],
  },

  // Módulo 03 - Estrutura sequencial (incluindo Exercício 7 Área do círculo do PDF)
  {
    moduleId: 3,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Soma de dois inteiros',
    estimatedMinutes: 8,
    prompt: 'Faça um programa para ler dois valores inteiros, e depois mostrar na tela a soma desses números com a mensagem explicativa SOMA = <resultado>.',
    examples: [
      { input: '10\n30', expectedOutput: 'SOMA = 40' },
      { input: '-30\n10', expectedOutput: 'SOMA = -20' },
    ],
    requirements: ['Ler dois inteiros com Scanner', 'Imprimir exatamente SOMA = <valor>', 'Fechar o Scanner'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int primeiro = sc.nextInt();\n        int segundo = sc.nextInt();\n        int soma = primeiro + segundo;\n        System.out.println("SOMA = " + soma);\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Espaçamento exato na saída', detail: 'Confira os espaços ao redor do sinal "=" em "SOMA = ".', severity: 'DICA' },
    ],
    focusTags: ['Scanner', 'Entrada e saída'],
  },
  {
    moduleId: 3,
    orderInModule: 7,
    difficulty: 'Fácil',
    title: 'Área do círculo',
    estimatedMinutes: 10,
    prompt: 'Faça um programa para ler o valor do raio de um círculo e depois mostrar o valor da área deste círculo com quatro casas decimais.',
    formula: 'área = π · raio². Considere π = 3.14159.',
    examples: [
      { input: '2.00', expectedOutput: 'A=12.5664' },
      { input: '100.64', expectedOutput: 'A=31819.3103' },
      { input: '150.00', expectedOutput: 'A=70685.7750' },
    ],
    requirements: [
      'Ler a entrada com Scanner',
      'Aceitar ponto como separador decimal',
      'Saída exatamente no formato A=0.0000',
    ],
    starterCode: [
      'import java.util.Scanner;',
      '',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        Scanner sc = new Scanner(System.in);',
      '',
      '        double r = sc.nextDouble();',
      '        double a = 3.14159 * Math.pow(r, 2);',
      '',
      '        System.out.println("A=" + a);',
      '    }',
      '}',
    ].join('\n'),
    preloadedImprovements: [
      {
        title: 'Ponto decimal depende do sistema',
        detail: 'Sem Locale.setDefault(Locale.US), a entrada 2.00 quebra em máquinas pt-BR.',
        line: 5,
        severity: 'ERRO',
      },
      {
        title: 'Saída sem 4 casas decimais',
        detail: 'Concatenar double com println imprime casas em excesso. Use printf("A=%.4f%n", area).',
        line: 10,
        severity: 'ERRO',
      },
      {
        title: 'Scanner nunca é fechado',
        detail: 'Feche o recurso com sc.close() ou try-with-resources.',
        line: 5,
        severity: 'AVISO',
      },
    ],
    focusTags: ['Scanner', 'Locale.US', 'printf', 'Constantes'],
  },
  {
    moduleId: 3,
    orderInModule: 8,
    difficulty: 'Médio',
    title: 'Salário de funcionário por horas',
    estimatedMinutes: 12,
    prompt: 'Leia o número de um funcionário, seu número de horas trabalhadas e o valor que recebe por hora. Calcule e mostre o número e o salário com duas casas decimais.',
    examples: [
      { input: '25\n100\n5.50', expectedOutput: 'NUMBER = 25\nSALARY = U$ 550.00' },
    ],
    requirements: ['Configurar Locale.US', 'Exibir NUMBER e SALARY em linhas separadas', 'Formatar salário com 2 casas decimais'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Leia numero, horas e valorHora\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Quebra de linha portável', detail: 'Prefira %n no printf em vez de \\n para compatibilidade entre sistemas operacionais.', severity: 'DICA' },
      { title: 'Locale.US para leitura e saída', detail: 'Garante ponto decimal tanto no nextDouble() quanto no printf().', severity: 'AVISO' },
    ],
    focusTags: ['Scanner', 'printf', 'Cálculo sequencial'],
  },
  {
    moduleId: 3,
    orderInModule: 9,
    difficulty: 'Difícil',
    title: 'Cálculo de áreas geométricas múltiplas',
    estimatedMinutes: 16,
    prompt: 'Leia três valores de ponto flutuante A, B e C. Calcule e mostre com 3 casas decimais: área do triângulo retângulo (base A, altura C), círculo (raio C), trapézio (bases A e B, altura C), quadrado (lado B) e retângulo (lados A e B).',
    formula: 'π = 3.14159 | Trapézio = ((A + B) * C) / 2.0',
    examples: [
      { input: '3.0 4.0 5.2', expectedOutput: 'TRIANGULO: 7.800\nCIRCULO: 84.949\nTRAPEZIO: 18.200\nQUADRADO: 16.000\nRETANGULO: 12.000' },
    ],
    requirements: ['Usar constante final double PI = 3.14159', 'Formatar todas as 5 saídas com %.3f', 'Manter Locale.US'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        try (Scanner sc = new Scanner(System.in)) {\n            double a = sc.nextDouble();\n            double b = sc.nextDouble();\n            double c = sc.nextDouble();\n            // Calcule e imprima as 5 áreas com 3 casas decimais\n        }',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Constante PI nomeada', detail: 'Evite repetir 3.14159 no código; declare final double PI = 3.14159.', severity: 'DICA' },
      { title: 'Precedência no trapézio', detail: 'Use parênteses em ((baseA + baseB) * altura) / 2.0.', severity: 'AVISO' },
    ],
    focusTags: ['Geometria', 'printf', 'Constantes'],
  },

  // Módulo 04 - Estrutura condicional
  {
    moduleId: 4,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Verificador de múltiplos',
    estimatedMinutes: 8,
    prompt: 'Leia 2 valores inteiros A e B. Em seguida, o programa deve mostrar a mensagem "Sao Multiplos" ou "Nao sao Multiplos", indicando se os valores são múltiplos entre si (em qualquer ordem).',
    examples: [
      { input: '6 24', expectedOutput: 'Sao Multiplos' },
      { input: '6 25', expectedOutput: 'Nao sao Multiplos' },
    ],
    requirements: ['Testar A % B == 0 || B % A == 0', 'Tratar qualquer ordem de entrada', 'Prevenir divisão por zero se necessário'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int primeiro = sc.nextInt();\n        int segundo = sc.nextInt();\n        // Verifique se são múltiplos entre si\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Ordem inversa dos operandos', detail: 'Se A=6 e B=24, A % B é 6, mas B % A é 0. Teste os dois sentidos!', severity: 'ERRO' },
    ],
    focusTags: ['if/else', 'Operador módulo', 'Operadores lógicos'],
  },
  {
    moduleId: 4,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Duração de jogo entre dias',
    estimatedMinutes: 14,
    prompt: 'Leia a hora inicial e a hora final de um jogo. A seguir calcule a duração do jogo, sabendo que o mesmo pode começar em um dia e terminar em outro, tendo duração mínima de 1 hora e máxima de 24 horas.',
    examples: [
      { input: '16 2', expectedOutput: 'O JOGO DUROU 10 HORA(S)' },
      { input: '0 0', expectedOutput: 'O JOGO DUROU 24 HORA(S)' },
    ],
    requirements: ['Considerar virada de meia-noite (fim <= inicio)', 'Garantir caso 0 0 => 24 horas', 'Imprimir exatamente O JOGO DUROU X HORA(S)'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int horaInicial = sc.nextInt();\n        int horaFinal = sc.nextInt();\n        // Calcule a duração considerando virada do dia\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Caso início == fim', detail: 'Quando horaInicial == horaFinal, a duração mínima é 1h, então o resultado deve ser 24h, não 0h.', severity: 'ERRO' },
    ],
    focusTags: ['Condicional composta', 'Lógica de intervalo'],
  },
  {
    moduleId: 4,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Cálculo progressivo de Imposto de Renda',
    estimatedMinutes: 18,
    prompt: 'Leia um salário com duas casas decimais e calcule o imposto progressivo por faixas: até 2000.00 (Isento), de 2000.01 a 3000.00 (8%), de 3000.01 a 4500.00 (18%), acima de 4500.00 (28%). Cada faixa incide apenas sobre a parcela excedente.',
    examples: [
      { input: '3002.00', expectedOutput: 'R$ 80.36' },
      { input: '1701.12', expectedOutput: 'Isento' },
    ],
    requirements: ['Aplicar alíquota apenas sobre cada faixa excedente', 'Configurar Locale.US', 'Formatar saída R$ %.2f ou Isento'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        double salario = sc.nextDouble();\n        // Calcule o imposto por faixa progressiva\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Faixas progressivas vs alíquota única', detail: 'Não aplique 18% sobre os R$ 3002 inteiros; apenas os R$ 2 acima de 3000 pagam 18% e R$ 1000 pagam 8%.', severity: 'ERRO' },
      { title: 'Encadeamento if / else if', detail: 'Estruture as faixas em ordem crescente para evitar condições redundantes.', severity: 'DICA' },
    ],
    focusTags: ['if/else encadeado', 'Faixas progressivas', 'printf'],
  },

  // Módulo 05 - Estruturas repetitivas
  {
    moduleId: 5,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Validação contínua de senha',
    estimatedMinutes: 8,
    prompt: 'Escreva um programa que repita a leitura de uma senha até que ela seja válida (2002). Para cada leitura incorreta imprima "Senha Invalida". Quando acertar, imprima "Acesso Permitido".',
    examples: [
      { input: '2200\n1020\n2002', expectedOutput: 'Senha Invalida\nSenha Invalida\nAcesso Permitido' },
    ],
    requirements: ['Usar laço while', 'Encerrar imediatamente ao ler 2002', 'Fechar Scanner após o laço'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int senha = sc.nextInt();\n        // Repita enquanto a senha for diferente de 2002\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Loop infinito por esquecer nova leitura', detail: 'Sempre chame sc.nextInt() dentro do while para atualizar a variável senha.', severity: 'ERRO' },
    ],
    focusTags: ['while', 'Condição de parada'],
  },
  {
    moduleId: 5,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Média ponderada em lote',
    estimatedMinutes: 14,
    prompt: 'Leia um inteiro N indicando o número de casos de teste. Cada caso contém 3 valores reais. Imprima a média ponderada de cada caso com 1 casa decimal (pesos 2, 3 e 5).',
    examples: [
      { input: '2\n6.5 4.3 6.2\n5.1 4.2 8.1', expectedOutput: '5.7\n6.3' },
    ],
    requirements: ['Usar laço for de 0 até N', 'Pesos 2, 3 e 5 (soma = 10)', 'Formatar com %.1f e Locale.US'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        int quantidadeCasos = sc.nextInt();\n        // Itere N vezes calculando a média ponderada\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Declarar pesos como constantes', detail: 'Usar constantes ou soma 10.0 explícita evita números mágicos no código.', severity: 'DICA' },
    ],
    focusTags: ['for', 'Média ponderada', 'Locale.US'],
  },
  {
    moduleId: 5,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Sequência de Fibonacci e soma de pares',
    estimatedMinutes: 16,
    prompt: 'Leia um inteiro N (1 <= N <= 40), gere os N primeiros termos da sequência de Fibonacci e mostre na primeira linha os termos separados por espaço e na segunda linha SOMA_PARES=<valor>.',
    examples: [
      { input: '6', expectedOutput: '0 1 1 2 3 5\nSOMA_PARES=2' },
    ],
    requirements: ['Tratar N=1 e N=2 corretamente', 'Acumular apenas termos pares', 'Evitar espaço extra ao final da linha'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Gere Fibonacci iterativamente e some os termos pares\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Complexidade O(n) iterativa', detail: 'Evite recursão ingênua para Fibonacci; use duas variáveis anterior e atual.', severity: 'DICA' },
      { title: 'Espaço à direita', detail: 'Use StringBuilder ou condicional i > 0 para não deixar espaço sobrando após o último número.', severity: 'AVISO' },
    ],
    focusTags: ['for', 'Fibonacci', 'Acumuladores'],
  },

  // Módulo 06 - Outros tópicos básicos sobre Java
  {
    moduleId: 6,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Normalização e split de String',
    estimatedMinutes: 10,
    prompt: 'Leia uma linha com palavras separadas por espaço e vírgulas extras, remova espaços das pontas, converta para minúsculas e imprima cada palavra em uma linha.',
    examples: [
      { input: '  Java, Spring, POO  ', expectedOutput: 'java\nspring\npoo' },
    ],
    requirements: ['Usar trim(), toLowerCase(), replace() e split()', 'Ignorar tokens vazios', 'Ler linha inteira com nextLine()'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        String linha = sc.nextLine();\n        // Normalize a String e faça o split\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Regex de separação', detail: 'split("[,\\\\s]+") separa múltiplos espaços e vírgulas de uma só vez.', severity: 'DICA' },
    ],
    focusTags: ['Strings', 'split', 'trim'],
  },
  {
    moduleId: 6,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Função estática para maior de três',
    estimatedMinutes: 12,
    prompt: 'Crie um método estático maxDeTres(int a, int b, int c) fora do main e utilize-o para ler três inteiros e imprimir MAIOR=<valor>.',
    examples: [
      { input: '7 15 9', expectedOutput: 'MAIOR=15' },
    ],
    requirements: ['Extrair lógica para método auxiliar static', 'Manter main limpo e legível', 'Tratar números negativos'],
    starterCode: [
      'import java.util.Scanner;',
      '',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        Scanner sc = new Scanner(System.in);',
      '        int a = sc.nextInt();',
      '        int b = sc.nextInt();',
      '        int c = sc.nextInt();',
      '        System.out.println("MAIOR=" + maxDeTres(a, b, c));',
      '        sc.close();',
      '    }',
      '',
      '    public static int maxDeTres(int a, int b, int c) {',
      '        // Implemente a comparação',
      '        return 0;',
      '    }',
      '}',
    ].join('\n'),
    preloadedImprovements: [
      { title: 'Modularização em funções', detail: 'Delegar cálculos para métodos estáticos prepara o terreno para Orientação a Objetos.', severity: 'DICA' },
    ],
    focusTags: ['Funções', 'Modularização', 'Escopo'],
  },
  {
    moduleId: 6,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Verificação de bit ativo com operador bitwise',
    estimatedMinutes: 15,
    prompt: 'Leia um número inteiro N e uma posição de bit K (0 a 31). Usando máscara bitwise (& e <<), informe se o K-ésimo bit está ligado ("BIT=1") ou desligado ("BIT=0").',
    examples: [
      { input: '89 5', expectedOutput: 'BIT=0' },
      { input: '113 5', expectedOutput: 'BIT=1' },
    ],
    requirements: ['Usar máscara (1 << k)', 'Usar operador & bitwise', 'Imprimir BIT=1 ou BIT=0'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int numero = sc.nextInt();\n        int bitPosicao = sc.nextInt();\n        // Aplique a máscara bitwise (1 << bitPosicao)\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Operador & vs &&', detail: 'Para máscaras de bits use & simples; && é apenas para booleanos.', severity: 'ERRO' },
    ],
    focusTags: ['Bitwise', 'Máscaras de bits'],
  },

  // Módulo 07 - Introdução à POO
  {
    moduleId: 7,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Classe Retângulo com área e perímetro',
    estimatedMinutes: 12,
    prompt: 'Crie uma classe Rectangle com atributos width e height e métodos area(), perimeter() e diagonal(). No main, leia largura e altura e imprima os três valores com 2 casas decimais.',
    examples: [
      { input: '3.00\n4.00', expectedOutput: 'AREA = 12.00\nPERIMETER = 14.00\nDIAGONAL = 5.00' },
    ],
    requirements: ['Criar classe Rectangle com métodos de instância', 'Usar Math.sqrt para diagonal', 'Formatar com %.2f e Locale.US'],
    starterCode: [
      'import java.util.Locale;',
      'import java.util.Scanner;',
      '',
      'class Rectangle {',
      '    public double width;',
      '    public double height;',
      '    // Implemente area(), perimeter() e diagonal()',
      '}',
      '',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        Locale.setDefault(Locale.US);',
      '        Scanner sc = new Scanner(System.in);',
      '        sc.close();',
      '    }',
      '}',
    ].join('\n'),
    preloadedImprovements: [
      { title: 'Coesão de classe', detail: 'O cálculo da área pertence à classe Rectangle, não ao método main.', severity: 'DICA' },
    ],
    focusTags: ['Classes', 'Métodos', 'Coesão'],
  },
  {
    moduleId: 7,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Folha salarial de Employee com aumento',
    estimatedMinutes: 15,
    prompt: 'Crie uma classe Employee com name, grossSalary e tax. Implemente netSalary() e increaseSalary(double percentage). Leia os dados, aplique o percentual de aumento e mostre o salário atualizado.',
    examples: [
      { input: 'Joao Silva\n6000.00\n1000.00\n10.0', expectedOutput: 'Employee: Joao Silva, $ 5000.00\nUpdated data: Joao Silva, $ 5600.00' },
    ],
    requirements: ['Aumento incide sobre o grossSalary', 'Sobrescrever toString() com String.format', 'Cuidar da quebra de linha após nextDouble()'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Crie e manipule a classe Employee\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Base do aumento', detail: 'O aumento percentual incide sobre o salário bruto (grossSalary), não sobre o líquido.', severity: 'ERRO' },
    ],
    focusTags: ['Objetos', 'toString', 'Comportamento'],
  },
  {
    moduleId: 7,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Conversor estático de moeda com IOF',
    estimatedMinutes: 16,
    prompt: 'Crie uma classe utilitária CurrencyConverter com constante estática IOF = 0.06 e método estático dollarToReal(double amount, double dollarPrice). Leia cotação e dólares comprados e imprima o valor final em reais.',
    examples: [
      { input: '3.10\n200.00', expectedOutput: 'Amount to be paid in reais = 657.20' },
    ],
    requirements: ['Usar método e constante static (sem instanciar CurrencyConverter)', 'Aplicar 6% de IOF', 'Formatar com %.2f'],
    starterCode: [
      'import java.util.Locale;',
      'import java.util.Scanner;',
      '',
      'class CurrencyConverter {',
      '    public static final double IOF = 0.06;',
      '    // Implemente dollarToReal',
      '}',
      '',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        Locale.setDefault(Locale.US);',
      '        Scanner sc = new Scanner(System.in);',
      '        sc.close();',
      '    }',
      '}',
    ].join('\n'),
    preloadedImprovements: [
      { title: 'Membros estáticos', detail: 'Conversores sem estado de instância devem expor métodos static e constante static final.', severity: 'DICA' },
    ],
    focusTags: ['static', 'Constantes', 'Design POO'],
  },

  // Módulo 08 - Construtores, this, sobrecarga, encapsulamento
  {
    moduleId: 8,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Encapsulamento de Product com construtor',
    estimatedMinutes: 12,
    prompt: 'Implemente a classe Product com atributos privados name, price e quantity, construtores sobrecarregados e getters/setters. Leia os dados e exiba o valor total em estoque.',
    examples: [
      { input: 'TV\n900.00\n10', expectedOutput: 'Product data: TV, $ 900.00, 10 units, Total: $ 9000.00' },
    ],
    requirements: ['Atributos private', 'Usar this nos construtores', 'Sobrecarga de construtor sem quantity (padrão 0)'],
    starterCode: [
      'import java.util.Locale;',
      'import java.util.Scanner;',
      '',
      'class Product {',
      '    private String name;',
      '    private double price;',
      '    private int quantity;',
      '    // Construtores e getters/setters',
      '}',
      '',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        Locale.setDefault(Locale.US);',
      '        Scanner sc = new Scanner(System.in);',
      '        sc.close();',
      '    }',
      '}',
    ].join('\n'),
    preloadedImprovements: [
      { title: 'Proteja os atributos', detail: 'Evite deixar atributos public; exponha leitura/escrita controlada via getters e setters.', severity: 'AVISO' },
    ],
    focusTags: ['Encapsulamento', 'this', 'Sobrecarga'],
  },
  {
    moduleId: 8,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Conta bancária com taxa de saque',
    estimatedMinutes: 16,
    prompt: 'Crie a classe Account com number (imutável após criação), holder (alterável) e balance (alterável apenas via deposit e withdraw). Todo saque cobra taxa fixa de $ 5.00.',
    examples: [
      { input: '8532\nAlex Green\ny\n500.00\n200.00\n300.00', expectedOutput: 'Account 8532, Holder: Alex Green, Balance: $ 500.00\nAccount 8532, Holder: Alex Green, Balance: $ 700.00\nAccount 8532, Holder: Alex Green, Balance: $ 395.00' },
    ],
    requirements: ['Não criar setBalance()', 'Usar deposit() no construtor com depósito inicial', 'Cobrar taxa de 5.00 em withdraw()'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente a classe Account com encapsulamento estrito\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Reutilize deposit() no construtor', detail: 'Se a regra de depósito mudar no futuro, chamar deposit(initialDeposit) no construtor evita duplicação.', severity: 'DICA' },
      { title: 'Buffer do Scanner após nextInt()', detail: 'Chame sc.nextLine() para consumir a quebra de linha pendente antes de ler o nome do titular.', severity: 'ERRO' },
    ],
    focusTags: ['Encapsulamento', 'Imutabilidade', 'Buffer Scanner'],
  },
  {
    moduleId: 8,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Pedido imutável com Builder interno',
    estimatedMinutes: 20,
    prompt: 'Implemente uma classe OrderConfig com campos final id, customer, discount e priority, usando construtor privado e sobrecarga/encadeamento com this(...) para valores padrão.',
    examples: [
      { input: '101\nMarina\n0.10', expectedOutput: 'OrderConfig[id=101, customer=Marina, discount=0.10, priority=NORMAL]' },
    ],
    requirements: ['Todos os campos private final', 'Encadear construtores com this(...)', 'Validar desconto entre 0.0 e 0.5'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente OrderConfig imutável\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Validação no construtor canônico', detail: 'Centralize todas as validações em um único construtor e delegue os demais via this(...).', severity: 'DICA' },
    ],
    focusTags: ['Imutabilidade', 'final', 'Encadeamento this()'],
  },

  // Módulo 09 - Memória, arrays, listas
  {
    moduleId: 9,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Filtro de números negativos em vetor',
    estimatedMinutes: 10,
    prompt: 'Leia um inteiro N (máximo 10), armazene N inteiros em um vetor e depois mostre na tela todos os números negativos lidos.',
    examples: [
      { input: '4\n8\n-2\n9\n-10', expectedOutput: 'NUMEROS NEGATIVOS:\n-2\n-10' },
    ],
    requirements: ['Alocar vetor int[] com tamanho N', 'Percorrer usando vet.length', 'Exibir um negativo por linha'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] numeros = new int[n];\n        // Leia o vetor e imprima os negativos\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Prefira .length a variável N solta', detail: 'Usar numeros.length no for protege contra inconsistências.', severity: 'DICA' },
    ],
    focusTags: ['Vetores', 'Alocação em heap'],
  },
  {
    moduleId: 9,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Aumento salarial com List<Employee>',
    estimatedMinutes: 16,
    prompt: 'Leia N funcionários (id, name, salary) em uma List<Employee>. Em seguida leia um id e uma porcentagem de aumento. Se o id existir, aumente o salário; caso contrário imprima "This id does not exist!".',
    examples: [
      { input: '2\n333\nMaria Brown\n4000.00\n536\nAlex Grey\n3000.00\n536\n10.0', expectedOutput: '333, Maria Brown, 4000.00\n536, Alex Grey, 3300.00' },
    ],
    requirements: ['Usar ArrayList<Employee>', 'Buscar por id usando stream().filter(...).findFirst() ou método auxiliar', 'Não permitir null pointer'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        List<Employee> list = new ArrayList<>();\n        // Leia funcionários, busque por ID e aplique aumento\n        sc.close();',
      'import java.util.ArrayList;\nimport java.util.List;\nimport java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Programar voltado à interface List', detail: 'Declare List<Employee> list = new ArrayList<>(); em vez de acoplar à classe concreta.', severity: 'DICA' },
      { title: 'Verificar null ao buscar ID', detail: 'Se o ID não existir, emp será null — trate antes de chamar increaseSalary.', severity: 'ERRO' },
    ],
    focusTags: ['ArrayList', 'Busca em lista', 'Null safety'],
  },
  {
    moduleId: 9,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Vizinhos de ocorrência em Matriz M x N',
    estimatedMinutes: 20,
    prompt: 'Leia dois inteiros M e N e uma matriz de M linhas por N colunas. Em seguida leia um valor X e, para cada ocorrência de X, imprima sua posição e os valores Left, Right, Up e Down quando existirem.',
    examples: [
      { input: '3 4\n10 8 15 12\n21 11 23 8\n14 5 13 19\n8', expectedOutput: 'Position 0,1:\nLeft: 10\nRight: 15\nDown: 11\nPosition 1,3:\nLeft: 23\nUp: 12\nDown: 19' },
    ],
    requirements: ['Validar limites i > 0, j > 0, i < mat.length - 1, j < mat[i].length - 1', 'Evitar ArrayIndexOutOfBoundsException'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        int m = sc.nextInt();\n        int n = sc.nextInt();\n        int[][] mat = new int[m][n];\n        // Leia a matriz e exiba os vizinhos válidos de X\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Checagem de bordas da matriz', detail: 'Sempre valide j > 0 antes de acessar mat[i][j-1] e j < mat[i].length - 1 antes de mat[i][j+1].', severity: 'ERRO' },
    ],
    focusTags: ['Matrizes 2D', 'Limites de índice'],
  },

  // Módulo 10 - Data-hora
  {
    moduleId: 10,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Formatação com LocalDate e DateTimeFormatter',
    estimatedMinutes: 10,
    prompt: 'Leia uma data no formato ISO (yyyy-MM-dd) e imprima no formato brasileiro dd/MM/yyyy.',
    examples: [
      { input: '2026-11-17', expectedOutput: '17/11/2026' },
    ],
    requirements: ['Usar LocalDate.parse()', 'Usar DateTimeFormatter.ofPattern("dd/MM/yyyy")', 'Não usar java.util.Date legado'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        String isoDate = sc.nextLine();\n        // Converta com LocalDate e DateTimeFormatter\n        sc.close();',
      'import java.time.LocalDate;\nimport java.time.format.DateTimeFormatter;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'MM maiúsculo para mês', detail: 'No padrão DateTimeFormatter, MM representa mês e mm representa minutos.', severity: 'ERRO' },
    ],
    focusTags: ['LocalDate', 'DateTimeFormatter'],
  },
  {
    moduleId: 10,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Conversão de Instant UTC para fuso local',
    estimatedMinutes: 14,
    prompt: 'Leia um timestamp UTC ISO-8601 (ex: 2026-07-20T01:30:26Z) e converta para o fuso America/Sao_Paulo no formato dd/MM/yyyy HH:mm.',
    examples: [
      { input: '2026-07-20T01:30:26Z', expectedOutput: '19/07/2026 22:30' },
    ],
    requirements: ['Usar Instant.parse()', 'Usar ZoneId.of("America/Sao_Paulo")', 'Converter com LocalDateTime.ofInstant()'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        Instant instant = Instant.parse(sc.nextLine());\n        // Converta para America/Sao_Paulo\n        sc.close();',
      'import java.time.Instant;\nimport java.time.LocalDateTime;\nimport java.time.ZoneId;\nimport java.time.format.DateTimeFormatter;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Instant exige ZoneId para formatar', detail: 'Um Instant representa um ponto global em UTC; informe o ZoneId ao DateTimeFormatter ou converta para ZonedDateTime/LocalDateTime.', severity: 'AVISO' },
    ],
    focusTags: ['Instant', 'ZoneId', 'Fuso horário'],
  },
  {
    moduleId: 10,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Cálculo de Duration entre turnos',
    estimatedMinutes: 16,
    prompt: 'Leia dois instantes ISO-8601 (início e fim de plantão) e calcule a duração exata em horas e minutos restantes usando Duration.between().',
    examples: [
      { input: '2026-11-17T08:15:00Z\n2026-11-17T17:45:00Z', expectedOutput: 'DURACAO: 9h 30m' },
    ],
    requirements: ['Usar Duration.between(inicio, fim)', 'Extrair toHours() e toMinutesPart()', 'Não fazer aritmética manual de milissegundos'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        Instant inicio = Instant.parse(sc.nextLine());\n        Instant fim = Instant.parse(sc.nextLine());\n        // Calcule a Duration\n        sc.close();',
      'import java.time.Duration;\nimport java.time.Instant;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'toMinutes() vs toMinutesPart()', detail: 'toMinutes() retorna o total acumulado (ex: 570), enquanto toMinutesPart() retorna apenas os minutos restantes (30).', severity: 'ERRO' },
    ],
    focusTags: ['Duration', 'Java Time API'],
  },

  // Módulo 11 - Enumerações, composição
  {
    moduleId: 11,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Enum OrderStatus e transição de estado',
    estimatedMinutes: 10,
    prompt: 'Crie um enum OrderStatus (PENDING_PAYMENT, PROCESSING, SHIPPED, DELIVERED), leia uma string de status via OrderStatus.valueOf() e imprima o status atual.',
    examples: [
      { input: 'PROCESSING', expectedOutput: 'STATUS=PROCESSING' },
    ],
    requirements: ['Definir enum OrderStatus', 'Converter String para enum com valueOf()', 'Tratar entrada em maiúsculas'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        String rawStatus = sc.nextLine().trim().toUpperCase();\n        // Converta para OrderStatus\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Padronize antes do valueOf()', detail: 'Aplicar .trim().toUpperCase() evita IllegalArgumentException por espaços ou minúsculas.', severity: 'AVISO' },
    ],
    focusTags: ['enum', 'valueOf'],
  },
  {
    moduleId: 11,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Composição Worker e HourContract',
    estimatedMinutes: 16,
    prompt: 'Modele Worker (nome, nível WorkerLevel, baseSalary, Department) com uma lista de HourContract. Leia os contratos e implemente income(int year, int month) somando apenas contratos daquele mês/ano.',
    examples: [
      { input: 'Design\nAlex\nMID_LEVEL\n1200.00\n2\n20/08/2018\n50.00\n20\n13/06/2018\n30.00\n18\n08/2018', expectedOutput: 'Name: Alex\nDepartment: Design\nIncome for 08/2018: 2200.00' },
    ],
    requirements: ['Relacionamento tem-muitos com List<HourContract>', 'Filtrar ano e mês do contrato', 'Formatar renda com %.2f'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Modele Department, Worker e HourContract\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Delegue cálculo de contrato', detail: 'Crie totalValue() dentro de HourContract em vez de multiplicar horas * valorHora dentro de Worker.', severity: 'DICA' },
    ],
    focusTags: ['Composição', 'UML para Java', 'enum'],
  },
  {
    moduleId: 11,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Resumo de Order com StringBuilder',
    estimatedMinutes: 18,
    prompt: 'Modele Order contendo Client, OrderStatus e List<OrderItem> (com Product). Implemente toString() usando StringBuilder para montar o resumo formatado do pedido e o preço total.',
    examples: [
      { input: 'Alex Green\nPROCESSING\n2\nTV\n1000.00\n1\nMouse\n40.00\n2', expectedOutput: 'ORDER SUMMARY:\nOrder status: PROCESSING\nClient: Alex Green\nOrder items:\nTV, $1000.00, Quantity: 1, Subtotal: $1000.00\nMouse, $40.00, Quantity: 2, Subtotal: $80.00\nTotal price: $1080.00' },
    ],
    requirements: ['Usar StringBuilder no toString() de Order', 'Não expor setters que quebrem a lista de itens (usar addItem/removeItem)'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente Order, OrderItem, Product e Client\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'StringBuilder em laços', detail: 'Concatenar Strings com + dentro de loops cria múltiplos objetos intermediários; use StringBuilder.append().', severity: 'DICA' },
    ],
    focusTags: ['Composição', 'StringBuilder', 'Encapsulamento'],
  },

  // Módulo 12 - Herança e polimorfismo
  {
    moduleId: 12,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Herança Employee e OutsourcedEmployee',
    estimatedMinutes: 12,
    prompt: 'Crie Employee com payment() e a subclasse OutsourcedEmployee com additionalCharge e pagamento acrescido de 110% dessa despesa. Use @Override.',
    examples: [
      { input: 'Alex\n50\n20.00\n200.00', expectedOutput: 'Alex - $ 1220.00' },
    ],
    requirements: ['Usar extends Employee', 'Sobrescrever payment() com @Override e super.payment()', 'Armazenar em List<Employee>'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente Employee e OutsourcedEmployee\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Sempre anote @Override', detail: '@Override garante em tempo de compilação que você realmente sobrescreveu o método da superclasse.', severity: 'AVISO' },
    ],
    focusTags: ['Herança', 'super', '@Override'],
  },
  {
    moduleId: 12,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Polimorfismo de etiquetas de Product',
    estimatedMinutes: 16,
    prompt: 'Modele Product, ImportedProduct (com customsFee) e UsedProduct (com manufactureDate), todos sobrescrevendo priceTag(). Leia N produtos e imprima todas as etiquetas polimorficamente.',
    examples: [
      { input: '2\ni\nTablet\n260.00\n20.00\nc\nNotebook\n1100.00', expectedOutput: 'PRICE TAGS:\nTablet $ 280.00 (Customs fee: $ 20.00)\nNotebook $ 1100.00' },
    ],
    requirements: ['Lista tipada como List<Product>', 'Chamar item.priceTag() sem instanceof', 'Usar @Override nas subclasses'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Crie a hierarquia Product -> ImportedProduct / UsedProduct\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Evite instanceof para comportamento polimórfico', detail: 'Deixe o dispatch dinâmico do Java escolher qual priceTag() executar.', severity: 'DICA' },
    ],
    focusTags: ['Polimorfismo', 'Upcasting', 'Hierarquia'],
  },
  {
    moduleId: 12,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Classes e métodos abstratos para TaxPayer',
    estimatedMinutes: 18,
    prompt: 'Crie a classe abstrata TaxPayer com método abstrato tax(). Subclasses Individual (saúde abate 50% do imposto) e Company (16% ou 14% se >10 funcionários). Calcule e exiba os impostos e o total.',
    examples: [
      { input: '2\ni\nAlex\n50000.00\n2000.00\nc\nSoftTech\n400000.00\n25', expectedOutput: 'TAXES PAID:\nAlex: $ 11500.00\nSoftTech: $ 56000.00\nTOTAL TAXES: $ 67500.00' },
    ],
    requirements: ['TaxPayer deve ser abstract class', 'tax() deve ser abstract double tax()', 'Somar total usando polimorfismo'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente abstract class TaxPayer, Individual e Company\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Imposto nunca negativo', detail: 'Se o abatimento de saúde superar o imposto bruto, retorne Math.max(0.0, imposto).', severity: 'AVISO' },
    ],
    focusTags: ['abstract', 'Polimorfismo', 'Regras de negócio'],
  },

  // Módulo 13 - Tratamento de exceções
  {
    moduleId: 13,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Proteção contra divisão e índice inválido',
    estimatedMinutes: 10,
    prompt: 'Leia um array de inteiros e um índice. Tente acessar o índice e dividir 100 pelo valor encontrado, capturando ArrayIndexOutOfBoundsException e ArithmeticException com mensagens claras.',
    examples: [
      { input: '3\n10 0 5\n1', expectedOutput: 'Error: division by zero' },
      { input: '3\n10 2 5\n5', expectedOutput: 'Error: index out of bounds' },
    ],
    requirements: ['Usar blocos try / catch específicos', 'Nunca deixar catch vazio', 'Fechar Scanner no finally ou try-with-resources'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        // Leia o vetor, o índice e trate as exceções\n        sc.close();',
      'import java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Capture exceções específicas', detail: 'Evite catch (Exception e) genérico quando você sabe exatamente quais falhas podem ocorrer.', severity: 'AVISO' },
    ],
    focusTags: ['try/catch', 'Exceções checked/unchecked'],
  },
  {
    moduleId: 13,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Exceção personalizada em Account.withdraw',
    estimatedMinutes: 16,
    prompt: 'Crie a classe DomainException (extends RuntimeException ou Exception) e valide na Account que o saque não pode exceder withdrawLimit nem o balance atual.',
    examples: [
      { input: '8021\nBob Brown\n500.00\n300.00\n400.00', expectedOutput: 'Withdraw error: The amount exceeds withdraw limit' },
    ],
    requirements: ['Criar DomainException personalizada', 'Validar regras dentro de Account.withdraw()', 'Capturar no main e exibir Withdraw error: <mensagem>'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente DomainException e valide o saque dentro de Account\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Regra de negócio dentro do modelo', detail: 'Valide limites dentro de Account.withdraw(), não no main().', severity: 'ERRO' },
    ],
    focusTags: ['Exceções personalizadas', 'Domínio rico'],
  },
  {
    moduleId: 13,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Validação de reservas de hotel com updateDates',
    estimatedMinutes: 18,
    prompt: 'Modele Reservation(roomNumber, checkIn, checkOut) lançando DomainException se checkOut <= checkIn ou se updateDates tentar datas no passado.',
    examples: [
      { input: '8021\n23/09/2026\n26/09/2026\n24/09/2026\n22/09/2026', expectedOutput: 'Error in reservation: Check-out date must be after check-in date' },
    ],
    requirements: ['Validar no construtor e no updateDates()', 'Usar LocalDate e ChronoUnit.DAYS', 'Tratar DateTimeParseException e DomainException'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        // Implemente Reservation com validação defensiva\n        sc.close();',
      'import java.time.LocalDate;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Construtor deve validar invariantes', detail: 'Nunca permita criar uma Reservation inválida para depois validar.', severity: 'AVISO' },
    ],
    focusTags: ['Invariantes', 'Exceções de domínio', 'LocalDate'],
  },

  // Módulo 14 - Trabalhando com arquivos
  {
    moduleId: 14,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Parser CSV de produtos em memória',
    estimatedMinutes: 12,
    prompt: 'Dadas N linhas no formato "Nome,Preco,Quantidade" lidas via BufferedReader/Scanner, calcule o subtotal de cada item e imprima "Nome,Subtotal" com 2 casas decimais.',
    examples: [
      { input: '2\nTV LED,1290.99,1\nVideo Game,350.50,3', expectedOutput: 'TV LED,1290.99\nVideo Game,1051.50' },
    ],
    requirements: ['Usar try-with-resources', 'Fazer split(",") e Double.parseDouble()', 'Formatar subtotal com %.2f'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        try (Scanner sc = new Scanner(System.in)) {\n            // Leia N linhas CSV e processe os itens\n        }',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'try-with-resources obrigatório', detail: 'Sempre envolva streams e readers em try (...) para fechar automaticamente mesmo com exceção.', severity: 'AVISO' },
    ],
    focusTags: ['CSV', 'try-with-resources', 'Parsing'],
  },
  {
    moduleId: 14,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Leitura com BufferedReader e StringReader',
    estimatedMinutes: 15,
    prompt: 'Simule a leitura de um arquivo de logs usando BufferedReader envolvendo um fluxo de entrada, ignore linhas em branco ou iniciadas por "#" e conte quantas linhas válidas existem.',
    examples: [
      { input: '# config\nINFO Server started\n\nWARN High memory\nEND', expectedOutput: 'VALID_LINES=2' },
    ],
    requirements: ['Usar BufferedReader.readLine() até null', 'Ignorar comentários "#" e linhas vazias', 'Parar ao encontrar END'],
    starterCode: makeStarter(
      '        try (BufferedReader br = new BufferedReader(new InputStreamReader(System.in))) {\n            // Leia linhas até END ou null\n        } catch (IOException e) {\n            System.out.println("Error: " + e.getMessage());\n        }',
      'import java.io.BufferedReader;\nimport java.io.IOException;\nimport java.io.InputStreamReader;'
    ),
    preloadedImprovements: [
      { title: 'Trate IOException explicitamente', detail: 'Informe a causa da IOException no log de erro em vez de ignorá-la.', severity: 'AVISO' },
    ],
    focusTags: ['BufferedReader', 'IOException', 'Streams I/O'],
  },
  {
    moduleId: 14,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Agregador de vendas por arquivo CSV',
    estimatedMinutes: 18,
    prompt: 'Leia linhas CSV "Categoria;Produto;Valor;Qtd" e gere um resumo ordenado por categoria somando o total vendido, utilizando try-with-resources e tratamento de linha malformada.',
    examples: [
      { input: 'Eletronicos;Mouse;50.00;2\nLivros;Clean Code;120.00;1\nEletronicos;Teclado;150.00;1\nEND', expectedOutput: 'Eletronicos: 250.00\nLivros: 120.00' },
    ],
    requirements: ['Usar TreeMap para manter categorias ordenadas', 'Validar 4 colunas após split(";")', 'Formatar totais com %.2f'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        // Leia com BufferedReader e agregue com Map<String, Double>',
      'import java.io.*;\nimport java.util.*;'
    ),
    preloadedImprovements: [
      { title: 'merge() simplifica acumulação em Map', detail: 'Use map.merge(categoria, total, Double::sum) em vez de if (containsKey).', severity: 'DICA' },
    ],
    focusTags: ['BufferedReader', 'Agregação CSV', 'TreeMap'],
  },

  // Módulo 15 - Interfaces
  {
    moduleId: 15,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Contrato TaxService para aluguel de carros',
    estimatedMinutes: 12,
    prompt: 'Defina a interface TaxService com double tax(double amount) e implemente BrazilTaxService (20% até 100.00, 15% acima). Calcule e imprima o imposto para um valor lido.',
    examples: [
      { input: '120.00', expectedOutput: 'TAX=18.00' },
    ],
    requirements: ['Declarar interface TaxService', 'Implementar com implements TaxService', 'Injetar dependência via interface no serviço'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        TaxService taxService = new BrazilTaxService();\n        // Calcule e imprima TAX=%.2f\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Inversão de dependência', detail: 'Dependa da interface TaxService na variável e no construtor, não da classe concreta.', severity: 'DICA' },
    ],
    focusTags: ['Interfaces', 'Injeção de dependência'],
  },
  {
    moduleId: 15,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Processador de parcelas com OnlinePaymentService',
    estimatedMinutes: 18,
    prompt: 'Modele ContractService que recebe OnlinePaymentService via construtor. Para um contrato de valor total e N meses, cada parcela recebe 1% de juros simples ao mês + 2% de taxa de pagamento.',
    examples: [
      { input: '600.00\n3', expectedOutput: 'Parcela 1: 206.04\nParcela 2: 208.08\nParcela 3: 210.12' },
    ],
    requirements: ['Interface OnlinePaymentService com paymentFee() e interest()', 'Implementação PaypalService', 'Injeção de dependência via construtor'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente OnlinePaymentService, PaypalService e ContractService\n        sc.close();',
      'import java.util.Locale;\nimport java.util.Scanner;'
    ),
    preloadedImprovements: [
      { title: 'Ordem dos juros e taxa', detail: 'Primeiro aplique o juro simples (amount + interest(amount, month)), depois a taxa sobre o resultado.', severity: 'ERRO' },
    ],
    focusTags: ['Interfaces', 'Serviços', 'Injeção de dependência'],
  },
  {
    moduleId: 15,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Ordenação de objetos com Comparable<T> e default method',
    estimatedMinutes: 18,
    prompt: 'Crie uma interface InterestService com default method payment(double amount, int months) usando Math.pow, e uma classe Worker implements Comparable<Worker> ordenada por salário decrescente.',
    examples: [
      { input: '3\nAna 3500.00\nBruno 4200.00\nCarla 2900.00', expectedOutput: 'Bruno - 4200.00\nAna - 3500.00\nCarla - 2900.00' },
    ],
    requirements: ['Usar Comparable<Worker> e Collections.sort()', 'Implementar compareTo retornando ordem decrescente'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente Worker implements Comparable<Worker>\n        sc.close();',
      'import java.util.*;'
    ),
    preloadedImprovements: [
      { title: 'Double.compare evita bugs de precisão', detail: 'No compareTo, use -Double.compare(this.salary, other.salary) em vez de subtração direta.', severity: 'AVISO' },
    ],
    focusTags: ['Comparable', 'default methods', 'Ordenação'],
  },

  // Módulo 16 - Generics, Set, Map
  {
    moduleId: 16,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Contagem de alunos únicos com Set<Integer>',
    estimatedMinutes: 12,
    prompt: 'Leia os códigos inteiros dos alunos matriculados em 3 cursos (A, B, C) e informe quantos alunos distintos existem no total utilizando HashSet.',
    examples: [
      { input: '2\n21 35\n2\n21 50\n1\n35', expectedOutput: 'Total students: 3' },
    ],
    requirements: ['Usar Set<Integer> = new HashSet<>()', 'Usar addAll() ou add() para união de conjuntos', 'Imprimir Total students: <qtd>'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        Set<Integer> alunos = new HashSet<>();\n        // Leia os 3 cursos e conte alunos únicos\n        sc.close();',
      'import java.util.HashSet;\nimport java.util.Scanner;\nimport java.util.Set;'
    ),
    preloadedImprovements: [
      { title: 'Complexidade O(1) no HashSet', detail: 'Não use List.contains() para remover duplicatas; HashSet garante unicidade em O(1).', severity: 'DICA' },
    ],
    focusTags: ['Set', 'HashSet', 'Unicidade'],
  },
  {
    moduleId: 16,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Totalização de votos por candidato com Map',
    estimatedMinutes: 15,
    prompt: 'Leia N registros de urna ("Candidato,Votos") e some os votos por candidato usando Map<String, Integer>, exibindo o resultado em ordem alfabética.',
    examples: [
      { input: '4\nAlex Blue,15\nMaria Green,22\nAlex Blue,30\nBob Brown,10', expectedOutput: 'Alex Blue: 45\nBob Brown: 10\nMaria Green: 22' },
    ],
    requirements: ['Usar TreeMap para ordenação automática de chaves', 'Acumular votos repetidos', 'Imprimir Candidato: Votos'],
    starterCode: makeStarter(
      '        Scanner sc = new Scanner(System.in);\n        Map<String, Integer> votos = new TreeMap<>();\n        // Leia os registros e acumule os votos\n        sc.close();',
      'import java.util.*;'
    ),
    preloadedImprovements: [
      { title: 'Evite get() + null check manual', detail: 'Use votos.merge(nome, qtd, Integer::sum) para somar de forma limpa.', severity: 'DICA' },
    ],
    focusTags: ['Map', 'TreeMap', 'merge'],
  },
  {
    moduleId: 16,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Método genérico max com Bounded Type Parameter',
    estimatedMinutes: 18,
    prompt: 'Implemente um serviço genérico CalculationService com <T extends Comparable<? super T>> T max(List<T> list) que encontre o maior produto de uma lista sem usar Collections.max().',
    examples: [
      { input: '3\nComputer,890.50\nIPhone X,910.00\nTablet,550.00', expectedOutput: 'Most expensive:\nIPhone X, 910.00' },
    ],
    requirements: ['Usar <T extends Comparable<? super T>>', 'Validar lista vazia lançando IllegalStateException', 'Product implements Comparable<Product>'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente CalculationService.max genérico\n        sc.close();',
      'import java.util.*;'
    ),
    preloadedImprovements: [
      { title: 'Wildcards ? super T', detail: 'Usar Comparable<? super T> permite que subclasses herdem Comparable da superclasse.', severity: 'DICA' },
    ],
    focusTags: ['Generics', 'Bounded Wildcards', 'Comparable'],
  },

  // Módulo 17 - Programação funcional e expressões lambda
  {
    moduleId: 17,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Pipeline Stream para média e filtro de preços',
    estimatedMinutes: 12,
    prompt: 'Dada uma lista de produtos (nome, preço), use Stream API para calcular o preço médio e exibir em ordem alfabética decrescente os nomes dos produtos com preço abaixo da média.',
    examples: [
      { input: '4\nTv,900.00\nMouse,50.00\nTablet,350.50\nHD Case,80.90', expectedOutput: 'Average price: 345.35\nMouse\nHD Case' },
    ],
    requirements: ['Usar stream().map(...).reduce(...) ou mapToDouble().average()', 'Usar filter(), sorted(Comparator.reverseOrder()) e forEach()'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Leia os produtos e processe via Stream API\n        sc.close();',
      'import java.util.*;\nimport java.util.stream.*;'
    ),
    preloadedImprovements: [
      { title: 'Stream só pode ser consumido uma vez', detail: 'Armazene os dados em List<Product> e crie um novo stream() para o cálculo da média e outro para o filtro.', severity: 'ERRO' },
    ],
    focusTags: ['Stream API', 'Lambda', 'map/reduce'],
  },
  {
    moduleId: 17,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Filtro e soma salarial com Predicate e mapToDouble',
    estimatedMinutes: 15,
    prompt: 'Leia funcionários (nome, email, salário) e um valor X. Mostre em ordem alfabética os emails dos funcionários com salário > X e a soma dos salários de quem começa com "M".',
    examples: [
      { input: '3\nMaria,maria@gmail.com,3200.00\nAlex,alex@gmail.com,1900.00\nMarco,marco@gmail.com,1700.00\n2000.00', expectedOutput: 'maria@gmail.com\nSum of salary of people whose name starts with M: 4900.00' },
    ],
    requirements: ['Usar filter() + map() + sorted()', 'Usar Predicate ou lambda para filtrar inicial M', 'Formatar soma com %.2f'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente o pipeline funcional\n        sc.close();',
      'import java.util.*;\nimport java.util.stream.*;'
    ),
    preloadedImprovements: [
      { title: 'Evite side-effects dentro de map/filter', detail: 'Não modifique variáveis externas dentro de lambdas; use .sum() ou .collect().', severity: 'AVISO' },
    ],
    focusTags: ['Predicate', 'Method reference', 'Stream API'],
  },
  {
    moduleId: 17,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Agrupamento Collectors.groupingBy de pedidos',
    estimatedMinutes: 18,
    prompt: 'Leia N transações (categoria, valor) e utilize Collectors.groupingBy com Collectors.summingDouble para agrupar o faturamento por categoria e exibir ordenado pelo maior faturamento.',
    examples: [
      { input: '4\nCLOUD,500.00\nDEV,1200.00\nCLOUD,300.00\nSEC,950.00', expectedOutput: 'DEV=1200.00\nSEC=950.00\nCLOUD=800.00' },
    ],
    requirements: ['Usar Collectors.groupingBy + Collectors.summingDouble', 'Ordenar entries por valor decrescente com Map.Entry.comparingByValue().reversed()'],
    starterCode: makeStarter(
      '        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Agrupe e ordene usando Stream API e Collectors\n        sc.close();',
      'import java.util.*;\nimport java.util.stream.*;'
    ),
    preloadedImprovements: [
      { title: 'Comparação reversa de Map.Entry', detail: 'Map.Entry.<String, Double>comparingByValue().reversed() garante ordenação clara sem casting inseguro.', severity: 'DICA' },
    ],
    focusTags: ['Collectors', 'groupingBy', 'Streams avançados'],
  },

  // Módulos 18 a 24 - Bônus & Projetos (com desafios em Java focados no domínio de cada projeto)
  {
    moduleId: 18,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Simulador de histórico de commits Git',
    estimatedMinutes: 12,
    prompt: 'Modele uma lista de commits (hash curto, mensagem Conventional Commits). Leia N mensagens e valide se seguem o prefixo "feat:", "fix:" ou "docs:", imprimindo quantos commits são válidos.',
    examples: [{ input: '3\nfeat: add login\nupdate readme\nfix: null check', expectedOutput: 'VALID_COMMITS=2' }],
    requirements: ['Validar prefixos Conventional Commits', 'Usar List e startsWith()'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Valide mensagens de commit\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Mensagens semânticas', detail: 'Use Set.of("feat:", "fix:", "docs:") para validar prefixos sem múltiplos ||.', severity: 'DICA' }],
    focusTags: ['Git', 'Conventional Commits', 'Strings'],
  },
  {
    moduleId: 18,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Resolução de grafo simples de branches',
    estimatedMinutes: 15,
    prompt: 'Leia pares "branchOrigem -> branchDestino" e verifique se há ciclo direto (A->B e B->A), imprimindo "MERGE_CONFLICT" ou "FAST_FORWARD".',
    examples: [{ input: '2\nmain -> feat/auth\nfeat/auth -> main', expectedOutput: 'MERGE_CONFLICT' }],
    requirements: ['Mapear relações com Map<String, Set<String>>', 'Detectar dependência circular'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Verifique ciclos entre branches\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Evite NullPointerException no Map', detail: 'Use computeIfAbsent(origem, k -> new HashSet<>()).add(destino).', severity: 'AVISO' }],
    focusTags: ['Git', 'Grafos', 'Map'],
  },
  {
    moduleId: 18,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Ordenação cronológica de changelog por SemVer',
    estimatedMinutes: 18,
    prompt: 'Leia N versões SemVer (major.minor.patch) e ordene da mais recente para a mais antiga comparando numericamente cada segmento.',
    examples: [{ input: '3\n1.2.10\n1.10.0\n1.2.3', expectedOutput: '1.10.0\n1.2.10\n1.2.3' }],
    requirements: ['Não ordenar lexicograficamente (1.10 < 1.2 como String)', 'Fazer parse dos 3 inteiros'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Compare versões SemVer numericamente\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Ordenação lexicográfica falha em SemVer', detail: '"1.10.0" vem antes de "1.2.0" em String; compare Integer.parseInt() por parte.', severity: 'ERRO' }],
    focusTags: ['SemVer', 'Comparator', 'Releases'],
  },

  // Módulo 19 - JDBC
  {
    moduleId: 19,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Montagem segura de PreparedStatement simulado',
    estimatedMinutes: 12,
    prompt: 'Simule a construção de uma query parametrizada de busca de Seller por departamento, garantindo validação contra SQL Injection (rejeitar ";" ou "--" nos parâmetros de texto).',
    examples: [{ input: 'Electronics', expectedOutput: 'SELECT * FROM seller WHERE Department = ? [param: Electronics]' }],
    requirements: ['Validar entrada contra caracteres perigosos', 'Nunca concatenar parâmetro direto na string SQL'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Valide e monte consulta parametrizada\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Nunca concatene SQL', detail: 'Sempre use placeholders "?" com PreparedStatement.', severity: 'ERRO' }],
    focusTags: ['JDBC', 'PreparedStatement', 'Segurança'],
  },
  {
    moduleId: 19,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Padrão DAO em memória com SellerDao',
    estimatedMinutes: 16,
    prompt: 'Implemente a interface SellerDao (insert, findById, update) operando sobre um repositório em memória (Map<Integer, Seller>) e trate recurso inexistente lançando DbException.',
    examples: [{ input: '1\nBob\n3000.00', expectedOutput: 'Seller[id=1, name=Bob, salary=3000.00]' }],
    requirements: ['Separar interface SellerDao da implementação', 'Lançar DbException se id não existir'],
    starterCode: makeStarter('        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente SellerDao e SellerDaoMemory\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Desacople persistência do domínio', detail: 'O controlador deve conhecer apenas a interface SellerDao.', severity: 'DICA' }],
    focusTags: ['JDBC', 'DAO Pattern', 'Exceções'],
  },
  {
    moduleId: 19,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Controle transacional commit / rollback simulado',
    estimatedMinutes: 18,
    prompt: 'Simule uma transferência bancária entre duas contas com commit() ao concluir e rollback() automático se o saldo for insuficiente durante a segunda operação.',
    examples: [{ input: '1000.00 500.00 1200.00', expectedOutput: 'ROLLBACK: Saldo insuficiente\nA=1000.00 B=500.00' }],
    requirements: ['Garantir atomicidade (ambas contas permanecem intactas no rollback)', 'Usar try/catch para acionar rollback'],
    starterCode: makeStarter('        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Simule transação com rollback atômico\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Atomicidade na transação', detail: 'Sem rollback, a primeira conta perde dinheiro mesmo após falha na segunda.', severity: 'ERRO' }],
    focusTags: ['Transações', 'ACID', 'Rollback'],
  },

  // Módulo 20 - JPA / Hibernate
  {
    moduleId: 20,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Entidade Pessoa com equals/hashCode por ID',
    estimatedMinutes: 12,
    prompt: 'Modele a entidade Pessoa (id, nome, email) seguindo a especificação JPA: construtor vazio obrigatório, Serializable e equals/hashCode baseados exclusivamente no id.',
    examples: [{ input: '1\nCarlos\ncarlos@mail.com\n1\nCarlos Silva\ncarlos@mail.com', expectedOutput: 'SAME_ENTITY=true' }],
    requirements: ['Construtor padrão sem argumentos', 'equals e hashCode usando Objects.equals(id, other.id)'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Implemente entidade Pessoa com equals/hashCode por id\n        sc.close();', 'import java.io.Serializable;\nimport java.util.*;'),
    preloadedImprovements: [{ title: 'Construtor vazio para JPA', detail: 'O Hibernate exige um construtor sem argumentos para instanciar proxies via reflection.', severity: 'AVISO' }],
    focusTags: ['JPA', 'Entidades', 'equals/hashCode'],
  },
  {
    moduleId: 20,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Mapeamento bidirecional sem loop infinito no toString',
    estimatedMinutes: 16,
    prompt: 'Modele Department (1) <-> (*) Employee em Java. Garanta que adicionar um Employee atualize ambos os lados da associação e que toString() não cause StackOverflowError.',
    examples: [{ input: 'TI\nAna\nBruno', expectedOutput: 'Department=TI Employees=[Ana, Bruno]' }],
    requirements: ['Evitar recursão mútua no toString()', 'Sincronizar associação bidirecional no método addEmployee()'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Modele Department <-> Employee sem recursão no toString\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Loop infinito em associações bidirecionais', detail: 'Se Department.toString() imprime Employee e Employee.toString() imprime Department, ocorre StackOverflowError.', severity: 'ERRO' }],
    focusTags: ['JPA', 'Associações', 'StackOverflow'],
  },
  {
    moduleId: 20,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Cache de primeiro nível (Identity Map) do EntityManager',
    estimatedMinutes: 20,
    prompt: 'Implemente um MiniEntityManager com persist(id, obj) e find(id) que mantenha o mesmo objeto gerenciado no contexto de persistência (Identity Map), retornando a mesma referência (==) em buscas repetidas.',
    examples: [{ input: '10\nNotebook', expectedOutput: 'SAME_REFERENCE=true' }],
    requirements: ['Usar Map<Long, Object> como contexto de persistência', 'Garantir find(10) == find(10) true'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Implemente MiniEntityManager com Identity Map\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Identity Map garante ==', detail: 'O cache de 1º nível do JPA garante que duas chamadas find() na mesma transação retornem a mesma instância.', severity: 'DICA' }],
    focusTags: ['EntityManager', 'Cache L1', 'Identity Map'],
  },

  // Módulo 21 - Spring Boot + JPA
  {
    moduleId: 21,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Conversão Entity para DTO na camada Service',
    estimatedMinutes: 12,
    prompt: 'Crie uma classe User (id, name, email, password) e UserDTO (id, name, email) sem expor a senha. Converta uma lista de User para List<UserDTO> usando Stream API.',
    examples: [{ input: '1\nMaria\nmaria@dev.io\n123456', expectedOutput: 'UserDTO[id=1, name=Maria, email=maria@dev.io]' }],
    requirements: ['Nunca incluir password no DTO', 'Converter via construtor UserDTO(User entity) ou record'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Converta User em UserDTO omitindo dados sensíveis\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Nunca exponha entidades JPA diretamente', detail: 'Retornar DTOs evita vazar senhas e evita LazyInitializationException na serialização JSON.', severity: 'ERRO' }],
    focusTags: ['Spring Boot', 'DTO', 'Segurança'],
  },
  {
    moduleId: 21,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Tratamento global de ResourceNotFoundException (404)',
    estimatedMinutes: 16,
    prompt: 'Simule um UserService.findById(id) que lança ResourceNotFoundException e um ResourceExceptionHandler que intercepta a exceção e retorna um objeto StandardError com status 404.',
    examples: [{ input: '99', expectedOutput: '404 Not Found: Resource not found. Id 99' }],
    requirements: ['Criar ResourceNotFoundException', 'Criar StandardError com status, error e message'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Implemente Service + Handler de exceção HTTP 404\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Padronize respostas de erro REST', detail: 'Um Handler centralizado mantém todos os erros da API no mesmo formato JSON.', severity: 'DICA' }],
    focusTags: ['REST', 'ExceptionHandler', 'HTTP 404'],
  },
  {
    moduleId: 21,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Arquitetura em camadas Controller -> Service -> Repository',
    estimatedMinutes: 20,
    prompt: 'Implemente um fluxo completo em memória com OrderController, OrderService e OrderRepository validando estoque antes de confirmar o pedido e retornando status 201 Created ou 422 Unprocessable Entity.',
    examples: [{ input: '1\n3\n5', expectedOutput: '422 Unprocessable Entity: Estoque insuficiente' }],
    requirements: ['Controller não deve conter regra de negócio', 'Service valida estoque e delega persistência ao Repository'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Modele Controller -> Service -> Repository\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Separação de responsabilidades', detail: 'Regras de estoque ficam no Service; o Controller apenas recebe entrada e devolve resposta HTTP.', severity: 'AVISO' }],
    focusTags: ['Arquitetura em camadas', 'Spring Boot', 'SOLID'],
  },

  // Módulo 22 - Jogo de Xadrez
  {
    moduleId: 22,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Conversão de ChessPosition para Position de matriz',
    estimatedMinutes: 12,
    prompt: 'No tabuleiro 8x8, converta uma coordenada de xadrez (ex: "a8", "e4", "h1") para índices de matriz Java [row][col] onde row 0 é a linha 8 e col 0 é a coluna "a".',
    examples: [
      { input: 'a8', expectedOutput: '0,0' },
      { input: 'e4', expectedOutput: '4,4' },
    ],
    requirements: ['Validar coluna entre a..h e linha entre 1..8', 'Calcular row = 8 - chessRow e col = chessCol - \'a\''],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        String pos = sc.nextLine().trim();\n        // Converta ChessPosition para matriz [row][col]\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Aritmética de char', detail: 'Subtrair \'a\' de char (\'e\' - \'a\' == 4) converte letras de coluna diretamente em índice.', severity: 'DICA' }],
    focusTags: ['Xadrez', 'Matriz 8x8', 'Coordenadas'],
  },
  {
    moduleId: 22,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Movimentos possíveis da Torre (Rook)',
    estimatedMinutes: 16,
    prompt: 'Dada a posição de uma Torre (row, col) em um tabuleiro 8x8 vazio, preencha uma matriz boolean[8][8] com os movimentos possíveis (4 direções) e imprima quantas casas alcançáveis existem.',
    examples: [{ input: '3 3', expectedOutput: 'MOVES=14' }],
    requirements: ['Usar método abstract boolean[][] possibleMoves()', 'Percorrer cima, baixo, esquerda, direita dentro dos limites 0..7'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        int row = sc.nextInt();\n        int col = sc.nextInt();\n        // Calcule boolean[8][8] possibleMoves() da Torre\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Não incluir a casa atual', detail: 'A casa onde a peça já está não conta como movimento válido.', severity: 'AVISO' }],
    focusTags: ['Xadrez', 'Matriz booleana', 'Polimorfismo'],
  },
  {
    moduleId: 22,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Detecção de Xeque (Check) com movimento temporário',
    estimatedMinutes: 20,
    prompt: 'Simule makeMove / undoMove em uma matriz de peças: dado um Rei branco e uma Torre preta na mesma linha com uma peça no meio, verifique se mover a peça do meio deixa o Rei em xeque.',
    examples: [{ input: '4 4\n4 0\n4 2', expectedOutput: 'ILLEGAL_MOVE_SELF_CHECK' }],
    requirements: ['Testar xeque após mover e desfazer o movimento se colocar o próprio Rei em risco', 'Usar coordenadas de matriz 8x8'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Simule validação de auto-xeque com makeMove e undoMove\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Sempre faça undoMove() se testar xeque', detail: 'Sem desfazer a jogada simulada, o estado do tabuleiro fica corrompido.', severity: 'ERRO' }],
    focusTags: ['Xadrez', 'Regras de Xeque', 'Estado'],
  },

  // Módulo 23 - Spring Boot + MongoDB
  {
    moduleId: 23,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Documento Post com comentários aninhados (NoSQL)',
    estimatedMinutes: 12,
    prompt: 'Modele a classe Post com lista embutida de CommentDTO (modelo orientado a documentos) e imprima o total de comentários.',
    examples: [{ input: 'Partiu viagem\n2\nBoa viagem!\nAproveite', expectedOutput: 'Post: Partiu viagem | Comments: 2' }],
    requirements: ['Aninhar List<CommentDTO> diretamente no documento Post', 'Inicializar lista vazia no campo para evitar NullPointerException'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Modele Post e CommentDTO em estilo documento NoSQL\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Inicialize coleções na declaração', detail: 'private List<CommentDTO> comments = new ArrayList<>(); evita NullPointerException ao adicionar itens.', severity: 'AVISO' }],
    focusTags: ['MongoDB', 'Documentos', 'DTO'],
  },
  {
    moduleId: 23,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Decodificação de parâmetro de busca URL',
    estimatedMinutes: 15,
    prompt: 'Implemente um método utilitário URL.decodeParam(String text) usando URLDecoder.decode(..., StandardCharsets.UTF_8) para decodificar termos de busca REST como "bom%20dia".',
    examples: [{ input: 'bom%20dia%20java', expectedOutput: 'bom dia java' }],
    requirements: ['Usar StandardCharsets.UTF_8', 'Tratar entrada nula retornando string vazia'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Implemente URL.decodeParam\n        sc.close();', 'import java.net.URLDecoder;\nimport java.nio.charset.StandardCharsets;\nimport java.util.*;'),
    preloadedImprovements: [{ title: 'Prefira StandardCharsets.UTF_8', detail: 'Evite passar "UTF-8" como string mágica para não precisar capturar UnsupportedEncodingException.', severity: 'DICA' }],
    focusTags: ['MongoDB', 'Query Params', 'URLDecoder'],
  },
  {
    moduleId: 23,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Filtro fullSearch por texto e intervalo de datas',
    estimatedMinutes: 18,
    prompt: 'Implemente uma busca em memória simulando @Query do MongoDB: filtre posts que contenham o texto (case-insensitive) no título OU nos comentários, dentro do intervalo [minDate, maxDate] inclusive.',
    examples: [{ input: 'viagem\n2026-03-01\n2026-03-31', expectedOutput: 'FOUND=1' }],
    requirements: ['Comparação case-insensitive no título e comentários', 'Intervalo inclusivo >= minDate e <= maxDate usando LocalDate'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Implemente fullSearch com Stream API e LocalDate\n        sc.close();', 'import java.time.LocalDate;\nimport java.util.*;'),
    preloadedImprovements: [{ title: 'Inclusividade nos limites de data', detail: 'Use !date.isBefore(minDate) && !date.isAfter(maxDate) para incluir o primeiro e o último dia.', severity: 'AVISO' }],
    focusTags: ['MongoDB', 'fullSearch', 'Stream API'],
  },

  // Módulo 24 - JavaFX (Legado)
  {
    moduleId: 24,
    orderInModule: 1,
    difficulty: 'Fácil',
    title: 'Observer simples para eventos de botão (Listener)',
    estimatedMinutes: 12,
    prompt: 'Simule o padrão Observer usado em eventos JavaFX: crie uma interface DataChangeListener com onDataChanged() e notifique todos os inscritos quando o estado mudar.',
    examples: [{ input: '2', expectedOutput: 'Listener 1 notified\nListener 2 notified' }],
    requirements: ['Interface funcional DataChangeListener', 'Lista de listeners notificada em ordem'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Implemente DataChangeListener e notificação de inscritos\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Desacoplamento por Observer', detail: 'Controllers de formulário não devem atualizar tabelas diretamente; emitem eventos para listeners.', severity: 'DICA' }],
    focusTags: ['JavaFX', 'Observer', 'Eventos'],
  },
  {
    moduleId: 24,
    orderInModule: 2,
    difficulty: 'Médio',
    title: 'Validação de formulário com ValidationException',
    estimatedMinutes: 16,
    prompt: 'Modele uma ValidationException que carrega Map<String, String> errors. Valide um cadastro (nome não vazio, email contendo "@") acumulando todos os erros antes de lançar.',
    examples: [{ input: ' \nemailinvalido', expectedOutput: 'name: Field cannot be empty\nemail: Invalid email' }],
    requirements: ['Acumular todos os erros no Map antes de lançar', 'Preservar ordem dos campos com LinkedHashMap'],
    starterCode: makeStarter('        Scanner sc = new Scanner(System.in);\n        // Implemente ValidationException com Map de erros por campo\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Use LinkedHashMap para manter ordem', detail: 'HashMap embaralha a ordem dos campos; LinkedHashMap mantém a ordem do formulário.', severity: 'DICA' }],
    focusTags: ['JavaFX', 'Validação', 'MVC'],
  },
  {
    moduleId: 24,
    orderInModule: 3,
    difficulty: 'Difícil',
    title: 'Navegação MVC com injeção de Service no Controller',
    estimatedMinutes: 18,
    prompt: 'Simule um SellerFormController recebendo SellerService e atualizando um modelo de tabela observável após salvar um registro válido.',
    examples: [{ input: 'Ana\nana@mail.com\n4500.00', expectedOutput: 'TableView updated: 1 row(s) -> Ana' }],
    requirements: ['Injetar SellerService via setSellerService()', 'Validar antes de salvar e notificar listeners'],
    starterCode: makeStarter('        Locale.setDefault(Locale.US);\n        Scanner sc = new Scanner(System.in);\n        // Implemente SellerFormController + SellerService + listener\n        sc.close();', 'import java.util.*;'),
    preloadedImprovements: [{ title: 'Verifique dependência nula antes de salvar', detail: 'Valide se sellerService != null antes de invocar saveOrUpdate().', severity: 'AVISO' }],
    focusTags: ['MVC', 'JavaFX', 'Controller'],
  },
];

export const JAVA_EXERCISES: Exercise[] = RAW_EXERCISES.map((item) => ({
  ...item,
  track: 'java' as const,
  fileName: 'Main.java',
  runtimeLabel: 'Java 21',
  id: `m${String(item.moduleId).padStart(2, '0')}-ex${String(item.orderInModule).padStart(2, '0')}`,
}));

export const EXERCISES: Exercise[] = [...JAVA_EXERCISES, ...EXTRA_EXERCISES];

// Sem progresso pré-preenchido: todo aluno começa com 0 atividades concluídas e histórico limpo
export const INITIAL_SOLVED_EXERCISE_IDS: string[] = [];

export const INITIAL_COPILOT_FINDINGS_M03_EX07: CopilotFinding[] = [];

export const INITIAL_SUBMISSIONS: SubmissionRecord[] = [];

