import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();

  const frame = data.series[0];

  const theta = frame.fields.find(field => field.name === 'windDir');
  const r = frame.fields.find(field => field.name === 'windSpeed');

  //check there are data
  if (!data.series?.length || !theta || !r) {
    return (
      <div className="panel-empty">
        <p>{'No data found in response'}</p>
      </div>
    );
  }
  const size = (Math.min(width, height) / 2) * 0.9;

  let palette: string;
  switch (options.palette) {
    case 'reds':
      palette = theme.palette.redBase;
      break;
    case 'greens':
      palette = theme.palette.greenBase;
      break;
    case 'blues':
      palette = theme.palette.blue95;
      break;
  }

  //draw windrose
  let num_points = theta.values.length;
  let points_on_dir: any[] = [];

  let angle = 360 / options.numberOfSegments;

  for (let i = 0; i < options.numberOfSegments; i++) {
    points_on_dir.push([]);
  }

  let angles: number[] = [];
  let rs: number[] = [];
  for (let p = 0; p < num_points; p++) {
    let angle_idx = Math.floor((theta.values.get(p) / angle + 1.5) % options.numberOfSegments);
    points_on_dir[angle_idx].push(r.values.get(p));

    //read the dataframe values, and put them into a number[] array
    //so subsequent functions are happy with the type
    angles.push(theta.values.get(p));
    rs.push(r.values.get(p));
  }

  // compute m levels for all n directions
  let petals: number[][] = [];

  // find max wind speed and speed levels
  let max_speed = Math.max(...rs);
  let bin_num = Math.ceil(max_speed / options.windSpeedInterval);
  let speed_levels = [];
  for (let bin_idx = 0; bin_idx <= bin_num; bin_idx++) {
    let level = options.windSpeedInterval * bin_idx;
    speed_levels.push(level);
  }

  // prepare base lengths
  let base_lengths: number[] = [];
  base_lengths.length = options.numberOfSegments;
  base_lengths.fill(0);

  // compute the petal lengths
  for (let bin_idx = 0; bin_idx < bin_num; bin_idx++) {
    petals.push([]);
    for (let angle_idx = 0; angle_idx < options.numberOfSegments; angle_idx++) {
      let pts = points_on_dir[angle_idx];
      let bin_counter = 0;

      for (let idx = 0; idx < pts.length; idx++) {
        if (pts[idx] >= speed_levels[bin_idx] && pts[idx] < speed_levels[bin_idx + 1]) {
          bin_counter++;
        }
      }

      let total_length = pts.length / num_points;
      let delta_length = (bin_counter / pts.length) * total_length;
      base_lengths[angle_idx] += 100 * delta_length;
      petals[bin_idx].push(base_lengths[angle_idx]);
    }
  }

  console.log([angle, bin_num, speed_levels, petals]);

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <svg
        className={styles.svg}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
      >
        <g>
          <circle style={{ fill: 'grey' }} r={size} />
          <circle
            r={size / 2}
            style={{ fill: 'transparent' }}
            stroke={palette}
            stroke-width={size / 3}
            stroke-dasharray={`${(90 / 360) * size * 3.14159} ${size * 3.14159}`}
            transform="rotate (-90)"
          />
        </g>
      </svg>

      <div className={styles.textBox}>
        {options.showSeriesCount && (
          <div
            className={css`
              font-size: ${theme.typography.size[options.seriesCountSize]};
            `}
          >
            Number of series: {data.series.length}
          </div>
        )}
        <div>Text option value: {options.text}</div>
      </div>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
