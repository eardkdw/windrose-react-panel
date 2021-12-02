import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder
    .addRadio({
      path: 'palette',
      name: 'Palette',
      defaultValue: 'greens',
      settings: {
        options: [
          {
            value: 'reds',
            label: 'Red',
          },
          {
            value: 'greens',
            label: 'Green',
          },
          {
            value: 'blues',
            label: 'Blue',
          },
        ],
      },
    })
    .addNumberInput({
      path: 'numberOfSegments',
      name: 'Number of Segments',
      defaultValue: 16,
    })
    .addNumberInput({
      path: 'windSpeedInterval',
      name: 'Wind Speed Interval',
      defaultValue: 2,
    })
    .addSelect({
      path: 'speedUnit',
      name: 'SpeedUnit',
      defaultValue: 'ms¯¹',
      settings: {
        options: [
          { value: 'ms¯¹', label: 'Metres per second' },
          { value: 'kmh¯¹', label: 'Kilometres per hour' },
          { value: 'mph', label: 'Miles per hour' },
          { value: 'kts', label: 'Knots' },
        ],
      },
    })
    .addNumberInput({
      path: 'rotation',
      name: 'Rotate Rose degrees (-90° is North at the top)',
      defaultValue: -90,
    });
});
