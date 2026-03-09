import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings, Music, Upload, Trash2, Clock, Play, Pause } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { getAssetUrl } from '@/app/lib/urlHelper';

export interface SlideAudio {
    file?: File | null;
    preview?: string | null;
    url?: string | null;
    duration: number; // in seconds
    isDefaultAudio: boolean;
}

interface SlideSettingsProps {
    audio: SlideAudio | undefined;
    onUpdate: (newAudio: SlideAudio) => void;
    defaultAudioPreview?: string | null;
}

export function SlideSettings({ audio, onUpdate, defaultAudioPreview }: SlideSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Initialize state from props or defaults
    const currentAudio = audio || {
        duration: 5,
        isDefaultAudio: true,
        file: null,
        preview: null,
        url: null
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdate({
                    ...currentAudio,
                    file: file,
                    preview: reader.result as string,
                    isDefaultAudio: false
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val > 0) {
            onUpdate({ ...currentAudio, duration: val });
        }
    };

    const toggleDefaultAudio = (checked: boolean) => {
        onUpdate({
            ...currentAudio,
            isDefaultAudio: checked,
            // If checking default, we keep the custom file but ignore it, or we could clear it. 
            // Lets keep it for now in case they toggle back.
        });
    };

    const clearCustomAudio = () => {
        onUpdate({
            ...currentAudio,
            file: null,
            preview: null,
            url: null,
            isDefaultAudio: true
        });
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-purple-500 hover:bg-purple-500/10">
                                <Music className="w-5 h-5" />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-0">
                        <p>Impostazioni Slide</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <PopoverContent className="w-80 p-4" side="top" align="end">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold text-sm">Configurazione Slide</h4>
                    </div>

                    {/* Duration Control */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 text-xs uppercase font-bold text-muted-foreground">
                                <Clock className="w-3 h-3" /> Durata (secondi)
                            </Label>
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{currentAudio.duration}s</span>
                        </div>
                        <Input
                            type="range"
                            min="1"
                            max="60"
                            value={currentAudio.duration}
                            onChange={handleDurationChange}
                            className="h-8"
                        />
                    </div>

                    <div className="border-t pt-4 space-y-4">
                        <Label className="flex items-center gap-2 text-xs uppercase font-bold text-muted-foreground mb-2">
                            <Music className="w-3 h-3" /> Audio
                        </Label>

                        {/* Default Audio Toggle */}
                        {defaultAudioPreview && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Usa audio principale</span>
                                <Switch
                                    checked={currentAudio.isDefaultAudio}
                                    onCheckedChange={toggleDefaultAudio}
                                />
                            </div>
                        )}

                        {/* Custom Audio Uploader (Only if not using default or no default exists) */}
                        {(!currentAudio.isDefaultAudio || !defaultAudioPreview) && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                {(currentAudio.preview || currentAudio.url) ? (
                                    <div className="bg-muted rounded-lg p-2 flex items-center justify-between">
                                        <audio
                                            controls
                                            src={getAssetUrl(currentAudio.preview || currentAudio.url || '')}
                                            className="h-8 max-w-[180px]"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={clearCustomAudio}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg h-24 hover:bg-muted/50 transition-colors">
                                        <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Carica audio personalizzato</span>
                                        <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                                    </Label>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
