import { useState, useRef, useEffect } from "react";
import Queue from '../components/Queue';

// 🎵 Main Music Player Component
export default function Home() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7); // default volume
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [search, setSearch] = useState("");

  const [optionsMenu, setOptionsMenu] = useState({ open: false, songId: null });
  const [queue, setQueue] = useState([]);
  const [isQueueOpen, setIsQueueOpen] = useState(false); // Queue visibility state
  const [showQueue, setShowQueue] = useState(false); // For the new queue button state

  const [songDurations, setSongDurations] = useState({});

  const songs = [
    { id: "1", title: "Aaj Ke Baad", artist: "Manan Bhardwaj & Tulsi Kumar", src: "/music/1.mp3", cover: "/music/covers/1.jpg" },
    { id: "2", title: "Closer", artist: "The Chainsmokers ft. Halsey", src: "/music/2.mp3", cover: "/music/covers/2.jpg" },
    { id: "3", title: "Dil Se Dil Tak", artist: "Laqshay Kapoor, Akashdeep Sengupta, Suvarna Tiwari", src: "/music/3.mp3", cover: "/music/covers/3.jpg" },
    { id: "4", title: "Jalebi", artist: "Tesher (feat. Jason Derulo remix)", src: "/music/4.mp3", cover: "/music/covers/4.jpeg" },
    { id: "5", title: "Janiye", artist: "Vishal Mishra ft. Rashmeet Kaur", src: "/music/5.mp3", cover: "/music/covers/5.jpg" },
    { id: "6", title: "Naina", artist: "Arijit Singh (composer: Pritam)", src: "/music/6.mp3", cover: "/music/covers/6.jpg" },
    { id: "7", title: "Pehle Bhi Main", artist: "Vishal Mishra", src: "/music/7.mp3", cover: "/music/covers/7.jpg" },
    { id: "8", title: "Love Story", artist: "Taylor Swift", src: "/music/8.mp3", cover: "/music/covers/8.png" },
    { id: "9", title: "Tum Kya Mile", artist: "Arijit Singh, Shreya Ghoshal", src: "/music/9.mp3", cover: "/music/covers/9.jpg" },
    { id: "10", title: "What Jhumka", artist: "Arijit Singh, Jonita Gandhi", src: "/music/10.mp3", cover: "/music/covers/10.jpg" },
    { id: "11", title: "Paaro", artist: "Aditya Rikhari, UNPLG'd", src: "/music/11.mp3", cover: "/music/covers/11.jpeg" },
    { id: "12", title: "Aavan Jaavan", artist: "Arijit Singh, Nikhita Gandhi", src: "/music/12.mp3", cover: "/music/covers/12.jpeg" },
    { id: "13", title: "Bheegi Saree", artist: "Adnan Sami, Shreya Ghoshal", src: "/music/13.mp3", cover: "/music/covers/13.jpeg" },
    { id: "14", title: "Pal Pal", artist: "AFusic (feat. AliSoomroMusic)", src: "/music/14.mp3", cover: "/music/covers/14.jpeg" },
    { id: "15", title: "Pardesiya", artist: "Sonu Nigam, Krishnakali Saha", src: "/music/15.mp3", cover: "/music/covers/15.jpeg" },
    { id: "16", title: "Saiyaara", artist: "Faheem Abdullah", src: "/music/16.mp3", cover: "/music/covers/16.jpeg" },
    { id: "17", title: "Thodi Si Daru", artist: "AP Dhillon, Shreya Ghoshal", src: "/music/17.mp3", cover: "/music/covers/17.jpeg" },
  ];

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(search.toLowerCase()) ||
    song.artist.toLowerCase().includes(search.toLowerCase())
  );

  // ▶️ Play a specific song
  const playSong = async (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    if (audioRef.current) {
      audioRef.current.src = song.src;
      audioRef.current.load();
      audioRef.current.play();
    }
  };

  // ⏯ Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // ⏩ Next Song
  const playNext = () => {
    if (!currentSong) return;
    if (shuffle) {
      playRandom();
      return;
    }
    let currentIndex = songs.findIndex(s => s.id === currentSong.id);
    currentIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[currentIndex]);
    setIsPlaying(true);
  };

  // ⏪ Previous Song
  const playPrev = () => {
    if (!currentSong) return;
    let currentIndex = songs.findIndex(s => s.id === currentSong.id);
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[currentIndex]);
    setIsPlaying(true);
  };

  // Shuffle logic
  const playRandom = () => {
    if (songs.length === 0) return;
    let idx = Math.floor(Math.random() * songs.length);
    setCurrentSong(songs[idx]);
    setIsPlaying(true);
  };

  // Update these functions
  const addToQueue = (song) => {
    if (!queue.some(s => s.id === song.id)) {
      setQueue(prevQueue => [...prevQueue, song]);
    }
    // Close the options menu
    setOptionsMenu({ open: false, songId: null });
  };

  const playNextSong = (song) => {
    if (!currentSong) {
      playSong(song);
      return;
    }

    setQueue(prevQueue => {
      const newQueue = [...prevQueue];
      const currentIndex = newQueue.findIndex(s => s.id === currentSong.id);
      
      if (currentIndex === -1) {
        newQueue.unshift(song);
      } else {
        newQueue.splice(currentIndex + 1, 0, song);
      }
      
      return newQueue;
    });

    setOptionsMenu({ open: false, songId: null });
  };

  // Add this function to handle queue completion
  const handleQueueEnd = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(prev => prev.slice(1));
      playSong(nextSong);
    }
  };

  // Update handleSongEnd to include queue
  const handleSongEnd = () => {
    if (repeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (queue.length > 0) {
      handleQueueEnd();
    } else {
      shuffle ? playRandom() : playNext();
    }
  };

  // 🔊 Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // ⏭ Seek within the song
  const handleSeek = (e) => {
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  // ⏱ Format time for display
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 🔄 Update audio source and play/pause state reliably
  // Effect 1: Handle song changes & play/pause
useEffect(() => {
  if (!audioRef.current) return;
  if (currentSong) {
    audioRef.current.src = currentSong.src;
    audioRef.current.load();
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }
}, [currentSong, isPlaying]);

// Effect 2: Handle only volume change
useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = volume;
  }
}, [volume]);


  // ⏲ Update currentTime and duration state from audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
    };
  }, [audioRef, currentSong]);

  // ⌨️ Keyboard and media keys support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "ArrowRight") {
        // Seek forward 5s
        if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, duration);
      }
      if (e.code === "ArrowLeft") {
        // Seek backward 5s
        if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
      }
      if (e.code === "MediaTrackNext") playNext();
      if (e.code === "MediaTrackPrevious") playPrev();
      if (e.code === "MediaPlayPause") togglePlay();
      if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // 📊 Play/pause when clicking progress bar
  const handleProgressClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  // Add this function to calculate duration
  const calculateDuration = (songId, audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.addEventListener('loadedmetadata', () => {
      setSongDurations(prev => ({
        ...prev,
        [songId]: audio.duration
      }));
    });
  };
const menuRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOptionsMenu({ open: false, songId: null });
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  // Add useEffect to calculate durations when component mounts
  useEffect(() => {
    songs.forEach(song => {
      calculateDuration(song.id, song.src);
    });
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.jpg" alt="Logo" />
        </div>
        <nav>
          {/* Remove heart button */}
        </nav>
        <div className="sidebar-playlists">
          {/* Playlist thumbnails - clickable */}
          {songs.slice(0, 8).map(song => (
            <img
              key={song.id}
              src={song.cover}
              alt={song.title}
              className="sidebar-thumb"
              style={{ cursor: "pointer" }}
              onClick={() => playSong(song)}
              title={song.title}
            />
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="playlist-header">
          <h2>Liked Songs</h2>
        </header>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Find in Liked Songs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="song-list">
          {filteredSongs.map((song) => (
            <div
              className={`song-row${currentSong && currentSong.id === song.id ? " playing" : ""}`}
              key={song.id}
              onClick={() => playSong(song)}
              tabIndex={0}
            >
              <img src={song.cover} className="song-thumb" alt={song.title} />
              <div className="song-meta">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
              <div className="song-extra">
                <span className="song-duration">
                  {formatTime(songDurations[song.id] || 0)}
                </span>

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
                    <div className="song-options-menu" ref={menuRef}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          playNextSong(song);
                        }}
                      >
                        <i className="fas fa-forward-step"></i> Play Next
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(song);
                        }}
                      >
                        <i className="fas fa-list"></i> Add to Queue
                      </button>
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
            <img src={currentSong.cover} alt={currentSong.title} className="np-thumb" />
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
            </div>

            <div className="np-progress-container">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={duration ? (currentTime / duration) * 100 : 0}
                onInput={handleSeek}
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
              onInput={handleVolumeChange}
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

      {/* Audio Element - Hidden */}
      <audio 
        ref={audioRef}
        onEnded={handleSongEnd}
        onError={(e) => console.error("Audio error:", e)}
      />

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
    </div>
  );
}