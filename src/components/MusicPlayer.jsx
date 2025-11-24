import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(() => {
    const savedPreference = localStorage.getItem('musicPlaying');
    return savedPreference === 'true';
  });
  
  // Someday - Jonny Easton (Classical Wedding Music from Uppbeat)
  const audioRef = useRef(new Audio('/music/someday.mp3'));

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = true;

    // Auto-play if preference is set
    if (isPlaying) {
      audio.play().catch(error => console.log("Autoplay prevented:", error));
    }

    return () => {
      audio.pause();
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      localStorage.setItem('musicPlaying', 'false');
    } else {
      audioRef.current.play();
      localStorage.setItem('musicPlaying', 'true');
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={togglePlay}
        className="bg-gold text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 hover:scale-110 active:scale-90 transition-all flex items-center justify-center w-12 h-12"
        aria-label={isPlaying ? "Pausar música" : "Tocar música"}
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
