// Inserito da vite.config.ts al momento della build
declare const __BUILD_INFO__: {
  commit: string;
  message: string;
  builtAt: string;
  source: 'online' | 'locale';
};

export const BUILD_INFO = __BUILD_INFO__;

/** "24/11/2026, 16:05" (ora italiana) */
export function formatBuildDate(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const GITHUB_COMMIT_URL = `https://github.com/Gigi-press/felpe-scuola/commit/${BUILD_INFO.commit}`;
