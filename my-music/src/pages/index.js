import { useState, useRef } from "react";

// 🎵 Main Music Player Component
export default function Home() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(false);
  const [volume, setVolume] = useState(0.7); // default volume
  const audioRef = useRef(null);

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

  // ▶️ Play a specific song
  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = song.src;
      audioRef.current.play();
    }
  };

  // ⏯ Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // ⏩ Next Song
  const playNext = () => {
    if (!currentSong) return;
    let currentIndex = songs.findIndex(s => s.id === currentSong.id);
    if (shuffleOn) {
      currentIndex = Math.floor(Math.random() * songs.length);
    } else {
      currentIndex = (currentIndex + 1) % songs.length;
    }
    playSong(songs[currentIndex]);
  };

  // ⏪ Previous Song
  const playPrev = () => {
    if (!currentSong) return;
    let currentIndex = songs.findIndex(s => s.id === currentSong.id);
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[currentIndex]);
  };

  // 🔊 Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <main>
      <h1 className="main-heading">
        <img src="/logo.jpg" alt="Logo" style={{ height: "40px", verticalAlign: "middle" }} /> My Music
      </h1>

      {/* Song Grid */}
      <div className="grid">
        {songs.map((song) => (
          <div className="song-card" key={song.id} onClick={() => playSong(song)}>
            <img src={song.cover} alt={song.title} />
            <div className="song-title">{song.title}</div>
            <div className="song-artist">{song.artist}</div>
          </div>
        ))}
      </div>

      {/* Now Playing Bar */}
      {currentSong && (
        <div className="now-playing">
          <img src={currentSong.cover} alt={currentSong.title} className="cover" />
          <div className="info">
            <div>{currentSong.title}</div>
            <div>{currentSong.artist}</div>
          </div>
          <div className="player-controls">
            <button onClick={playPrev}><i className="fa-solid fa-backward-step"></i></button>
            <button onClick={togglePlay}>
              <i className={isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play"}></i>
            </button>
            <button onClick={playNext}><i className="fa-solid fa-forward-step"></i></button>
            <button onClick={() => setShuffleOn(!shuffleOn)} style={{ color: shuffleOn ? "#1db954" : "white" }}>
              <i className="fa-solid fa-shuffle"></i>
            </button>
            <button onClick={() => setRepeatOn(!repeatOn)} style={{ color: repeatOn ? "#1db954" : "white" }}>
              <i className="fa-solid fa-repeat"></i>
            </button>
            <div className="volume-control">
              <i className="fa-solid fa-volume-high"></i>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
              />
            </div>
          </div>
          <audio
            ref={audioRef}
            onEnded={repeatOn ? () => audioRef.current.play() : playNext}
            volume={volume}
            autoPlay
          ></audio>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .main-heading {
          font-family: 'Segoe UI', sans-serif;
          font-size: 2.5rem;
          text-align: center;
          margin: 30px 0;
          color: white;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
          padding: 20px;
        }
        .song-card {
          background: #222;
          color: white;
          border-radius: 10px;
          padding: 10px;
          cursor: pointer;
          text-align: center;
          transition: transform 0.2s;
        }
        .song-card:hover {
          transform: scale(1.05);
        }
        .song-card img {
          width: 100%;
          border-radius: 8px;
        }
        .now-playing {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #111;
          color: white;
          display: flex;
          align-items: center;
          padding: 10px;
          gap: 10px;
        }
        .cover {
          width: 50px;
          height: 50px;
          object-fit: cover;
        }
        .player-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .player-controls button {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          margin: 0 5px;
        }
        .volume-control {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 12px;
        }
        .volume-control input[type="range"] {
          width: 80px;
          accent-color: #1db954;
          cursor: pointer;
        }
        .volume-control i {
          font-size: 18px;
        }
      `}</style>

      {/* Font Awesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      />
    </main>
  );
}
