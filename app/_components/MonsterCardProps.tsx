import React from 'react';

export interface Monster {
    id: string;
    name: string;
    emoji: string;
    color: string;
    personality: string;
}

export interface MonsterCardProps {
    monster: Monster;
    isSelected: boolean;
    onSelect: (monster: Monster) => void;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({ monster, isSelected, onSelect }) => {
    return (
        <button
            onClick={() => onSelect(monster)}
            className={`relative group flex flex-col items-center justify-center w-full aspect-square rounded-[2.5rem] transition-all duration-300 ${isSelected
                ? 'bg-white border-[4px] border-black shadow-2xl scale-105 z-10'
                : 'bg-[#f0f5ff] border-[4px] border-transparent hover:bg-[#e6eeff] hover:scale-[1.02]'
                }`}
        >
            <div className={`text-6xl md:text-7xl mb-3 transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                {monster.emoji}
            </div>
            <span className={`text-xs md:text-sm font-black uppercase tracking-wider transition-colors ${isSelected ? 'text-[#ff0080]' : 'text-[#a1b3d5]'}`}>
                {monster.name}
            </span>

            {isSelected && (
                <div className="absolute -top-2 -right-2 bg-[#ff4d4d] border-[3px] border-white text-white rounded-full w-9 h-9 flex items-center justify-center text-sm font-black shadow-lg">
                    ✓
                </div>
            )}
        </button>
    );
};