export const getPath = (path: string) => {
    const basePath = ''; //./
    // Remove leading slash if present to avoid double slashes, though double slashes usually work.
    // Actually, simple concatenation is safest:
    return `${basePath}${path.startsWith('/') ? '' : '/'}${path}`;
};
