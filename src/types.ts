export interface WatermarkConfig {
  timeFormat: string;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  fontSize: number;
  fontColor: string;
  addShadow: boolean;
  quality: number;
  brightness: number;  // 亮度调整值，范围 0.1-2.0，1.0为原始亮度
}

export interface ImageInfo {
  path: string;
  width: number;
  height: number;
  format: string;
  exifDateTime?: string;
}

export interface WatermarkOptions {
  inputDir: string;
  outputDir?: string;
  config?: Partial<WatermarkConfig>;
  overwrite?: boolean;
}

export interface CLIOptions {
  directory?: string;
  input?: string;
  output?: string;
  format?: string;
  brightness?: number;
  overwrite?: boolean;
  interactive?: boolean;
}

export interface FontSize {
  size: number;
  margin: number;
}

export interface ProcessResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: string[];
}
