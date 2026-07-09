# 🪢 Jogo da Forca

Projeto desenvolvido em **JavaScript**, executado via **Node.js** no terminal, como parte da atividade prática #08.

## 👤 Autor

**Nome completo:** _Herik Willian Nogueira Soares_

## 📖 Sobre o jogo

Um clássico Jogo da Forca de terminal com 3 categorias de palavras (Tecnologia, Animais e Frutas), sistema de dicas, ranking dos melhores jogadores e desenho da forca em ASCII a cada erro.

## 🎯 Regras do jogo

- O jogador informa seu nome e escolhe (ou sorteia) uma categoria de palavras.
- Uma palavra secreta é sorteada dentro da categoria escolhida.
- A cada rodada, o jogador digita **uma letra por vez** tentando descobrir a palavra.
- Se a letra existir na palavra, ela é revelada em todas as posições em que aparece.
- Se a letra **não** existir na palavra, conta como um erro.
- O jogador tem no máximo **6 erros** antes de perder a rodada (a cada erro, um novo pedaço do boneco é desenhado na forca).
- O jogador **vence** a rodada se descobrir todas as letras da palavra antes de atingir 6 erros.
- O jogador **perde** a rodada se atingir 6 erros antes de completar a palavra.
- Ao final de cada rodada, é exibido o nome do jogador, o resultado (vitória/derrota), a palavra correta e a pontuação obtida.
- O jogador pode optar por jogar novamente (pontuação acumulada) ou encerrar o jogo.

### Personalizações desta versão

- **Pontuação:** ao vencer, `(quantidade de letras únicas da palavra × 10) + (tentativas restantes × 5) − (dicas usadas × 5)`. Ao perder, `(letras corretas descobertas × 3) − (dicas usadas × 5)`. A pontuação nunca é negativa.
- **Desenho da forca:** o boneco é desenhado em ASCII e evolui a cada erro (7 estágios, de 0 a 6 erros).
- **Erros máximos:** 6.
- **Acentos e maiúsculas/minúsculas:** o jogo normaliza toda a entrada (remove acentos e ignora maiúsculas/minúsculas), então digitar `a`, `A` ou `á` é tratado da mesma forma.
- **Letra repetida:** se o jogador tentar uma letra já usada, o jogo avisa e pede outra, **sem** contar como erro.
- **Caractere inválido:** entradas que não sejam exatamente uma letra são rejeitadas com um aviso, sem penalidade.
- **Categoria:** o jogador escolhe manualmente entre as 3 categorias ou pode optar por sortear uma aleatoriamente.
- **Múltiplas rodadas:** ao final de cada rodada, o jogador pode escolher jogar novamente. A pontuação é **acumulada** entre as rodadas da mesma sessão e salva no ranking ao encerrar o jogo.

## 🕹️ Como jogar

1. Digite seu nome quando solicitado.
2. Escolha o número da categoria desejada (ou a opção de sorteio aleatório).
3. A cada rodada, o jogo mostra:
   - A palavra com as letras já descobertas e ocultas (ex.: `_ O N I T O R`);
   - As letras já tentadas;
   - O número de erros e tentativas restantes;
   - O desenho da forca atualizado.
4. Digite uma letra e pressione Enter para tentar.
5. Digite `?` a qualquer momento para pedir uma dica sobre a palavra (**custa uma tentativa**).
6. Ao final da rodada, veja o resultado e escolha se quer jogar novamente (`S` ou `N`).
7. Ao encerrar, sua pontuação final é salva no ranking, que é exibido na tela.

## ▶️ Como executar

Pré-requisito: ter o **Node.js** instalado (v16 ou superior recomendado).

```bash
# 1. Clone o repositório
git clone <https://github.com/HerikWillian/08-JS-A-Linguagem>

# 2. Entre na pasta do projeto
cd 08-JS-A-Linguagem

# 3. Rode o jogo
npm start
```

Este projeto **não possui dependências externas** — usa apenas os módulos nativos do Node.js (`readline`, `fs`, `path`), então não é necessário rodar `npm install`.

## 🧐 Bônus implementados

- ✅ **Sistema de dicas:** cada palavra do banco possui uma dica associada. O jogador pode digitar `?` durante a rodada para receber a dica, ao custo de uma tentativa (equivalente a um erro).
- ✅ **Ranking dos melhores jogadores:** ao final de cada sessão de jogo, a pontuação acumulada do jogador é salva em `ranking.json` (gerado automaticamente na primeira execução). O Top 10 é exibido ordenado da maior para a menor pontuação ao final de cada sessão.

## 🙏 Créditos — fontes de referência utilizadas

- Documentação oficial do Node.js: [Módulo `readline`](https://nodejs.org/api/readline.html) e [Módulo `fs`](https://nodejs.org/api/fs.html)
- [MDN Web Docs](https://developer.mozilla.org/pt-BR/) — referência de métodos de String, Array e `Intl`/normalização de texto (`String.prototype.normalize`)
- Arte ASCII da forca inspirada no formato clássico do jogo Hangman, recriada manualmente para este projeto.

## 📄 Licença

Este projeto está licenciado sob a licença MIT — veja mais detalhes em [choosealicense.com/licenses/mit](https://choosealicense.com/licenses/mit/).