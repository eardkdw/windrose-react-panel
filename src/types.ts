type SeriesSize = 'sm' | 'md' | 'lg';
type Palette = 'reds' | 'greens' | 'blues';
type SpeedUnit = 'ms¯¹' | 'kmh¯¹' | 'mph' | 'kts';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  palette: Palette;
  numberOfSegments: number;
  windSpeedInterval: number;
  rotation: number;
  speedUnit: SpeedUnit;
}
