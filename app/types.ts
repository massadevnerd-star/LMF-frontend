export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    coverUrl: string;
    duration: string;
    description?: string;
}

export interface Playlist {
    id: string;
    title: string;
    description: string;
    coverUrl: string;
    owner: string;
}

export interface MagicCharacter {
    id: string;
    name: string;
    seed: string;
    isColorized: boolean;
}

export interface ChildProfile {
    id: number;
    user_id: number;
    nickname: string;
    birthdate: string;
    type: 'Adulto' | 'Figlio' | 'Figlia';
    avatar?: string;
}

export type ViewType = 'home' | 'search' | 'library' | 'ai-discovery' | 'my-stories' | 'details' | 'gadgets' | 'atelier' | 'laboratorio' | 'parents-area' | 'profile-selection' | 'user-profile';

export interface Story {
    id: number;
    title: string;
    output: any; // Contains the JSON structure with coverImage, etc.
    created_at: string;
    cover_image?: string;
    story_subject?: string;
    children?: ChildProfile[]; // The full objects from API
}

export interface Draft {
    id: number;
    formData: any;
    updatedAt: string;
    userId: number;
    slides: any[];
}