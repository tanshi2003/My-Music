import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeUp, hoverTap } from "../lib/motionVariants";
// LocalPlayer should NOT be mounted here; use global player instead
import Link from "next/link";
import { songs } from "../data/songs";
import LoveButton from "../components/LoveButton";
import { usePlayer } from "../context/PlayerContext";

export default function LibraryPage() {
	const [search, setSearch] = useState("");
	const [currentPlaylist, setCurrentPlaylist] = useState(null);
	// use global player (single source of truth)
	const { playSong, enqueue, insertNext, toggleLove, lovedSongs, currentSong } = usePlayer();

	// add: small synthesized 'love' sound and wrapper to call context.toggleLove
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
			o.connect(g); g.connect(ctx.destination);
			const now = ctx.currentTime;
			g.gain.setValueAtTime(0, now);
			g.gain.linearRampToValueAtTime(0.12, now + 0.01);
			g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
			o.start(now); o.stop(now + 0.28);
			setTimeout(() => { try { ctx.close(); } catch (e) {} }, 500);
		} catch (e) { console.warn("sound failed", e); }
	};
	const handleToggleLove = (id) => { toggleLove(id); playLoveSound(); };

	// UI state reused from index.js
	const [playlists, setPlaylists] = useState(() => {
		try {
			const p = localStorage.getItem('cutiefy-playlists');
			return p ? JSON.parse(p) : [];
		} catch (e) { return []; }
	});
	const [optionsMenu, setOptionsMenu] = useState({ open: false, songId: null, anchorRect: null });
	const [playlistMenu, setPlaylistMenu] = useState({ open: false, songId: null });
	const menuRef = useRef(null);
	const [showLovedOnly, setShowLovedOnly] = useState(false);

	useEffect(() => {
		const handler = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setOptionsMenu({ open: false, songId: null, anchorRect: null });
				setPlaylistMenu({ open: false, songId: null });
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Persist playlists (same behaviour as index.js)
	useEffect(() => localStorage.setItem('cutiefy-playlists', JSON.stringify(playlists)), [playlists]);

	// Playlist helpers (persist + update)
	function createPlaylist(name) {
		if (!name) return;
		const next = [...playlists, { name, songs: [] }];
		setPlaylists(next);
		return next.length - 1;
	}
	function addSongToPlaylist(playlistIndex, songId) {
		setPlaylists(prev => {
			const clone = JSON.parse(JSON.stringify(prev));
			if (clone[playlistIndex] && !clone[playlistIndex].songs.includes(songId)) {
				clone[playlistIndex].songs.push(songId);
			}
			return clone;
		});
		setPlaylistMenu({ open: false, songId: null });
		setOptionsMenu({ open: false, songId: null });
	}

	// Queue helpers using PlayerContext
	function addToQueue(song) {
		enqueue(song);
		setOptionsMenu({ open: false, songId: null });
	}
	function playNextSong(song) {
		if (!currentSong) { playSong(song); setOptionsMenu({ open: false, songId: null }); return; }
		insertNext(song);
		setOptionsMenu({ open: false, songId: null });
	}



	// Filter songs by UI states
 	const visibleSongs = useMemo(() => {
 		let pool = songs;
 		// If viewing a specific playlist
 		if (typeof currentPlaylist === 'number' && playlists[currentPlaylist]) {
 			pool = songs.filter(s => playlists[currentPlaylist].songs.includes(s.id));
 		}
		// Filter by loved songs if toggle is on
		if (showLovedOnly) pool = pool.filter(s => lovedSongs.includes(s.id));
 		// Filter by search
 		return pool.filter(song => {
 			const matchesSearch = song.title.toLowerCase().includes(search.toLowerCase()) || song.artist.toLowerCase().includes(search.toLowerCase());
 			return matchesSearch;
 		});
 	}, [songs, search, showLovedOnly, lovedSongs, currentPlaylist, playlists]);

	return (
		<div className="app-layout">
			{/* Sidebar (same structure as index.js) */}
			<aside className="sidebar">
				<div className="sidebar-logo"><img src="/logo.jpg" alt="Logo" /></div>
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
									<button key={idx} className={`sidebar-playlist-item ${currentPlaylist === idx ? 'active' : ''}`} onClick={() => { setCurrentPlaylist(idx); setShowLovedOnly(false); }}>
										<img src={cover} alt="" className="sidebar-playlist-cover" />
										<span className="sidebar-item-label">{pl.name}</span>
									</button>
								);
							})}
						</div>
					</div>
				</nav>
			</aside>

			{/* Main content uses the same global background & font as index.js */}
			<main className="main-content" style={{ padding: 24 }}>
				<header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
					<h2 style={{ margin: 0 }}>Library</h2>
					<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
						{/* Heart toggle — same visual pattern as index.js */}
						<button
							className={`view-toggle-btn top-action ${showLovedOnly ? 'active' : ''}`}
							onClick={() => { setShowLovedOnly(s => !s); }}
							title={showLovedOnly ? "Showing liked songs" : "Show liked songs"}
						>
							<i className={showLovedOnly ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
						</button>

						{/* Flashy "Home" link (tadka bhadka) */}
						<Link href="/" className="home-btn top-action" title="Back to Home">✨ Home</Link>
					</div>
				</header>
				{/* search bar (local to Library) */}
				<div className="search-bar">
					<input
						type="text"
						placeholder="Search songs or artists"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<section>
					<h3 style={{ marginBottom: 10 }}>
						{typeof currentPlaylist === 'number' && playlists[currentPlaylist] 
							? `${playlists[currentPlaylist].name}` 
							: (showLovedOnly ? 'Liked Songs' : 'All Songs')}
					</h3>

					{/* song list */}
					<div className="library-song-list">
						{visibleSongs.map((song, i) => (
							<motion.div
								key={song.id}
								className="lib-song-row"
								initial="initial"
								animate="animate"
								variants={fadeUp}
								whileHover={hoverTap.hover}
								onClick={() => playSong(song)}
								style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, cursor: 'pointer' }}
							>
								<img src={song.cover} alt={song.title} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
								<div style={{ flex: 1 }}>
									<div className="lib-title" style={{ fontWeight: 700, color: "#fff" }}>{song.title}</div>
									<div className="lib-artist" style={{ fontSize: 13, opacity: 0.85 }}>{song.artist}</div>
								</div>

								{/* love button (uses global lovedSongs & toggle) */}
								<div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
									<LoveButton songId={song.id} isLoved={lovedSongs.includes(song.id)} onToggle={() => handleToggleLove(song.id)} onSound={playLoveSound} />
								</div>

								{/* song options button */}
								<div className="song-options-wrapper" onClick={(e) => e.stopPropagation()}>
									<button className="song-options btn" title="Options"
										onClick={(e) => {
											const rect = e.target.getBoundingClientRect();
											setOptionsMenu({ open: true, songId: song.id, anchorRect: rect });
										}}
									>
										<i className="fas fa-ellipsis-v"></i>
									</button>

									{optionsMenu.open && optionsMenu.songId === song.id && (
										<motion.div ref={menuRef} className="song-options-menu glass" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'absolute', right: 18, zIndex: 80, minWidth: 180, padding: 8 }}>
											<button className="btn" onClick={() => { playNextSong(song); }}>⏭ Play Next</button>
											<button className="btn" onClick={() => { addToQueue(song); }}>➕ Add to Queue</button>

											{/* Add to Playlist dropdown */}
											<div style={{ position: 'relative' }}>
												<button className="btn" onClick={() => setPlaylistMenu({ open: true, songId: song.id })}>📁 Add to Playlist ▾</button>

												{playlistMenu.open && playlistMenu.songId === song.id && (
													<motion.div className="playlist-dropdown glass" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', right: 0 }}>
														{playlists.map((pl, idx) => (
															<button key={pl.name} className="btn" onClick={() => { addSongToPlaylist(idx, song.id); setPlaylistMenu({ open: false, songId: null }); setOptionsMenu({ open: false, songId: null }); }}>
																{pl.name}
															</button>
														))}
														<hr />
														<button className="btn" onClick={() => {
															const name = prompt("New playlist name");
															if (name) createPlaylist(name);
														}}>＋ Create new playlist</button>
													</motion.div>
												)}
											</div>
										</motion.div>
									)}
								</div>
							</motion.div>
						))}
					</div>

					{/* LocalPlayer removed — shared PlayerProvider renders persistent PlayerBar */}
				</section>
			</main>

			{/* LocalPlayer removed — shared PlayerProvider renders persistent PlayerBar */}
		</div>
	);
}
