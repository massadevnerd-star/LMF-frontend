'use client';

import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import StoryAssignmentSelector from '@/app/_components/Laboratorio/_components/StoryAssignmentSelector';
import api from '@/app/lib/api';
import { toast } from 'sonner';

interface AssignmentUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    storyId: number;
    initialAssignedChildIds: number[];
    onUpdate: (storyId: number, newChildIds: number[]) => void;
}

export default function AssignmentUpdateModal({
    isOpen,
    onClose,
    storyId,
    initialAssignedChildIds,
    onUpdate
}: AssignmentUpdateModalProps) {
    const [assignedIds, setAssignedIds] = useState<number[]>(initialAssignedChildIds);
    const [isSaving, setIsSaving] = useState(false);

    // Sync state when modal opens (handled by parent re-rendering or useEffect if needed, 
    // but for simple modal unmount/remount usually fine. 
    // Better to use useEffect if the modal stays mounted but props change.
    React.useEffect(() => {
        if (isOpen) {
            setAssignedIds(initialAssignedChildIds);
        }
    }, [isOpen, initialAssignedChildIds]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put(`/api/auth/stories/${storyId}`, {
                assigned_children: assignedIds
            });
            onUpdate(storyId, assignedIds);
            toast.success("Condivisione aggiornata!");
            onClose();
        } catch (error) {
            console.error("Failed to update assignments", error);
            toast.error("Errore durante l'aggiornamento.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="rounded-3xl border-2 border-purple-100 bg-white dark:bg-[#1a1c31] dark:border-purple-900/30">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        Modifica Condivisione 🎁
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <div className="py-4">
                    <StoryAssignmentSelector
                        assignedChildrenIds={assignedIds}
                        onChange={setAssignedIds}
                    />
                </div>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel disabled={isSaving} className="rounded-xl">Annulla</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault(); // Prevent auto-close
                            handleSave();
                        }}
                        disabled={isSaving}
                        className="rounded-xl bg-purple-600 hover:bg-purple-500 font-bold"
                    >
                        {isSaving ? "Salvataggio..." : "Salva Modifiche"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
