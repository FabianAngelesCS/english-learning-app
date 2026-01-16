export interface Word {
    id: string;
    term: string;
    definition: string;
    example: string;
    phonetic?: string;
    audio?: string;
    spanishTranslation?: string; // Optional Spanish hint
    level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    tags?: string[];
}

export interface ReviewLog {
    timestamp: number;
    rating: 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
}

export interface UserProgress {
    wordId: string;
    nextReview: number; // Timestamp
    interval: number;   // Days
    easeFactor: number;
    streak: number;
    history: ReviewLog[];
}

export interface VocabularyState {
    words: Word[];
    progress: Record<string, UserProgress>;
}
