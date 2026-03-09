import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Music, Upload, Trash2, Mic, Volume2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { getAssetUrl } from '@/app/lib/urlHelper';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type AudioMode = 'global' | 'slides';

interface StoryAudioSettingsProps {
    audioMode: AudioMode;
    onModeChange: (mode: AudioMode) => void;
    globalAudioPreview?: string | null;
    onGlobalAudioUpload: (file: File) => void;
    onGlobalAudioClear: () => void;
}

export function StoryAudioSettings({
    audioMode,
    onModeChange,
    globalAudioPreview,
    onGlobalAudioUpload,
    onGlobalAudioClear
}: StoryAudioSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onGlobalAudioUpload(e.target.files[0]);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant={audioMode === 'global' ? "default" : "secondary"}
                                size="sm"
                                className={cn(
                                    "gap-2 transition-all",
                                    audioMode === 'global'
                                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
                                        : "bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 text-muted-foreground border border-white/20"
                                )}
                            >
                                {audioMode === 'global' ? <Music className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                <span className="hidden sm:inline font-medium">
                                    {audioMode === 'global' ? "Audio Storia" : "Audio Slide"}
                                </span>
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-0">
                        <p>Gestisci Audio Storia</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <PopoverContent className="w-80 p-5" side="top" align="end">
                <div className="space-y-5">
                    <div className="flex items-center justify-between border-b pb-3">
                        <h4 className="font-bold text-sm uppercase tracking-wide opacity-80">Impostazioni Audio</h4>
                    </div>

                    {/* Mode Switch */}
                    <div className="bg-muted/50 p-1 rounded-lg flex items-center relative">
                        <div
                            className="absolute inset-y-1 bg-white dark:bg-gray-800 rounded-md shadow transition-all duration-300 ease-out"
                            style={{
                                left: audioMode === 'global' ? '4px' : '50%',
                                right: audioMode === 'global' ? '50%' : '4px'
                            }}
                        />
                        <button
                            onClick={() => onModeChange('global')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-md relative z-10 transition-colors",
                                audioMode === 'global' ? "text-purple-600" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Music className="w-3 h-3" />
                            Sottofondo
                        </button>
                        <button
                            onClick={() => onModeChange('slides')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-md relative z-10 transition-colors",
                                audioMode === 'slides' ? "text-purple-600" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Mic className="w-3 h-3" />
                            Slide
                        </button>
                    </div>

                    <div className="space-y-3">
                        {audioMode === 'global' ? (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-3">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Una singola traccia musicale che suonerà per tutta la durata della storia.
                                </p>

                                {globalAudioPreview ? (
                                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-3 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                                <Volume2 className="w-3 h-3" /> Audio Caricato
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={onGlobalAudioClear}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <audio controls src={getAssetUrl(globalAudioPreview)} className="w-full h-8" />
                                    </div>
                                ) : (
                                    <Label className="cursor-pointer group flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl h-28 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-purple-300 transition-all">
                                        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 mb-2 transition-colors">
                                            <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 group-hover:text-purple-600">Carica file (MP3, WAV)</span>
                                        <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                                    </Label>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-300 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Mic className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                                    <div className="space-y-1">
                                        <h5 className="text-xs font-bold text-orange-700 dark:text-orange-300">Narrazione Attiva</h5>
                                        <p className="text-[11px] text-orange-600/80 dark:text-orange-400/70 leading-relaxed">
                                            In questa modalità, puoi caricare un audio diverso per ogni slide (es. voce narrante). Usa l'icona <Music className="w-3 h-3 inline mx-0.5" /> sulla barra strumenti in alto per configurare ogni pagina.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
