import Image from 'next/image'
import React from 'react'
import { getAssetUrl } from '@/app/lib/urlHelper'

const BookCoverPage = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const isAi = props.creationMode === 'ai';
    const coverUrl = getAssetUrl(props.coverImage);
    return (
        <div className="page p-10 bg-purple-900 text-white h-full flex flex-col items-center justify-center shadow-lg border-r-4 border-purple-950" ref={ref} data-density="hard">
            <div className="border-4 border-yellow-500 p-4 w-full h-full flex flex-col items-center justify-between rounded-lg bg-cover bg-center box-border" style={{ backgroundImage: coverUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${coverUrl})` : undefined }}>
                <div className="text-center mt-10">
                    <h1 className="text-5xl font-serif font-bold text-yellow-400 drop-shadow-lg tracking-wider uppercase mb-4">{props.title}</h1>
                    <p className="text-xl text-yellow-200 font-light tracking-widest uppercase">
                        {isAi ? "Creato con Genio AI" : "Una storia magica"}
                    </p>
                </div>

                <div className="mb-20">
                    <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-4xl">📖</span>
                    </div>
                </div>

                <div className="mb-10 text-center opacity-80 text-sm">
                    <p>Open the magic...</p>
                </div>
            </div>
        </div>
    )
});

BookCoverPage.displayName = 'BookCoverPage';

export default BookCoverPage