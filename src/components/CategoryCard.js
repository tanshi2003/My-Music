import React, { useRef } from "react";
import { motion } from "framer-motion";
import { fadeUp, hoverTap } from "../lib/motionVariants";

export default function CategoryCard({ title, emoji, gradient, count = 0, active = false, onClick = () => {} }) {
	const el = useRef(null);

	const handleMove = (e) => {
		const rect = el.current.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		const rx = (y / rect.height) * -6; // tilt strength
		const ry = (x / rect.width) * 10;
		el.current.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
		el.current.style.boxShadow = `0 12px 30px rgba(0,0,0,0.08)`;
	};
	const handleLeave = () => {
		el.current.style.transform = "";
		el.current.style.boxShadow = "";
	};

	return (
		<motion.div
			initial="initial"
			animate="animate"
			variants={fadeUp}
			whileHover="hover"
			whileTap="tap"
			transition={{ ease: "easeInOut" }}
			style={{ display: "inline-block" }}
		>
			<button
				ref={el}
				className={`category-card ${active ? 'active' : ''}`}
				onMouseMove={handleMove}
				onMouseLeave={handleLeave}
				onClick={onClick}
				aria-pressed={active}
				style={{
					background: gradient,
					border: "none",
					borderRadius: 12,
					padding: 16,
					cursor: "pointer",
					color: "#222",
					minWidth: 160,
					textAlign: "left",
					transition: "transform .18s ease, box-shadow .18s ease"
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<div style={{ fontSize: 28 }}>{emoji}</div>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
						<span style={{ fontSize: 12, opacity: 0.8 }}>{count} songs</span>
					</div>
				</div>
			</button>
		</motion.div>
	);
}
