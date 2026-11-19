# Prompts

Principais prompts usados com o Claude Code (Anthropic) para construir o site. Eles estão agrupados por etapa e escritos de forma que, repetidos em ordem, levem a um resultado equivalente. Como a IA foi usada está explicado em [AI.md](AI.md).

## 1. Planejamento

> Analise o briefing da Global Solution 2026.2 (CitizenTech da Minha Cidade, Rio de Janeiro), a solução da equipe (monitorar bolsões d'água em vias críticas com sensor ultrassônico, ESP32 e script Python) e os critérios de Front-end Design e Web Development. Proponha a arquitetura de um site em React com CRUD em API externa, custom hooks, separação entre regra de negócio, acesso a dados e interface, e modo claro/escuro. Use o mesmo Índice de Risco do script Python (60% lâmina d'água, 40% chuva; Normal < 40, Atenção 40–70, Perigo ≥ 70).

> Pesquise notícias recentes sobre bolsões d'água no Rio (Av. Brasil, Linha Vermelha, Estrada do Galeão, Centro de Operações Rio) para embasar o problema e cite as fontes no site.

## 2. Funcionalidades

> Crie um painel com as vias monitoradas num mapa real do Rio (MapLibre + OpenStreetMap), com a cor de cada ponto pela faixa de risco, filtro por faixa e busca por nome. Cada via deve ter uma página com o histórico das últimas leituras e a tendência da água.

> Implemente o CRUD de relatos de bolsão na MockAPI (via, referência, profundidade, observação), com validação no formulário, paginação e atualização otimista que desfaz em caso de erro.

> Na página inicial, crie um simulador com dois controles (lâmina d'água e chuva) que calcula o índice ao vivo e acende LEDs verde, amarelo e vermelho, com alarme sonoro no Perigo.

> Crie um fórum no Supabase com tópicos por ponto monitorado, fotos, comentários, denúncias e filtro de mensagens (links e telefones vão para revisão). Moderadores podem esconder, apagar, silenciar e banir. Proteja tudo com regras RLS e nunca exponha a chave secreta no front.

## 3. Design

> Defina uma identidade visual própria inspirada em placas de sinalização viária e painéis de mensagem variável, evitando a aparência genérica de interfaces geradas por IA. Paleta: azul #002893, branco e laranja #FD701C, com o laranja reservado aos elementos clicáveis e verde/amarelo/vermelho só para as faixas de risco. Confira o contraste WCAG nos dois temas.

> Adicione animações ligadas ao tema: chuva que atravessa a página com nuvens e relâmpagos, tela de carregamento com uma régua enchendo de água e hover nos botões como água subindo. Respeite a preferência de movimento reduzido.

> Revise o site contra sinais comuns de interfaces feitas por IA (gradiente roxo e azul, efeito de vidro, eyebrow em todo título, chips coloridos, emojis, sparklines decorativas, faixas coloridas nas bordas, insights que ninguém lê) e remova o que encontrar.

## 4. Qualidade e performance

> Otimize o site: debounce na busca, paginação, imagens em WebP, eliminação de chamadas duplicadas e consultas N+1, timeout nas requisições, lazy loading das páginas e do mapa, cache de arquivos estáticos, índices no banco e menos re-renderizações. Teste no celular e em rede 3G lenta.

> Escreva testes para o cálculo do índice de risco reproduzindo o exemplo do PDF e teste os fluxos principais no navegador: CRUD de relatos e fórum com usuário logado.

## 5. Entrega

> Confira o projeto contra todas as exigências da Global Solution e liste o que falta.

> Escreva o README com a Ficha da CitizenTech no início, o AI.md e um modelo de Integrantes.md para cada integrante preencher.
