import { Sparkles, Ticket, Trophy } from 'lucide-react';
import type { DrawResult } from '@/types/lottery';

interface HeaderProps {
  totalGames: number;
  drawResult: DrawResult | null;
}

/**
 * Top application header with Reveillon aesthetic and live pool/draw status pills.
 */
export function Header({ totalGames, drawResult }: HeaderProps) {
  return (
    <header className="relative border-b border-reveillon-border/80 bg-reveillon-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-reveillon-gold/40 bg-gradient-to-br from-reveillon-gold/20 via-reveillon-charcoal to-reveillon-black shadow-gold-glow">
            <Sparkles className="h-6 w-6 text-reveillon-gold-bright" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Bolão<span className="text-gold-gradient">MegaSync</span>
              </h1>
              <span className="hidden rounded-full border border-reveillon-gold/30 bg-reveillon-gold/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-reveillon-gold-light sm:inline-flex">
                Edição Réveillon
              </span>
            </div>
            <p className="mt-0.5 text-sm text-reveillon-silver">
              Conferência inteligente de bolões da Mega-Sena e Mega da Virada
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              totalGames > 0
                ? 'border-reveillon-silver/40 bg-reveillon-surface text-reveillon-silver-light'
                : 'border-reveillon-border bg-reveillon-charcoal/70 text-reveillon-silver-muted'
            }`}
          >
            <Ticket className="h-3.5 w-3.5 text-reveillon-silver" />
            <span>
              {totalGames > 0
                ? `${totalGames} ${totalGames === 1 ? 'jogo carregado' : 'jogos carregados'}`
                : 'Aguardando CSV'}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              drawResult
                ? 'border-reveillon-gold/50 bg-reveillon-gold/10 text-reveillon-gold-light'
                : 'border-reveillon-border bg-reveillon-charcoal/70 text-reveillon-silver-muted'
            }`}
          >
            <Trophy
              className={`h-3.5 w-3.5 ${
                drawResult
                  ? 'text-reveillon-gold-bright'
                  : 'text-reveillon-silver-muted'
              }`}
            />
            <span>
              {drawResult
                ? drawResult.contestNumber
                  ? `Concurso #${drawResult.contestNumber}`
                  : 'Resultado Manual Definido'
                : 'Sorteio não definido'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

