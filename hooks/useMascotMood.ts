import { useState, useCallback, useEffect } from 'react';

export type MascotMood = 'calm' | 'agitated';

export function useMascotMood() {
  const [mood, setMood] = useState<MascotMood>('calm');
  const [agitatedCount, setAgitatedCount] = useState(0);
  
  const updateMood = useCallback((newMood: MascotMood) => {
    setMood(newMood);
    if (newMood === 'agitated') {
      setAgitatedCount((prev) => prev + 1);
    } else {
      setAgitatedCount(0); // Reset on calm
    }
  }, []);

  // Auto-calm over time if idle
  useEffect(() => {
    if (mood === 'agitated') {
      const timer = setTimeout(() => {
        setMood('calm');
        setAgitatedCount(0);
      }, 10000); // Reset to calm after 10s of inactivity
      return () => clearTimeout(timer);
    }
  }, [mood]);

  return {
    mood,
    agitatedCount,
    updateMood
  };
}
