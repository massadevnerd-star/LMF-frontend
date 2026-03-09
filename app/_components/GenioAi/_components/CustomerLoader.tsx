"use client"

import React from 'react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import Image from 'next/image'

import { getPath } from "@/app/lib/path";

function CustomerLoader({ isLoadingStory }: { isLoadingStory: boolean }) {
    return (
        <AlertDialog open={isLoadingStory}>
            <AlertDialogContent className="p-10 flex flex-col items-center justify-center">
                <AlertDialogHeader>
                    <AlertDialogTitle className="sr-only">Caricamento in corso</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="flex items-center justify-center">
                    <Image src={getPath('/loader.gif')} alt="Loader" width={300} height={300} priority />
                </div>
                <h2 className='text-2xl font-bold text-center'>Please wait...</h2>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CustomerLoader