'use client'

import React from "react";
import { Textarea } from "@/components/ui/textarea"


function StorySubjectInput({ userSelection, isDarkMode }: any) {
    const bgColor = isDarkMode ? 'bg-[#1a1c31]' : 'bg-white border-2 border-orange-50';
    const textColor = isDarkMode ? 'text-indigo-200' : 'text-[#5b21b6]';
    return (
        <div className="w-full">
            <h3 className={`md:text-3xl font-black ${textColor}  uppercase tracking-wide mb-6 `}>

                1. Soggetto della storia
            </h3>
            <div className={`bg-[#f4f4f5] hover:bg-gray-100 focus-within:bg-white transition-colors duration-200 shadow-sm rounded-3xl p-6 border border-transparent focus-within:border-gray-200 h-full ${bgColor}`}>
                <Textarea
                    className="text-xl lg:text-2xl text-gray-700 placeholder:text-gray-400 font-medium h-full min-h-[200px] border-none shadow-none focus-visible:ring-0 resize-none bg-transparent p-0"
                    id="story-subject"
                    placeholder="Scrivi qui il soggetto della storia che vuoi generare..."
                    onChange={(e) =>
                        userSelection({
                            fieldValue: e.target.value,
                            fieldId: "storySubject",
                        })
                    }
                />
            </div>
        </div>
    )
}

export default StorySubjectInput