import type { DrawResult, PrizeRateioItem } from '@/types/lottery';

const CAIXA_MEGASENA_BASE_URL =
  'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';

const CORS_PROXIES = [
  (targetUrl: string) =>
    `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
  (targetUrl: string) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
];

const REQUEST_TIMEOUT_MS = 10000;

interface CaixaRateioRaw {
  descricaoFaixa?: string;
  faixa?: number;
  numeroDeGanhadores?: number;
  valorPremio?: number;
}

interface CaixaMegaSenaApiResponse {
  numero?: number;
  dataApuracao?: string;
  listaDezenas?: string[];
  acumulado?: boolean;
  valorEstimadoProximoConcurso?: number;
  listaRateioPremio?: CaixaRateioRaw[];
  message?: string;
}

/**
 * Fetches JSON from a URL with a strict timeout so static client calls
 * never hang indefinitely.
 */
async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validates and transforms the official Caixa API payload into our DrawResult model.
 */
function parseCaixaResponse(data: CaixaMegaSenaApiResponse): DrawResult {
  if (!data || !Array.isArray(data.listaDezenas) || data.listaDezenas.length !== 6) {
    throw new Error(
      'A resposta da API não contém as 6 dezenas sorteadas esperadas.'
    );
  }

  const parsedNumbers = data.listaDezenas.map((token) =>
    Number.parseInt(String(token).trim(), 10)
  );

  const uniqueNumbers = Array.from(new Set(parsedNumbers));
  const allValidRange = uniqueNumbers.every(
    (num) => Number.isInteger(num) && num >= 1 && num <= 60
  );

  if (uniqueNumbers.length !== 6 || !allValidRange) {
    throw new Error('As dezenas retornadas pela API são inválidas.');
  }

  const prizeBreakdown: PrizeRateioItem[] | undefined = Array.isArray(
    data.listaRateioPremio
  )
    ? data.listaRateioPremio.map((item) => ({
        tierLabel: item.descricaoFaixa ?? `Faixa ${item.faixa ?? ''}`.trim(),
        winners: typeof item.numeroDeGanhadores === 'number' ? item.numeroDeGanhadores : 0,
        prizeAmount: typeof item.valorPremio === 'number' ? item.valorPremio : 0,
      }))
    : undefined;

  return {
    contestNumber: typeof data.numero === 'number' ? data.numero : null,
    drawDate: typeof data.dataApuracao === 'string' ? data.dataApuracao : null,
    drawnNumbers: [...uniqueNumbers].sort((a, b) => a - b),
    source: 'api',
    accumulated: Boolean(data.acumulado),
    nextPrizeEstimate:
      typeof data.valorEstimadoProximoConcurso === 'number'
        ? data.valorEstimadoProximoConcurso
        : null,
    prizeBreakdown,
  };
}

/**
 * Fetches official Mega-Sena draw results from the Caixa API using a public
 * CORS proxy (compatible with GitHub Pages static export).
 *
 * @param contestNumber Optional draw number ("Concurso"). If omitted or empty,
 * fetches the latest draw available.
 */
export async function fetchMegaSenaDraw(
  contestNumber?: string
): Promise<DrawResult> {
  const sanitizedContest = contestNumber?.trim() ?? '';

  if (sanitizedContest.length > 0 && !/^\d+$/.test(sanitizedContest)) {
    throw new Error(
      'O número do concurso deve conter apenas dígitos (ex: 2810).'
    );
  }

  const targetUrl =
    sanitizedContest.length > 0
      ? `${CAIXA_MEGASENA_BASE_URL}/${sanitizedContest}`
      : `${CAIXA_MEGASENA_BASE_URL}/`;

  let lastError: unknown = null;

  for (const buildProxyUrl of CORS_PROXIES) {
    const proxiedUrl = buildProxyUrl(targetUrl);

    try {
      const payload = await fetchJsonWithTimeout<CaixaMegaSenaApiResponse>(
        proxiedUrl,
        REQUEST_TIMEOUT_MS
      );
      return parseCaixaResponse(payload);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error && lastError.message.includes('HTTP 404')) {
    throw new Error(
      `Concurso ${sanitizedContest} não encontrado na base da Caixa. Verifique o número ou use a Inserção Manual.`
    );
  }

  throw new Error(
    'Não foi possível consultar a API da Caixa (instabilidade na API ou no proxy CORS). Utilize a opção de Inserção Manual abaixo.'
  );
}

export interface ManualDrawValidationResult {
  isValid: boolean;
  numbers: number[];
  errorMessage: string | null;
}

/**
 * Validates 6 manually entered Mega-Sena numbers (integers 1-60, all unique).
 */
export function validateManualDrawInputs(
  rawInputs: string[]
): ManualDrawValidationResult {
  if (rawInputs.length !== 6) {
    return {
      isValid: false,
      numbers: [],
      errorMessage: 'Informe exatamente 6 dezenas sorteadas.',
    };
  }

  const trimmed = rawInputs.map((val) => val.trim());

  if (trimmed.some((val) => val.length === 0)) {
    return {
      isValid: false,
      numbers: [],
      errorMessage: 'Preencha todas as 6 dezenas para realizar a conferência.',
    };
  }

  const parsed: number[] = [];

  for (const value of trimmed) {
    if (!/^\d+$/.test(value)) {
      return {
        isValid: false,
        numbers: [],
        errorMessage: `Valor inválido ("${value}"). Informe números entre 01 e 60.`,
      };
    }

    const num = Number.parseInt(value, 10);
    if (!Number.isInteger(num) || num < 1 || num > 60) {
      return {
        isValid: false,
        numbers: [],
        errorMessage: `A dezena "${value}" está fora do intervalo válido (01 a 60).`,
      };
    }

    parsed.push(num);
  }

  const uniqueNumbers = Array.from(new Set(parsed));
  if (uniqueNumbers.length !== 6) {
    return {
      isValid: false,
      numbers: [],
      errorMessage:
        'Existem dezenas repetidas. As 6 dezenas sorteadas devem ser diferentes entre si.',
    };
  }

  return {
    isValid: true,
    numbers: [...uniqueNumbers].sort((a, b) => a - b),
    errorMessage: null,
  };
}

