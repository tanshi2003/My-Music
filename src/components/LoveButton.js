import React from "react";

export default function LoveButton({ songId, isLoved = false, onToggle = () => {}, onSound = () => {} }) {
	// Toggle love and play tiny sound
	const handleClick = (e) => {
		e.stopPropagation();
		onToggle(songId);
		try { onSound(); } catch (e) {}
	};

	return (
		<button
			className={`love-btn ${isLoved ? 'loved' : ''}`}
			aria-pressed={isLoved}
			aria-label={isLoved ? "Unlove" : "Love"}
			onClick={handleClick}
			title={isLoved ? "Unlove" : "Love"}
		>
			<i className={isLoved ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
			<style jsx>{`
				.love-btn {
					background: transparent;
					border: none;
					padding: 6px;
					border-radius: 6px;
					cursor: pointer;
					color: #fff;
					font-size: 16px;
					display: inline-flex;
					align-items: center;
					justify-content: center;
					transition: transform .12s ease, color .12s ease, filter .12s ease;
					box-shadow: none;
					outline: none;
				}
				.love-btn:focus { box-shadow: 0 0 0 4px rgba(255,107,154,0.06); }
				.love-btn:hover { transform: scale(1.06); color: #ff4b4b; filter: drop-shadow(0 6px 18px rgba(255,75,75,0.14)); }
				.love-btn.loved { color: #ff4b4b; filter: drop-shadow(0 6px 18px rgba(255,75,75,0.14)); transform: scale(1.04); }
			`}</style>
		</button>
	);
}
