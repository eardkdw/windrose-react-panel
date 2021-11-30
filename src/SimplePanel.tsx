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

  let palette: string[] = [];
  switch (options.palette) {
    case 'reds':
      for (let j = 0; j < options.numberOfSegments; j++) {
        palette.push('rgb(' + (255 * (1 - j / (options.numberOfSegments - 1))).toString() + ',0,0)');
      }
      break;
    case 'greens':
      for (let j = 0; j < options.numberOfSegments; j++) {
        palette.push('rgb(0,' + (255 * (1 - j / (options.numberOfSegments - 1))).toString() + ',0)');
      }
      break;
    case 'blues':
      for (let j = 0; j < options.numberOfSegments; j++) {
        palette.push('rgb(0,0,' + (255 * (1 - j / (options.numberOfSegments - 1))).toString() + ')');
      }
      break;
  }

  //draw windrose
  let num_points = theta.values.length;
  let points_on_dir: any[] = [];

  let angle = 360 / options.numberOfSegments;

  for (let i = 0; i < options.numberOfSegments; i++) {
    points_on_dir.push([]);
  }

  let thetas: number[] = [];
  let rs: number[] = [];
  for (let p = 0; p < num_points; p++) {
    let angle_idx = Math.floor((theta.values.get(p) / angle + 1.5) % options.numberOfSegments);
    points_on_dir[angle_idx].push(r.values.get(p));

    //read the dataframe values, and put them into a number[] array
    //so subsequent functions are happy with the type
    thetas.push(theta.values.get(p));
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

      let total_length = pts.length / num_points; //proportion of total points in this petal
      let delta_length = (bin_counter / pts.length) * total_length; //proportion of petal length in this bin
      base_lengths[angle_idx] += delta_length;
      //petals[bin_idx].push(base_lengths[angle_idx]);
      petals[bin_idx].push(delta_length);
    }
  }

  let petal_max_length = Math.max(...base_lengths);

  console.log([angle, petals]);

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
        <g id="lines">
          <circle style={{ stroke: 'grey', strokeDasharray: '5 5', fill: 'transparent' }} r={size} />
        </g>
        {petals.map((petal, idx1) => {
          return (
            <g id={`bin${idx1}`}>
              {petal.map((segment, idx2) => {
                //sum over previous segment lengths
                let radius = 0;
                petals.slice(0, idx1).forEach(function(each) {
                  radius += each[idx2];
                });
                radius += segment / 2;
                radius = (radius / petal_max_length) * size; //so the longest one is at the border
                return (
                  <circle
                    r={radius}
                    className={`petal${idx2}`}
                    style={{ fill: 'transparent', transform: 'rotate(' + (angle * idx2 - angle / 2 + -90) + 'deg)' }}
                    stroke={palette[idx1]}
                    stroke-width={(segment / petal_max_length) * size}
                    stroke-dasharray={`${(angle / 360) * radius * 2 * 3.14159} ${radius * 2 * 3.14159}`}
                  />
                );
              })}
            </g>
          );
        })}
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
