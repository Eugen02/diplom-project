interface ColorsInterface {
  primary: string;
  primarySoft: string;
  primaryDeep: string;
  // "r, g, b" of primary, for rgba() at varying alpha.
  primaryRgb: string;
  brandGradient: string;
  black: string;
  deepBlack: string;
  white: string;
  darkGray: string;
  backgroundHoverGray: string;
  gray: string;
  lightGray: string;
  border: string;
  danger: string;
}

// "Midnight violet": near-black with a cool tint, one violet accent.
// Gradients are reserved for hero headers and a few highlights.
export const colors: ColorsInterface = {
  primary: "#8B5CF6",
  primarySoft: "#C084FC",
  primaryDeep: "#4F46E5",
  primaryRgb: "139, 92, 246",
  brandGradient: "linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)",
  black: "#121219",
  deepBlack: "#0D0D12",
  white: "#F2F1F6",
  darkGray: "#1E1E27",
  backgroundHoverGray: "#262631",
  gray: "#9A98A8",
  lightGray: "#E6E4EE",
  border: "rgba(255, 255, 255, 0.07)",
  danger: "#F87171",
};

export const primaryAlpha = (alpha: number) =>
  `rgba(${colors.primaryRgb}, ${alpha})`;
