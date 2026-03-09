'use client'
import React, { useState } from 'react'
import Image from 'next/image'



export interface ImageStyleData {
    label: string;
    imageUrl: string;
    isFree: boolean;
}

interface StoryTypeProps {
    userSelection: (data: { fieldId: string; fieldValue: string }) => void;
    isDarkMode: boolean;
}

export default function ImageStyle({ isDarkMode, userSelection }: StoryTypeProps) {
    const textColor = isDarkMode ? 'text-indigo-200' : 'text-[#5b21b6]';
    const [selectedOption, setSelectedOption] = useState<string>("");

    // Placeholder data for Image Styles
    const OptionList: ImageStyleData[] = [
        {
            label: "3D Cartoon",
            imageUrl: "/ImageStyle/3DCartoon.png", // Keeping existing path as placeholder
            isFree: true,
        },
        {
            label: "Acquerello",
            imageUrl: "/ImageStyle/watercolor.png", // Keeping existing path as placeholder
            isFree: true,
        },
        {
            label: "Realistico",
            imageUrl: "/ImageStyle/papercut.png", // Keeping existing path as placeholder
            isFree: true,
        },
        {
            label: "Pixel Art",
            imageUrl: "/ImageStyle/pixelart.png", // Keeping existing path as placeholder
            isFree: true,
        },
    ];

    const onUserSelect = (item: ImageStyleData) => {
        setSelectedOption(item.label);
        userSelection({
            fieldId: "imageStyle",
            fieldValue: item.label,
        });
    };
    return (
        <div className="">
            <h3 className={`md:text-3xl font-black ${textColor}  uppercase tracking-wide mb-6 `}>
                4. Seleziona Stile
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {OptionList.map((item, index) => (
                    <div
                        key={index}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onUserSelect(item); }}
                        className={`relative group cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl rounded-2xl overflow-hidden border-2 ${selectedOption === item.label
                            ? "border-[#5b21b6] ring-2 ring-[#5b21b6] ring-offset-2 scale-105"
                            : "border-transparent hover:border-[#a78bfa] grayscale hover:grayscale-0"
                            }`}
                        onClick={() => onUserSelect(item)}
                    >
                        <div className="relative w-full aspect-[4/3]">
                            <Image
                                fill
                                alt={item.label}
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                src={item.imageUrl}
                            />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                            <h3 className="text-white text-xl font-bold text-center tracking-wider drop-shadow-md">
                                {item.label}
                            </h3>
                        </div>

                        {/* Selected Indicator Icon */}
                        {selectedOption === item.label && (
                            <div className="absolute top-4 right-4 bg-[#ec4899] text-white p-2 rounded-full shadow-lg animate-in fade-in zoom-in">
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5 13l4 4L19 7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}