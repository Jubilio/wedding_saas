import React, { useState, useEffect, useRef } from 'react';
import { useEvent } from '../contexts/EventContext';

const MusicPlayer = () => {
  const { eventData } = useEvent();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Determine the source URL (Database URL or fallback)
    const musicUrl = eventData?.music_url || '/music/someday.mp3';
    
    // Instantiate audio object only once on mount or when URL changes
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audioRef.current = audio;

    console.log("🎵 Music Player loading source:", musicUrl);

    // Check saved preference
    const savedPreference = localStorage.getItem('musicPlaying');
    
    // Attempt play if strictly true
    if (savedPreference === 'true') {
        const play = () => {
            if (!audioRef.current) return;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        // Once playing, we can remove the global listener
                        window.removeEventListener('click', play);
                        window.removeEventListener('touchstart', play);
                    })
                    .catch(() => {
                        console.log("Autoplay still waiting for interaction...");
                        setIsPlaying(false);
                    });
            }
        };

        // 1. Try immediately (might work if user interacted before mount)
        play();

        // 2. Add global listeners to "unlock" audio on first interaction
        window.addEventListener('click', play);
        window.addEventListener('touchstart', play);

        const timeout = setTimeout(play, 300);
        
        return () => {
          window.removeEventListener('click', play);
          window.removeEventListener('touchstart', play);
          clearTimeout(timeout);
          if (audio) audio.pause();
          audioRef.current = null;
        };
    }

    // Cleanup
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [eventData?.music_url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      localStorage.setItem('musicPlaying', 'false');
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise
            .then(() => {
                localStorage.setItem('musicPlaying', 'true');
                setIsPlaying(true);
            })
            .catch(error => {
                console.error("Playback failed:", error);
                setIsPlaying(false);
            });
      }
    }
  };

  return (
    <div className="fixed md:bottom-4 bottom-20 right-4 z-40">
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
