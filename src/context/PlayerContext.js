import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { songs } from "../data/songs";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(typeof window !== "undefined" ? new Audio() : null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [lovedSongs, setLovedSongs] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ls = localStorage.getItem("cutiefy-loved");
    if (ls) setLovedSongs(JSON.parse(ls));
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cutiefy-loved", JSON.stringify(lovedSongs));
  }, [lovedSongs]);

  // Audio event wiring
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (repeat) {
        a.currentTime = 0;
        a.play();
        return;
      }
      if (queue.length > 0) {
        const [next, ...rest] = queue;
        setQueue(rest);
        playSong(next);
        return;
      }
      if (shuffle) {
        const idx = Math.floor(Math.random() * songs.length);
        playSong(songs[idx]);
        return;
      }
      // fallback next
      const idx = songs.findIndex(s => s.id === currentSong?.id);
      if (idx !== -1 && idx < songs.length - 1) {
        playSong(songs[idx + 1]);
      } else {
        setIsPlaying(false);
      }
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.volume = volume;

    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, repeat, shuffle, volume, currentSong]);

  const playSong = async (song) => {
    if (!audioRef.current) return;
    try {
      setCurrentSong(song);
      audioRef.current.src = song.src;
      audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn("Playback prevented:", e);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  const playNext = () => {
    if (!currentSong) return;
    if (shuffle) {
      const idx = Math.floor(Math.random() * songs.length);
      playSong(songs[idx]);
      return;
    }
    const idx = songs.findIndex(s => s.id === currentSong.id);
    playSong(songs[(idx + 1) % songs.length]);
  };

  const playPrev = () => {
    if (!currentSong) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    playSong(songs[(idx - 1 + songs.length) % songs.length]);
  };

  const addToQueue = (song) => setQueue(prev => [...prev, song]);
  const insertNext = (song) => setQueue(prev => [song, ...prev]);
  const enqueue = (song) => addToQueue(song);

  const handleSeek = (percent) => {
    if (!audioRef.current || !duration) return;
    const t = (percent / 100) * duration;
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolumeChange = (v) => {
    if (!audioRef.current) return;
    setVolume(v);
    audioRef.current.volume = v;
  };

  const toggleLove = (id) => {
    setLovedSongs(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      // Persist immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('cutiefy-loved', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <PlayerContext.Provider value={{
      audioRef,
      currentSong,
      isPlaying,
      currentTime,
      duration,
      volume,
      queue,
      playSong,
      togglePlay,
      playNext,
      playPrev,
      addToQueue,
      insertNext,
      enqueue,
      handleSeek,
      handleVolumeChange,
      shuffle, setShuffle,
      repeat, setRepeat,
      lovedSongs, toggleLove
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
