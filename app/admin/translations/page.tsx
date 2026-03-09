'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

// Helper to flatten object
const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
    return Object.keys(obj).reduce((acc: any, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k]))
            Object.assign(acc, flattenObject(obj[k], pre + k));
        else
            acc[pre + k] = obj[k];
        return acc;
    }, {});
};

// Helper to unflatten object
const unflattenObject = (data: Record<string, string>): any => {
    const result: any = {};
    for (const i in data) {
        const keys = i.split('.');
        keys.reduce((r, e, j) => {
            return r[e] || (r[e] = keys[j + 1] === undefined ? data[i] : {});
        }, result);
    }
    return result;
};

interface TranslationItem {
    key: string;
    it: string;
    en: string;
}

export default function TranslationsPage() {
    const [items, setItems] = useState<TranslationItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<TranslationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newKey, setNewKey] = useState({ key: '', it: '', en: '' });

    useEffect(() => {
        loadTranslations();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredItems(items);
        } else {
            const lower = search.toLowerCase();
            setFilteredItems(items.filter(i =>
                i.key.toLowerCase().includes(lower) ||
                i.it.toLowerCase().includes(lower) ||
                i.en.toLowerCase().includes(lower)
            ));
        }
    }, [search, items]);

    const loadTranslations = async () => {
        try {
            const res = await fetch('/api/admin/translations');
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const flatIT = flattenObject(data.it);
            const flatEN = flattenObject(data.en);

            // Merge keys
            const allKeys = Array.from(new Set([...Object.keys(flatIT), ...Object.keys(flatEN)])).sort();

            const list = allKeys.map(key => ({
                key,
                it: flatIT[key] || '',
                en: flatEN[key] || ''
            }));

            setItems(list);
        } catch (error) {
            toast.error("Errore caricamento traduzioni");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (key: string, lang: 'it' | 'en', value: string) => {
        setItems(prev => prev.map(item =>
            item.key === key ? { ...item, [lang]: value } : item
        ));
    };

    const handleSaveAll = async () => {
        try {
            // Reconstruct nested objects
            const itObj = unflattenObject(items.reduce((acc, item) => ({ ...acc, [item.key]: item.it }), {}));
            const enObj = unflattenObject(items.reduce((acc, item) => ({ ...acc, [item.key]: item.en }), {}));

            const res = await fetch('/api/admin/translations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ it: itObj, en: enObj })
            });

            if (!res.ok) throw new Error('Salvataggio fallito');

            toast.success("Traduzioni salvate con successo!");
        } catch (error) {
            toast.error("Errore durante il salvataggio");
        }
    };

    const handleDelete = (key: string) => {
        if (!confirm(`Eliminare chiave "${key}"?`)) return;
        setItems(prev => prev.filter(i => i.key !== key));
    };

    const handleCreate = () => {
        if (!newKey.key || items.some(i => i.key === newKey.key)) {
            toast.error("Chiave mancante o duplicata");
            return;
        }
        setItems(prev => [{ ...newKey }, ...prev]);
        setNewKey({ key: '', it: '', en: '' });
        setIsCreating(false);
        toast.success("Chiave aggiunta (Ricorda di Salvare!)");
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-800">Traduzioni</h2>
                    <p className="text-sm text-gray-500">Gestisci i testi dell'applicazione</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsCreating(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4" /> Nuova Chiave
                    </Button>
                    <Button onClick={handleSaveAll} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Save className="w-4 h-4" /> Salva Modifiche
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    className="w-full pl-10 pr-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Cerca chiave o traduzione..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Creation Modal */}
            {isCreating && (
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold">Aggiungi Nuova Chiave</h3>
                        <button onClick={() => setIsCreating(false)}><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            className="p-2 border rounded font-mono text-sm"
                            placeholder="chiave.esempio"
                            value={newKey.key}
                            onChange={e => setNewKey({ ...newKey, key: e.target.value })}
                        />
                        <input
                            className="p-2 border rounded"
                            placeholder="Valore IT"
                            value={newKey.it}
                            onChange={e => setNewKey({ ...newKey, it: e.target.value })}
                        />
                        <input
                            className="p-2 border rounded"
                            placeholder="Valore EN"
                            value={newKey.en}
                            onChange={e => setNewKey({ ...newKey, en: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleCreate} size="sm">Aggiungi</Button>
                    </div>
                </div>
            )}

            {/* Table Container - Scrollable */}
            <div className="bg-white rounded-xl shadow-sm border flex-1 overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-bold text-gray-500 w-1/4">Chiave</th>
                                <th className="p-4 font-bold text-gray-500 w-1/3">Italiano (IT)</th>
                                <th className="p-4 font-bold text-gray-500 w-1/3">Inglese (EN)</th>
                                <th className="p-4 font-bold text-gray-500 w-12">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredItems.map(item => (
                                <tr key={item.key} className="hover:bg-gray-50 group">
                                    <td className="p-3 font-mono text-xs text-indigo-600 font-bold break-all">
                                        {item.key}
                                    </td>
                                    <td className="p-2">
                                        <textarea
                                            className="w-full bg-transparent border-transparent focus:bg-white focus:border-indigo-300 rounded p-1 text-sm resize-none overflow-hidden"
                                            rows={1}
                                            value={item.it}
                                            onChange={(e) => handleUpdate(item.key, 'it', e.target.value)}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto'; // Reset height
                                                target.style.height = Math.min(target.scrollHeight, 100) + 'px'; // Expand up to 100px
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <textarea
                                            className="w-full bg-transparent border-transparent focus:bg-white focus:border-indigo-300 rounded p-1 text-sm resize-none overflow-hidden"
                                            rows={1}
                                            value={item.en}
                                            onChange={(e) => handleUpdate(item.key, 'en', e.target.value)}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = Math.min(target.scrollHeight, 100) + 'px';
                                            }}
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleDelete(item.key)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                            title="Elimina"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">Nessuna traduzione trovata.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-2 border-t bg-gray-50 text-xs text-gray-400 text-center">
                    Showing {filteredItems.length} keys
                </div>
            </div>
        </div>
    );
}
