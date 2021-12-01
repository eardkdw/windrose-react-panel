# Grafana Windrose ReactJS Panel Plugin

This is a ReactJS Windrose generator. There already is a [Windrose Panel by fatcloud](https://github.com/fatcloud/windrose-panel),
but it was written in AngularJS. This updates the same concept to React. Some of the logic is based on the Fatcloud panel.

## Using

It requires data with wind angle from North (North is 0°, East is 90°, etc.) and speed (unit-agnostic). The units displayed
in the legend can be specified. 

## Getting started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

## Development Notes

The SVG viewbox is adjusted so the origin (0,0) is at the centre of the circle plot, with negative points above and positive 
below for the y-axis. 

All the frequency bins of the graph are SVG circle elements with the `stroke-width` set to bin width and the  `stroke-dasharray` pattern set so that only a wedge shows (see [How to Create an SVG Pie Chart](https://sparkbox.com/foundry/how_to_code_an_SVG_pie_chart)). It is then rotated using SVG transforms to the correct angle.

## Learn more

- [Build a panel plugin tutorial](https://grafana.com/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
