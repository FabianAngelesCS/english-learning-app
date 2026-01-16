import mammoth from 'mammoth';
import type { Word } from '../types/vocabulary';
import { v4 as uuidv4 } from 'uuid';

export const parseDocxWords = async (file: File): Promise<Word[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                if (!arrayBuffer) {
                    reject(new Error("Failed to read file"));
                    return;
                }

                const result = await mammoth.convertToHtml({ arrayBuffer });
                const html = result.value;

                // Simple HTML table parsing
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const rows = Array.from(doc.querySelectorAll('tr'));

                const words: Word[] = [];

                // Assuming row 0 is header, start from 1
                // Robustness check: find index of headers
                let englishIndex = 0;
                let spanishIndex = 1;

                // Try to find headers
                if (rows.length > 0) {
                    const headerCells = Array.from(rows[0].querySelectorAll('td, th')).map(c => c.textContent?.toLowerCase().trim());
                    const eIndex = headerCells.findIndex(h => h?.includes('english') || h?.includes('ingles'));
                    const sIndex = headerCells.findIndex(h => h?.includes('español') || h?.includes('spanish'));

                    if (eIndex !== -1) englishIndex = eIndex;
                    if (sIndex !== -1) spanishIndex = sIndex;
                }

                // Process rows (skip header if we definitely found one, otherwise process all and maybe skip first if it looks like a header)
                // For simplicity, let's skip the first row usually.
                for (let i = 1; i < rows.length; i++) {
                    const cells = rows[i].querySelectorAll('td');
                    if (cells.length < 2) continue;

                    const term = cells[englishIndex]?.textContent?.trim();
                    const definition = cells[spanishIndex]?.textContent?.trim();

                    if (term && definition) {
                        words.push({
                            id: uuidv4(),
                            term,
                            definition,
                            spanishTranslation: definition, // Using Spanish column as "definition" locally or usually we map it to translation?
                            example: '',
                            level: 'A1',
                            tags: ['imported']
                        });
                    }
                }

                resolve(words);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
