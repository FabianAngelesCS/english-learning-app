import type { UserProgress } from '../types/vocabulary';

// Ratings:
// 1: Again (Complete blackout, reset)
// 2: Hard (Correct but difficult)
// 3: Good (Check successful)
// 4: Easy (Perfect memory)

export const calculateNextReview = (
    currentProgress: UserProgress | undefined,
    rating: 1 | 2 | 3 | 4
): UserProgress => {
    const now = Date.now();

    // Default values for new words
    if (!currentProgress) {
        return {
            wordId: '', // Should be set by caller
            nextReview: now + (rating === 1 ? 0 : 1) * 24 * 60 * 60 * 1000,
            interval: rating === 1 ? 0 : 1,
            easeFactor: 2.5,
            streak: rating === 1 ? 0 : 1,
            history: [{ timestamp: now, rating }]
        };
    }

    let { interval, easeFactor, streak } = currentProgress;

    if (rating === 1) {
        // Forgot the word
        streak = 0;
        interval = 1; // Reset to 1 day (or very short)
        // Ease factor slightly decreased or kept same? 
        // SM-2 says EF remains unchanged or decreased. Let's decrease slightly to penalize frequent fails.
        easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else {
        // Correct
        streak += 1;

        // Update Ease Factor
        // SM-2 formula: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
        // Our map: 1=Again(q=0-2), 2=Hard(3), 3=Good(4), 4=Easy(5)
        // Simplified heuristic:
        if (rating === 2) { // Hard
            easeFactor = Math.max(1.3, easeFactor - 0.15);
            interval = interval * 1.2; // Growing slowly
        } else if (rating === 3) { // Good
            interval = interval * easeFactor;
        } else if (rating === 4) { // Easy
            easeFactor += 0.15;
            interval = interval * easeFactor * 1.3; // Bonus
        }
    }

    return {
        ...currentProgress,
        nextReview: now + interval * 24 * 60 * 60 * 1000,
        interval,
        easeFactor,
        streak,
        history: [...currentProgress.history, { timestamp: now, rating }]
    };
};
