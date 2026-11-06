import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import {
  getRoleEmoji,
  getRoleColor,
  getRoleDescription,
  getRoleTeam,
  getRoleGoal,
} from '@/lib/gameLogic';
import { Badge } from '@/components/ui/badge';
import { Shield, Skull, Eye, Moon, Sun, ArrowRight } from 'lucide-react';

export function RoleReveal() {
  const { myPlayer, dismissRoleReveal, room } = useGameStore();
  const [revealed, setRevealed] = useState(false);

  if (!myPlayer) return null;

  const role = myPlayer.role || 'villager';
  const isWolf = role === 'werewolf';
  const team = getRoleTeam(role);
  const goal = getRoleGoal(role);
  const description = getRoleDescription(role);

  return (
    <div className="min-h-screen mystic-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[140px] animate-flicker" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="w-full max-w-md animate-fade-up text-center relative z-10">
        {!revealed ? (
          <div className="space-y-8">
            <div className="relative inline-block group animate-float-slow">
              <div className="text-8xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-700 select-none">
                🃏
              </div>
              <div className="absolute -inset-8 rounded-full border border-primary/20 animate-breathe" />
              <div className="absolute -inset-12 rounded-full border border-primary/10 animate-pulse duration-[4s]" />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-display tracking-[0.4em] uppercase text-primary/80">Secret Identity</span>
              <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-[0.15em] uppercase noir-text-glow text-white">
                Your Role
              </h2>
              <div className="noir-divider mx-auto w-32" />
              <p className="text-muted-foreground font-body text-base opacity-75">
                Click below to secretly discover your assigned role and winning objective. Keep it hidden from other players!
              </p>
            </div>

            <button
              onClick={() => setRevealed(true)}
              className="group relative w-full h-16 rounded-2xl overflow-hidden active:scale-[0.98] transition-all shadow-[0_0_40px_-10px_hsl(var(--wolf-red)/0.5)] border border-primary/30"
            >
              <div className="absolute inset-0 bg-primary/90 group-hover:bg-primary transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
              <span className="relative z-10 font-display text-sm tracking-[0.3em] uppercase text-primary-foreground flex items-center justify-center gap-3">
                Reveal My Secret Role <Eye className="w-4 h-4" />
              </span>
            </button>
          </div>
        ) : (
          <div className="noir-glass rounded-3xl p-8 sm:p-10 animate-fade-up border-primary/30 shadow-[0_0_50px_-10px_rgba(255,0,0,0.25)] relative overflow-hidden text-left">
            {/* Reveal Burst Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/20 blur-[70px] animate-pulse pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="text-7xl sm:text-8xl mb-3 animate-fade-up select-none filter drop-shadow-[0_0_20px_rgba(255,0,0,0.4)]">
                  {getRoleEmoji(role)}
                </div>

                <Badge
                  className={`text-[9px] font-display tracking-[0.25em] uppercase px-3 py-1 mb-2 ${
                    isWolf ? 'bg-primary/20 text-primary border-primary/40' : 'bg-accent/20 text-accent border-accent/40'
                  }`}
                >
                  {team}
                </Badge>

                <h2 className={`text-3xl sm:text-4xl font-display font-bold uppercase tracking-[0.1em] noir-text-glow ${getRoleColor(role)}`}>
                  {role}
                </h2>
              </div>

              {/* Goal Card */}
              <div className="noir-glass p-4 rounded-xl border-white/10 bg-black/40 mb-4">
                <p className="text-[10px] font-display tracking-[0.2em] uppercase text-primary/80 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Your Objective
                </p>
                <p className="text-sm font-body text-foreground/90 leading-relaxed">
                  {goal}
                </p>
              </div>

              {/* Ability & Instructions */}
              <div className="space-y-2 mb-8">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                  <Moon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-display tracking-widest uppercase text-foreground/80 block mb-0.5">Night Phase</span>
                    <span className="text-muted-foreground font-body">
                      {isWolf
                        ? 'Coordinate with fellow wolves in secret chat and pick a villager to eliminate.'
                        : role === 'seer'
                        ? 'Select one player to investigate and learn their true allegiance.'
                        : role === 'doctor'
                        ? 'Select one player to shield from werewolf attack.'
                        : role === 'witch'
                        ? 'Decide whether to use your heal or poison potion.'
                        : role === 'hunter'
                        ? 'Lock in a retribution target if you are eliminated.'
                        : 'Sleep through the night. Stay rested for the dawn.'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
                  <Sun className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-display tracking-widest uppercase text-foreground/80 block mb-0.5">Day Phase</span>
                    <span className="text-muted-foreground font-body">
                      {isWolf
                        ? 'Blend in with the villagers! Feign innocence and misdirect daytime votes.'
                        : 'Discuss clues in public chat, share deductions, and vote to eliminate suspected werewolves.'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={dismissRoleReveal}
                className="relative overflow-hidden w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-display text-xs tracking-[0.25em] uppercase border border-primary/30 transition-all active:scale-[0.98] group shadow-lg flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-shimmer opacity-0 group-hover:opacity-100" />
                <span className="relative z-10 font-bold">Ready — Enter Night 1</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
