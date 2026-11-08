import { Crown, Sparkles } from 'lucide-react';
import type { CheckedGame, PrizeTier } from '@/types/lottery';
import { formatDezena } from '@/utils/csvParser';

interface GameCardProps {
  checkedGame: CheckedGame;
  hasDrawResult: boolean;
}

const TIER_STYLES: Record<
  PrizeTier,
  {
    cardClass: string;
    badgeClass: string;
    tierLabel: string | null;
  }
> = {
  sena: {
    cardClass:
      'border-reveillon-gold-bright bg-gradient-to-br from-reveillon-gold/15 via-reveillon-charcoal to-reveillon-obsidian shadow-gold-glow',
    badgeClass:
      'bg-gold-shimmer text-reveillon-black font-bold shadow-sm',
    tierLabel: 'SENA',
  },
  quina: {
    cardClass:
      'border-reveillon-gold/75 bg-gradient-to-br from-reveillon-gold/10 via-reveillon-charcoal to-reveillon-charcoal shadow-gold-glow',
    badgeClass:
      'border border-reveillon-gold-bright/70 bg-reveillon-gold/25 text-reveillon-gold-bright font-bold',
    tierLabel: 'QUINA',
  },
  quadra: {
    cardClass:
      'border-reveillon-gold/45 bg-reveillon-charcoal/95 shadow-silver-card',
    badgeClass:
      'border border-reveillon-gold/50 bg-reveillon-gold/15 text-reveillon-gold-light font-semibold',
    tierLabel: 'QUADRA',
  },
  none: {
    cardClass: 'border-reveillon-border bg-reveillon-charcoal/80',
    badgeClass:
      'border border-reveillon-border bg-reveillon-surface text-reveillon-silver',
    tierLabel: null,
  },
};

/**
 * Renders a single bet card with numbers in ascending order.
 * Matched numbers are highlighted in Gold; non-matched numbers use Silver/neutral tones.
 */
export function GameCard({ checkedGame, hasDrawResult }: GameCardProps) {
  const { game, matchedNumbers, hitCount, tier } = checkedGame;
  const matchedSet = new Set(matchedNumbers);
  const styles = TIER_STYLES[hasDrawResult ? tier : 'none'];

  const hitText =
    hitCount === 1 ? '1 acerto' : `${hitCount} acertos`;

  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border p-4 transition-all hover:border-reveillon-silver/40 ${styles.cardClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              Jogo #{String(game.id).padStart(2, '0')}
            </h3>
            <span className="rounded-md border border-reveillon-border bg-reveillon-black/60 px-2 py-0.5 text-[11px] font-medium text-reveillon-silver">
              {game.numbers.length} dezenas
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-reveillon-silver-muted">
            Linha {game.sourceRow} do CSV
          </p>
        </div>

        {hasDrawResult ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${styles.badgeClass}`}
          >
            {tier === 'sena' && <Crown className="h-3 w-3" />}
            {(tier === 'quina' || tier === 'quadra') && (
              <Sparkles className="h-3 w-3" />
            )}
            {styles.tierLabel ? `${styles.tierLabel} • ${hitText}` : hitText}
          </span>
        ) : (
          <span className="rounded-full border border-reveillon-border bg-reveillon-obsidian px-2.5 py-1 text-[11px] text-reveillon-silver-muted">
            Aguardando sorteio
          </span>
        )}
      </div>

      {/* Numbers Grid in Ascending Order */}
      <div className="mt-4 flex flex-wrap gap-2">
        {game.numbers.map((num) => {
          const isMatch = hasDrawResult && matchedSet.has(num);

          return (
            <span
              key={num}
              aria-label={
                isMatch
                  ? `Dezena ${formatDezena(num)} sorteada`
                  : `Dezena ${formatDezena(num)}`
              }
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs transition-transform ${
                isMatch
                  ? 'scale-105 bg-gold-shimmer font-extrabold text-reveillon-black shadow-gold-ball ring-2 ring-reveillon-gold-light/60'
                  : 'border border-reveillon-silver-dark/80 bg-reveillon-black/80 font-medium text-reveillon-silver'
              }`}
            >
              {formatDezena(num)}
            </span>
          );
        })}
      </div>
    </article>
  );
}

