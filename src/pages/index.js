import { useState, useRef, useEffect } from "react";

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
  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
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

  // Repeat/loop logic
  const handleSongEnd = () => {
    if (repeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
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
  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
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
        <div className="search-bar">
          <input
            type="text"
            placeholder="Find in Liked Songs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <header className="playlist-header">
          <h2>Liked Songs</h2>
        </header>
        <div className="song-list">
          {filteredSongs.map((song) => (
            <div
              className={`song-row${currentSong && currentSong.id === song.id ? " playing" : ""}`}
              key={song.id}
              onClick={() => playSong(song)}
              tabIndex={0}
            >
              <img src={song.cover} alt={song.title} className="song-thumb" />
              <div className="song-meta">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
              <div className="song-extra">
                <span className="song-duration">{formatTime(song.duration || 210)}</span>
                <button className="song-options" tabIndex={-1}>
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Now Playing Bar */}
      <footer className="now-playing-bar">
        {currentSong && (
          <>
            <img src={currentSong.cover} alt={currentSong.title} className="np-thumb" />
            <div className="np-meta">
              <div className="np-title">{currentSong.title}</div>
              <div className="np-artist">{currentSong.artist}</div>
            </div>
            <div className="np-controls">
              {/* Shuffle */}
              <button
                className={shuffle ? "active" : ""}
                onClick={() => setShuffle(!shuffle)}
                title="Shuffle"
              >
                <i className="fa-solid fa-shuffle"></i>
              </button>
              {/* Previous */}
              <button onClick={playPrev} title="Previous">
                <i className="fa-solid fa-backward-step"></i>
              </button>
              {/* Play/Pause */}
              <button onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                <i className={isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play"}></i>
              </button>
              {/* Next */}
              <button onClick={playNext} title="Next">
                <i className="fa-solid fa-forward-step"></i>
              </button>
              {/* Repeat/Loop */}
              <button
                className={repeat ? "active" : ""}
                onClick={() => setRepeat(!repeat)}
                title="Repeat"
              >
                <i className="fa-solid fa-repeat"></i>
              </button>
              {/* Progress Bar (seek) */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={duration ? (currentTime / duration) * 100 : 0}
                onInput={handleSeek}
                className="np-progress"
              />
              <span className="np-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
              {/* Volume */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onInput={handleVolumeChange}
                className="np-volume"
              />
            </div>
            <audio
              ref={audioRef}
              src={currentSong.src}
              autoPlay
              onEnded={handleSongEnd}
            />
          </>
        )}
      </footer>

      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      />
    </div>
  );
}