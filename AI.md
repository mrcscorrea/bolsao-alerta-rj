# Uso de Inteligência Artificial

A FIAP permite IA "como copiloto, para aprender e revisar", desde que os prompts fiquem registrados e a equipe saiba explicar cada linha. Este arquivo conta como usamos. Os principais prompts, agrupados por etapa, estão em [prompts.md](prompts.md).

## Ferramenta

**Claude Code** (Anthropic), modelo Claude Opus 5.5, rodando no terminal dentro da pasta do projeto. Ele lia os arquivos, propunha e escrevia código, rodava build e testes e tirava screenshots do site para conferir o visual.

## Como a IA entrou no trabalho

| Etapa | O que a IA fez | O que a equipe decidiu |
|---|---|---|
| Entender o briefing | Leu o PDF da GS, a solução resumida e as exigências de Front-end e Web Dev, e montou a lista do que conta na nota | Escopo: só Front-end e Web Dev nesta frente; documentação no fim |
| Pesquisa | Buscou notícias de bolsões no Rio (COR, Av. Brasil, Linha Vermelha, Galeão), que viraram as manchetes e as fontes do rodapé | Quais notícias usar e citar |
| Arquitetura | Propôs a divisão `domain / services / hooks / components / pages` e o contrato de dados igual ao do Python | Aprovamos o índice de risco com os mesmos pesos e faixas do Python |
| Código | Escreveu os componentes, hooks, serviços e SQL do fórum a partir dos nossos pedidos | Pedimos e cortamos funcionalidades: tiramos o 3D, pedimos mapa real, fórum com moderação, chuva com raios, a paleta azul de placa |
| Design | Aplicou a direção visual e revisou contraste de cores | Fizemos uma varredura de "cara de IA" (20 sinais) e removemos gradientes, eyebrows, chips e enfeites |
| Performance | Implementou paginação, debounce, lazy loading, cache, timeout e atualização otimista | Pedimos a lista de otimizações e o teste em rede lenta |
| Testes | Escreveu os testes Vitest do índice e rodou testes de navegador (Playwright) no CRUD, no fórum logado e em 3G lento | Conferimos os resultados e as telas |
| Configuração | Explicou como configurar MockAPI e Supabase | Criamos as contas e rodamos o SQL nós mesmos |

## O que conferimos (e não deixamos a IA decidir sozinha)

- **Fórmula e faixas do risco:** comparamos com o script Python. O teste `risco.test.js` reproduz o exemplo do PDF (níveis 75 e 66,7 → risco 71,7 → Perigo).
- **Segurança:** a chave secreta do Supabase nunca vai no front. Só a publishable fica no `.env`, e o banco é protegido por regras RLS (`supabase/forum.sql`).
- **Dados:** nenhum dado pessoal real. Os pontos são simulados ou vêm de fontes públicas, e as fontes estão citadas.
- **Visual:** cada mudança de design foi aprovada olhando o site, não só o código.
- **Erros que a IA cometeu e corrigimos juntos:** a tela preta ao abrir (um `useEffect` devolvendo valor), a URL da MockAPI com `/api/v1` sobrando, o relato aparecendo duplicado na criação otimista e um número negativo na tela de carregamento.

## O que cada integrante precisa saber explicar

1. Como o Índice de Risco é calculado (`src/domain/risco.js`) e por que 40 cm.
2. O caminho de um relato: formulário → `useRelatos` → `relatosService` → MockAPI, e por que a tela atualiza antes do servidor responder.
3. Como o tema claro/escuro funciona (`data-theme` no `<html>` + tokens em `src/styles/tokens.css`).
4. O simulador: dois sliders → `calcularRisco` → `if/else` da faixa → LEDs, letreiro e som.
5. A tela de carregamento em JavaScript puro (`src/carregamento.js`): funções, DOM, `requestAnimationFrame` e condicionais.
6. Por que o site separa `domain`, `services`, `hooks` e `components`.
