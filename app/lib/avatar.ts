const IS_MOBILE_BUILD = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.8.103:8000';

/**
 * Centralizzata: genera un URL avatar coerente.
 */
export function getAvatarUrl(avatar?: string | null, seed?: string | null): string {
    if (avatar && avatar.startsWith('http')) {
        if (IS_MOBILE_BUILD && avatar.includes('127.0.0.1')) {
            const fixedUrl = avatar.replace('127.0.0.1:8000', BACKEND_URL.replace('http://', ''));
            console.log(`[MOBILE-DEBUG] Local Avatar fixed: ${fixedUrl}`);
            return fixedUrl;
        }
        return avatar;
    }
    const s = encodeURIComponent(avatar || seed || 'User');
    // Ripristinato SVG per v7 (PNG non supportato direttamente nell'URL)
    const finalUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s}`;
    console.log(`[MOBILE-DEBUG] Avatar generated: ${finalUrl}`);
    return finalUrl;
}
