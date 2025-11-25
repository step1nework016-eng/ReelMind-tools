export type Mode = 'generate' | 'edit';

export interface GeneratedImage {
  id: string;
  url: string; // Data URL
  prompt: string;
  timestamp: number;
  mode: Mode;
}

export interface LoadingState {
  isLoading: boolean;
  message: string;
}

export interface AspectRatio {
  label: string;
  value: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}
