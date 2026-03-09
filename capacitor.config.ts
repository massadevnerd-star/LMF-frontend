import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.lemiestorie.app',
    appName: 'Le Mie Storie',
    webDir: 'out',
    server: {
        // 'https' configurato per produzione su server sicuro reale
        androidScheme: 'https',
        // ── SVILUPPO: Live Reload ──────────────────────────────────────────────
        // Decommenta per dev live reload, commenta per build di produzione
        // url: 'http://192.168.8.103:3000',
        // cleartext: true,
        // ─────────────────────────────────────────────────────────────────────
    }
};

export default config;
