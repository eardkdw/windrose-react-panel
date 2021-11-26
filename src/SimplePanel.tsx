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

  for (let p = 0; p < num_points; p++) {
    let angle_idx = Math.floor((theta.values.get(p) / angle + 1.5) % options.numberOfSegments);
    points_on_dir[angle_idx].push(r.values.get(p));
  }

  console.log([angle, theta, r]);

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
          <circle style={{ fill: palette }} r={size} />
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
