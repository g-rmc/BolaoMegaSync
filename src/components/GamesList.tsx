'use client';

import { useMemo, useState } from 'react';
import { ArrowDownWideNarrow, Filter, Ticket } from 'lucide-react';
import type { CheckedGame, ConferenceSummary } from '@/types/lottery';
import { GameCard } from '@/components/GameCard';

type FilterCategory = 'all' | 'winners' | 'senas' | 'quinas' | 'quadras';
type SortMode = 'original' | 'hits';

interface GamesListProps {
  checkedGames: CheckedGame[];
  summary: ConferenceSummary;
  hasDrawResult: boolean;
}

/**
 * Renders the filterable, sortable grid of parsed games with hit highlights.
 */
export function GamesList({
  checkedGames,
  summary,
  hasDrawResult,
}: GamesListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [sortMode, setSortMode] = useState<SortMode>('original');

  const visibleGames = useMemo(() => {
    const filtered = checkedGames.filter((entry) => {
      if (!hasDrawResult || activeFilter === 'all') return true;
      if (activeFilter === 'winners') return entry.hitCount >= 4;
      if (activeFilter === 'senas') return entry.hitCount === 6;
      if (activeFilter === 'quinas') return entry.hitCount === 5;
      if (activeFilter === 'quadras') return entry.hitCount === 4;
      return true;
    });

    if (sortMode === 'hits' && hasDrawResult) {
      return [...filtered].sort((a, b) => {
        if (b.hitCount !== a.hitCount) return b.hitCount - a.hitCount;
        return a.game.id - b.game.id;
      });
    }

    return filtered;
  }, [checkedGames, activeFilter, sortMode, hasDrawResult]);

  if (checkedGames.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-reveillon-border bg-reveillon-charcoal/40 px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-reveillon-border bg-reveillon-obsidian text-reveillon-gold">
          <Ticket className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">
          Nenhum jogo carregado até o momento
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-reveillon-silver">
          Envie o arquivo CSV com as apostas do bolão ou clique em{' '}
          <strong className="text-reveillon-gold-light">Testar Exemplo</strong>{' '}
          acima para visualizar todos os cartões e conferir os acertos em tempo
          real.
        </p>
      </section>
    );
  }

  const filterButtons: Array<{
    key: FilterCategory;
    label: string;
    count: number;
  }> = [
    { key: 'all', label: 'Todos', count: summary.totalGames },
    { key: 'winners', label: 'Premiados (4+)', count: summary.totalWinningGames },
    { key: 'senas', label: 'Senas', count: summary.senas },
    { key: 'quinas', label: 'Quinas', count: summary.quinas },
    { key: 'quadras', label: 'Quadras', count: summary.quadras },
  ];

  return (
    <section aria-labelledby="games-list-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2
            id="games-list-heading"
            className="text-base font-semibold text-white sm:text-lg"
          >
            Jogos do Bolão
          </h2>
          <span className="rounded-full border border-reveillon-border bg-reveillon-surface px-2.5 py-0.5 text-xs font-medium text-reveillon-silver">
            {visibleGames.length} exibido(s)
          </span>
        </div>

        {hasDrawResult && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-reveillon-border bg-reveillon-obsidian p-1">
              <Filter className="ml-2 mr-1 h-3.5 w-3.5 text-reveillon-silver-muted" />
              {filterButtons.map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => setActiveFilter(btn.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    activeFilter === btn.key
                      ? 'bg-reveillon-gold text-reveillon-black'
                      : 'text-reveillon-silver hover:text-white'
                  }`}
                >
                  {btn.label} ({btn.count})
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setSortMode((prev) =>
                  prev === 'original' ? 'hits' : 'original'
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                sortMode === 'hits'
                  ? 'border-reveillon-gold/50 bg-reveillon-gold/10 text-reveillon-gold-light'
                  : 'border-reveillon-border bg-reveillon-charcoal text-reveillon-silver hover:text-white'
              }`}
            >
              <ArrowDownWideNarrow className="h-3.5 w-3.5" />
              {sortMode === 'hits' ? 'Ordenado por Acertos' : 'Ordem do Arquivo'}
            </button>
          </div>
        )}
      </div>

      {visibleGames.length === 0 ? (
        <div className="rounded-2xl border border-reveillon-border bg-reveillon-charcoal/60 px-6 py-10 text-center text-xs text-reveillon-silver">
          Nenhum jogo encontrado nesta faixa de premiação para o sorteio atual.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleGames.map((checkedGame) => (
            <GameCard
              key={checkedGame.game.id}
              checkedGame={checkedGame}
              hasDrawResult={hasDrawResult}
            />
          ))}
        </div>
      )}
    </section>
  );
}

