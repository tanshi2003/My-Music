import React, { useEffect, useRef } from "react";

export default function Visualizer({ audioRef, isPlaying, show = true }) {
	const canvasRef = useRef(null);
	const rafRef = useRef(null);

	useEffect(() => {
		if (!show) return;
		if (!audioRef || !audioRef.current) return;
		if (!window || !(window.AudioContext || window.webkitAudioContext)) return;

		let audioCtx;
		let analyser;
		let source;
		let dataArray;
		let bufferLength;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		let devicePixelRatio = window.devicePixelRatio || 1;

		const palettes = {
			default: ["#EAEAEA", "#D0D0D0"]
		};
		const colors = palettes.default;
		const sensitivity = 0.9;

		const resize = () => {
			const w = canvas.clientWidth;
			const h = canvas.clientHeight;
			canvas.width = Math.max(32, Math.floor(w * devicePixelRatio));
			canvas.height = Math.max(16, Math.floor(h * devicePixelRatio));
		};
		resize();
		window.addEventListener("resize", resize);

		try {
			const Ctx = window.AudioContext || window.webkit.AudioContext;
			audioCtx = new Ctx();
			source = audioCtx.createMediaElementSource(audioRef.current);
			analyser = audioCtx.createAnalyser();
			analyser.smoothingTimeConstant = 0.8;
			analyser.fftSize = 128;
			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array(bufferLength);

			source.connect(analyser);
			analyser.connect(audioCtx.destination);

			const draw = () => {
				// if not playing, draw a calm baseline
				if (!isPlaying) {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					const cw = canvas.width / devicePixelRatio;
					const ch = canvas.height / devicePixelRatio;
					const grad = ctx.createLinearGradient(0, 0, 0, ch);
					grad.addColorStop(0, colors[0]);
					grad.addColorStop(1, colors[1] || colors[0]);
					ctx.fillStyle = grad;
					ctx.globalAlpha = 0.04;
					ctx.fillRect(0, Math.floor((ch - 4) * devicePixelRatio), Math.floor(cw * devicePixelRatio), Math.floor(4 * devicePixelRatio));
					rafRef.current = requestAnimationFrame(draw);
					return;
				}

				analyser.getByteFrequencyData(dataArray);
				const cw = canvas.width / devicePixelRatio;
				const ch = canvas.height / devicePixelRatio;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				const grad = ctx.createLinearGradient(0, 0, 0, ch);
				grad.addColorStop(0, colors[0]);
				grad.addColorStop(1, colors[1] || colors[0]);
				ctx.fillStyle = grad;
				// limit bars to keep drawing light and aesthetic
				const barCount = Math.min(36, bufferLength);
				const step = Math.max(1, Math.floor(bufferLength / barCount));
				const barWidth = cw / barCount * 0.72;
				let x = (cw - barCount * barWidth) / 2;
				for (let i = 0; i < barCount; i++) {
					const v = (dataArray[i * step] / 255) * sensitivity;
					const h = Math.max(2, v * ch * 0.9);
					ctx.globalAlpha = 0.95;
					ctx.fillRect(Math.floor(x * devicePixelRatio), Math.floor((ch - h) * devicePixelRatio), Math.floor(barWidth * devicePixelRatio), Math.floor(h * devicePixelRatio));
					x += barWidth + (cw * 0.006);
				}
				rafRef.current = requestAnimationFrame(draw);
			};

			if (isPlaying) {
				if (audioCtx.state === "suspended") audioCtx.resume().catch(()=>{});
			}
			draw();
		} catch (e) {
			console.warn("Visualizer init failed", e);
		}

		return () => {
			window.removeEventListener("resize", resize);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			try {
				if (source) source.disconnect();
				if (analyser) analyser.disconnect();
				if (audioCtx) audioCtx.close();
			} catch (err) {}
		};
	}, [audioRef, isPlaying, show]);

	if (!show) return null;
	return (
		<div className="visualizer-wrap" style={{ width: "100%", height: 48, display: "block", marginTop: 6 }}>
			<canvas ref={canvasRef} style={{ width: "100%", height: `48px`, display: "block", borderRadius: 8 }} />
		</div>
	);
}