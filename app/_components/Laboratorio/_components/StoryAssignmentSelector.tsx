'use client';

import React, { useEffect, useState } from 'react';
import { ChildProfile } from '@/app/types';
import api from '@/app/lib/api';
import { Check, Users } from 'lucide-react';

interface StoryAssignmentSelectorProps {
    assignedChildrenIds: number[];
    onChange: (ids: number[]) => void;
}

export default function StoryAssignmentSelector({ assignedChildrenIds, onChange }: StoryAssignmentSelectorProps) {
    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const response = await api.get('/api/auth/children');
                setChildren(response.data);
            } catch (err) {
                console.error("Failed to fetch children", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    const toggleChild = (childId: number) => {
        if (assignedChildrenIds.includes(childId)) {
            onChange(assignedChildrenIds.filter(id => id !== childId));
        } else {
            onChange([...assignedChildrenIds, childId]);
        }
    };

    const toggleAll = () => {
        if (assignedChildrenIds.length === 0) {
            // If currently empty (All), we might want to keep it empty to signify "All" explicitly 
            // OR if the UI convention is "Select All" = fill array.
            // Based on backend logic: Empty = All. 
            // But for UI clarity, let's treat "Empty" as "All" visually too? 
            // Actually, let's allow explicit selection. 
            // If I click "All", I clear the specific selection (making it empty -> Global).
            onChange([]);
        } else {
            // Logic: If I have some selected, clicking "All" should clear selection (return to Global)
            onChange([]);
        }
    };

    const isAllSelected = assignedChildrenIds.length === 0;

    if (loading) return <div className="animate-pulse h-10 w-full bg-gray-100 rounded-xl"></div>;

    if (children.length === 0) return null;

    return (
        <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                A chi vuoi dedicare questa storia?
            </label>

            <div className="flex flex-wrap gap-3">
                {/* Option: TUTTI (Default / Empty Array) */}
                <button
                    onClick={() => onChange([])}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${isAllSelected
                            ? 'bg-purple-100 border-purple-500 text-purple-700 font-bold shadow-sm'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-purple-200'
                        }`}
                >
                    {isAllSelected && <Check className="w-4 h-4" />}
                    Tutti i figli
                </button>

                {/* Individual Children */}
                {children.map(child => {
                    const isSelected = assignedChildrenIds.includes(child.id);
                    return (
                        <button
                            key={child.id}
                            onClick={() => toggleChild(child.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${isSelected
                                    ? 'bg-purple-100 border-purple-500 text-purple-700 font-bold shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-purple-200'
                                }`}
                        >
                            {isSelected && <Check className="w-4 h-4" />}
                            {child.nickname}
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-gray-400 pl-1">
                {isAllSelected
                    ? "La storia sarà visibile a tutti i tuoi figli."
                    : "La storia sarà visibile solo ai figli selezionati."}
            </p>
        </div>
    );
}
