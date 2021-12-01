import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'text',
      name: 'Simple text option',
      description: 'Description of panel option',
      defaultValue: 'Default value of text input option',
    })
    .addRadio({
      path: 'seriesCountSize',
      defaultValue: 'sm',
      name: 'Series counter size',
      settings: {
        options: [
          {
            value: 'sm',
            label: 'Small',
          },
          {
            value: 'md',
            label: 'Medium',
          },
          {
            value: 'lg',
            label: 'Large',
          },
        ],
      },
      showIf: config => config.showSeriesCount,
    })
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
    .addNumberInput({
      path: 'rotation',
      name: 'Rotate Rose degrees (-90° is North at the top)',
      defaultValue: -90,
    });
});
