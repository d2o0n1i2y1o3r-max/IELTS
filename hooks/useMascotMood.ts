import { useState, useCallback, useEffect } from 'react';

export type MascotMood = 'calm' | 'angry';

export function useMascotMood(threshold = 3) {
  const [angerLevel, setAngerLevel] = useState(0);

  const handleCorrectAnswer = useCallback(() => {
    setAngerLevel((prev) => Math.max(0, prev - 1));
  }, []);

  const handleIncorrectAnswer = useCallback(() => {
    setAngerLevel((prev) => prev + 1);
  }, []);

  const resetMood = useCallback(() => {
    setAngerLevel(0);
  }, []);

  useEffect(() => {
    if (angerLevel > 0) {
      const timer = setTimeout(() => {
        setAngerLevel((prev) => Math.max(0, prev - 1));
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [angerLevel]);

  const mood: MascotMood = angerLevel >= threshold ? 'angry' : 'calm';

  return {
    mood,
    angerLevel,
    handleCorrectAnswer,
    handleIncorrectAnswer,
    resetMood
  };
}
