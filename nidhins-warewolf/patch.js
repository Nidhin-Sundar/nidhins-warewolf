import { readFileSync, writeFileSync } from 'fs';
const path = './src/stores/gameStore.ts';
let content = readFileSync(path, 'utf8');

content = content.replace(
  "import { create } from 'zustand';",
  "import { create } from 'zustand';\nimport { persist } from 'zustand/middleware';"
);

content = content.replace(
  "export const useGameStore = create<GameState>((set, get) => ({",
  "export const useGameStore = create<GameState>()(\n  persist(\n    (set, get) => ({"
);

content = content.replace(
  /\}\)\);\n?$/,
  `    }),
    {
      name: 'werewolf-game-storage',
      partialize: (state) => ({
        room: state.room,
        screen: state.screen,
        myPlayer: state.myPlayer,
      }),
    }
  )\n);\n`
);

writeFileSync(path, content);
