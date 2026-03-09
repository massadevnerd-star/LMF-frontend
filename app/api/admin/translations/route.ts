import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-static';

// Percorsi assoluti ai file di locales (letti/scritti lato server)
const LOCALES_DIR = path.join(process.cwd(), 'app', 'locales');
const IT_PATH = path.join(LOCALES_DIR, 'it.ts');
const EN_PATH = path.join(LOCALES_DIR, 'en.ts');

/**
 * Legge un file .ts di locales ed estrae l'oggetto JSON.
 * Il file ha formato: `export const xx = { ... };`
 * Usa eval-safe: estrae solo la parte JSON con regex.
 */
function readLocaleFile(filePath: string): Record<string, any> {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Rimuove la riga export const xx = e il trailing ; per ottenere pure JSON-like object
        const match = content.match(/export const \w+ = ({[\s\S]*});?\s*$/);
        if (!match) return {};

        // Usa Function constructor per valutare in modo sicuro (server-side only)
        // eslint-disable-next-line no-new-func
        const obj = new Function(`return ${match[1]}`)();
        return obj;
    } catch (e) {
        console.error(`Failed to read locale file: ${filePath}`, e);
        return {};
    }
}

/**
 * Serializza un oggetto in formato TypeScript locale.
 * Produce: export const xx = { ... };\n
 */
function serializeLocale(varName: string, obj: Record<string, any>): string {
    const json = JSON.stringify(obj, null, 4);
    return `export const ${varName} = ${json};\n`;
}

// GET /api/admin/translations → restituisce { it: {...}, en: {...} }
export async function GET() {
    try {
        const it = readLocaleFile(IT_PATH);
        const en = readLocaleFile(EN_PATH);
        return NextResponse.json({ it, en });
    } catch (error) {
        console.error('Error reading locale files:', error);
        return NextResponse.json({ error: 'Failed to read translations' }, { status: 500 });
    }
}

// POST /api/admin/translations → body: { it: {...}, en: {...} } → salva i file .ts
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { it, en } = body;

        if (!it || !en) {
            return NextResponse.json({ error: 'Missing it or en data' }, { status: 400 });
        }

        fs.writeFileSync(IT_PATH, serializeLocale('it', it), 'utf-8');
        fs.writeFileSync(EN_PATH, serializeLocale('en', en), 'utf-8');

        return NextResponse.json({ success: true, message: 'Translations saved successfully' });
    } catch (error) {
        console.error('Error saving translations:', error);
        return NextResponse.json({ error: 'Failed to save translations' }, { status: 500 });
    }
}
