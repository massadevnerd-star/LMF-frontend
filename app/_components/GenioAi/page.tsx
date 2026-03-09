'use client'
import React from 'react'
import { useRouter } from 'next/navigation';
import { ViewType } from '@/app/types';
import StorySubjectInput from './_components/StorySubjectInput';
import StoryType from './_components/StoryType';
import AgeGroup from './_components/AgeGroup';
import ImageStyle from './_components/ImageStyle';
import api, { getCsrfToken, uploadFile, generateAiStory, generateAiImage, saveStory } from "@/app/lib/api";
import { getAssetUrl, toRelativePath } from "@/app/lib/urlHelper";
import { Button } from "@/components/ui/button"
import CustomerLoader from './_components/CustomerLoader';
import axios from 'axios';



const CREATE_STORY_PROMPT = process.env.NEXT_PUBLIC_CREATE_STORY_PROMPT || "";

// Helper to convert Base64 to File
function dataURLtoFile(dataurl: string, filename: string) {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


interface GenioAiProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    isDarkMode: boolean;
}
export interface UserSelection {
    fieldId: string;
    fieldValue: string;
}

export interface formDataType {
    storySubject: string;
    storyType: string;
    ageGroup: string;
    imageStyle: string;
}

function GenioAi({ currentView, setView, isDarkMode }: GenioAiProps) {
    const router = useRouter();
    const [isLoadingStory, setIsLoadingStory] = React.useState(false);


    const [formData, setFormData] = React.useState<formDataType>({
        storySubject: "",
        storyType: "",
        ageGroup: "",
        imageStyle: "",
    });

    const [storyData, setStoryData] = React.useState<any>(null);
    const [isStoryModalOpen, setIsStoryModalOpen] = React.useState(false);



    const bgColor = isDarkMode ? 'bg-[#1a1c31]' : 'bg-white border-2 border-orange-50';
    const textColor = isDarkMode ? 'text-indigo-200' : 'text-[#5b21b6]';
    const activeColor = isDarkMode ? 'text-indigo-400' : 'text-orange-600';
    const hoverBg = isDarkMode ? 'hover:bg-indigo-500/10' : 'hover:bg-orange-50';


    const onHandleUserSelection = (data: UserSelection) => {
        setFormData((prev) => ({
            ...prev,
            [data.fieldId]: data.fieldValue,
        }));
        console.log(formData);
    };

    const handleGenerateStory = async () => {
        setIsLoadingStory(true);
        // Prompt construction moved to backend or keep simple subject
        // For now, we still pass specific fields to backend
        try {
            console.log("Dati selezionati:", formData);

            // 1. Generate Story Content via Backend
            const storyResponse = await generateAiStory({
                storySubject: formData.storySubject,
                storyType: formData.storyType,
                ageGroup: formData.ageGroup,
                imageStyle: formData.imageStyle
            });

            console.log("Backend Story Response:", storyResponse.data);

            if (!storyResponse.data.success || !storyResponse.data.data) {
                throw new Error(storyResponse.data.error || "Failed to generate story content");
            }

            const generatedStory = storyResponse.data.data;

            // 2. Generate Cover Image via Backend
            const imageResponse = await generateAiImage(
                `Create a ${formData.imageStyle} style image. Add text with title ${generatedStory.title} in bold text for book cover. ${generatedStory.cover_image_prompt}`
            );

            let coverImageUrl = imageResponse.data.imageUrl;
            console.log("Image Response:", coverImageUrl);

            // If image generation failed (202 or error), we might get a partial response, handle gracefully
            if (!coverImageUrl) {
                console.warn("Image generation failed or pending:", imageResponse.data);
            }

            // Construct the complete story object for state and storage
            const completedStoryData = {
                ...generatedStory,
                coverImage: coverImageUrl
            };

            setStoryData(completedStoryData);

            // 3. Save Story to Backend
            // await getCsrfToken(); // handled in api.ts
            const response = await saveStory({
                ...formData,
                output: completedStoryData,
                creationMode: 'ai',
            });

            console.log("Story created and saved:", response.data);

            if (response.data && response.data.id) {
                router.push(`/view-story?id=${response.data.id}`);
            }

        } catch (error: any) {
            console.error("Error creating story:", error);
            alert(`Errore: ${error.message || "Errore sconosciuto"}`);
        } finally {
            setIsLoadingStory(false);
        }
    };

    const isFormValid =
        formData.storySubject &&
        formData.storyType &&
        formData.ageGroup &&
        formData.imageStyle;

    return (
        <div className={`min - h - screen ${bgColor} `}>
            {/* Story Preview Modal */}
            {isStoryModalOpen && storyData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl ${isDarkMode ? 'bg-[#1a1c31] text-indigo-50 border border-indigo-500/30' : 'bg-white text-gray-900'} `}>

                        {/* Modal Header - Fixed */}
                        <div className="flex-none flex justify-between items-start p-8 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="text-3xl font-black mb-2">{storyData.title}</h2>
                                <p className="opacity-70 text-sm">Creata con Genio AI</p>
                            </div>
                            <button
                                onClick={() => setIsStoryModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Cover Image Display */}
                            {storyData.coverImage && (
                                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-orange-100 mx-auto max-w-lg">
                                    <img
                                        src={getAssetUrl(storyData.coverImage)}
                                        alt={storyData.title}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}

                            {/* Cover Prompt Info */}
                            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/30">
                                <h4 className="font-bold text-sm uppercase tracking-wider text-purple-600 dark:text-purple-300 mb-2">Prompt Copertina</h4>
                                <p className="text-sm italic opacity-80">{storyData.cover_image_prompt}</p>
                            </div>

                            <div className="space-y-6">
                                {storyData.chapters?.map((chapter: any, index: number) => (
                                    <div key={index} className="p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                        <h3 className="text-xl font-bold mb-3">Capitolo {chapter.chapter_number}: {chapter.chapter_title}</h3>
                                        <p className="leading-relaxed mb-4 whitespace-pre-wrap">{chapter.text}</p>

                                        <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg text-xs">
                                            <span className="font-bold uppercase text-gray-400 block mb-1">Image Prompt:</span>
                                            <span className="font-mono text-gray-600 dark:text-gray-400">{chapter.image_prompt}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer - Fixed */}
                        <div className="flex-none p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50 dark:bg-white/5 rounded-b-3xl">
                            <Button onClick={() => setIsStoryModalOpen(false)}>
                                Chiudi e Salva
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Header Section from Reference */}
            <div className="py-30 px-4 text-center">

                <h1 className={`md: text-5xl font-black ${textColor}  uppercase tracking-wide mb-6 `}>

                    Crea la tua Fiaba
                </h1>


                <p className={` ${textColor} text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed`}>
                    Libera la tua creatività con l&apos;AI: crea storie come mai prima d&apos;ora!
                    Lascia che la nostra AI dia vita alla tua immaginazione, una storia
                    alla volta.
                </p>
            </div>

            <div className="max-w-[1600px] mx-auto px-12 pb-20 relative z-10 w-full">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full">
                    <StorySubjectInput userSelection={onHandleUserSelection} isDarkMode={isDarkMode} />
                    <StoryType userSelection={onHandleUserSelection} isDarkMode={isDarkMode} />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 w-full mt-30">
                    {/* Age Group */}
                    <AgeGroup userSelection={onHandleUserSelection} isDarkMode={isDarkMode} />
                    <ImageStyle userSelection={onHandleUserSelection} isDarkMode={isDarkMode} />
                </div>
                <div className="flex justify-end gap-4 my-10">
                    <Button
                        className="p-10 text-2xl cursor-pointer"
                        disabled={!isFormValid || isLoadingStory}
                        onClick={handleGenerateStory}>
                        {isLoadingStory ? "Generando..." : "Genera la tua Storia"}
                    </Button>
                </div>
                <CustomerLoader isLoadingStory={isLoadingStory} />
            </div>
        </div>

    )
}

export default GenioAi