/**
 * URL Helper Utility
 * Constructs full URLs from relative paths using environment variables.
 * Always uses NEXT_PUBLIC_BACKEND_URL for dynamic server-agnostic paths.
 */

const getBaseUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Normalizes a URL to a relative path (storage/uploads/xxx.png).
 * Use before saving to DB to avoid hardcoding localhost or any domain.
 */
export function toRelativePath(url: string | null | undefined): string {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url; // Keep as-is, will be replaced on upload
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const parsed = new URL(url);
            return parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
        } catch {
            return url;
        }
    }
    return url.startsWith('/') ? url.slice(1) : url;
}

/**
 * Constructs full URL from relative path (dynamic, server-agnostic).
 * Handles legacy full URLs in DB by extracting path and rebuilding with current backend URL.
 * @param relativePath - Path like 'storage/uploads/image.jpg' or full URL
 * @returns Full URL using NEXT_PUBLIC_BACKEND_URL
 */
export function getAssetUrl(relativePath: string | null | undefined): string {
    if (!relativePath) return '';

    // blob: and data: are temporary preview URLs - use as-is
    if (relativePath.startsWith('blob:') || relativePath.startsWith('data:')) {
        return relativePath;
    }

    // If full URL (legacy data with localhost), extract path and rebuild with current backend
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        relativePath = toRelativePath(relativePath) || relativePath;
    }

    const baseUrl = getBaseUrl();
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    return `${baseUrl}/${cleanPath}`;
}

/**
 * Constructs API endpoint URL (dynamic, server-agnostic).
 * @param endpoint - API endpoint like '/api/auth/login'
 * @returns Full URL using NEXT_PUBLIC_BACKEND_URL
 */
export function getApiUrl(endpoint: string): string {
    const baseUrl = getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
}
