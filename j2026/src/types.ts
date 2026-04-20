export type GradientPalette = [string, string, string];

export interface MemoryEntry {
  id: string;
  year: string;
  title: string;
  image: string;
  imageFit?: "contain" | "cover";
  frameWidth?: number;
  frameHeight?: number;
  displayScale?: number;
  text: string;
  song?: string;
  highlight?: boolean;
  gradient: GradientPalette;
  accent: string;
  secretMessage?: string;
  altMessage?: string;
}

export interface IntroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  gradient: GradientPalette;
}

export interface LandingContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  promptLabel: string;
  placeholder: string;
  buttonLabel: string;
  helperText: string;
  password: string;
  image: string;
  gradient: GradientPalette;
}

export interface EndingContent {
  title: string;
  message: string;
  buttonLabel: string;
  gradient: GradientPalette;
}
