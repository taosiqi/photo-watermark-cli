export interface WatermarkConfig {
  timeFormat: string;
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  fontSize: number;
  fontColor: string;
  addShadow: boolean;
  quality: number;
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
