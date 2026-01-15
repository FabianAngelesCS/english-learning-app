import { useState, useEffect } from 'react'
import { Flashcard } from './components/Flashcard'
import { getWordsBatch } from './utils/wordLoader'
import { calculateNextReview } from './utils/srs'
import { fetchWordDefinition } from './utils/dictionaryService'
import type { Word, UserProgress } from './types/vocabulary'

function App() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [wordsLearned, setWordsLearned] = useState(0);

  // Load progress from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('english-app-progress');
    if (stored) {
      const parsed = JSON.parse(stored);
      setProgress(parsed);
      setWordsLearned(Object.keys(parsed).length);
    }
    loadNextWord();
  }, []);

  // Save progress
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem('english-app-progress', JSON.stringify(progress));
      setWordsLearned(Object.keys(progress).length);
    }
  }, [progress]);

  const loadNextWord = async () => {
    setIsLoading(true);
    // Simple strategy: Pick a new word that isn't in progress
    // In a real app, we'd also check for "due" reviews

    // For MVP: random offset or sequential
    const offset = Math.floor(Math.random() * 100); // Grab from top 100 for now
    const candidates = getWordsBatch(offset, 1);

    if (candidates.length > 0) {
      const baseWord = candidates[0];
      // Fetch details
      const details = await fetchWordDefinition(baseWord.term);

      setCurrentWord({
        ...baseWord,
        ...details
      });
    }
    setIsLoading(false);
  };

  const handleRate = (rating: 1 | 2 | 3 | 4) => {
    if (!currentWord) return;

    const previousProgress = progress[currentWord.term];
    const newProgress = calculateNextReview(previousProgress, rating);

    setProgress(prev => ({
      ...prev,
      [currentWord.term]: newProgress
    }));

    // Next word
    loadNextWord();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-gray-800 dark:text-gray-100">

      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Antigravity<span className="text-indigo-600">English</span></h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">10,000 Words Challenge</p>
        </div>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium">{wordsLearned} learned</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-xl flex flex-col items-center gap-8 z-10">

        {currentWord ? (
          <Flashcard
            word={currentWord}
            onRate={handleRate}
            isLoading={isLoading}
          />
        ) : (
          <div className="text-center p-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your session...</p>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-gray-400 text-xs text-center">
        <p>Space Repetition System • Powered by Free Dictionary API</p>
      </footer>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30 mix-blend-multiply"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-30 mix-blend-multiply"></div>
      </div>
    </div>
  )
}

export default App
