import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePlayer } from "../context/PlayerContext";

export default function PlayerBar() {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrev,
    currentTime, duration, handleSeek, volume, handleVolumeChange,
    toggleLove, lovedSongs
  } = usePlayer();
  const reduceMotion = useReducedMotion();

  if (!currentSong) return null;

  const pct = duration ? (currentTime / duration) * 100 : 0;
  const isLoved = lovedSongs.includes(currentSong.id);

  return (
    <div className="playerbar-wrap">
      <div className="playerbar-left">
        <img src={currentSong.cover} alt="" className="pb-cover" />
        <div className="pb-meta">
          <div className="pb-title">{currentSong.title}</div>
          <div className="pb-artist">{currentSong.artist}</div>
        </div>
      </div>

      <div className="playerbar-center">
        <div className="controls">
          <button onClick={playPrev} title="Previous">⏮</button>
          <button onClick={togglePlay} className="play-main" title={isPlaying ? "Pause" : "Play"}>{isPlaying ? "⏸" : "▶️"}</button>
          <button onClick={playNext} title="Next">⏭</button>
        </div>
        <div className="progress">
          <input type="range" min="0" max="100" step="0.1" value={pct} onChange={e => handleSeek(parseFloat(e.target.value))} />
          <div className="time">{Math.floor(currentTime/60)}:{String(Math.floor(currentTime%60)).padStart(2,"0")} / {Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,"0")}</div>
        </div>
      </div>

      <div className="playerbar-right">
        <button className={`love ${isLoved ? 'active' : ''}`} onClick={() => toggleLove(currentSong.id)} title="Like">
          {isLoved ? "♥" : "♡"}
        </button>
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => handleVolumeChange(parseFloat(e.target.value))} />
      </div>

      <style jsx>{`
        .playerbar-wrap {
          position: fixed;
          left: 18px;
          right: 18px;
          bottom: 18px;
          z-index: 80;
          display:flex;
          align-items:center;
          gap:12px;
          padding:12px;
          border-radius:12px;
          background: rgba(12,12,16,0.98); /* solid glass-dark background — no transparency bleed */
          box-shadow: 0 12px 40px rgba(2,6,35,0.6);
          color: #fff;
        }
        .pb-cover { width:56px; height:56px; object-fit:cover; border-radius:8px; }
        .pb-meta { margin-left:8px; }
        .pb-title { font-weight:700; }
        .pb-artist { opacity:0.8; font-size:13px; }
        .playerbar-center { flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; }
        .controls button { background:transparent; border:none; color:#fff; padding:8px; font-size:16px; cursor:pointer }
        .play-main { font-size:20px; background:linear-gradient(90deg,#ff6b9a,#6b6bff); border-radius:8px; padding:6px 10px; }
        .progress { width:100%; display:flex; align-items:center; gap:8px; }
        .progress input[type="range"] { flex:1; }
        .playerbar-right { display:flex; align-items:center; gap:8px; }
        .love { background:transparent; border:none; font-size:18px; color:#fff; cursor:pointer; }
        .love.active { color:#ff4b4b; transform:scale(1.06); }
      `}</style>
    </div>
  );
}
