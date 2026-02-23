import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Queue from '../components/Queue';
import LoveButton from '../components/LoveButton';
import Visualizer from '../components/Visualizer';
import { songs } from "../data/songs";
import { usePlayer } from "../context/PlayerContext";

// 🎵 Main Music Player Component
export default function Home() {
  const {
    audioRef,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    playNext,
    playPrev,
    currentTime,
    duration,
    handleSeek,
    volume,
    handleVolumeChange,
    toggleLove,
    lovedSongs,
    queue,
    enqueue,
    insertNext
  } = usePlayer();

  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [search, setSearch] = useState("");

  const [optionsMenu, setOptionsMenu] = useState({ open: false, songId: null });
  const [isQueueOpen, setIsQueueOpen] = useState(false); // Queue visibility state
  const [showQueue, setShowQueue] = useState(false); // For the new queue button state

  const [songDurations, setSongDurations] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [playlistMenu, setPlaylistMenu] = useState({ open: false, songId: null });
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showLovedOnly, setShowLovedOnly] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);

  const reduceMotion = useReducedMotion();
  const menuRef = useRef(null); // used by outside-click handlers

  // small synthesized 'love' sound (no assets, lightweight)
  const playLoveSound = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = 650;
      g.gain.value = 0;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      o.start(now);
      o.stop(now + 0.28);
      setTimeout(() => { try { ctx.close(); } catch(e){} }, 500);
    } catch (e) {
      // ignore - fallback gracefully
      console.warn("sound failed", e);
    }
  };

  // call the PlayerContext toggleLove and play a small feedback sound
  const handleToggleLove = (songId) => {
    toggleLove(songId); // context method
    playLoveSound();
  };

  // Check URL param to play a specific song from other pages (e.g., library)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("play");
    if (id) {
      const s = songs.find(x => x.id === id);
      if (s) {
        playSong(s);
        // remove param
        params.delete("play");
        const base = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", base);
      }
    }
  }, []);

  // Filter by search AND loved / optional active playlist
  const filteredSongs = songs.filter(song => {
    const matchesSearch =
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist.toLowerCase().includes(search.toLowerCase());
    const matchesLoved = !showLovedOnly || lovedSongs.includes(song.id);
    // If a playlist is selected, show only tracks in that playlist
    if (typeof currentPlaylist === 'number' && playlists[currentPlaylist]) {
      return matchesSearch && matchesLoved && playlists[currentPlaylist].songs.includes(song.id);
    }
    return matchesSearch && matchesLoved;
  });

  // Queue is managed by PlayerContext: use enqueue (add to end) and insertNext (play next)

  // Small wrappers so existing UI callers keep working
  function addToQueue(song) {
    enqueue(song); // PlayerContext enqueue
    setOptionsMenu({ open: false, songId: null });
  }

  function playNextSong(song) {
    if (!currentSong) {
      playSong(song);
      setOptionsMenu({ open: false, songId: null });
      return;
    }
    insertNext(song); // PlayerContext insertNext -> plays after current
    setOptionsMenu({ open: false, songId: null });
  }

  // Create a new playlist and persist
  function createPlaylist(name) {
    if (typeof window === 'undefined') return;
    const p = localStorage.getItem('cutiefy-playlists') || '[]';
    const list = JSON.parse(p);
    list.push({ name, songs: [] });
    localStorage.setItem('cutiefy-playlists', JSON.stringify(list));
    setPlaylists(Array.isArray(list) ? list : []);
    return list.length - 1;
  }

  // Add a song to an existing playlist (persist and update state)
  function addSongToPlaylist(playlistIndex, songId) {
    if (typeof window === 'undefined') return;
    const p = localStorage.getItem('cutiefy-playlists') || '[]';
    const list = JSON.parse(p);
    const clone = JSON.parse(JSON.stringify(list));
    if (clone[playlistIndex] && !clone[playlistIndex].songs.includes(songId)) {
      clone[playlistIndex].songs.push(songId);
      localStorage.setItem('cutiefy-playlists', JSON.stringify(clone));
      setPlaylists(clone);
    }
    setOptionsMenu({ open: false, songId: null });
    setPlaylistMenu({ open: false, songId: null });
  }
  
  // open playlist dropdown inside options menu
  const openPlaylistMenu = (e, song) => {
    e.stopPropagation();
    setPlaylistMenu({ open: true, songId: song.id });
  };

  const handleCreatePlaylistAndAdd = (songId) => {
    if (!newPlaylistName.trim()) return;
    const idx = createPlaylist(newPlaylistName.trim());
    if (typeof idx === 'number') addSongToPlaylist(idx, songId);
    setNewPlaylistName('');
  };

  // load playlists on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const p = JSON.parse(localStorage.getItem('cutiefy-playlists') || '[]');
      setPlaylists(Array.isArray(p) ? p : []);
    } catch (e) {
      setPlaylists([]);
    }
  }, []);

  // Add: format seconds to M:SS for display (safe for SSR)
  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Close options/playlist menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOptionsMenu({ open: false, songId: null });
        setPlaylistMenu({ open: false, songId: null });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  // Seeking / volume are handled by PlayerContext; use handleSeek(percent) and handleVolumeChange(value)

  return (
    <div className={`app-layout`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.jpg" alt="Logo" />
        </div>
        <nav className="sidebar-nav" aria-label="Primary">
          <Link href="/library" className="sidebar-item" title="Library">
            <span className="sidebar-item-icon">📚</span>
            <span className="sidebar-item-label">Library</span>
          </Link>

          <div className="sidebar-playlist-section" aria-label="Playlists">
            <div className="sidebar-playlist-header">Playlists</div>
            <div className="sidebar-playlist-list">
              {playlists.length === 0 && <div className="muted" style={{ padding: '6px 0' }}>No playlists</div>}
              {playlists.map((pl, idx) => {
                const coverSong = songs.find(s => pl.songs.includes(s.id));
                const cover = coverSong ? coverSong.cover : '/logo.jpg';
                return (
                  <button
                    key={idx}
                    className={`sidebar-playlist-item ${currentPlaylist === idx ? 'active' : ''}`}
                    onClick={() => { setCurrentPlaylist(idx); setShowLovedOnly(false); }}
                  >
                    <img src={cover} alt="" className="sidebar-playlist-cover" />
                    <span className="sidebar-item-label">{pl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="playlist-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Your Collection</h2>
           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className={`view-toggle-btn ${showLovedOnly ? 'active' : ''} top-action`}
              onClick={() => setShowLovedOnly(p => !p)}
              title={showLovedOnly ? 'Showing loved only' : 'Show loved only'}
            >
              <i className={showLovedOnly ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
            </button>
           </div>
         </header>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Find in Songs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="song-list">
          {filteredSongs.map((song) => (
            <div
              className={`song-row${currentSong && currentSong.id === song.id ? " playing" : ""}${lovedSongs.includes(song.id) ? " loved-row" : ""}`}
              key={song.id}
              onClick={() => playSong(song)}
              tabIndex={0}
            >
              <img src={song.cover} className="song-thumb" alt={song.title} />
              <div className="song-meta">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="song-title">{song.title}</div>
                </div>
                <div className="song-artist">{song.artist}</div>
              </div>
              <div className="song-extra">
                <span className="song-duration">
                  {formatTime(songDurations[song.id] || 0)}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <LoveButton songId={song.id} isLoved={lovedSongs.includes(song.id)} onToggle={(id) => handleToggleLove(id)} onSound={playLoveSound} />
                </div>

                <div className="song-options-wrapper">
                  <button
                    className="song-options"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOptionsMenu({ open: true, songId: song.id });
                    }}
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>

                  {optionsMenu.open && optionsMenu.songId === song.id && (
                    <div className="song-options-menu" ref={menuRef} role="menu" aria-label="Song options">
                      <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); insertNext(song); setOptionsMenu({ open: false, songId: null }); }}
                      >
                        ▶ Play Next
                      </button>
                      <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); enqueue(song); setOptionsMenu({ open: false, songId: null }); }}
                      >
                        ＋ Add to Queue
                      </button>

                      {/* Add to Playlist dropdown */}
                      <div className="playlist-section">
                        <button
                          role="menuitem"
                          onClick={(e) => openPlaylistMenu(e, song)}
                          aria-expanded={playlistMenu.open && playlistMenu.songId === song.id}
                        >
                          ♡ Add to Playlist
                        </button>

                        {playlistMenu.open && playlistMenu.songId === song.id && (
                          <div className="playlist-dropdown" role="menu">
                            {playlists.length === 0 && <div className="muted">No playlists yet</div>}
                            {playlists.map((pl, idx) => (
                              <div
                                key={idx}
                                className="playlist-item"
                                onClick={(e) => { e.stopPropagation(); addSongToPlaylist(idx, song.id); }}
                                role="menuitem"
                              >
                                {pl.name}
                              </div>
                            ))}

                            <div className="new-playlist-row">
                              <input
                                placeholder="New playlist name"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                aria-label="New playlist name"
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCreatePlaylistAndAdd(song.id); }}
                              >
                                Create
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                 </div>
               </div>
             </div>
           ))}
        </div>
      </main>

      {/* Now Playing Bar */}
      {currentSong && (
        <div className="now-playing">
          <div className="now-playing-info">
            <div className={`np-thumb-wrapper ${isPlaying ? 'playing' : ''}`}>
              <motion.img
                src={currentSong.cover}
                alt={currentSong.title}
                className="np-thumb"
                animate={(!reduceMotion && isPlaying) ? { rotate: 360 } : { rotate: 0 }}
                transition={(!reduceMotion && isPlaying) ? { repeat: Infinity, duration: 20, ease: 'linear' } : { duration: 0 }}
                whileHover={reduceMotion ? {} : { scale: 1.04 }}
                style={{ transformOrigin: '50% 50%' }}
                draggable={false}
              />
            </div>
            <div className="np-meta">
              <div className="np-title">{currentSong.title}</div>
              <div className="np-artist">{currentSong.artist}</div>
            </div>
          </div>

          <div className="player-controls-container">
            <div className="now-playing-controls">
              <button
                className={shuffle ? "active" : ""}
                onClick={() => setShuffle(!shuffle)}
                title="Shuffle"
              >
                <i className="fa-solid fa-shuffle"></i>
              </button>
              <button onClick={playPrev} title="Previous">
                <i className="fa-solid fa-backward-step"></i>
              </button>
              <button 
                onClick={togglePlay} 
                title={isPlaying ? "Pause" : "Play"}
                className="play-button-main"
              >
                <i className={isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play"}></i>
              </button>
              <button onClick={playNext} title="Next">
                <i className="fa-solid fa-forward-step"></i>
              </button>
              <button
                className={repeat ? "active" : ""}
                onClick={() => setRepeat(!repeat)}
                title="Repeat"
              >
                <i className="fa-solid fa-repeat"></i>
              </button>
              <button
                className={showVisualizer ? "active" : ""}
                onClick={() => setShowVisualizer(v => !v)}
                title={showVisualizer ? "Hide visualizer" : "Show visualizer"}
              >
                <i className="fa-solid fa-chart-simple"></i>
              </button>
            </div>
 
           {/* visualizer (subtle) */}
           <Visualizer audioRef={audioRef} isPlaying={isPlaying} show={showVisualizer} />

            <div className="np-progress-container">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={duration ? (currentTime / duration) * 100 : 0}
                onInput={(e) => handleSeek(parseFloat(e.target.value))}
                className="np-progress"
              />
              <span className="np-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="volume-queue-controls">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onInput={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="np-volume"
            />
            <button 
              className={`queue-button ${showQueue ? 'active' : ''}`} 
              onClick={() => setShowQueue(prev => !prev)} 
              title="Show Queue"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      )}

      {/* Audio element is managed globally by PlayerProvider via PlayerBar */}

      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Queue Component - Conditional Rendering */}
      {showQueue && (
        <Queue
          queue={queue}
          currentSong={currentSong}
          onSongClick={playSong}
          onClose={() => setShowQueue(false)}
        />
      )}

      {/* Styles moved to src/styles/globals.css — sidebar/layout styles are now centralized */}
    </div>
  );
}