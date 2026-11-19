# Bolsão Alerta RJ

Site que mostra, antes de o motorista sair de casa, se as vias que mais alagam no Rio estão com bolsão d'água. Projeto da Global Solution 2026.2 da FIAP (Engenharia de Software, 1º ano), disciplinas de Front-end Design e Web Development.

**Site no ar:** https://bolsao-alerta-rj.vercel.app

## Ficha da CitizenTech

|                            |                                                                                                                                                                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nome da CitizenTech**    | Bolsão Alerta RJ                                                                                                                                                                                                                                                                                    |
| **Cidade e bairro**        | Rio de Janeiro: Av. Brasil (Caju, Maré, Cordovil), Linha Vermelha, Linha Amarela, Estrada do Galeão, Praça da Bandeira e Túnel Rebouças                                                                                                                                                             |
| **Cidadão beneficiado**    | Motorista, motorista de aplicativo, taxista e passageiro de ônibus que passa pelas vias expressas da Zona Norte em dia de chuva                                                                                                                                                                     |
| **Problema, em uma frase** | Em temporal, bolsões d'água se formam em minutos nas vias expressas do Rio e o motorista só descobre quando já está dentro deles, sem tempo de desviar.                                                                                                                                             |
| **Como funciona**          | Um sensor ultrassônico mede a lâmina d'água na pista e um pluviômetro mede a chuva. O ESP32 envia as leituras para o ThingSpeak, o script Python calcula o Índice de Risco (0 a 100) e o site mostra cada via em Normal, Atenção ou Perigo.                                                         |
| **O que cada parte faz**   | **Edge (ESP32):** lê os dois sensores e acende LED e buzzer no local. **Python:** classifica o risco e gera os alertas. **Site (este repositório):** painel com mapa, histórico por via, simulador, relatos dos cidadãos e fórum. **DPS:** modela o cálculo do índice. **Pitch:** conta a história. |
| **Link do repositório**    | https://github.com/mrcscorrea/bolsao-alerta-rj                                                                                                                                                                                                                                                      |
| **Indicador de impacto**   | Quantos motoristas consultam a via antes de sair e desistem de passar por um ponto em Perigo (consultas ao painel com a via em Perigo e relatos confirmando o desvio).                                                                                                                              |
| **ODS conectados**         | **ODS 11**, cidades e comunidades sustentáveis: mobilidade mais segura em dia de chuva. **ODS 13**, ação contra a mudança do clima: adaptação a chuvas extremas cada vez mais frequentes.                                                                                                           |

## O problema

O Centro de Operações Rio já registrou dezenas de bolsões num único temporal. A Av. Brasil alaga entre o Caju e Cordovil, a Linha Vermelha tem trechos críticos e a Estrada do Galeão já arrastou carros. Entrar num bolsão com mais de 40 cm de água é a altura em que um carro comum pode puxar água pela admissão e sofrer calço hidráulico. As fontes das notícias usadas estão no rodapé do site.

## O que o site faz

| Página      | O que tem                                                                                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Início**  | Simulador: dois controles (lâmina e chuva) que calculam o índice ao vivo, acendem os LEDs e tocam o alarme no Perigo. Também tem a checagem de rota, o diagrama do sensor e as manchetes reais. |
| **Painel**  | Mapa real (MapLibre + OpenStreetMap) com os 8 pontos monitorados e as estações pluviométricas do Alerta Rio, além de lista filtrável por faixa e busca por nome.                                |
| **Via**     | Histórico das últimas leituras de um ponto, com tendência (água subindo, estável ou baixando).                                                                                                  |
| **Relatos** | CRUD completo na MockAPI: o cidadão relata um bolsão, edita e apaga.                                                                                                                            |
| **Fórum**   | Tópicos por ponto com foto, comentários, denúncia e filtro de mensagens. Moderadores escondem, apagam, silenciam e banem (Supabase).                                                            |

O ponto da **Av. Brasil (Maré)** lê o sensor real pelo ThingSpeak quando o canal está configurado. Os demais pontos usam leituras **simuladas**, com um temporal a cada 6 minutos para a demonstração.

## Como rodar

Requer Node 20 ou mais novo.

```bash
npm install
cp .env.example .env    # preencha as variáveis (abaixo)
npm run dev             # http://localhost:5173
npm test                # testes do índice de risco e do filtro de mensagens
npm run build           # versão de produção em dist/
```

### Variáveis de ambiente (`.env`)

| Variável                                       | Para quê                                            | Sem ela                                             |
| ---------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `VITE_MOCKAPI_URL`                             | Base do projeto na MockAPI, com o recurso `relatos` | Os relatos ficam salvos no navegador (o site avisa) |
| `VITE_THINGSPEAK_CHANNEL`                      | Canal público alimentado pelo ESP32                 | O ponto da Maré também fica simulado                |
| `VITE_THINGSPEAK_VIA`                          | Qual ponto recebe o sensor real                     | Usa `av-brasil-mare`                                |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Fórum                                               | O fórum mostra como configurar                      |

Use só a chave **publishable/anon** do Supabase. A chave secreta nunca vai num `VITE_`, porque tudo que começa com `VITE_` vai parar no navegador.

**MockAPI:** crie um recurso `relatos` com os campos `viaId` (string), `referencia` (string), `profundidadeCm` (number), `observacao` (string) e `criadoEm` (string).

**Supabase:** no SQL Editor, rode `supabase/forum.sql` e depois `supabase/indices.sql`. Para promover um moderador:

```sql
update public.perfis set papel = 'admin' where apelido = 'seu-apelido';
```

## Como o código está organizado

```
src/
  domain/     regras de negócio puras, sem React (índice de risco, faixas, validações, filtro de mensagens)
  services/   acesso a dados (MockAPI, ThingSpeak, Supabase, Alerta Rio, som)
  hooks/      custom hooks e contextos (tema, monitoramento, relatos, sessão, debounce...)
  components/ peças de interface, separadas por assunto (layout, vias, relatos, forum, home, ui)
  pages/      uma por rota
  styles/     tokens de cor e tipografia (tema claro/escuro) e estilos globais
supabase/     SQL do fórum: tabelas, regras de acesso (RLS) e índices
```

A interface nunca chama a API direto. O caminho é sempre **página → hook → service**, e as contas ficam em `domain/`. Por isso `domain/risco.js` é testado sem abrir o navegador.

## Índice de Risco (o mesmo do Python e do ESP32)

```
nivel  = limitar((valor - min) / (max - min) * 100, 0, 100)
risco  = 0.6 * nivel_lamina + 0.4 * nivel_chuva
```

| Sensor                                          | Faixa       | Peso |
| ----------------------------------------------- | ----------- | ---- |
| Lâmina d'água (ultrassônico HC-SR04)            | 0 a 40 cm   | 60%  |
| Chuva (pluviômetro, simulado por potenciômetro) | 0 a 60 mm/h | 40%  |

| Faixa   | Índice       | LED               | Mensagem         |
| ------- | ------------ | ----------------- | ---------------- |
| Normal  | abaixo de 40 | Verde             | Via livre        |
| Atenção | 40 a 69,9    | Amarelo           | Acúmulo iniciado |
| Perigo  | 70 ou mais   | Vermelho + buzzer | Evite a via      |

Três leituras seguidas subindo marcam a via como "água subindo". Os valores ficam em `src/domain/config.js`. Se mudar aqui, mude no Python e no ESP32.

## Requisitos das disciplinas

**Front-end Design**

- **CRUD em API externa:** relatos na MockAPI (`services/relatosService.js`, `hooks/useRelatos.js`, `pages/Relatos.jsx`). Cria, lista com paginação, edita e apaga. A tela atualiza antes da resposta do servidor e desfaz se der erro.
- **Hooks e Custom Hooks:** `useTheme`, `useMonitoramento`, `useRelatos`, `useSimulador`, `useCarregar`, `useDebounce`, `useAviso`, `usePrefersReducedMotion`, `useRolagemSuave`.
- **Separação de camadas e componentização:** veja a estrutura acima.

**Web Development: interações em JavaScript**

1. **Modo claro/escuro** (`hooks/useTheme.js` e o script no `index.html`): troca o atributo `data-theme` do `<html>`, lembra a escolha e, na primeira visita, segue o tema do sistema.
2. **Simulador de chuva** (`components/hero/Simulador.jsx`): os controles chamam `calcularRisco`, um `if/else` escolhe a faixa e a tela muda os LEDs, o texto e o som.
3. **Filtro e busca de vias** (`components/vias/FiltroVias.jsx`, `domain/filtros.js`).
4. **Formulário de relato com validação** (`domain/relatos.js`): campos obrigatórios, profundidade de 0 a 100 cm e mensagem de resposta.
5. **Tela de carregamento** (`src/carregamento.js`): JavaScript puro manipulando o DOM antes de o React existir, com a régua enchendo de água.

## Dados e privacidade

- Nenhum dado pessoal real. As leituras são simuladas ou vêm do canal público do ThingSpeak.
- As estações pluviométricas são dados abertos do Alerta Rio (Prefeitura do Rio). O mapa usa OpenFreeMap / OpenStreetMap.
- No fórum, só aparecem o apelido e o bairro que a pessoa escolhe. O e-mail fica no Supabase Auth e nunca é exibido.
- As notícias citadas estão listadas, com data e veículo, no rodapé do site.

## Documentação

- [Integrantes.md](Integrantes.md): equipe.
- [AI.md](AI.md): como usamos inteligência artificial.
- [prompts.md](prompts.md): registro dos prompts.

## Licença

MIT, veja [LICENSE](LICENSE).
