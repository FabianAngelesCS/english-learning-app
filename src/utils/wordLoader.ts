import rawWordList from '../data/words.txt?raw';
import type { Word } from '../types/vocabulary';

let cachedWords: string[] | null = null;

export const getFullWordList = (): string[] => {
    if (cachedWords) return cachedWords;
    cachedWords = rawWordList.split('\n').filter(w => w.trim().length > 0);
    return cachedWords;
};

export const getWordsBatch = (offset: number, limit: number): Word[] => {
    const allWords = getFullWordList();
    const slice = allWords.slice(offset, offset + limit);

    return slice.map((term, index) => ({
        id: term, // Use term as ID for simplicity or generate UUID
        term,
        definition: 'Loading...', // To be fetched
        example: '', // To be fetched
        level: 'A1', // Placeholder
        tags: ['common']
    }));
};
