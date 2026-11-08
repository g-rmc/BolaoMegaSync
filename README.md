# BolãoMegaSync

Aplicação web estática (SPA) construída em **Next.js (App Router)**, **TypeScript (strict)** e **Tailwind CSS** para gerenciar e conferir bolões da **Mega-Sena** e da **Mega da Virada**.

Projetado com identidade visual **Réveillon (Preto, Prata e Dourado)**, o projeto realiza todo o processamento localmente no navegador e está configurado para exportação estática (**GitHub Pages**) via `output: 'export'`.

---

## Principais Funcionalidades

- **Importação e Validação de CSV (Sem Cabeçalho)**
  - Suporta apostas com **6 a 20 dezenas** (01 a 60), separadas por vírgula, ponto e vírgula ou tabulação.
  - Filtra automaticamente linhas completamente vazias ou contendo apenas separadores.
  - Valida erros de leitura de arquivo, números inválidos/repetidos e linhas com menos de 6 ou mais de 20 dezenas, exibindo alertas claros na interface.
  - Exibe notificação (*toast*) confirmando a quantidade exata de jogos válidos carregados.
  - Inclui botões para **Testar Exemplo** e **Baixar CSV Modelo** para avaliação imediata.

- **Consulta de Resultado Oficial (API da Caixa + Fallback)**
  - Busca o resultado de qualquer concurso (ou o mais recente) diretamente da API oficial da Caixa Econômica Federal (`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/{concurso}`).
  - Utiliza proxy CORS (`https://corsproxy.io/?url=...`, com fallback automático secundário) para permitir requisições client-side a partir de uma hospedagem estática no GitHub Pages.
  - **Inserção Manual (Fallback Integrado):** alternância rápida para digitação manual das 6 dezenas sorteadas (inclusive colando os 6 números de uma só vez), garantindo funcionamento mesmo se a API oficial ou o proxy estiverem indisponíveis.

- **Motor de Conferência & Painel Resumo**
  - Cálculo otimizado com `useMemo` evitando recálculos desnecessários.
  - **Painel de Conferência:** exibe **Total de Jogos**, **Quadras** (4 acertos), **Quinas** (5 acertos) e **Senas** (6 acertos).
  - **Cartões de Jogos:** cada aposta é exibida em um card com suas dezenas ordenadas em ordem crescente, destacando os acertos em **Dourado** e os demais números em **Prata/Neutro**, com filtros por faixa de premiação e ordenação por acertos.

---

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (`strict: true`)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Testes Unitários:** [Vitest](https://vitest.dev/)
- **Deploy Target:** [GitHub Pages](https://pages.github.com/) (Static Export)

---

## Desenvolvimento Local

Pré-requisitos: **Node.js 20+** e **npm 10+**.

1. **Instale as dependências:**

```bash
npm install
```

2. **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

3. **Execute verificações de qualidade e testes:**

```bash
npm run typecheck
npm run lint
npm test
```

---

## Configuração e Deploy no GitHub Pages (`output: 'export'`)

Este projeto foi arquitetado como **100% frontend estático**, sem Route Handlers dinâmicos, Server Actions ou dependências de servidor Node.js em tempo de execução.

### Como está configurado em `next.config.js`

```js
/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

module.exports = nextConfig;
```

- `output: 'export'`: gera os arquivos HTML/CSS/JS estáticos finais na pasta `out/` ao rodar `npm run build`.
- `images: { unoptimized: true }`: desativa o otimizador server-side de imagens do Next.js, obrigatório para exportações estáticas.
- `trailingSlash: true`: garante compatibilidade de roteamento em servidores estáticos como o GitHub Pages.
- `NEXT_PUBLIC_BASE_PATH`: variável opcional para publicação em repositórios de projeto (`https://<usuario>.github.io/<repositorio>/`).

### Gerando o build estático localmente

```bash
npm run build
```

Para testar localmente os arquivos estáticos da pasta `out/`:

```bash
npx serve out
```

### Deploy Automático via GitHub Actions

O repositório já inclui o workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Para ativar:

1. No repositório do GitHub, acesse **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Faça push para a branch `main`. O workflow executará `npm ci`, `npm run build` (com `NEXT_PUBLIC_BASE_PATH` ajustado automaticamente caso não seja um domínio customizado/root) e publicará a pasta `out/` no GitHub Pages.

---

## Formato do Arquivo CSV

O arquivo `.csv` **não deve conter linha de cabeçalho**. Cada linha representa um único jogo com 6 a 20 dezenas (de `01` a `60`):

```csv
01,17,19,29,50,57
03,12,17,19,29,50,52,57
04;11;17;22;29;38;49;50;57;60
```

---

## Estrutura do Projeto

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ApiFetcher.tsx
│   ├── CsvUploader.tsx
│   ├── GameCard.tsx
│   ├── GamesList.tsx
│   ├── Header.tsx
│   ├── MegaSyncApp.tsx
│   ├── SummaryDashboard.tsx
│   └── Toast.tsx
├── types/
│   └── lottery.ts
└── utils/
    ├── __tests__/
    ├── conferenceEngine.ts
    ├── csvParser.ts
    └── lotteryApi.ts
```

