import React, { useState, useRef } from 'react';
import type { Word } from '../types/vocabulary';
import { parseDocxWords } from '../utils/fileParser';

interface FileUploaderProps {
    onWordsLoaded: (words: Word[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onWordsLoaded }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const processFiles = async (files: FileList | File[]) => {
        setError(null);
        setIsProcessing(true);

        const allWords: Word[] = [];
        const validFiles = Array.from(files).filter(f => f.name.endsWith('.docx'));

        if (validFiles.length === 0) {
            setError('Por favor sube archivos Word (.docx)');
            setIsProcessing(false);
            return;
        }

        try {
            for (const file of validFiles) {
                const words = await parseDocxWords(file);
                allWords.push(...words);
            }

            if (allWords.length === 0) {
                setError('No se encontraron palabras en los archivos. Asegúrate de que tengan tablas.');
            } else {
                onWordsLoaded(allWords);
            }
        } catch (err) {
            console.error(err);
            setError('Error procesando archivos. Intenta de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4">
            <div
                className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer bg-white dark:bg-gray-800
            ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-105' : 'border-gray-300 dark:border-gray-700'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".docx"
                    multiple
                    onChange={handleFileSelect}
                />

                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-4xl">
                        📄
                    </div>

                    {isProcessing ? (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Procesando archivo...</h3>
                            <p className="text-gray-500">Esto tomará solo un momento.</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Carga tus listas de palabras</h3>
                            <p className="text-gray-500 text-sm mb-6">Arrastra tus archivos .docx aquí o haz click para buscarlos.</p>
                            <p className="text-xs text-indigo-500 font-mono bg-indigo-50 dark:bg-indigo-900/30 py-2 px-4 rounded-lg inline-block">
                                Formato: Tablas (Inglés | Español)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-xl text-center font-medium animate-bounce">
                    {error}
                </div>
            )}
        </div>
    );
};
