import type { NextConfig } from "next";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

// ─── Modalità build ───────────────────────────────────────────────────────────
// CAPACITOR (mobile): next build → genera cartella 'out' → npx cap sync
//   • output:'export' obbligatorio, le rewrites vengono ignorate
//   • api.ts usa NEXT_PUBLIC_BACKEND_URL direttamente (nessun proxy)
//
// WEB (browser): npm run dev
//   • output:'export' commentato, le rewrites attivano il proxy verso Laravel
//   • api.ts usa baseURL vuoto → il browser chiama /api/* in stessa origine
// ─────────────────────────────────────────────────────────────────────────────

const isMobileBuild = process.env.BUILD_TARGET === 'mobile';

const nextConfig: NextConfig = {
  // Commentare/decommentare a seconda del target:
  //  - mobile build (Capacitor): export BUILD_TARGET=mobile  →  output si attiva automaticamente
  //  - web dev (npm run dev):    nessuna variabile           →  output disabilitato
  ...(isMobileBuild ? { output: 'export' } : {}),

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'loremflickr.com' },
    ],
  },

  // Proxy attivo SOLO in modalità dev (web browser)
  // In export statico queste rewrites vengono ignorate automaticamente da Next.js
  ...(!isMobileBuild ? {
    async rewrites() {
      return [
        { source: '/api/:path*', destination: `${BACKEND}/api/:path*` },
        { source: '/sanctum/:path*', destination: `${BACKEND}/sanctum/:path*` },
      ];
    },
  } : {}),
};

export default nextConfig;
