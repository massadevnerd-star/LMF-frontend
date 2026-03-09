import React from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const EndPage = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const router = useRouter();

    return (
        <div className="page bg-purple-900 text-white h-full flex flex-col items-center justify-center p-10 border-l-4 border-purple-950" ref={ref} data-density="hard">
            <div className="text-center space-y-8">
                <h2 className="text-6xl font-serif font-bold text-yellow-400 mb-4">Fine</h2>
                <div className="w-16 h-1 bg-yellow-400 mx-auto rounded-full"></div>
                <p className="text-xl text-gray-600 italic">Speriamo che la storia ti sia piaciuta!</p>

                <div className="pt-10 space-y-4 flex flex-col items-center">
                    <Button
                        onClick={() => router.push('/')}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest px-8 py-6 text-lg rounded-2xl shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        Torna alla Libreria
                    </Button>

                    <button
                        onClick={() => window.location.reload()}
                        className="text-gray-600  hover:text-gray-900 font-bold text-lg underline underline-offset-4 decoration-2 opacity-80 hover:opacity-100 transition-all mt-4 cursor-pointer"
                    >
                        🔄 Rileggi la storia
                    </button>
                </div>
            </div>
        </div>
    )
});

EndPage.displayName = 'EndPage';

export default EndPage;
