import React from 'react';
import { PanelProps, dateTimeFormat } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = getStyles();

  const frame = data.series[0];

  const theta = frame.fields.find(field => field.name === 'direction');
  const r = frame.fields.find(field => field.name === 'speed');

  //check there are data
  if (!data.series?.length || !theta || !r) {
    return (
      <div className="panel-empty">
        <p>{'No data found in response'}</p>
      </div>
    );
  }
  const size = (Math.min(width, height) / 2) * 0.9;

  //draw windrose
  let num_points = theta.values.length;
  let points_on_dir: any[] = [];

  let angle = 360 / options.numberOfSegments;

  for (let i = 0; i < options.numberOfSegments; i++) {
    points_on_dir.push([]);
  }

  let rs: number[] = [];
  for (let p = 0; p < num_points; p++) {
    //Ignore entries where r is zero as theta is undefined anyway
    if (r.values.get(p) > 0) {
      let angle_idx = Math.floor(theta.values.get(p) / angle + 0.5) % options.numberOfSegments;
      points_on_dir[angle_idx].push(r.values.get(p));

      //read the dataframe values, and put them into a number[] array
      //so subsequent functions are happy with the type
      rs.push(r.values.get(p));
    }
  }

  // find max wind speed and speed levels
  let max_speed = Math.max(...rs);
  let bin_num = Math.ceil(max_speed / options.windSpeedInterval);

  //palette
  let palette: string[] = [];
  switch (options.palette) {
    case 'reds':
      for (let j = 0; j < bin_num; j++) {
        palette.push('hsl(20,100%,' + (97 * (1 - j / (bin_num - 1))).toString() + '%)');
      }
      break;
    case 'greens':
      for (let j = 0; j < bin_num; j++) {
        palette.push('hsl(106,51%,' + (92 * (1 - j / (bin_num - 1))).toString() + '%)');
      }
      break;
    case 'blues':
      for (let j = 0; j < bin_num; j++) {
        palette.push('hsl(210,100%,' + (98 * (1 - j / (bin_num - 1))).toString() + '%)');
      }
      break;
  }

  // compute m levels for all n directions (petals is an array of number arrays
  // with bin_num elements, each with numberOfSegments elements)
  let petals: number[][] = [];

  let speed_levels: number[] = [];
  for (let bin_idx = 0; bin_idx <= bin_num; bin_idx++) {
    let level = options.windSpeedInterval * bin_idx;
    speed_levels.push(level);
  }

  // prepare base lengths
  let base_lengths: number[] = [];
  base_lengths.length = options.numberOfSegments;
  base_lengths.fill(0);
  let base_proportion: number[] = [];
  base_proportion.length = options.numberOfSegments;
  base_proportion.fill(0);

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

      base_proportion[angle_idx] = pts.length / num_points; //proportion of total points in this petal
      let delta_length = (bin_counter / pts.length) * base_proportion[angle_idx]; //proportion of petal length in this bin
      base_lengths[angle_idx] += delta_length;
      //petals[bin_idx].push(base_lengths[angle_idx]);
      petals[bin_idx].push(delta_length);
    }
  }

  let petal_max_length = Math.max(...base_lengths);
  let petal_max_proportion = Math.max(...base_proportion);

  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const proportions = [1, 0.8, 0.6, 0.4, 0.2];

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
          <g id="proportionLines">
            {proportions.map((proportion, proportion_idx) => 
               <g style={{ transform: 'rotate(' + (-180 / cardinals.length) + 'deg)'}}>
               <circle className={styles.polarlines} r={size * proportion} />
               <text x="0" y={size * proportion * 1.025} text-anchor="middle" className={styles.annotation}>{(petal_max_proportion * proportion * 100).toFixed(1)}%</text>
               </g>
          )}
          </g>
          <g id="cardinals" style={{ transform: 'rotate(' + (90 + options.rotation) + 'deg)' }}>
            {cardinals.map((cardinal, idxC) => {
              return (
                <g style={{ transform: 'rotate(' + (360 / cardinals.length) * idxC + 'deg)' }}>
                  <line x1="0" y1="0" x2="0" y2={-size} className={styles.polarlines} />
                  <g>
                    <text x="0" y={-size * 1.025} text-anchor="middle" className={styles.annotation}>
                      {cardinal}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
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
                    className={`petal${idx2}_${points_on_dir[idx2].length}`}
                    style={{
                      fill: 'transparent',
                      transform: 'rotate(' + (angle * idx2 - angle / 2 + options.rotation) + 'deg)',
                    }}
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
        <div>
          From {dateTimeFormat(data.timeRange.from, { format: 'YYYY-MM-DD HH:mm' })} to{' '}
          {dateTimeFormat(data.timeRange.to, { format: 'YYYY-MM-DD HH:mm' })}
        </div>
      </div>
      <div className={styles.legend}>
        <h3>Speed / {options.speedUnit}</h3>
        {speed_levels.slice(0, bin_num).map((level, level_idx) => {
          return (
            <div id={`legend_${level_idx}`} style={{ height: '4ex' }}>
              <div
                className={cx(
                  styles.legendBox,
                  css`
                    background-color: ${palette[level_idx]};
                  `
                )}
              />
              <p className={styles.legendText}>
                {level} {level > 0 ? '≤' : '<'} <span style={{ fontStyle: 'italic' }}>v</span> &lt;{' '}
                {speed_levels[level_idx + 1]}
              </p>
            </div>
          );
        })}
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
    polarlines: css`
      stroke: grey;
      stroke-dasharray: 5 5;
      fill: transparent;
    `,
    annotation: css`
      fill: white;
    `,
    legend: css`
      text-align: center;
      position: absolute;
      right: 0;
      top: 0;
      width: 15%;
    `,
    legendBox: css`
      border: solid 1px transparent;
      height: 100%;
      width: 4ex;
      display: inline-block;
    `,
    legendText: css`
      display: inline-block;
      height: 100%;
      vertical-align: middle;
      padding-left: 0.75em;
    `,
  };
});
