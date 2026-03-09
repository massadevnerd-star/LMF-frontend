'use client'

import React from 'react'
import { useState } from 'react';
import Image from 'next/image';


export interface StoryTypeData {
    label: string;
    imageUrl: string;
    isFree: boolean;
}

function StoryType({ userSelection, isDarkMode }: any) {

    const [selectedOption, setSelectedOption] = useState<string>("");
    const bgColor = isDarkMode ? 'bg-[#1a1c31]' : 'bg-white border-2 border-orange-50';
    const textColor = isDarkMode ? 'text-indigo-200' : 'text-[#5b21b6]';

    const OptionList: StoryTypeData[] = [
        {
            label: "Libro di Storie",
            imageUrl: "/StoryType/storybook.png",
            isFree: true,
        },
        {
            label: "Storia della Buonanotte",
            imageUrl: "/StoryType/badstory.png", // Fixed typo from 'badstory'
            isFree: true,
        },
        {
            label: "Storia Educative",
            imageUrl: "/StoryType/educational_no.png",
            isFree: true,
        },
    ];

    const onUserSelect = (item: StoryTypeData) => {
        setSelectedOption(item.label);
        userSelection({
            fieldId: "storyType",
            fieldValue: item.label,
        });
    };

    return (
        <div className="">

            {/*<h3 className="font-black text-3xl sm:text-4xl text-[#5b21b6] mb-6 block uppercase tracking-wide">
                2. Scegli il Tipo di Storia
            </h3>*/}
            <h3 className={`md:text-3xl font-black ${textColor}  uppercase tracking-wide mb-6 `}>
                2. Scegli il Tipo di Storia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {OptionList.map((item, index) => (
                    <div
                        key={index}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onUserSelect(item); }}
                        className={`relative group cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl rounded-3xl overflow-hidden border-4 ${selectedOption === item.label
                            ? "border-[#ec4899] shadow-2xl scale-105"
                            : "border-transparent hover:border-[#a78bfa] grayscale hover:grayscale-0"
                            }`}
                        onClick={() => onUserSelect(item)}
                    >
                        <div className="relative w-full aspect-[3/4]">
                            {" "}
                            {/* Portrait aspect ratio */}
                            {/* Placeholder generic image if source fails, but assuming Next.js Image logic */}
                            <Image
                                fill
                                alt={item.label}
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                src={item.imageUrl}
                            />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                            <h3 className="text-white text-2xl font-bold text-center tracking-wider drop-shadow-md">
                                {item.label}
                            </h3>
                            {/* Optional: Free tag */}
                            {/* <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
                                {item.isFree ? 'FREE' : 'PAID'}
                            </span> */}
                        </div>

                        {/* Selected Indicator Icon (Optional but helpful checkmark) */}
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

export default StoryType