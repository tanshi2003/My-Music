export const fadeUp = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeInOut" } },
	exit: { opacity: 0, y: 8, transition: { duration: 0.18, ease: "easeInOut" } }
};

export const hoverTap = {
	hover: { scale: 1.05, y: -3, transition: { duration: 0.12, ease: "easeInOut" } },
	tap: { scale: 0.98, transition: { duration: 0.06, ease: "easeInOut" } }
};

export const slideInRight = {
	initial: { opacity: 0, x: 18 },
	animate: { opacity: 1, x: 0, transition: { duration: 0.32, ease: "easeInOut" } },
	exit: { opacity: 0, x: 18, transition: { duration: 0.2, ease: "easeInOut" } }
};
