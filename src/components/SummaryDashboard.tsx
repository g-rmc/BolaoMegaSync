import { Award, Crown, Layers, Star } from 'lucide-react';
import type { ConferenceSummary } from '@/types/lottery';

interface SummaryDashboardProps {
  summary: ConferenceSummary;
  hasGames: boolean;
  hasDrawResult: boolean;
}

/**
 * Displays the top KPI summary panel for Total de Jogos, Quadras, Quinas, and Senas.
 */
export function SummaryDashboard({
  summary,
  hasGames,
  hasDrawResult,
}: SummaryDashboardProps) {
  const showCheckedMetrics = hasGames && hasDrawResult;

  const cards = [
    {
      id: 'total',
      label: 'Total de Jogos',
      value: summary.totalGames,
      caption: hasGames
        ? 'Apostas válidas analisadas'
        : 'Envie o CSV para iniciar',
      icon: Layers,
      isHighlighted: false,
      accentBorder: 'border-reveillon-border',
      iconContainer:
        'border-reveillon-silver/30 bg-reveillon-surface text-reveillon-silver-light',
      valueColor: 'text-white',
    },
    {
      id: 'quadras',
      label: 'Quadras',
      value: showCheckedMetrics ? summary.quadras : '—',
      caption: 'Exatamente 4 acertos',
      icon: Award,
      isHighlighted: showCheckedMetrics && summary.quadras > 0,
      accentBorder:
        showCheckedMetrics && summary.quadras > 0
          ? 'border-reveillon-gold/50 shadow-gold-glow'
          : 'border-reveillon-border',
      iconContainer:
        showCheckedMetrics && summary.quadras > 0
          ? 'border-reveillon-gold/50 bg-reveillon-gold/15 text-reveillon-gold-light'
          : 'border-reveillon-border bg-reveillon-surface text-reveillon-silver-muted',
      valueColor:
        showCheckedMetrics && summary.quadras > 0
          ? 'text-reveillon-gold-light'
          : 'text-reveillon-silver-light',
    },
    {
      id: 'quinas',
      label: 'Quinas',
      value: showCheckedMetrics ? summary.quinas : '—',
      caption: 'Exatamente 5 acertos',
      icon: Star,
      isHighlighted: showCheckedMetrics && summary.quinas > 0,
      accentBorder:
        showCheckedMetrics && summary.quinas > 0
          ? 'border-reveillon-gold/70 shadow-gold-glow'
          : 'border-reveillon-border',
      iconContainer:
        showCheckedMetrics && summary.quinas > 0
          ? 'border-reveillon-gold/60 bg-reveillon-gold/20 text-reveillon-gold-bright'
          : 'border-reveillon-border bg-reveillon-surface text-reveillon-silver-muted',
      valueColor:
        showCheckedMetrics && summary.quinas > 0
          ? 'text-reveillon-gold-bright'
          : 'text-reveillon-silver-light',
    },
    {
      id: 'senas',
      label: 'Senas',
      value: showCheckedMetrics ? summary.senas : '—',
      caption: 'Exatamente 6 acertos',
      icon: Crown,
      isHighlighted: showCheckedMetrics && summary.senas > 0,
      accentBorder:
        showCheckedMetrics && summary.senas > 0
          ? 'border-reveillon-gold-bright bg-gradient-to-br from-reveillon-gold/20 via-reveillon-charcoal to-reveillon-charcoal shadow-gold-glow'
          : 'border-reveillon-border',
      iconContainer:
        showCheckedMetrics && summary.senas > 0
          ? 'border-reveillon-gold-bright bg-gold-shimmer text-reveillon-black'
          : 'border-reveillon-border bg-reveillon-surface text-reveillon-silver-muted',
      valueColor:
        showCheckedMetrics && summary.senas > 0
          ? 'text-gold-gradient'
          : 'text-reveillon-silver-light',
    },
  ];

  return (
    <section aria-labelledby="summary-dashboard-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="summary-dashboard-heading"
          className="text-base font-semibold tracking-tight text-reveillon-silver-light sm:text-lg"
        >
          Painel de Conferência
        </h2>

        {hasGames && !hasDrawResult && (
          <span className="text-xs text-reveillon-gold-light/90">
            Defina as 6 dezenas do sorteio para calcular quadras, quinas e senas
          </span>
        )}

        {showCheckedMetrics && summary.totalWinningGames > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-reveillon-gold/40 bg-reveillon-gold/10 px-3 py-1 text-xs font-semibold text-reveillon-gold-light">
            <Crown className="h-3.5 w-3.5 text-reveillon-gold-bright" />
            {summary.totalWinningGames}{' '}
            {summary.totalWinningGames === 1
              ? 'jogo premiado encontrado!'
              : 'jogos premiados encontrados!'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const IconComponent = card.icon;

          return (
            <div
              key={card.id}
              className={`rounded-2xl border bg-reveillon-charcoal/90 p-4 transition-all sm:p-5 ${card.accentBorder}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-reveillon-silver">
                  {card.label}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${card.iconContainer}`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
              </div>

              <p
                className={`mt-3 font-mono text-3xl font-bold tracking-tight sm:text-4xl ${card.valueColor}`}
              >
                {card.value}
              </p>

              <p className="mt-1 text-xs text-reveillon-silver-muted">
                {card.caption}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

