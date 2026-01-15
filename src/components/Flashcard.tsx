import React, { useState } from 'react';
import type { Word } from '../types/vocabulary';

interface FlashcardProps {
    word: Word;
    onRate: (rating: 1 | 2 | 3 | 4) => void;
    isLoading?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({ word, onRate, isLoading }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const handleFlip = () => setIsFlipped(!isFlipped);

    // Reset flip when word changes
    React.useEffect(() => {
        setIsFlipped(false);
    }, [word.id]);

    if (isLoading) {
        return (
            <div className="w-full max-w-md h-80 bg-gray-100 rounded-3xl animate-pulse shadow-xl mx-auto" />
        );
    }

    return (
        <div className="perspective-1000 w-full max-w-md mx-auto h-96 cursor-pointer group" onClick={handleFlip}>
            <div className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>


                {/* FRONT */}
                <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 border border-gray-100 dark:border-gray-700">
                    <span className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4 font-semibold">Word</span>
                    <h2 className="text-5xl font-bold text-gray-800 dark:text-white mb-2">{word.term}</h2>
                    {word.phonetic && <p className="text-xl text-indigo-500 font-mono mb-8">{word.phonetic}</p>}

                    <div className="w-full grid grid-cols-2 gap-4 mt-auto mb-4" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFlipped(true); // Show details
                            }}
                            className="py-3 px-4 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <span>🤔</span> No la sé
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRate(4); // "Know it" -> Mark easy & Next
                            }}
                            className="py-3 px-4 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <span>⚡</span> Ya me la sé
                        </button>
                    </div>
                </div>

                {/* BACK */}
                <div className={`absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8`}>
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <h3 className="text-3xl font-bold">{word.term}</h3>
                        <div className="w-16 h-1 bg-white/30 rounded-full" />

                        {/* Primary Meaning (Spanish) */}
                        {word.spanishTranslation ? (
                            <div className="text-center animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Significado</p>
                                <p className="text-3xl font-extrabold text-yellow-300">{word.spanishTranslation}</p>
                            </div>
                        ) : (
                            <p className="text-lg leading-relaxed font-medium px-4 opacity-90">{word.definition}</p>
                        )}

                        {/* Secondary Info (English Definition) */}
                        <div className="bg-black/20 rounded-xl p-4 w-full text-sm backdrop-blur-sm mt-2">
                            <p className="opacity-70 mb-1 text-xs uppercase font-semibold">In English:</p>
                            <p className="italic leading-relaxed opacity-90">"{word.definition}"</p>
                        </div>

                        {word.example && (
                            <div className="mt-2 text-xs opacity-75">
                                <span className="font-bold">Ej: </span>"{word.example}"
                            </div>
                        )}
                    </div>

                    <div className="w-full mt-6" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onRate(1)} // Confirm review after failing
                            className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <span>👍</span> Entendido, Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
