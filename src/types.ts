type Palette = 'reds' | 'greens' | 'blues';
type SpeedUnit = 'ms¯¹' | 'kmh¯¹' | 'mph' | 'kts';

export interface SimpleOptions {
  palette: Palette;
  numberOfSegments: number;
  windSpeedInterval: number;
  rotation: number;
  speedUnit: SpeedUnit;
}
