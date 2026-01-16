import { useState, useEffect } from 'react'
import { Flashcard } from './components/Flashcard'
import { FileUploader } from './components/FileUploader'
import { fetchWordDefinition } from './utils/dictionaryService'
import { calculateNextReview } from './utils/srs'
import type { Word, UserProgress } from './types/vocabulary'

function App() {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [wordsLearned, setWordsLearned] = useState(0);

  // Actually, let's just use state for the words list.
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we have saved words
    const stored = localStorage.getItem('english-app-words');
    if (stored) {
      setAllWords(JSON.parse(stored));
      setIsReady(true);
    }

    const storedProgress = localStorage.getItem('english-app-progress');
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
  }, []);

  useEffect(() => {
    if (isReady && allWords.length > 0 && !currentWord) {
      loadNextWord();
    }
  }, [allWords, isReady, currentWord]);

  // Save progress
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem('english-app-progress', JSON.stringify(progress));
      setWordsLearned(Object.keys(progress).length);
    }
  }, [progress]);

  const handleWordsLoaded = (words: Word[]) => {
    setAllWords(words);
    localStorage.setItem('english-app-words', JSON.stringify(words));
    setIsReady(true);
    // loadNextWord will trigger via effect
  };

  // Reset functionality (optional, for debugging)
  const handleReset = () => {
    if (confirm('¿Seguro que quieres borrar todo y subir nuevo archivo?')) {
      localStorage.removeItem('english-app-words');
      localStorage.removeItem('english-app-progress');
      setAllWords([]);
      setIsReady(false);
      setCurrentWord(null);
      setProgress({});
    }
  };

  const loadNextWord = async () => {
    if (allWords.length === 0) return;
    setIsLoading(true);

    // Strategy: Find words due for review or new words
    // Simple random for now from the loaded list
    const randomIndex = Math.floor(Math.random() * allWords.length);
    const baseWord = allWords[randomIndex];

    // We already have definition/translation from the file, so we might not need to fetch details
    // unless we want phonetics or extra examples.
    // Let's assume the file provided enough for now.

    // Optional: Fetch extra details if missing
    let details = {};
    if (!baseWord.phonetic) {
      const fetched = await fetchWordDefinition(baseWord.term);
      // Only use fetched if we don't conflict or if we want to enrich
      if (fetched) details = { ...fetched, definition: baseWord.definition, spanishTranslation: baseWord.spanishTranslation };
      // Keep our file's Spanish translation and definition structure!
    }

    setCurrentWord({
      ...baseWord,
      ...details
    });

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
      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-4xl mx-auto z-50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">10 000<span className="text-indigo-600">words</span></h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Custom Vocabulary</p>
        </div>
        <div className="flex items-center gap-4">
          {isReady && (
            <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-500 underline">Reset File</button>
          )}
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">{wordsLearned} learned</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-xl flex flex-col items-center gap-8 z-10">

        {!isReady ? (
          <FileUploader onWordsLoaded={handleWordsLoaded} />
        ) : (
          currentWord ? (
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
          )
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
