import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Visualizer from "./Visualizer";
import { fadeUp, hoverTap } from "../lib/motionVariants";

export default forwardRef(function LocalPlayer({ songs = [] }, ref) {
	const audioRef = useRef(null);
	const [currentSong, setCurrentSong] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(0.8);
	const [queue, setQueue] = useState([]);
	const [shuffle, setShuffle] = useState(false);
	const [repeat, setRepeat] = useState(false);
	const [showVisualizer, setShowVisualizer] = useState(false);
	const reduceMotion = useReducedMotion();

	// expose api
	useImperativeHandle(ref, () => ({
		play(song) {
			setCurrentSong(song);
			setIsPlaying(true);
		},
		stop() {
			setIsPlaying(false);
			if (audioRef.current) audioRef.current.pause();
		},
		enqueue(song) {
			setQueue(prev => {
				// avoid duplicates
				if (prev.some(s => s.id === song.id)) return prev;
				return [...prev, song];
			});
		},
		// insert directly next (after current song). If nothing playing, play now.
		insertNext(song) {
			if (!currentSong) {
				setCurrentSong(song);
				setIsPlaying(true);
				return;
			}
			setQueue(prev => {
				// remove any existing occurrence
				const filtered = prev.filter(s => s.id !== song.id);
				// insert at front (next)
				return [song, ...filtered];
			});
		}
	}));

	useEffect(() => {
		if (!audioRef.current) return;
		audioRef.current.volume = volume;
	}, [volume]);

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		const handleTime = () => setCurrentTime(a.currentTime);
		const handleMeta = () => setDuration(a.duration || 0);
		a.addEventListener("timeupdate", handleTime);
		a.addEventListener("loadedmetadata", handleMeta);
		a.addEventListener("ended", () => {
			// handle queue first
			if (queue.length > 0) {
				const next = queue[0];
				setQueue(prev => prev.slice(1));
				setCurrentSong(next);
				setIsPlaying(true);
			} else if (repeat) {
				a.currentTime = 0;
				a.play().catch(()=>{});
			} else if (shuffle && songs.length > 0) {
				const idx = Math.floor(Math.random() * songs.length);
				setCurrentSong(songs[idx]);
				setIsPlaying(true);
			} else if (currentSong) {
				const idx = Math.max(0, songs.findIndex(s => s.id === currentSong.id));
				const next = songs[(idx + 1) % songs.length];
				setCurrentSong(next);
				setIsPlaying(true);
			}
		});
		return () => {
			a.removeEventListener("timeupdate", handleTime);
			a.removeEventListener("loadedmetadata", handleMeta);
		};
	}, [audioRef, currentSong, queue, repeat, shuffle, songs]);

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		if (currentSong) {
			a.src = currentSong.src;
			a.load();
			if (isPlaying) a.play().catch(()=>{});
		}
	}, [currentSong]);

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		if (isPlaying) a.play().catch(()=>{});
		else a.pause();
	}, [isPlaying]);

	const togglePlay = () => setIsPlaying(p => !p);
	const playNext = () => {
		if (!currentSong || songs.length === 0) return;
		if (shuffle) {
			const idx = Math.floor(Math.random() * songs.length);
			setCurrentSong(songs[idx]);
			setIsPlaying(true);
			return;
		}
		const idx = Math.max(0, songs.findIndex(s => s.id === currentSong.id));
		const next = songs[(idx + 1) % songs.length];
		setCurrentSong(next);
		setIsPlaying(true);
	};
	const playPrev = () => {
		if (!currentSong || songs.length === 0) return;
		const idx = Math.max(0, songs.findIndex(s => s.id === currentSong.id));
		const prev = songs[(idx - 1 + songs.length) % songs.length];
		setCurrentSong(prev);
		setIsPlaying(true);
	};
	const handleSeek = (val) => {
		if (!audioRef.current || !duration) return;
		audioRef.current.currentTime = (val / 100) * duration;
		setCurrentTime(audioRef.current.currentTime);
	};

	const formatTime = (s) => {
		if (!s || isNaN(s)) return "0:00";
		const m = Math.floor(s/60);
		const sec = Math.floor(s % 60).toString().padStart(2,'0');
		return `${m}:${sec}`;
	};

	if (!currentSong) return null;

	return (
		<motion.div className="now-playing glass glow"
			initial={{opacity:0, y: 10}}
			animate={{opacity:1, y:0}}
			style={{display:'flex', alignItems:'center', gap:12}}
		>
			<audio ref={audioRef} />
			<div className={`np-thumb-wrapper ${isPlaying ? 'playing' : ''}`}>
				<motion.img
					src={currentSong.cover}
					alt={currentSong.title}
					className="np-thumb"
					animate={(!reduceMotion && isPlaying) ? { rotate: [-3, 3, -3] } : { rotate: 0 }}
					transition={(!reduceMotion && isPlaying) ? { repeat: Infinity, duration: 12, ease: "easeInOut" } : { duration: 0 }}
					whileHover={reduceMotion ? {} : { scale: 1.04 }}
					style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
					draggable={false}
				/>
			</div>

			<div className="np-meta" style={{flex:1}}>
				<div className="np-title" style={{fontWeight:600}}>{currentSong.title}</div>
				<div className="np-artist" style={{fontSize:13, opacity:0.85}}>{currentSong.artist}</div>
			</div>

			<div className="now-playing-controls" style={{display:'flex', alignItems:'center', gap:8}}>
				<button className={`btn ${shuffle ? 'active' : ''}`} onClick={() => setShuffle(s => !s)} title="Shuffle">🔀</button>
				<button className="btn" onClick={playPrev}>⏮</button>
				<button className="btn play-button-main" onClick={togglePlay}>{isPlaying ? '⏸' : '▶️'}</button>
				<button className="btn" onClick={playNext}>⏭</button>
				<button className={`btn ${repeat ? 'active' : ''}`} onClick={() => setRepeat(r => !r)} title="Repeat">🔁</button>
				<button className={`btn ${showVisualizer ? 'active' : ''}`} onClick={() => setShowVisualizer(v => !v)} title="Visualizer">🔊</button>
			</div>

			{ showVisualizer && <Visualizer audioRef={audioRef} isPlaying={isPlaying} show={true} /> }

			<div style={{flex:1, display:'flex', alignItems:'center', gap:8, marginLeft:8}}>
				<input className="np-progress" type="range" min="0" max="100" step="0.1" value={duration ? (currentTime / duration) * 100 : 0} onInput={(e)=>handleSeek(parseFloat(e.target.value))} />
				<span className="np-time" style={{minWidth:72, textAlign:'right'}}>{formatTime(currentTime)} / {formatTime(duration)}</span>
			</div>

			<div style={{display:'flex', alignItems:'center', gap:8}}>
				<input type="range" min="0" max="1" step="0.01" value={volume} onInput={(e)=>setVolume(parseFloat(e.target.value))} className="np-volume" />
			</div>

			<style jsx>{`
				.now-playing { position: fixed; left: 18px; right: 18px; bottom: 18px; padding: 12px; z-index: 60; align-items:center; }
				.np-progress { height:8px; border-radius:999px; appearance:none; background: linear-gradient(90deg, var(--accent-pink), var(--accent-blue)); flex:1; }
				.np-progress::-webkit-slider-thumb { -webkit-appearance:none; width:14px;height:14px;border-radius:50%;background:var(--accent-pink); margin-top:-3px; box-shadow: 0 6px 18px rgba(255,107,154,0.18); }
				@media (prefers-reduced-motion: reduce) { .np-thumb { transition:none !important } }
			`}</style>
		</motion.div>
	);
});
