'use client';

import React, { useEffect, useState } from 'react';
import { adminService, MenuItem } from '@/app/services/adminService';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/app/context/LanguageContext';

export default function MenusPage() {
    const { t } = useLanguage();
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadMenus();
    }, [t]); // Reload if language changes to re-render but data is same. 
    // Ideally we fetch once and translate render-side, but loadMenus fetches data. 
    // Let's keep loadMenus simple and just translate in render.

    const loadMenus = async () => {
        try {
            const data = await adminService.getMenus();
            // Data comes from DB. Labels might be keys like 'sidebar.my_castle'
            setMenus(data);
        } catch (error) {
            toast.error("Errore caricamento menu");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Eliminare questa voce di menu?")) return;
        try {
            await adminService.deleteMenu(id);
            setMenus(prev => prev.filter(m => m.id !== id));
            toast.success("Voce eliminata");
        } catch (e) {
            toast.error("Errore eliminazione");
        }
    };

    const handleSave = async () => {
        try {
            // Prepare data for backend (extract IDs)
            const payload = {
                ...editForm,
                roles: editForm.roles?.map((r: any) => r.id) || []
            };

            if (isEditing) {
                const updated = await adminService.updateMenu(isEditing, payload);
                setMenus(prev => prev.map(m => m.id === isEditing ? updated : m));
                toast.success("Menu aggiornato");
            } else if (isCreating) {
                const created = await adminService.createMenu(payload);
                setMenus(prev => [...prev, created]);
                toast.success("Nuova voce creata");
            }
            resetForm();
        } catch (e) {
            console.error(e);
            toast.error("Operazione fallita");
        }
    };

    const resetForm = () => {
        setIsEditing(null);
        setIsCreating(false);
        setEditForm({});
    };

    const startEdit = (menu: MenuItem) => {
        setIsEditing(menu.id);
        setIsCreating(false);
        setEditForm(menu);
    };

    const startCreate = () => {
        setIsCreating(true);
        setIsEditing(null);
        setEditForm({ label: '', route: '', order: 0 });
    };

    // Helper to try translating or return original if no key found (or if it's user input)
    const renderLabel = (label: string) => {
        // If label looks like a translation key (e.g. contains dot), try translating
        // This is a naive check. 
        if (label.includes('.') && !label.includes(' ')) {
            return t(label);
        }
        return label;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-800">Gestione Menu</h2>
                <Button onClick={startCreate} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" /> Nuova Voce
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-500">ID</th>
                            <th className="p-4 font-bold text-gray-500">Icona</th>
                            <th className="p-4 font-bold text-gray-500">Label (Trans)</th>
                            <th className="p-4 font-bold text-gray-500">Raw Label</th>
                            <th className="p-4 font-bold text-gray-500">Route</th>
                            <th className="p-4 font-bold text-gray-500">Ruoli</th>
                            <th className="p-4 font-bold text-gray-500 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {menus.map(menu => (
                            <tr key={menu.id} className="hover:bg-gray-50">
                                <td className="p-4 text-gray-500 font-mono text-sm">#{menu.id}</td>
                                <td className="p-4 text-2xl">{menu.icon}</td>
                                <td className="p-4 font-bold text-lg">{renderLabel(menu.label)}</td>
                                <td className="p-4 text-gray-400 text-xs italic">{menu.label}</td>
                                <td className="p-4 text-gray-600 font-mono text-sm">{menu.route}</td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        {menu.roles?.map(r => (
                                            <span key={r.id} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold uppercase">
                                                {r.name}
                                            </span>
                                        ))}
                                        {(!menu.roles || menu.roles.length === 0) && <span className="opacity-50 text-xs italic">Tutti</span>}
                                    </div>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <Button size="sm" variant="ghost" onClick={() => startEdit(menu)}>
                                        <Edit2 className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(menu.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {menus.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">Nessuna voce di menu trovata.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Modal */}
            {(isEditing || isCreating) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                {isCreating ? 'Nuova Voce' : 'Modifica Voce'}
                            </h3>
                            <button onClick={resetForm}><X className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Label (Chiave traduzione o Testo)</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    value={editForm.label || ''}
                                    onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">Es: 'sidebar.my_castle' per traduzione automatica</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Route</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    value={editForm.route || ''}
                                    onChange={e => setEditForm({ ...editForm, route: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Icona</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    value={editForm.icon || ''}
                                    onChange={e => setEditForm({ ...editForm, icon: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ruoli (Chi può vedere questo menu?)</label>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {/* Option: Tutti */}
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border hover:bg-emerald-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={!editForm.roles || editForm.roles.length === 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setEditForm({ ...editForm, roles: [] });
                                                }
                                            }}
                                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <span className="capitalize font-medium text-gray-700">Tutti</span>
                                    </label>

                                    {/* Specific Roles */}
                                    {[
                                        { name: 'parent', id: 2, label: 'Solo Genitore' },
                                        { name: 'kid', id: 3, label: 'Solo Bambino' }
                                    ].map(roleDef => (
                                        <label key={roleDef.name} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border hover:bg-indigo-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={editForm.roles?.some((r: any) => r.name === roleDef.name) || false}
                                                onChange={(e) => {
                                                    const currentRoles = editForm.roles || [];
                                                    if (e.target.checked) {
                                                        // Add role, effectively removing 'Tutti' status
                                                        // Ensure we don't have duplicates
                                                        if (!currentRoles.some((r: any) => r.name === roleDef.name)) {
                                                            setEditForm({
                                                                ...editForm,
                                                                roles: [...currentRoles, { id: roleDef.id, name: roleDef.name }]
                                                            });
                                                        }
                                                    } else {
                                                        // Remove role
                                                        setEditForm({
                                                            ...editForm,
                                                            roles: currentRoles.filter((r: any) => r.name !== roleDef.name)
                                                        });
                                                    }
                                                }}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <span className="capitalize font-medium text-gray-700">{roleDef.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Seleziona "Tutti" oppure specifica chi può vedere la voce.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={resetForm}>Annulla</Button>
                            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">Salva</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
