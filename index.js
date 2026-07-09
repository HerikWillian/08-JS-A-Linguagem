/**
 * JOGO DA FORCA - Node.js
 * Um único arquivo contendo toda a lógica do jogo.
 * Usa apenas o módulo nativo "readline" (sem dependências externas).
 *
 * Como executar: npm start
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Fila de linhas digitadas + "waiters" pendentes. Esse padrão evita um problema
// conhecido do Node: chamar rl.question() várias vezes em sequência pode travar
// quando o stdin não é um terminal interativo (ex.: entrada via pipe/arquivo).
const filaDeLinhas = [];
const esperandoLinha = [];
let entradaEncerrada = false;

rl.on('line', (linha) => {
  if (esperandoLinha.length) {
    esperandoLinha.shift()(linha);
  } else {
    filaDeLinhas.push(linha);
  }
});

rl.on('close', () => {
  entradaEncerrada = true;
  while (esperandoLinha.length) esperandoLinha.shift()('');
});

function perguntar(texto) {
  if (texto) process.stdout.write(texto);
  return new Promise((resolve) => {
    if (filaDeLinhas.length) {
      resolve(filaDeLinhas.shift());
    } else if (entradaEncerrada) {
      resolve('');
    } else {
      esperandoLinha.push(resolve);
    }
  });
}

async function perguntarInteiro(texto) {
  const resposta = await perguntar(texto);
  const numero = parseInt(resposta, 10);
  return Number.isNaN(numero) ? -1 : numero;
}

async function pausar(mensagem = 'Pressione ENTER para continuar...') {
  await perguntar(mensagem);
}

async function perguntarSimNao(texto) {
  while (true) {
    const resposta = normalizar(await perguntar(`${texto} (S/N): `));
    if (resposta === 'S' || resposta === 'SIM') return true;
    if (resposta === 'N' || resposta === 'NAO') return false;
    console.log('Resposta inválida. Digite S ou N.');
  }
}

// ============================================================
// CONFIGURAÇÕES E BANCO DE DADOS
// ============================================================

const MAX_ERROS = 6;
const RANKING_PATH = path.join(__dirname, 'ranking.json');

const CATEGORIAS = {
  Tecnologia: [
    { palavra: 'JAVASCRIPT', dica: 'Linguagem de programação muito usada na web' },
    { palavra: 'PYTHON', dica: 'Linguagem de programação famosa pela simplicidade' },
    { palavra: 'PROGRAMACAO', dica: 'Ato de escrever código para computadores' },
    { palavra: 'COMPUTADOR', dica: 'Máquina usada para processar dados' },
    { palavra: 'INTERNET', dica: 'Rede mundial que conecta computadores' },
    { palavra: 'TECLADO', dica: 'Periférico usado para digitar' },
    { palavra: 'MONITOR', dica: 'Periférico usado para exibir imagens' },
    { palavra: 'ALGORITMO', dica: 'Sequência de passos para resolver um problema' },
  ],
  Animais: [
    { palavra: 'ELEFANTE', dica: 'Maior mamífero terrestre' },
    { palavra: 'GIRAFA', dica: 'Animal com o pescoço mais longo do mundo' },
    { palavra: 'CACHORRO', dica: 'Considerado o melhor amigo do homem' },
    { palavra: 'GATO', dica: 'Felino doméstico muito popular' },
    { palavra: 'LEAO', dica: 'Conhecido como o rei da selva' },
    { palavra: 'TIGRE', dica: 'Felino listrado, um dos maiores do mundo' },
    { palavra: 'MACACO', dica: 'Primata que adora bananas' },
    { palavra: 'BALEIA', dica: 'Maior animal do planeta, vive nos oceanos' },
  ],
  Frutas: [
    { palavra: 'ABACAXI', dica: 'Fruta tropical com casca espinhosa' },
    { palavra: 'BANANA', dica: 'Fruta amarela e curva, rica em potássio' },
    { palavra: 'MORANGO', dica: 'Fruta vermelha, pequena e doce' },
    { palavra: 'MELANCIA', dica: 'Fruta grande, verde por fora e vermelha por dentro' },
    { palavra: 'LARANJA', dica: 'Fruta cítrica muito usada em sucos' },
    { palavra: 'UVA', dica: 'Fruta pequena usada para fazer vinho' },
    { palavra: 'MANGA', dica: 'Fruta tropical doce e suculenta' },
    { palavra: 'ABACATE', dica: 'Fruta usada em vitaminas, tratada como salgada em alguns países' },
  ],
};

const FORCA_ASCII = [
  `
  +---+
  |   |
      |
      |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
];

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function linha(caractere = '-', tamanho = 50) {
  console.log(caractere.repeat(tamanho));
}

async function escolherCategoria() {
  const nomes = Object.keys(CATEGORIAS);
  console.log('\nEscolha uma categoria:');
  nomes.forEach((nome, i) => console.log(`  ${i + 1}. ${nome}`));
  console.log(`  ${nomes.length + 1}. Sortear categoria aleatoriamente`);

  const opcao = await perguntarInteiro('Digite o número da opção: ');

  if (opcao === nomes.length + 1 || opcao < 1 || opcao > nomes.length) {
    const aleatoria = nomes[Math.floor(Math.random() * nomes.length)];
    console.log(`Categoria sorteada: ${aleatoria}`);
    return aleatoria;
  }

  return nomes[opcao - 1];
}

function escolherPalavra(categoria) {
  const lista = CATEGORIAS[categoria];
  return lista[Math.floor(Math.random() * lista.length)];
}

function montarPalavraOculta(palavra, letrasCorretas) {
  return palavra
    .split('')
    .map((letra) => (letrasCorretas.includes(letra) ? letra : '_'))
    .join(' ');
}

function exibirEstadoJogo(estado) {
  const { palavra, letrasCorretas, letrasTentadas, erros, categoria } = estado;
  console.clear();
  linha('=');
  console.log(`  JOGO DA FORCA  |  Categoria: ${categoria}`);
  linha('=');
  console.log(FORCA_ASCII[erros]);
  console.log(`\nPalavra: ${montarPalavraOculta(palavra, letrasCorretas)}`);
  console.log(
    `Letras tentadas: ${letrasTentadas.length ? letrasTentadas.join(', ') : '(nenhuma)'}`
  );
  console.log(`Erros: ${erros} / ${MAX_ERROS}  |  Tentativas restantes: ${MAX_ERROS - erros}`);
  linha('-');
}

// ============================================================
// RANKING (BÔNUS)
// ============================================================

function carregarRanking() {
  try {
    if (!fs.existsSync(RANKING_PATH)) return [];
    const conteudo = fs.readFileSync(RANKING_PATH, 'utf-8');
    return JSON.parse(conteudo);
  } catch (erro) {
    return [];
  }
}

function salvarNoRanking(nome, pontuacao) {
  const ranking = carregarRanking();
  ranking.push({ nome, pontuacao, data: new Date().toISOString() });
  ranking.sort((a, b) => b.pontuacao - a.pontuacao);
  const top20 = ranking.slice(0, 20);
  fs.writeFileSync(RANKING_PATH, JSON.stringify(top20, null, 2), 'utf-8');
}

function exibirRanking() {
  const ranking = carregarRanking();
  linha('=');
  console.log('  RANKING - TOP 10 JOGADORES');
  linha('=');
  if (ranking.length === 0) {
    console.log('Nenhuma pontuação registrada ainda.');
  } else {
    ranking.slice(0, 10).forEach((item, i) => {
      console.log(`  ${i + 1}º - ${item.nome}: ${item.pontuacao} pontos`);
    });
  }
  linha('=');
}

// ============================================================
// LÓGICA PRINCIPAL DA RODADA
// ============================================================

async function jogarRodada(nomeJogador) {
  const categoria = await escolherCategoria();
  const { palavra: palavraOriginal, dica } = escolherPalavra(categoria);
  const palavra = normalizar(palavraOriginal);

  const estado = {
    palavra,
    categoria,
    letrasCorretas: [],
    letrasTentadas: [],
    erros: 0,
    dicasUsadas: 0,
  };

  let venceu = false;

  while (estado.erros < MAX_ERROS) {
    const letrasUnicas = new Set(palavra.split(''));
    const acertouTudo = [...letrasUnicas].every((l) => estado.letrasCorretas.includes(l));
    if (acertouTudo) {
      venceu = true;
      break;
    }

    exibirEstadoJogo(estado);
    console.log('Digite uma letra, ou "?" para pedir uma dica (custa 1 tentativa).');
    const entrada = normalizar(await perguntar('Sua jogada: '));

    if (entrada === '?') {
      estado.dicasUsadas += 1;
      estado.erros += 1;
      console.log(`\nDICA: ${dica}`);
      await pausar();
      continue;
    }

    if (!/^[A-Z]$/.test(entrada)) {
      console.log('\nEntrada inválida! Digite apenas uma letra (A-Z).');
      await pausar();
      continue;
    }

    if (estado.letrasTentadas.includes(entrada)) {
      console.log('\nVocê já tentou essa letra! Tente outra.');
      await pausar();
      continue;
    }

    estado.letrasTentadas.push(entrada);

    if (palavra.includes(entrada)) {
      estado.letrasCorretas.push(entrada);
    } else {
      estado.erros += 1;
    }
  }

  const letrasUnicasFinal = new Set(palavra.split(''));
  const acertouTudoFinal = [...letrasUnicasFinal].every((l) =>
    estado.letrasCorretas.includes(l)
  );
  if (acertouTudoFinal) venceu = true;

  exibirEstadoJogo(estado);

  let pontuacao;
  if (venceu) {
    const base = letrasUnicasFinal.size * 10;
    const bonusTentativas = (MAX_ERROS - estado.erros) * 5;
    const penalidadeDicas = estado.dicasUsadas * 5;
    pontuacao = Math.max(0, base + bonusTentativas - penalidadeDicas);
  } else {
    const penalidadeDicas = estado.dicasUsadas * 5;
    pontuacao = Math.max(0, estado.letrasCorretas.length * 3 - penalidadeDicas);
  }

  linha('=');
  console.log(venceu ? '🎉 VOCÊ VENCEU! 🎉' : '💀 VOCÊ PERDEU! 💀');
  console.log(`Jogador: ${nomeJogador}`);
  console.log(`Palavra correta: ${palavraOriginal}`);
  console.log(`Pontuação da rodada: ${pontuacao}`);
  linha('=');

  return pontuacao;
}

// ============================================================
// FUNÇÃO PRINCIPAL (MENU / LOOP DO JOGO)
// ============================================================

async function iniciarJogo() {
  console.clear();
  linha('=');
  console.log('       BEM-VINDO AO JOGO DA FORCA!');
  linha('=');

  const nomeDigitado = (await perguntar('Digite o seu nome: ')).trim();
  const nomeJogador = nomeDigitado || 'Jogador';

  let pontuacaoTotal = 0;
  let continuarJogando = true;

  while (continuarJogando) {
    pontuacaoTotal += await jogarRodada(nomeJogador);
    console.log(`\nPontuação acumulada de ${nomeJogador}: ${pontuacaoTotal}`);

    continuarJogando = await perguntarSimNao('\nDeseja jogar outra rodada?');
  }

  salvarNoRanking(nomeJogador, pontuacaoTotal);

  console.log(`\nObrigado por jogar, ${nomeJogador}!`);
  console.log(`Pontuação final: ${pontuacaoTotal}`);
  exibirRanking();
  rl.close();
}

iniciarJogo().catch((erro) => {
  console.error('Erro inesperado:', erro);
  process.exit(1);
});