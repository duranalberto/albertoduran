export interface Icon {
  text: string;
  viewBox: string;
  content: string;
  isFile?: boolean;
  width?: number | string;
  height?: number | string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  strokeLinecap?: "round" | "butt" | "square";
  strokeLinejoin?: "round" | "inherit" | "miter" | "bevel";
}

export interface RibbonIcon {
  iconSize: number;
  gap: number;
  verticalPadding?: number;
}
