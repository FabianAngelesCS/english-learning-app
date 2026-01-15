import type { Word } from "../types/vocabulary";

const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

interface DictionaryApiResponse {
    word: string;
    phonetic?: string;
    phonetics: Array<{ text?: string; audio?: string }>;
    meanings: Array<{
        partOfSpeech: string;
        definitions: Array<{
            definition: string;
            example?: string;
        }>;
    }>;
}

export const fetchWordDefinition = async (term: string): Promise<Partial<Word> | null> => {
    try {
        const res = await fetch(`${API_URL}/${term}`);
        if (!res.ok) return null;

        const data: DictionaryApiResponse[] = await res.json();
        const entry = data[0];

        if (!entry) return null;

        const firstMeaning = entry.meanings[0];
        const firstDef = firstMeaning?.definitions[0];

        // Fetch Spanish translation (Best effort)
        let spanishTranslation = '';
        try {
            const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${term}&langpair=en|es`);
            const transData = await transRes.json();
            spanishTranslation = transData.responseData?.translatedText || '';
        } catch (e) {
            console.warn('Translation failed', e);
        }

        return {
            definition: firstDef?.definition || 'No definition found',
            example: firstDef?.example || '',
            phonetic: entry.phonetic || entry.phonetics.find(p => p.text)?.text,
            spanishTranslation
        };
    } catch (error) {
        console.error(`Error fetching definition for ${term}:`, error);
        return null;
    }
};
