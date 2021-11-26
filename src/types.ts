type SeriesSize = 'sm' | 'md' | 'lg';
type Palette = 'reds' | 'greens' | 'blues';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  palette: Palette;
  numberOfSegments: number;
}
